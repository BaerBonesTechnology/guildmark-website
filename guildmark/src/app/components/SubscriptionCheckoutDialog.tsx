/**
 * SubscriptionCheckoutDialog
 *
 * Step 1 — confirm the plan + price
 * Step 2 — custom payment form (Square individual hosted fields + billing address)
 * Step 3 — success confirmation
 *
 * Square tokenises card number, CVV, and expiry in browser-hosted iframes so
 * raw card data never touches our servers. Billing fields are plain HTML inputs
 * sent alongside the Square payment nonce.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, CheckCircle2, AlertCircle, CreditCard, Sparkles } from "lucide-react";
import { useSubscriptionCheckout, useTriggerValuation } from "../lib/apiHooks";
import { squareApplicationId, squareLocationId, squareEnvironment } from "../config";
import { useAuth } from "../hooks/useAuth";

// ---------------------------------------------------------------------------
// Lazy-load Square SDK
// ---------------------------------------------------------------------------

const SQUARE_SDK_URLS: Record<string, string> = {
  production: "https://web.squarecdn.com/v1/square.js",
  sandbox:    "https://sandbox.web.squarecdn.com/v1/square.js",
};

let squareSdkPromise: Promise<void> | null = null;

function loadSquareSdk(): Promise<void> {
  if (window.Square) return Promise.resolve();
  if (squareSdkPromise) return squareSdkPromise;

  squareSdkPromise = new Promise((resolve, reject) => {
    const url = SQUARE_SDK_URLS[squareEnvironment] ?? SQUARE_SDK_URLS.sandbox;
    const script = document.createElement("script");
    script.src     = url;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load Square SDK from ${url}`));
    document.head.appendChild(script);
  });

  return squareSdkPromise;
}

// ---------------------------------------------------------------------------
// Plan metadata
// ---------------------------------------------------------------------------

export type PaidPlan = "starter" | "growth" | "pro";

const PLAN_META: Record<PaidPlan, {
  label:       string;
  price:       number;
  sellerFee:   string;
  devices:     string;
  teamMembers: string;
  color:       string;
}> = {
  starter: { label: "Starter", price: 49,  sellerFee: "6%", devices: "Up to 100 devices",  teamMembers: "2 team members",         color: "text-blue-500"   },
  growth:  { label: "Growth",  price: 149, sellerFee: "5%", devices: "Up to 500 devices",  teamMembers: "5 team members",         color: "text-violet-500" },
  pro:     { label: "Pro",     price: 349, sellerFee: "3%", devices: "Unlimited devices",  teamMembers: "Unlimited team members", color: "text-amber-500"  },
};

// ---------------------------------------------------------------------------
// Square type shim — combined card form (payments.card() is the standard SDK API)
// ---------------------------------------------------------------------------

type SquareCardForm = {
  attach:   (selector: string) => Promise<void>;
  tokenize: () => Promise<{
    status:  string;
    token?:  string;
    errors?: { message: string }[];
  }>;
  destroy:  () => Promise<void>;
};

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<{
        card: (options?: object) => Promise<SquareCardForm>;
      }>;
    };
  }
}

// ---------------------------------------------------------------------------
// Shared input styles
// ---------------------------------------------------------------------------

const inputCls =
  "w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm  " +
  "placeholder:text-black focus:outline-none focus:ring-1 focus:ring-ring " +
  "disabled:opacity-50";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Step = "confirm" | "card" | "success";

interface Props {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  plan:         PaidPlan;
  currentPlan:  string;
  /** Called after a successful payment, just before the dialog closes. */
  onSuccess?:   () => void;
}

