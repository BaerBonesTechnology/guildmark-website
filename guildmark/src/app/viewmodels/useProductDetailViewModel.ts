/** ViewModel for the Product Detail page: listing load, offer form, buy dialog. */
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useCompare } from "../components/CompareContext";
import { useListing, useMakeOffer } from "../lib/apiHooks";

export function useProductDetailViewModel() {
  const { id = "" } = useParams<{ id: string }>();
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
  }, [listing]);

  function submitOffer() {
    const parsedPrice = parseFloat(offerPrice);
    const parsedQuantity = parseInt(quantity, 10);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) { setFormError("Enter a valid offer price"); return; }
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) { setFormError("Enter a valid quantity"); return; }
    setFormError(null);
    makeOffer.mutate(
      { listing_id: listing!.id, offer_price: parsedPrice, quantity: parsedQuantity },
      { onSuccess: () => setSubmitted(true) },
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
