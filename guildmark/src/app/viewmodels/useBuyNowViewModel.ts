/** ViewModel for the Buy Now dialog: Square card lifecycle + payment flow. */
import { useEffect, useRef, useState } from "react";
import { ApiError } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { loadCheckout, saveCheckout, canRestartCheckout, type CheckoutAttempt } from "../services/checkoutAttempt";
import { squareApplicationId, squareLocationId } from "../config";
import { useBuyListing, usePlatformFees } from "../lib/apiHooks";
import type { MarketplaceListing } from "../models/marketplace";
import {
  computeOrderTotals, loadSquareSdk, type SquareCardForm,
} from "../services/square.service";

type Step = "card" | "success";

export function useBuyNowViewModel(listing: MarketplaceListing, quantity: number, open: boolean) {
  const buy = useBuyListing(listing.id);
  const { user } = useAuth();
  const attemptRef = useRef<{ scope: string; attempt: CheckoutAttempt } | null>(null);
  const payingRef = useRef(false);
  const scope = `guildmark-checkout:${user?.company_id ?? "anonymous"}:${listing.id}`;
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
      if (step === "success") {
        sessionStorage.removeItem(scope);
        attemptRef.current = null;
      }
      setCardInitKey(0);
      setCardholderName("");
      setAddr1(""); setAddr2(""); setCity(""); setStateAb(""); setZip("");
      buy.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePay() {
    if (payingRef.current) return;
    payingRef.current = true;
    setIsLoading(true);
    setCardError("");
    try {
      if (attemptRef.current?.scope !== scope) {
        attemptRef.current = { scope, attempt: loadCheckout(sessionStorage, scope, qty) };
      }
      const attempt = attemptRef.current.attempt;
      if (attempt.submitted && attempt.quantity !== qty) {
        throw new Error(`An earlier checkout for ${attempt.quantity} items is unresolved. Restore that quantity to resume it.`);
      }
      if (!attempt.submitted) {
        attempt.quantity = qty;
        attempt.expectedTotalCents = Math.round(total * 100);
          if (!cardRef.current) throw new Error("Payment form not ready — please wait.");
          if (!cardholderName.trim() || !addr1.trim() || !city.trim() || !stateAb.trim() || !zip.trim()) {
            throw new Error("Complete the required billing fields before paying.");
          }
          const result = await cardRef.current.tokenize();
          if (result.status !== "OK" || !result.token) throw new Error(result.errors?.[0]?.message ?? "Card tokenisation failed");
          attempt.source = result.token;
        // Persist the key before sending. Reloads resume instead of charging again.
        attempt.submitted = true;
      }
      saveCheckout(sessionStorage, scope, attempt);
      await buy.mutateAsync({
        source_id: attempt.source, idempotency_key: attempt.key,
        expected_total_cents: attempt.expectedTotalCents ?? Math.round(total * 100),
        quantity: attempt.quantity, payment_terms: "immediate",
      });
      setStep("success");
    } catch (err) {
      if (err instanceof ApiError && canRestartCheckout(err.code)) {
        sessionStorage.removeItem(scope);
        attemptRef.current = null;
        setCardInitKey(k => k + 1);
      }
      setCardError(err instanceof Error ? err.message : "Payment could not be confirmed. Retry this checkout.");
    } finally {
      payingRef.current = false;
      setIsLoading(false);
    }
  }

  return {
    addr1, addr2, cardError, cardholderName, city, handlePay, isLoading, setAddr1, setAddr2,
    setCardholderName, setCity, setStateAb, setZip, stateAb, step, totals, unit, zip,
  };
}