export function SubscriptionCheckoutDialog({ open, onOpenChange, plan, currentPlan, onSuccess }: Props) {
  const meta           = PLAN_META[plan];
  const checkout          = useSubscriptionCheckout();
  const triggerValuation  = useTriggerValuation();
  const { refreshUser }   = useAuth();

  const [step,      setStep]      = useState<Step>("confirm");
  const [cardError, setCardError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveCard,  setSaveCard]  = useState(true);

  // Card detail fields
  const [cardholderName, setCardholderName] = useState("");

  // Billing address fields
  const [bizName, setBizName] = useState("");
  const [addr1,   setAddr1]   = useState("");
  const [addr2,   setAddr2]   = useState("");
  const [city,    setCity]    = useState("");
  const [stateAb, setStateAb] = useState("");
  const [zip,     setZip]     = useState("");

  // Square card form ref (combined — handles card number, expiry, and CVV)
  const cardRef = useRef<SquareCardForm | null>(null);
  // Incrementing this forces the card form to fully re-mount (new nonce on retry).
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

  // Reset when dialog closes
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
    // ── Sandbox shortcut ────────────────────────────────────────────────────
    // In sandbox mode (VITE_SQUARE_ENVIRONMENT=sandbox) we bypass the SDK card
    // form and use Square's static test nonce so we can verify backend config
    // without needing a matching application ID on the frontend.
    // Detect sandbox by env string OR by the sandbox- prefix on the application ID
    const isSandbox = squareEnvironment === "sandbox" || squareApplicationId.startsWith("sandbox-");
    if (isSandbox) {
      setIsLoading(true);
      setCardError("");
      try {
        await checkout.mutateAsync({
          plan,
          source_id:       "cnon:card-nonce-ok",
          save_card:       saveCard,
          cardholder_name: cardholderName.trim() || "Sandbox Test",
          billing_address: {
            address_line_1: addr1.trim() || "123 Test St",
            city:           city.trim()  || "New York",
            state:          stateAb.trim().toUpperCase() || "NY",
            postal_code:    zip.trim()   || "10001",
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
    // ── Production flow (real SDK tokenization) ─────────────────────────────
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
        const msg = result.errors?.[0]?.message ?? "Card tokenisation failed";
        setCardError(msg);
        setIsLoading(false);
        return;
      }

      await checkout.mutateAsync({
        plan,
        source_id:       result.token,
        save_card:       saveCard,
        cardholder_name: cardholderName.trim(),
        billing_address: {
          business_name:  bizName.trim() || undefined,
          address_line_1: addr1.trim(),
          address_line_2: addr2.trim() || undefined,
          city:           city.trim(),
          state:          stateAb.trim().toUpperCase(),
          postal_code:    zip.trim(),
        },
      });

      setStep("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed. Please try again.";
      setCardError(msg);
      // The nonce returned by tokenize() is single-use. After any server-side
      // payment failure the card form must be re-initialized so the next
      // attempt generates a fresh nonce rather than reusing the consumed one.
      setCardInitKey(k => k + 1);
    } finally {
      setIsLoading(false);
    }
  }

  const isUpgrade =
    currentPlan === "free" ||
    (currentPlan === "starter" && (plan === "growth" || plan === "pro")) ||
    (currentPlan === "growth"  && plan === "pro");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className=" flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amps-accent" />
            {step === "success"
              ? "You're all set!"
              : isUpgrade
              ? `Upgrade to ${meta.label}`
              : `Switch to ${meta.label}`}
          </DialogTitle>
          <DialogDescription className="">
            {step === "confirm" && `$${meta.price}/month, billed monthly. Cancel any time.`}
            {step === "card"    && "Enter your payment details to complete the subscription."}
            {step === "success" && `Your ${meta.label} plan is now active.`}
          </DialogDescription>
        </DialogHeader>

        {/* ── Step 1: Confirm ── */}
        {step === "confirm" && (
          <div className="space-y-5 py-2">
            <div className="rounded-lg border bg-muted p-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className={` font-semibold text-lg ${meta.color}`}>
                  {meta.label}
                </span>
                <span className=" font-bold text-xl">
                  ${meta.price}
                  <span className="text-sm text-muted-foreground font-normal">/mo</span>
                </span>
              </div>
              <ul className="space-y-1.5 text-sm  text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  {meta.devices}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  {meta.teamMembers}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  {meta.sellerFee} marketplace seller fee (vs 8% on Free)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  Full AMPS asset management suite
                </li>
              </ul>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                className="flex-1 bg-amps-accent hover:bg-amps-accent/90 text-white "
                onClick={() => setStep("card")}
              >
                Continue to payment
              </Button>
              <Button
                variant="outline"
                className=""
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Payment form ── */}
        {step === "card" && (
          <div className="space-y-5 py-2">

            {/* ── Card Details section ── */}
            <div className="space-y-3">
              <p className="text-xs  font-semibold uppercase tracking-wider text-foreground">
                Card Details
              </p>

              {/* Cardholder Name */}
              <div className="space-y-1 text-black ">
                <label className="text-xs  text-foreground/70">Cardholder Name *</label>
                <input
                  className={inputCls}
                  placeholder="Jane Smith"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  autoComplete="cc-name"
                  disabled={isLoading}
                />
              </div>

              {/* Square card form — Card Number, Expiry, CVV hosted by Square */}
              <div className="space-y-1">
                <label className="text-xs  text-foreground/70">
                  Card Number · Expiry · CVV
                </label>
                {/* Square Web Payments SDK mounts its iframe here.
                    Card data is tokenised in the browser — never sent to our servers. */}
                <div id="gm-square-card" className="rounded-md border border-input bg-input-background p-1 min-h-[56px]" />
              </div>
            </div>

            {/* ── Billing Address section ── */}
            <div className="space-y-3 border-t pt-4">
              <p className="text-xs  font-semibold uppercase tracking-wider text-foreground">
                Billing Address
              </p>

              {/* Business Name */}
              <div className="space-y-1">
                <label className="text-xs  text-foreground/70">Business Name</label>
                <input
                  className={inputCls}
                  placeholder="Acme Corp"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  autoComplete="organization"
                  disabled={isLoading}
                />
              </div>

              {/* Address Line 1 */}
              <div className="space-y-1">
                <label className="text-xs  text-foreground/70">Address Line 1 *</label>
                <input
                  className={inputCls}
                  placeholder="123 Main St"
                  value={addr1}
                  onChange={(e) => setAddr1(e.target.value)}
                  autoComplete="address-line1"
                  disabled={isLoading}
                />
              </div>

              {/* Address Line 2 */}
              <div className="space-y-1">
                <label className="text-xs  text-foreground/70">Address Line 2</label>
                <input
                  className={inputCls}
                  placeholder="Suite 400"
                  value={addr2}
                  onChange={(e) => setAddr2(e.target.value)}
                  autoComplete="address-line2"
                  disabled={isLoading}
                />
              </div>

              {/* City + State */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs  text-foreground/70">City *</label>
                  <input
                    className={inputCls}
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    autoComplete="address-level2"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs  text-foreground/70">State *</label>
                  <input
                    className={inputCls}
                    placeholder="NY"
                    maxLength={2}
                    value={stateAb}
                    onChange={(e) => setStateAb(e.target.value.toUpperCase())}
                    autoComplete="address-level1"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* ZIP */}
              <div className="space-y-1">
                <label className="text-xs  text-foreground/70">ZIP Code *</label>
                <input
                  className={`${inputCls} max-w-[160px]`}
                  placeholder="10001"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  autoComplete="postal-code"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Save card checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="mt-0.5 rounded border-border"
                disabled={isLoading}
              />
              <div>
                <p className="text-sm ">Save card for future payments</p>
                <p className="text-xs text-muted-foreground ">
                  Your card is stored securely by Square — we never see or store your card number.
                </p>
              </div>
            </label>

            {/* Error */}
            {cardError && (
              <div className="flex items-start gap-2 text-sm text-destructive ">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {cardError}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-amps-accent hover:bg-amps-accent/90 text-white  gap-2"
                onClick={handlePay}
                disabled={isLoading}
              >
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  : <><CreditCard className="w-4 h-4" /> Pay ${meta.price}</>
                }
              </Button>
              <Button
                variant="outline"
                className=""
                onClick={() => setStep("confirm")}
                disabled={isLoading}
              >
                Back
              </Button>
            </div>

            <p className="text-xs text-muted-foreground  text-center">
              Secured by Square · Your card is encrypted and never stored on our servers.
            </p>
          </div>
        )}

        {/* ── Step 3: Success ── */}
        {step === "success" && (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-1">
              <p className=" font-semibold">{meta.label} plan activated</p>
              <p className="text-sm text-muted-foreground ">
                Your new features are available immediately. A receipt has been sent to your email.
              </p>
            </div>
            <Button
              className="mt-2 bg-amps-accent hover:bg-amps-accent/90 text-white "
              onClick={async () => {
                // Refresh the access token so the in-memory user picks up the
                // new subscription_plan before TierGate checks it.
                await refreshUser();
                // Fire-and-forget: kick off background ML re-valuation for any
                // existing listings so the user sees current values immediately
                // rather than waiting for the next scheduled run.
                // Only triggers if the company already has listings; otherwise
                // the backend returns { status: "no_listings" } and the banner
                // never appears.
                triggerValuation.mutate();
                onOpenChange(false);
                onSuccess?.();
              }}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
