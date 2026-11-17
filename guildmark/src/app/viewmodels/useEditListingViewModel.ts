/** ViewModel for the Edit Listing Price dialog. */
import { useEffect, useState } from "react";
import { useUpdateListingPrice } from "../lib/apiHooks";
import type { Listing } from "../models/listing";
import { priceFlagHint, validListingPrice } from "../services/listing.service";

export function useEditListingViewModel(
  listing: Listing | null,
  onOpenChange: (open: boolean) => void,
) {
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
    if (!listing || updatePrice.isPending) return;
    const parsed = Number(price);
    if (!validListingPrice(price)) {
      setError(
        "Enter a price from $0.01 to $1,000,000 with at most two decimal places.",
      );
      return;
    }
    updatePrice.mutate(
      { listingId: listing.id, listed_price: parsed },
      {
        onSuccess: () => onOpenChange(false),
        onError: () =>
          setError(
            "We couldn’t save your price. Your entry is preserved; try again.",
          ),
      },
    );
  }

  const fmv = listing?.fair_market_value;
  const flagHint = priceFlagHint(parseFloat(price), fmv);

  return {
    error,
    flagHint,
    fmv,
    handlePriceChange,
    handleSave,
    price,
    updatePrice,
  };
}
