import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  useMyListings,
  usePublishListing,
  useWithdrawListing,
} from "../lib/apiHooks";
import {
  computeListingStats,
  listingHistoryPage,
} from "../services/listing.service";
import type { Listing } from "../models/listing";

export function useMyListingsViewModel() {
  const query = useMyListings();
  const listings = query.data ?? [];
  const publishListing = usePublishListing();
  const withdrawListing = useWithdrawListing();
  const [createOpen, setCreateOpen] = useState(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const candidate = params.get("status") ?? "all";
  const status = ["draft", "active", "sold", "withdrawn", "expired"].includes(
    candidate,
  )
    ? candidate
    : "all";
  const history = useMemo(
    () => listingHistoryPage(listings, search, status, params.get("page")),
    [listings, search, status, params],
  );
  function patch(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== "page") next.delete("page");
        return next;
      },
      { replace: key === "q", preventScrollReset: true },
    );
  }
  function publish(id: string) {
    if (publishListing.isPending || withdrawListing.isPending) return;
    setNotice("");
    publishListing.reset();
    withdrawListing.reset();
    publishListing.mutate(id, {
      onSuccess: () => setNotice("Listing published to the marketplace."),
    });
  }
  function withdraw(id: string) {
    if (publishListing.isPending || withdrawListing.isPending) return;
    setNotice("");
    publishListing.reset();
    withdrawListing.reset();
    withdrawListing.mutate(id, {
      onSuccess: () => setNotice("Listing withdrawn from the marketplace."),
    });
  }
  return {
    ...query,
    ...history,
    listings,
    createOpen,
    setCreateOpen,
    editListing,
    setEditListing,
    importOpen,
    setImportOpen,
    stats: computeListingStats(listings),
    search,
    status,
    notice,
    publish,
    withdraw,
    actionError: publishListing.isError
      ? "We couldn’t publish the listing. Try again after reviewing its details."
      : withdrawListing.isError
        ? "We couldn’t withdraw the listing. It may still be visible to buyers. Try again."
        : null,
    busyId: publishListing.isPending
      ? publishListing.variables
      : withdrawListing.isPending
        ? withdrawListing.variables
        : null,
    busyAction: publishListing.isPending
      ? "publish"
      : withdrawListing.isPending
        ? "withdraw"
        : null,
    isActing: publishListing.isPending || withdrawListing.isPending,
    setSearch: (value: string) => patch("q", value),
    setStatus: (value: string) => patch("status", value === "all" ? "" : value),
    setPage: (value: number) => patch("page", value > 1 ? String(value) : ""),
    clearFilters: () =>
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          ["q", "status", "page"].forEach((key) => next.delete(key));
          return next;
        },
        { preventScrollReset: true },
      ),
  };
}
