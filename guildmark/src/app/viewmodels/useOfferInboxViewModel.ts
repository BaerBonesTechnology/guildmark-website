import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { usePlacedOffers, useSellerOffers } from "../lib/apiHooks";
import {
  effectiveOfferStatus,
  offersPage,
  pendingOfferCount,
} from "../services/offer.service";
import { useOfferClock } from "../hooks/useOfferClock";
import type { OfferRole, SellerOffer } from "../models/offer";
const EMPTY: SellerOffer[] = [];
export function useOfferInboxViewModel() {
  const [params, setParams] = useSearchParams();
  const activeTab: OfferRole =
    params.get("tab") === "placed" ? "placed" : "received";
  const placedQuery = usePlacedOffers(activeTab === "placed");
  const receivedQuery = useSellerOffers(activeTab === "received");
  const query = activeTab === "received" ? receivedQuery : placedQuery;
  const activeOffers = query.data ?? EMPTY;
  const now = useOfferClock(activeOffers);
  const search = params.get("q") ?? "";
  const candidate = params.get("status") ?? "all";
  const status = [
    "pending",
    "accepted",
    "countered",
    "expired",
    "rejected",
  ].includes(candidate)
    ? candidate
    : "all";
  const history = useMemo(
    () => offersPage(activeOffers, search, status, params.get("page"), now),
    [activeOffers, search, status, params, now],
  );
  function patch(key: string, value: string, replace = false) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== "offer") next.delete("offer");
        if (!["page", "offer"].includes(key)) next.delete("page");
        return next;
      },
      { replace, preventScrollReset: true },
    );
  }
  return {
    ...query,
    ...history,
    activeOffers,
    activeTab,
    now,
    search,
    status,
    selectedOffer:
      activeOffers.find((offer) => offer.id === params.get("offer")) ?? null,
    pendingCount: pendingOfferCount(activeOffers, now),
    acceptedCount: activeOffers.filter(
      (offer) => effectiveOfferStatus(offer, now) === "accepted",
    ).length,
    switchTab: (value: OfferRole) =>
      patch("tab", value === "received" ? "" : value),
    setSearch: (value: string) => patch("q", value, true),
    setStatus: (value: string) => patch("status", value === "all" ? "" : value),
    setPage: (value: number) => patch("page", value > 1 ? String(value) : ""),
    selectOffer: (offer: SellerOffer) => patch("offer", offer.id),
    clearSelection: () => patch("offer", "", true),
    clearFilters: () =>
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          ["q", "status", "page", "offer"].forEach((key) => next.delete(key));
          return next;
        },
        { preventScrollReset: true },
      ),
    refresh: async () => !(await query.refetch()).isError,
  };
}
