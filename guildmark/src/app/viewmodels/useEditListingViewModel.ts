/** ViewModel for the Edit Listing Price dialog. */
import { useEffect, useState } from "react";
import { useUpdateListingPrice } from "../lib/apiHooks";
import type { Listing } from "../models/listing";
import { priceFlagHint } from "../services/listing.service";

export function useEditListingViewModel(listing: Listing | null, onOpenChange: (open: boolean) => void) {
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const updatePrice = useUpdateListingPrice();

  useEffect(() => {
    if (listing) setPrice(String(listing.listed_price ?? ""));
    setError(null);
  }, [listing]);

  function handlePriceChange(value: string) {
    setPrice(value);
    setError(null);
  }

  function handleSave() {
    const parsed = parseFloat(price);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid price greater than 0");
      return;
    }
    updatePrice.mutate(
      { listingId: listing!.id, listed_price: parsed },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  const fmv = listing?.fair_market_value;
  const flagHint = priceFlagHint(parseFloat(price), fmv);

  return { error, flagHint, fmv, handlePriceChange, handleSave, price, updatePrice };
}
