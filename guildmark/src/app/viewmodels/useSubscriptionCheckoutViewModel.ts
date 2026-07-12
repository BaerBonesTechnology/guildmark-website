/** ViewModel for the subscription checkout dialog: Square + billing flow. */
import { useEffect, useRef, useState } from "react";
import { squareApplicationId, squareLocationId, squareEnvironment } from "../config";
import { PLAN_META, type PaidPlan } from "../constants/subscriptionCheckout.constants";
import { useAuth } from "../hooks/useAuth";
import { useSubscriptionCheckout, useTriggerValuation } from "../lib/apiHooks";
import { isSquareSandbox, loadSquareSdk, type SquareCardForm } from "../services/square.service";

type Step = "card" | "confirm" | "success";

export function useSubscriptionCheckoutViewModel(plan: PaidPlan, currentPlan: string, open: boolean) {
  const meta = PLAN_META[plan];
  const checkout = useSubscriptionCheckout();
  const triggerValuation = useTriggerValuation();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState<Step>("confirm");
  const [cardError, setCardError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [cardholderName, setCardholderName] = useState("");
  const [bizName, setBizName] = useState("");
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [city, setCity] = useState("");
  const [stateAb, setStateAb] = useState("");
  const [zip, setZip] = useState("");

  const cardRef = useRef<SquareCardForm | null>(null);
  const [cardInitKey, setCardInitKey] = useState(0);

  // Mount Square card form when we reach the card step (or when cardInitKey bumps).
  useEffect(() => {
    if (step !== "card" || !open) return;
    let cancelled = false;

    async function initSquare() {
      setCardError("");
      try {
        await loadSquareSdk();
        if (!window.Square) throw new Error("Square SDK not available");

        console.log('[Square] init appId=%s locationId=%s env=%s', squareApplicationId, squareLocationId, squareEnvironment);
        const payments = await window.Square.payments(squareApplicationId, squareLocationId);
        const card = await payments.card();

        if (cancelled) {
          await card.destroy().catch(() => {});
          return;
        }

        cardRef.current = card;
        await card.attach("#gm-square-card");
      } catch (err) {
        if (!cancelled) {
          setCardError(err instanceof Error ? err.message : "Failed to load payment form");
        }
      }
    }

    initSquare();

    return () => {
      cancelled = true;
      cardRef.current?.destroy().catch(() => {});
      cardRef.current = null;
    };
  }, [step, open, cardInitKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when dialog closes.
  useEffect(() => {
    if (!open) {
      setStep("confirm");
      setCardError("");
      setIsLoading(false);
      setCardInitKey(0);
      setCardholderName("");
      setBizName(""); setAddr1(""); setAddr2("");
      setCity(""); setStateAb(""); setZip("");
      checkout.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePay() {
    // Sandbox shortcut — bypass the SDK card form and use Square's static test
    // nonce so backend config can be verified without a matching frontend appId.
    if (isSquareSandbox()) {
      setIsLoading(true);
      setCardError("");
      try {
        await checkout.mutateAsync({
          plan,
          source_id: "cnon:card-nonce-ok",
          save_card: saveCard,
          cardholder_name: cardholderName.trim() || "Sandbox Test",
          billing_address: {
            address_line_1: addr1.trim() || "123 Test St",
            city: city.trim() || "New York",
            state: stateAb.trim().toUpperCase() || "NY",
            postal_code: zip.trim() || "10001",
          },
        });
        setStep("success");
      } catch (err) {
        setCardError(err instanceof Error ? err.message : "Payment failed.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Production flow — real SDK tokenization.
    if (!cardRef.current) {
      setCardError("Payment form not ready — please wait.");
      return;
    }
    if (!cardholderName.trim()) {
      setCardError("Cardholder name is required.");
      return;
    }
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

      await checkout.mutateAsync({
        plan,
        source_id: result.token,
        save_card: saveCard,
        cardholder_name: cardholderName.trim(),
        billing_address: {
          business_name: bizName.trim() || undefined,
          address_line_1: addr1.trim(),
          address_line_2: addr2.trim() || undefined,
          city: city.trim(),
          state: stateAb.trim().toUpperCase(),
          postal_code: zip.trim(),
        },
      });

      setStep("success");
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      // The nonce is single-use — force a fresh card form for the next attempt.
      setCardInitKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDone(onOpenChange: (open: boolean) => void, onSuccess?: () => void) {
    // Refresh the access token so the in-memory user picks up the new
    // subscription_plan before TierGate checks it.
    await refreshUser();
    // Fire-and-forget background ML re-valuation so existing listings show
    // current values immediately (backend no-ops if there are no listings).
    triggerValuation.mutate();
    onOpenChange(false);
    onSuccess?.();
  }

  const isUpgrade =
    currentPlan === "free" ||
    (currentPlan === "starter" && (plan === "growth" || plan === "pro")) ||
    (currentPlan === "growth" && plan === "pro");

  return {
    addr1, addr2, bizName, cardError, cardholderName, city, handleDone, handlePay, isLoading,
    isUpgrade, meta, saveCard, setAddr1, setAddr2, setBizName, setCardholderName, setCity,
    setSaveCard, setStateAb, setStep, setZip, stateAb, step, zip,
  };
}
