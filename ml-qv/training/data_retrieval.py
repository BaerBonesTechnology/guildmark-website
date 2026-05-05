"""Data retrieval pipeline for the ValuationModel.

Fetches current fixed-price listings from the eBay Browse API, averages the
prices per (model, condition) bucket, and returns a DataFrame in the shape
that ValuationModel.feature_columns() expects.

Auctions are explicitly excluded via the ``buyingOptions:{FIXED_PRICE}``
filter — only Buy It Now listings are used so prices reflect real ask-prices
rather than in-flight bid dynamics.

Auth: eBay OAuth 2.0 client-credentials flow.
  Required env vars:
    EBAY_APP_ID   — eBay application Client ID
    EBAY_CERT_ID  — eBay application Client Secret
  Optional:
    EBAY_SANDBOX  — set to "1" to hit the sandbox environment

Usage:
    from training.data_retrieval import DataGrabber
    df = DataGrabber().retrieve_and_process_data("Apple MacBook Pro M2 14 inch")
"""
from __future__ import annotations

import base64
import logging
import os
import time
from typing import Any

import pandas as pd
import requests

log = logging.getLogger("astech.data_retrieval")

# ---------------------------------------------------------------------------
# eBay API endpoints
# ---------------------------------------------------------------------------
_EBAY_PROD_BASE = "https://api.ebay.com"
_EBAY_SAND_BASE = "https://api.sandbox.ebay.com"
_TOKEN_PATH = "/identity/v1/oauth2/token"
_SEARCH_PATH = "/buy/browse/v1/item_summary/search"
_EBAY_SCOPE = "https://api.ebay.com/oauth/api_scope"

# ---------------------------------------------------------------------------
# eBay conditionId → AsTech grade
#   1000/1500  New / New other          → A
#   2000/2500  Manufacturer/Seller refurb → A
#   3000/4000  Used / Very Good         → B
#   5000/6000  Good / Acceptable        → C
#   7000       For parts                → skip
# ---------------------------------------------------------------------------
_CONDITION_ID_TO_GRADE: dict[str, str] = {
    "1000": "A",
    "1500": "A",
    "2000": "A",
    "2500": "A",
    "3000": "B",
    "4000": "B",
    "5000": "C",
    "6000": "C",
}

# Human-readable condition strings returned by the API (fallback mapping).
_CONDITION_STR_TO_GRADE: dict[str, str] = {
    "new": "A",
    "new other": "A",
    "manufacturer refurbished": "A",
    "seller refurbished": "A",
    "used": "B",
    "very good": "B",
    "good": "C",
    "acceptable": "C",
}

# Required output columns — must match models.valuation.feature_columns().
_REQUIRED_COLS = [
    "asset_type",
    "condition_grade",
    "age_months",
    "cpu_score",
    "ram_gb",
    "storage_gb",
    "original_price",
    "sem3_msrp",
    "fmv",
]

# How many listings to pull per search (max eBay allows per request is 200).
_PAGE_SIZE = 200
# Maximum total listings to collect before stopping pagination.
_MAX_LISTINGS = 400
# Request timeout in seconds.
_REQUEST_TIMEOUT = 10


class EbayAuthError(RuntimeError):
    """Raised when the OAuth token request fails."""


