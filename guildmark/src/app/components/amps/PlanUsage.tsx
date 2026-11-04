import { useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { useSubscription } from "../../lib/apiHooks";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { BODY } from "../../constants/typography";
import { PAID_PLANS } from "../../constants/planCatalog";
import { SeatPricingDialog } from "./SeatPricingDialog";

function UsageInfo({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button type="button" aria-label={`About ${label}`} className="inline-flex min-h-7 min-w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary" onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setOpen(true); }}><Info size={14} aria-hidden="true" /></button></PopoverTrigger><PopoverContent aria-label={`About ${label}`} className="max-w-[calc(100vw-2rem)] text-xs leading-relaxed" style={{ fontFamily: BODY }} onOpenAutoFocus={(event) => event.preventDefault()} onCloseAutoFocus={(event) => event.preventDefault()}>{children}</PopoverContent></Popover>;
}

export function PlanUsage() {
  const [seatPricingOpen, setSeatPricingOpen] = useState(false);
  const { data, isPending, isError, refetch } = useSubscription();
  if (isPending) return <p role="status" className="text-xs text-muted-foreground">Loading plan usage...</p>;
  if (isError || !data?.usage || !data.limits) return <p role="status" className="text-xs text-muted-foreground">Plan usage could not be loaded. <button type="button" className="underline" onClick={() => refetch()}>Retry usage</button></p>;
  const { usage, limits } = data;
  const paidPlan = PAID_PLANS.find(plan => plan === data.plan);
  const restricted = !data.eligibility?.paid || usage.over_asset_limit || usage.over_seat_limit;
  return <section aria-label="Company plan usage" className="space-y-3 rounded-lg border border-border bg-card p-4" style={{ fontFamily: BODY }}>
    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold capitalize">{data.plan} plan <span className="ml-2 text-xs font-normal text-muted-foreground">{data.status.replaceAll("_", " ")}</span></p><span className="text-xs text-muted-foreground">{restricted ? "Plan restrictions apply" : "Company allowance"}</span></div>
    <dl className="grid gap-3 text-sm sm:grid-cols-3">
      <div><dt className="flex items-center gap-1 text-xs text-muted-foreground">Active physical devices<UsageInfo label="active physical devices">Active hardware quantities count toward this allowance; archived records and software licenses do not. Existing records remain available for viewing and CSV export when additions are restricted. No automatic overage charges.</UsageInfo></dt><dd className="font-semibold">{usage.asset_units.toLocaleString()} / {limits.asset_limit.toLocaleString()}</dd></div>
      <div><dt className="flex items-center gap-1 text-xs text-muted-foreground">Staff seats<UsageInfo label="staff seats">One owner seat is included. Extra staff seat purchasing and team invitations are not available yet. Seat access does not automatically grant purchasing or billing permissions. Expanded integrations are still being prepared.</UsageInfo></dt><dd className="flex flex-wrap items-center gap-3 font-semibold"><span>{usage.active_seats}/{limits.seat_limit} Seats</span>{paidPlan && <button type="button" onClick={() => setSeatPricingOpen(true)} className="rounded border border-amps-accent px-2 py-1 text-xs font-medium text-amps-accent hover:bg-secondary">Add seats</button>}</dd></div>
      <div><dt className="flex items-center gap-1 text-xs text-muted-foreground">Valuation credits<UsageInfo label="valuation credits">One credit per successful fresh estimate for an asset record and input version. Viewing records, CSV export and cached estimates do not use credits. Select up to five records per assistant request; a record may contain multiple devices.</UsageInfo></dt><dd className="font-semibold">{usage.valuation_used.toLocaleString()} / {limits.valuation_limit.toLocaleString()}<span className="ml-2 text-xs font-normal text-muted-foreground">{usage.valuation_remaining.toLocaleString()} available</span></dd></div>
    </dl>
    {usage.period_end && <p className="text-xs text-muted-foreground">Credit period ends {new Date(usage.period_end).toLocaleDateString()}.</p>}
    {paidPlan && <SeatPricingDialog plan={paidPlan} open={seatPricingOpen} onOpenChange={setSeatPricingOpen} />}
  </section>;
}
