/** ViewModel for the My Listings page: data, dialog state, listing actions. */
import { useState } from "react";
import { useMyListings, usePublishListing, useWithdrawListing } from "../lib/apiHooks";
import { computeListingStats } from "../services/listing.service";
import type { Listing } from "../models/listing";

export function useMyListingsViewModel() {
  const { data: listings = [], isLoading } = useMyListings();
  const publishListing = usePublishListing();
  const withdrawListing = useWithdrawListing();

  const [createOpen, setCreateOpen] = useState(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const stats = computeListingStats(listings);

  return {
    createOpen,
    editListing,
    importOpen,
    isLoading,
    isPublishing: publishListing.isPending,
    isWithdrawing: withdrawListing.isPending,
    listings,
    publish: publishListing.mutate,
    setCreateOpen,
    setEditListing,
    setImportOpen,
    stats,
    withdraw: withdrawListing.mutate,
  };
}
