/** ViewModel for the Offers page: tab state, data orchestration, selection. */
import { useState } from "react";
import { usePlacedOffers, useSellerOffers } from "../lib/apiHooks";
import { pendingOfferCount } from "../services/offer.service";
import type { OfferRole, SellerOffer } from "../models/offer";

export function useOfferInboxViewModel() {
  const placedQuery = usePlacedOffers();
  const receivedQuery = useSellerOffers();

  const [activeTab, setActiveTab] = useState<OfferRole>("received");
  const [selectedIdent, setSelectedIdent] = useState<string | null>(null);

  const placedOffers = placedQuery.data ?? [];
  const receivedOffers = receivedQuery.data ?? [];

  const activeOffers: SellerOffer[] = activeTab === "received" ? receivedOffers : placedOffers;
  const activeError = activeTab === "received" ? receivedQuery.isError : placedQuery.isError;
  const activeLoading = activeTab === "received" ? receivedQuery.isLoading : placedQuery.isLoading;
  const pendingReceived = pendingOfferCount(receivedOffers);
  // Re-read from the live list so an open dialog reflects status changes.
  const selectedOffer = selectedIdent
    ? activeOffers.find((offer) => offer.id === selectedIdent) ?? null
    : null;

  function clearSelection() {
    setSelectedIdent(null);
  }

  function selectOffer(offer: SellerOffer) {
    setSelectedIdent(offer.id);
  }

  function switchTab(nextTab: OfferRole) {
    setActiveTab(nextTab);
    setSelectedIdent(null);
  }

  return {
    activeError,
    activeLoading,
    activeOffers,
    activeTab,
    clearSelection,
    pendingReceived,
    selectedOffer,
    selectOffer,
    switchTab,
  };
}
