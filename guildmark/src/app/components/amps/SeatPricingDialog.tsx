import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PLAN_CATALOG, type PaidPlan } from "../../constants/planCatalog";

const dollars = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

/** Transparent estimate only: paid seat activation has not been implemented. */
export function SeatPricingDialog({ plan, open, onOpenChange }: { plan: PaidPlan; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [quantityText, setQuantityText] = useState("1");
  const tier = PLAN_CATALOG[plan];
  const quantity = Number(quantityText);
  const valid = quantityText.trim() !== "" && Number.isSafeInteger(quantity) && quantity >= 1 && Number.isSafeInteger(quantity * tier.additionalSeatPrice + tier.price);
  const extra = quantity * tier.additionalSeatPrice;
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[calc(100%_-_32px)] max-w-lg max-h-[calc(100dvh_-_32px)] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add staff seats</DialogTitle>
        <DialogDescription>{tier.label} includes one owner. Preview the monthly price of additional staff seats.</DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Label htmlFor="additional-staff-seats">Additional seats</Label>
        <Input id="additional-staff-seats" type="number" min="1" step="1" inputMode="numeric" value={quantityText} onChange={event => setQuantityText(event.target.value)} aria-invalid={!valid} aria-describedby={!valid ? "seat-quantity-error" : undefined} />
        {!valid && <p id="seat-quantity-error" className="text-sm text-destructive">Enter a whole number of 1 or more.</p>}
      </div>
      <dl className="space-y-3 text-sm" aria-live="polite">
        <div className="flex justify-between gap-4"><dt>{tier.label} subscription</dt><dd>{dollars(tier.price)}/month</dd></div>
        <div className="flex justify-between gap-4"><dt>Additional seats · {dollars(tier.additionalSeatPrice)} each</dt><dd>{valid ? dollars(extra) : "—"}/month</dd></div>
        <div className="flex justify-between gap-4 border-t pt-3 font-semibold"><dt>Estimated monthly total</dt><dd>{valid ? dollars(tier.price + extra) : "—"}</dd></div>
      </dl>
      <p className="text-xs text-muted-foreground">Prices are in USD, before any applicable tax. Seat purchasing and invitations are not available yet. This preview does not change your subscription or charge your account.</p>
      <button type="button" onClick={() => onOpenChange(false)} className="rounded bg-amps-accent px-4 py-2 text-sm font-medium text-amps-accent-foreground">Done</button>
    </DialogContent>
  </Dialog>;
}
