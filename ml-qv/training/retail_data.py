"""Amazon Product Advertising API v5 — retail price fetcher.

Fetches current street prices for new units of each asset category from
Amazon.  These are used as a retail reference ceiling in evaluation charts,
showing the gap between what the market pays for used hardware vs what a new
unit costs today on Amazon.

Uses AWS Signature V4 via ``requests-aws4auth`` (already in requirements).
No additional SDK required.

Required env vars:
    AMAZON_ACCESS_KEY     — PA API Access Key ID
    AMAZON_SECRET_KEY     — PA API Secret Access Key
    AMAZON_ASSOCIATE_TAG  — Affiliate associate tag  (e.g. "guildmark-20")

Optional env vars:
    AMAZON_REGION         — defaults to "us-east-1"  (amazon.com)
    AMAZON_MAX_ITEMS      — results to pull per query (default 8, max 10)

Usage:
    fetcher = RetailPriceFetcher()
    prices = fetcher.fetch_by_type(["laptop", "desktop"])
    # → {"laptop": 1649.00, "desktop": 899.00}
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import time
from datetime import datetime, timezone

import requests

log = logging.getLogger("guildmark.retail_data")

# ---------------------------------------------------------------------------
# Per-type Amazon search queries.
# Goal: catch the main SKUs actually traded in B2B refresh channels.
# Prices are averaged across results so a spread of models is intentional.
# ---------------------------------------------------------------------------
_TYPE_QUERIES: dict[str, list[str]] = {
    "laptop": [
        "Apple MacBook Pro 14 inch laptop",
        "Dell XPS 15 laptop",
        "Lenovo ThinkPad X1 Carbon laptop",
        "HP EliteBook 840 laptop",
    ],
    "desktop": [
        "Apple Mac Mini M2 desktop",
        "Dell OptiPlex 7000 desktop",
        "HP EliteDesk 800 desktop",
    ],
    "server": [
        "Dell PowerEdge R750 server",
        "HP ProLiant DL380 Gen10 server",
    ],
    "phone": [
        "Apple iPhone 15 Pro unlocked",
        "Samsung Galaxy S24 unlocked",
    ],
    "tablet": [
        "Apple iPad Pro 12.9 inch",
        "Microsoft Surface Pro 9",
    ],
    "networking": [
        "Cisco Catalyst 9200 switch",
        "Ubiquiti UniFi Dream Machine Pro",
    ],
    "monitor": [
        "Dell UltraSharp U2723D monitor",
        "LG 27UK850 4K monitor",
    ],
}

_PA_API_HOST     = "webservices.amazon.com"
_PA_API_ENDPOINT = f"https://{_PA_API_HOST}/paapi5/searchitems"
_PA_API_TARGET   = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems"
_PA_API_SERVICE  = "ProductAdvertisingAPI"

_REQUEST_TIMEOUT = 12
_RATE_LIMIT_SLEEP = 1.1   # PA API: ≤1 TPS for standard associates


class RetailPriceFetcher:
    """Fetch current Amazon retail prices for new units per asset type.

    Results are averaged across multiple search queries and multiple items
    per query to get a representative street price for each category.
    """

    def __init__(self) -> None:
        self._access_key   = os.environ.get("AMAZON_ACCESS_KEY", "")
        self._secret_key   = os.environ.get("AMAZON_SECRET_KEY", "")
        self._partner_tag  = os.environ.get("AMAZON_ASSOCIATE_TAG", "")
        self._region       = os.environ.get("AMAZON_REGION", "us-east-1")
        self._max_items    = int(os.environ.get("AMAZON_MAX_ITEMS", "8"))

        self._available = bool(
            self._access_key and self._secret_key and self._partner_tag
        )
        if not self._available:
            log.warning(
                "Amazon PA API credentials not set "
                "(AMAZON_ACCESS_KEY / AMAZON_SECRET_KEY / AMAZON_ASSOCIATE_TAG). "
                "Retail price overlay will be skipped."
            )

    # -------------------------------------------------------------------------
    # Public API
    # -------------------------------------------------------------------------

    def fetch_by_type(self, asset_types: list[str]) -> dict[str, float]:
        """Return a dict of {asset_type: average_retail_price_usd}.

        Only types present in ``_TYPE_QUERIES`` are fetched.  Types with no
        Amazon results (or no credentials) are omitted from the output.
        """
        if not self._available:
            return {}

        prices: dict[str, list[float]] = {}

        for atype in asset_types:
            queries = _TYPE_QUERIES.get(atype)
            if not queries:
                log.debug("No PA API queries defined for type %r — skipping", atype)
                continue

            type_prices: list[float] = []
            for query in queries:
                batch = self._search_prices(query)
                type_prices.extend(batch)
                time.sleep(_RATE_LIMIT_SLEEP)   # respect 1 TPS limit

            if type_prices:
                prices[atype] = type_prices

        return {
            atype: round(sum(vals) / len(vals), 2)
            for atype, vals in prices.items()
            if vals
        }

    # -------------------------------------------------------------------------
    # PA API call
    # -------------------------------------------------------------------------

    def _search_prices(self, keywords: str) -> list[float]:
        """Run a SearchItems query and return the list price for each result."""
        payload = {
            "PartnerTag":   self._partner_tag,
            "PartnerType":  "Associates",
            "Keywords":     keywords,
            "SearchIndex":  "Electronics",
            "ItemCount":    min(self._max_items, 10),
            "Resources": [
                "Offers.Listings.Price",
                "Offers.Summaries.HighestPrice",
                "Offers.Summaries.LowestPrice",
                "ItemInfo.Title",
            ],
        }

        try:
            headers = self._sign_request(payload)
            resp = requests.post(
                _PA_API_ENDPOINT,
                headers=headers,
                data=json.dumps(payload),
                timeout=_REQUEST_TIMEOUT,
            )
            resp.raise_for_status()
        except requests.RequestException as exc:
            log.warning("PA API request failed for %r: %s", keywords, exc)
            return []

        body = resp.json()
        items = (
            body.get("SearchResult", {})
                .get("Items", [])
        )
        prices: list[float] = []
        for item in items:
            price = self._extract_price(item)
            if price and price > 0:
                prices.append(price)

        log.debug("PA API: %d prices for %r (keywords=%r)",
                  len(prices), prices[:3], keywords)
        return prices

    def _extract_price(self, item: dict) -> float | None:
        """Pull the lowest available offer price from a PA API item."""
        # Prefer Offers.Listings[0].Price.Amount (active offer)
        listings = (
            item.get("Offers", {})
                .get("Listings", [])
        )
        if listings:
            amount = listings[0].get("Price", {}).get("Amount")
            if amount:
                return float(amount)

        # Fallback: Offers.Summaries[0].LowestPrice
        summaries = (
            item.get("Offers", {})
                .get("Summaries", [])
        )
        if summaries:
            amount = summaries[0].get("LowestPrice", {}).get("Amount")
            if amount:
                return float(amount)

        return None

    # -------------------------------------------------------------------------
    # AWS Signature V4 (manual — avoids SDK dependency)
    # -------------------------------------------------------------------------

    def _sign_request(self, payload: dict) -> dict[str, str]:
        """Return signed headers for a PA API SearchItems POST.

        Implements AWS SigV4 using only the standard library so we don't need
        an extra SDK.  The signed headers are merged with the required PA API
        target and content-type headers.
        """
        body      = json.dumps(payload, separators=(",", ":"))
        body_hash = hashlib.sha256(body.encode("utf-8")).hexdigest()

        now   = datetime.now(timezone.utc)
        amz_date  = now.strftime("%Y%m%dT%H%M%SZ")
        date_stamp = now.strftime("%Y%m%d")

        # Canonical headers (must be sorted, lowercase)
        headers_to_sign = {
            "content-encoding": "amz-1.0",
            "content-type":     "application/json; charset=utf-8",
            "host":             _PA_API_HOST,
            "x-amz-date":      amz_date,
            "x-amz-target":    _PA_API_TARGET,
        }
        canonical_headers = "".join(
            f"{k}:{v}\n" for k, v in sorted(headers_to_sign.items())
        )
        signed_headers = ";".join(sorted(headers_to_sign.keys()))

        canonical_request = "\n".join([
            "POST",
            "/paapi5/searchitems",
            "",                         # no query string
            canonical_headers,
            signed_headers,
            body_hash,
        ])

        credential_scope = f"{date_stamp}/{self._region}/{_PA_API_SERVICE}/aws4_request"
        string_to_sign   = "\n".join([
            "AWS4-HMAC-SHA256",
            amz_date,
            credential_scope,
            hashlib.sha256(canonical_request.encode("utf-8")).hexdigest(),
        ])

        signing_key = self._derive_signing_key(date_stamp)
        signature   = hmac.new(
            signing_key,
            string_to_sign.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        auth_header = (
            f"AWS4-HMAC-SHA256 "
            f"Credential={self._access_key}/{credential_scope}, "
            f"SignedHeaders={signed_headers}, "
            f"Signature={signature}"
        )

        return {
            "Authorization":    auth_header,
            "Content-Encoding": "amz-1.0",
            "Content-Type":     "application/json; charset=utf-8",
            "Host":             _PA_API_HOST,
            "X-Amz-Date":       amz_date,
            "X-Amz-Target":     _PA_API_TARGET,
        }

    def _derive_signing_key(self, date_stamp: str) -> bytes:
        """Derive the HMAC signing key from the secret using the SigV4 KDF."""
        def _sign(key: bytes, msg: str) -> bytes:
            return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()

        k_date    = _sign(f"AWS4{self._secret_key}".encode("utf-8"), date_stamp)
        k_region  = _sign(k_date, self._region)
        k_service = _sign(k_region, _PA_API_SERVICE)
        return _sign(k_service, "aws4_request")
