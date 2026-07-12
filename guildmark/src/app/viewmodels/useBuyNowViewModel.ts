/** ViewModel for the Buy Now dialog: Square card lifecycle + payment flow. */
import { useEffect, useRef, useState } from "react";
import { squareApplicationId, squareLocationId } from "../config";
import { useBuyListing, usePlatformFees } from "../lib/apiHooks";
import type { MarketplaceListing } from "../models/marketplace";
import {
  computeOrderTotals, isSquareSandbox, loadSquareSdk, type SquareCardForm,
} from "../services/square.service";

type Step = "card" | "success";

export function useBuyNowViewModel(listing: MarketplaceListing, quantity: number, open: boolean) {
  const buy = useBuyListing(listing.id);
  const { data: fees } = usePlatformFees();

  const [step, setStep] = useState<Step>("card");
  const [cardError, setCardError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [city, setCity] = useState("");
  const [stateAb, setStateAb] = useState("");
  const [zip, setZip] = useState("");

  const cardRef = useRef<SquareCardForm | null>(null);
  const [cardInitKey, setCardInitKey] = useState(0);

  const totals = computeOrderTotals(listing, quantity, fees?.buyer_fee ?? null);
  const { qty, total, unit } = totals;

  // Mount the Square card form when we reach the card step (or on retry).
  useEffect(() => {
    if (step !== "card" || !open) return;
    let cancelled = false;

    (async () => {
      setCardError("");
      try {
        await loadSquareSdk();
        if (!window.Square) throw new Error("Square SDK not available");
        const payments = await window.Square.payments(squareApplicationId, squareLocationId);
        const card = await payments.card();
        if (cancelled) { await card.destroy().catch(() => {}); return; }
        cardRef.current = card;
        await card.attach("#gm-buynow-card");
      } catch (err) {
        if (!cancelled) setCardError(err instanceof Error ? err.message : "Failed to load payment form");
      }
    })();

    return () => {
      cancelled = true;
      cardRef.current?.destroy().catch(() => {});
      cardRef.current = null;
    };
  }, [step, open, cardInitKey]);

  // Reset when the dialog closes.
  useEffect(() => {
    if (!open) {
      setStep("card");
      setCardError("");
      setIsLoading(false);
      setCardInitKey(0);
      setCardholderName("");
      setAddr1(""); setAddr2(""); setCity(""); setStateAb(""); setZip("");
      buy.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePay() {
    // Sandbox shortcut — bypass the SDK card form and use Square's static test
    // nonce so backend config can be verified without a matching frontend appId.
    if (isSquareSandbox()) {
      setIsLoading(true);
      setCardError("");
      try {
        await buy.mutateAsync({ source_id: "cnon:card-nonce-ok", quantity: qty, payment_terms: "immediate" });
        setStep("success");
      } catch (err) {
        setCardError(err instanceof Error ? err.message : "Payment failed.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Production flow — real SDK tokenisation.
    if (!cardRef.current) { setCardError("Payment form not ready — please wait."); return; }
    if (!cardholderName.trim()) { setCardError("Cardholder name is required."); return; }
    if (!addr1.trim() || !city.trim() || !stateAb.trim() || !zip.trim()) {
      setCardError("Please fill in all required billing address fields (marked *).");
      return;
    }

    setIsLoading(true);
    setCardError("");
    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== "OK" || !result.token) {
        setCardError(result.errors?.[0]?.message ?? "Card tokenisation failed");
        setIsLoading(false);
        return;
      }
      await buy.mutateAsync({ source_id: result.token, quantity: qty, payment_terms: "immediate" });
      setStep("success");
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      // The nonce is single-use — force a fresh card form for the next attempt.
      setCardInitKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    addr1, addr2, cardError, cardholderName, city, handlePay, isLoading, setAddr1, setAddr2,
    setCardholderName, setCity, setStateAb, setZip, stateAb, step, totals, unit, zip,
  };
}