class DataGrabber:
    """Fetches and normalizes eBay listing data for valuation training."""

    def __init__(self) -> None:
        self._sandbox = os.environ.get("EBAY_SANDBOX", "0") == "1"
        self._base_url = _EBAY_SAND_BASE if self._sandbox else _EBAY_PROD_BASE
        self._app_id = os.environ.get("EBAY_APP_ID", "")
        self._cert_id = os.environ.get("EBAY_CERT_ID", "")
        self._token: str | None = None
        self._token_expires_at: float = 0.0

    # -------------------------------------------------------------------------
    # Public API
    # -------------------------------------------------------------------------

    def retrieve_ebay_data(self, query: str) -> pd.DataFrame:
        """Search eBay for fixed-price listings matching *query* and return a
        DataFrame with columns matching ``_REQUIRED_COLS``.

        Args:
            query: A model name or search string, e.g.
                   "Apple MacBook Pro M2 Pro 14 inch 16GB 512GB".
                   UPCs also work if you have them.

        Returns:
            DataFrame with one row per listing. ``fmv`` is the individual
            listing price; callers should aggregate (mean/median) as needed.
            Returns an empty DataFrame on auth failure or empty results.
        """
        if not self._app_id or not self._cert_id:
            log.warning(
                "EBAY_APP_ID / EBAY_CERT_ID not set — skipping eBay fetch"
            )
            return pd.DataFrame(columns=_REQUIRED_COLS)

        try:
            token = self._get_token()
            items = self._paginate_search(query, token)
        except EbayAuthError as exc:
            log.error("eBay auth failed: %s", exc)
            return pd.DataFrame(columns=_REQUIRED_COLS)
        except requests.RequestException as exc:
            log.error("eBay search request failed: %s", exc)
            return pd.DataFrame(columns=_REQUIRED_COLS)

        if not items:
            log.info("No eBay listings found for query: %s", query)
            return pd.DataFrame(columns=_REQUIRED_COLS)

        rows = [self._parse_item(item) for item in items]
        # Filter out items we couldn't parse a price or condition for.
        rows = [r for r in rows if r is not None]

        df = pd.DataFrame(rows)
        log.info("eBay: collected %d listings for query '%s'", len(df), query)
        return df

    def clean_and_preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize, de-duplicate, and impute the raw listings DataFrame.

        Steps:
        1. Drop rows with no ``fmv``.
        2. Drop rows with unrecognized ``condition_grade``.
        3. Clip ``fmv`` to [5, 20_000] to remove obvious outliers.
        4. Impute missing numeric spec fields with the per-condition median.
        5. Ensure all ``_REQUIRED_COLS`` are present (NaN where unavailable).
        """
        if df.empty:
            return df

        df = df.copy()

        # 1. Require fmv.
        df = df.dropna(subset=["fmv"])
        df = df[df["fmv"] > 0]

        # 2. Require a valid condition grade.
        df = df[df["condition_grade"].isin(["A", "B", "C"])]

        # 3. Clip price outliers.
        df = df[df["fmv"].between(5, 20_000)]

        # 4. Impute spec fields per condition bucket (better than global median).
        numeric_specs = ["age_months", "cpu_score", "ram_gb", "storage_gb",
                         "original_price", "sem3_msrp"]
        for col in numeric_specs:
            if col not in df.columns:
                df[col] = float("nan")
                continue
            df[col] = df.groupby("condition_grade")[col].transform(
                lambda s: s.fillna(s.median())
            )
            # Final fallback: global median for any remaining NaNs.
            df[col] = df[col].fillna(df[col].median())

        # 5. Guarantee all required columns exist.
        for col in _REQUIRED_COLS:
            if col not in df.columns:
                df[col] = float("nan")

        return df[_REQUIRED_COLS].reset_index(drop=True)

    def retrieve_and_process_data(self, query: str) -> pd.DataFrame:
        """Fetch, clean, and return training-ready data for a given search query.

        This is the main entry point called by training scripts.
        Returns a DataFrame ready for ValuationModel.feature_columns().
        """
        raw = self.retrieve_ebay_data(query)
        return self.clean_and_preprocess_data(raw)

    def average_price_by_condition(self, query: str) -> dict[str, float]:
        """Convenience method: return mean fixed-price listing value per grade.

        Returns a dict like ``{"A": 1250.0, "B": 980.0, "C": 620.0}``.
        Missing grades are omitted if no listings were found for them.
        """
        df = self.retrieve_and_process_data(query)
        if df.empty:
            return {}
        return (
            df.groupby("condition_grade")["fmv"]
            .mean()
            .round(2)
            .to_dict()
        )

    # -------------------------------------------------------------------------
    # eBay OAuth
    # -------------------------------------------------------------------------

    def _get_token(self) -> str:
        """Return a valid application-level OAuth token, refreshing if needed."""
        if self._token and time.time() < self._token_expires_at - 60:
            return self._token

        credentials = base64.b64encode(
            f"{self._app_id}:{self._cert_id}".encode()
        ).decode()

        resp = requests.post(
            f"{self._base_url}{_TOKEN_PATH}",
            headers={
                "Authorization": f"Basic {credentials}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={
                "grant_type": "client_credentials",
                "scope": _EBAY_SCOPE,
            },
            timeout=_REQUEST_TIMEOUT,
        )
        if not resp.ok:
            raise EbayAuthError(f"HTTP {resp.status_code}: {resp.text[:200]}")

        body = resp.json()
        self._token = body["access_token"]
        self._token_expires_at = time.time() + int(body.get("expires_in", 7200))
        return self._token

    # -------------------------------------------------------------------------
    # eBay Browse API search + pagination
    # -------------------------------------------------------------------------

    def _paginate_search(self, query: str, token: str) -> list[dict[str, Any]]:
        """Collect up to ``_MAX_LISTINGS`` fixed-price items across pages."""
        items: list[dict[str, Any]] = []
        offset = 0

        while len(items) < _MAX_LISTINGS:
            batch = self._search_page(query, token, offset=offset, limit=_PAGE_SIZE)
            if not batch:
                break
            items.extend(batch)
            if len(batch) < _PAGE_SIZE:
                # Last page — no more results.
                break
            offset += _PAGE_SIZE

        return items[:_MAX_LISTINGS]

    def _search_page(
            self,
            query: str,
            token: str,
            *,
            offset: int = 0,
            limit: int = _PAGE_SIZE,
    ) -> list[dict[str, Any]]:
        """Fetch a single page of eBay Browse search results.

        Filters applied:
        - ``buyingOptions:{FIXED_PRICE}``  — excludes auctions entirely
        - ``conditionIds:{1000|1500|2000|2500|3000|4000|5000|6000}``
          — excludes "For parts or not working" (7000)
        """
        resp = requests.get(
            f"{self._base_url}{_SEARCH_PATH}",
            headers={
                "Authorization": f"Bearer {token}",
                "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
                "Content-Type": "application/json",
            },
            params={
                "q": query,
                "filter": (
                    "buyingOptions:{FIXED_PRICE},"
                    "conditionIds:{1000|1500|2000|2500|3000|4000|5000|6000}"
                ),
                "limit": limit,
                "offset": offset,
            },
            timeout=_REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json().get("itemSummaries", [])

    # -------------------------------------------------------------------------
    # Item parsing
    # -------------------------------------------------------------------------

    def _parse_item(self, item: dict[str, Any]) -> dict[str, Any] | None:
        """Map a single eBay itemSummary dict to a row in ``_REQUIRED_COLS``.

        Returns None if the item lacks a usable price or condition.
        """
        # -- Price -----------------------------------------------------------
        price_info = item.get("price", {})
        try:
            fmv = float(price_info.get("value", 0))
        except (TypeError, ValueError):
            return None
        if fmv <= 0:
            return None

        # -- Condition -------------------------------------------------------
        condition_id = str(item.get("conditionId", ""))
        condition_str = item.get("condition", "").lower().strip()
        grade = (
                _CONDITION_ID_TO_GRADE.get(condition_id)
                or _CONDITION_STR_TO_GRADE.get(condition_str)
        )
        if grade is None:
            return None

        # -- Spec fields from localizedAspects -------------------------------
        aspects = {
            a["name"].lower(): a.get("value", [None])[0]
            for a in item.get("localizedAspects", [])
            if a.get("value")
        }
        ram_gb = _parse_int(aspects.get("ram") or aspects.get("memory"))
        storage_gb = _parse_int(
            aspects.get("ssd capacity")
            or aspects.get("storage capacity")
            or aspects.get("hard drive capacity")
        )

        return {
            "asset_type": _infer_asset_type(item),
            "condition_grade": grade,
            "age_months": float("nan"),  # eBay listings don't expose device age
            "cpu_score": float("nan"),  # Not available from Browse API
            "ram_gb": float(ram_gb) if ram_gb else float("nan"),
            "storage_gb": float(storage_gb) if storage_gb else float("nan"),
            "original_price": float("nan"),  # MSRP not available from listings
            "sem3_msrp": float("nan"),
            "fmv": fmv,
        }


# ---------------------------------------------------------------------------
# Module-level helpers
# ---------------------------------------------------------------------------

def _parse_int(value: str | None) -> int | None:
    """Extract the leading integer from a string like "16 GB" or "512GB"."""
    if not value:
        return None
    digits = ""
    for ch in str(value):
        if ch.isdigit():
            digits += ch
        elif digits:
            break
    return int(digits) if digits else None


def _infer_asset_type(item: dict[str, Any]) -> str:
    """Guess asset_type from the item's category path or title.

    Falls back to "laptop" since that's the dominant category for the
    refurb B2B market AsTech targets.
    """
    category = (item.get("category", {}).get("categoryName") or "").lower()
    title = (item.get("title") or "").lower()
    combined = f"{category} {title}"

    if any(k in combined for k in ("desktop", "tower", "mac mini", "mac pro")):
        return "desktop"
    if any(k in combined for k in ("server",)):
        return "server"
    if any(k in combined for k in ("iphone", "galaxy", "pixel", "smartphone", "mobile")):
        return "phone"
    if any(k in combined for k in ("ipad", "tablet", "surface pro")):
        return "tablet"
    if any(k in combined for k in ("monitor", "display", "screen")):
        return "monitor"
    if any(k in combined for k in ("switch", "router", "firewall", "access point", "networking")):
        return "networking"
    return "laptop"
