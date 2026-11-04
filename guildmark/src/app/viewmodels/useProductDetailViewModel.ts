/** ViewModel for the Product Detail page: listing load, offer form, buy dialog. */
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useCompare } from "../components/CompareContext";
import { useListing, useMakeOffer } from "../lib/apiHooks";

import { useAuth } from "../hooks/useAuth";
import { validateOfferTerms, offerSubtotal } from "../services/offer.service";

export function useProductDetailViewModel() {
  const { user } = useAuth();
  const offerLock = useRef(false);
  const { id = "" } = useParams<{ id: string }>();
  const currentListingId = useRef(id);
  currentListingId.current = id;
  const { data: listing, error, isError, isPending } = useListing(id);
  const makeOffer = useMakeOffer();
  const { atMax, isCompared, toggle } = useCompare();

  const [buyOpen, setBuyOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [offerPrice, setOfferPrice] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (listing) {
      setOfferPrice(String(listing.listed_price ?? ""));
      setQuantity("1");
      setFormError(null);
      setSubmitted(false);
      setPurchased(false);
      setImageIndex(0);
    }
  }, [listing?.id]);

  function submitOffer() {
    if (!listing || makeOffer.isPending || offerLock.current) return;
    if (!user) {
      setFormError("Sign in to send an offer.");
      return;
    }
    if (listing.status !== "active") {
      setFormError("This listing is no longer accepting offers.");
      return;
    }
    const error = validateOfferTerms(
      offerPrice,
      quantity,
      listing.quantity ?? 1,
    );
    if (error) {
      setFormError(error);
      return;
    }
    const submittedListingId = listing.id;
    setFormError(null);
    offerLock.current = true;
    makeOffer.mutate(
      {
        listing_id: listing.id,
        offer_price: Number(offerPrice),
        quantity: Number(quantity),
      },
      {
        onSuccess: () => {
          if (currentListingId.current === submittedListingId)
            setSubmitted(true);
        },
        onError: () => {
          if (currentListingId.current === submittedListingId)
            setFormError(
              "We couldn’t send your offer. Your entries are preserved. Check My Offers before sending it again.",
            );
        },
        onSettled: () => {
          offerLock.current = false;
        },
      },
    );
  }

  return {
    atMax,
    buyOpen,
    error,
    formError,
    imageIndex,
    isCompared,
    isError,
    isPending,
    isSubmitting: makeOffer.isPending,
    listing,
    offerPrice,
    offerTotal:
      validateOfferTerms(offerPrice, quantity, listing?.quantity ?? 1) == null
        ? offerSubtotal(Number(offerPrice), Number(quantity))
        : null,
    purchased,
    quantity,
    setBuyOpen,
    setFormError,
    setImageIndex,
    setOfferPrice,
    setPurchased,
    setQuantity,
    submitOffer,
    submitted,
    toggle,
  };
}
