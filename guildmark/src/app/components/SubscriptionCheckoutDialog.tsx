/**
 * SubscriptionCheckoutDialog (View)
 *
 * Step 1 — confirm the plan + price
 * Step 2 — custom payment form (Square individual hosted fields + billing address)
 * Step 3 — success confirmation
 *
 * Square SDK lifecycle, billing state, and the payment flow live in
 * useSubscriptionCheckoutViewModel / square.service. Presentation only.
 */
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, CheckCircle2, AlertCircle, CreditCard, Sparkles } from "lucide-react";
import { formatFeeRate, usePlatformFees } from "../lib/apiHooks";
import { useSubscriptionCheckoutViewModel } from "../viewmodels/useSubscriptionCheckoutViewModel";

export type { PaidPlan } from "../constants/subscriptionCheckout.constants";

import type { PaidPlan } from "../constants/subscriptionCheckout.constants";

const inputCls =
  "w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm  " +
  "placeholder:text-black focus:outline-none focus:ring-1 focus:ring-ring " +
  "disabled:opacity-50";

interface Props {
  currentPlan: string;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful payment, just before the dialog closes. */
  onSuccess?: () => void;
  open: boolean;
  plan: PaidPlan;
}

export function SubscriptionCheckoutDialog({ currentPlan, onOpenChange, onSuccess, open, plan }: Props) {
  const { data: fees } = usePlatformFees();
  const {
    addr1, addr2, bizName, cardError, cardholderName, city, handleDone, handlePay, isLoading,
    isUpgrade, meta, saveCard, checkPayment, setAddr1, setAddr2, setBizName, setCardholderName, setCity,
    setSaveCard, setStateAb, setStep, setZip, stateAb, step, zip,
  } = useSubscriptionCheckoutViewModel(plan, currentPlan, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className=" flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amps-accent" />
            {step === "pending" ? "Payment confirmation pending" : step === "success"
              ? "You're all set!"
              : isUpgrade
              ? `Upgrade to ${meta.label}`
              : `Switch to ${meta.label}`}
          </DialogTitle>
          <DialogDescription className="">
            {step === "confirm" && `$${meta.price}/month, billed monthly. Cancel any time.`}
            {step === "card"    && "Enter your payment details to complete the subscription."}
            {step === "success" && `Your ${meta.label} plan is now active.`}
            {step === "pending" && "Your plan has not been activated by this checkout. Check this payment before attempting another charge."}
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
                  {formatFeeRate(fees?.[`seller_fee_${plan}`])} marketplace seller fee (vs {formatFeeRate(fees?.seller_fee_free)} on Free)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  {meta.valuationCredits.toLocaleString()} fresh valuation credits / billing month
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">Company plan. No annual commitment or automatic usage overages. Invoice drafts and MDM pages are prototypes; integrations, expanded reports and invitations are still being prepared.</p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                className="flex-1 bg-amps-accent hover:bg-amps-accent/90 text-amps-accent-foreground "
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
                <p className="text-sm ">I authorize ${meta.price}/month recurring billing</p>
                <p className="text-xs text-muted-foreground ">
                  Square will save this card and charge it monthly until you cancel. Cancel in Settings before renewal; paid access continues through the current period.
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
                className="flex-1 bg-amps-accent hover:bg-amps-accent/90 text-amps-accent-foreground  gap-2"
                onClick={handlePay}
                disabled={isLoading || !saveCard}
              >
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  : <><CreditCard className="w-4 h-4" /> Subscribe · ${meta.price}/mo</>
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
                Payment was verified for this plan. Review billing history for your payment record.
              </p>
            </div>
            <Button
              className="mt-2 bg-amps-accent hover:bg-amps-accent/90 text-amps-accent-foreground "
              onClick={() => handleDone(onOpenChange, onSuccess)}
            >
              Done
            </Button>
          </div>
        )}
        {step === "pending" && <div className="space-y-4 py-4"><p className="text-sm text-muted-foreground">The provider or billing service has not supplied a verified completed payment. No new AMPS access is granted here. This attempt is retained in this browser session so checking again does not start another payment.</p>{cardError && <p role="alert" className="text-sm text-destructive">{cardError}</p>}<div className="flex gap-2"><Button onClick={checkPayment} disabled={isLoading}>{isLoading ? "Checking…" : "Check existing payment"}</Button><Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Close</Button></div></div>}
      </DialogContent>
    </Dialog>
  );
}
