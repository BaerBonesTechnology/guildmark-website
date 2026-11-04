/** ViewModel for the subscription checkout dialog: Square + billing flow. */
import { useEffect, useRef, useState } from "react";
import { squareApplicationId, squareLocationId, squareEnvironment } from "../config";
import { PLAN_META, type PaidPlan } from "../constants/subscriptionCheckout.constants";
import { useAuth } from "../hooks/useAuth";
import { useSubscriptionCheckout } from "../lib/apiHooks";
import { isSquareSandbox, loadSquareSdk, type SquareCardForm } from "../services/square.service";
import { loadSubscriptionPayment, subscriptionPaymentOutcome, subscriptionCanRestart } from "../services/subscriptionPayment.service";

type Step = "card" | "confirm" | "success" | "pending";

export function useSubscriptionCheckoutViewModel(plan: PaidPlan, currentPlan: string, open: boolean) {
  const meta = PLAN_META[plan];
  const checkout = useSubscriptionCheckout();
  const { refreshUser, user } = useAuth();
  const scope = `guildmark-subscription:${user?.company_id}:${plan}`;
  const [attempt] = useState(() => {
    try { return loadSubscriptionPayment(sessionStorage, scope); }
    catch { return { key: "", submitted: true }; }
  });

  const [step, setStep] = useState<Step>(attempt.submitted ? "pending" : "confirm");
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
  function handlePaymentFailure(error: unknown) {
    setCardError(error instanceof Error ? error.message : "Payment status could not be confirmed. Check the existing payment before trying again.");
    if (subscriptionCanRestart(error)) {
      sessionStorage.removeItem(scope);
      attempt.key = crypto.randomUUID();attempt.submitted = false;
      setStep("card");setCardInitKey(k => k + 1);
    } else if (attempt.submitted) setStep("pending");
  }

  // Mount Square card form when we reach the card step (or when cardInitKey bumps).
  useEffect(() => {
    if (step !== "card" || !open) return;
    let cancelled = false;

    async function initSquare() {
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
    if (attempt.submitted || !attempt.key) { setStep("pending"); return; }
    const markSubmitted = () => { sessionStorage.setItem(scope, JSON.stringify({key: attempt.key, submitted: true})); attempt.submitted = true; };
    // Sandbox shortcut — bypass the SDK card form and use Square's static test
    // nonce so backend config can be verified without a matching frontend appId.
    if (isSquareSandbox()) {
      setIsLoading(true);
      setCardError("");
      try {
        markSubmitted();
        const payment = await checkout.mutateAsync({
          plan,
          idempotency_key: attempt.key,
          expected_price_cents: meta.price * 100,
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
        const outcome = subscriptionPaymentOutcome(payment, plan, meta.price * 100);
        if (outcome === "success") sessionStorage.removeItem(scope);
        setStep(outcome);
      } catch (err) {
        handlePaymentFailure(err);
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

      markSubmitted();
      const payment = await checkout.mutateAsync({
        plan,
        idempotency_key: attempt.key,
        expected_price_cents: meta.price * 100,
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

      const outcome = subscriptionPaymentOutcome(payment, plan, meta.price * 100);
      if (outcome === "success") sessionStorage.removeItem(scope);
      setStep(outcome);
    } catch (err) {
      handlePaymentFailure(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDone(onOpenChange: (open: boolean) => void, onSuccess?: () => void) {
    if (step !== "success") return;
    // Refresh the access token so the in-memory user picks up the new
    // subscription_plan before TierGate checks it.
    await refreshUser();
    onOpenChange(false);
    onSuccess?.();
  }
  async function checkPayment() {
    if (!attempt.key) {setCardError("Payment recovery details are unavailable. Contact support and check billing before making another payment.");return;}
    setIsLoading(true);setCardError("");
    try {
      const result = await checkout.mutateAsync({plan, idempotency_key: attempt.key, expected_price_cents: meta.price * 100});
      const outcome = subscriptionPaymentOutcome(result, plan, meta.price * 100);
      if (outcome === "success") sessionStorage.removeItem(scope);
      setStep(outcome);
    } catch (error) {handlePaymentFailure(error);}
    finally {setIsLoading(false);}
  }

  const isUpgrade =
    currentPlan === "free" ||
    (currentPlan === "starter" && (plan === "growth" || plan === "pro")) ||
    (currentPlan === "growth" && plan === "pro");

  return {
    addr1, addr2, bizName, cardError, cardholderName, city, handleDone, handlePay, isLoading,
    isUpgrade, meta, saveCard, checkPayment, setAddr1, setAddr2, setBizName, setCardholderName, setCity,
    setSaveCard, setStateAb, setStep, setZip, stateAb, step, zip,
  };
}
