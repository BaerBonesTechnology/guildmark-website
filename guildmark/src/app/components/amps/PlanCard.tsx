/** GM Pro pricing plan card. */
import { Check } from "lucide-react";
import { AMPS_ACCENT } from "../../constants/amps.constants";
import type { Plan } from "../../constants/proSignup.constants";
import { DISPLAY, MONO } from "../../constants/typography";
import type { PaidPlan } from "../SubscriptionCheckoutDialog";
import type { PlatformFees } from "../../lib/apiHooks";
import { sellerFeeLabel } from "../../services/proSignup.service";

interface PlanCardProps {
  fees: PlatformFees | undefined;
  onSelect: (plan: PaidPlan) => void;
  plan: Plan;
}

export function PlanCard({ fees, onSelect, plan }: PlanCardProps) {
  const highlight = plan.highlight;
  return (
    <div className="relative border p-6 space-y-5" style={{ background: "var(--card)", borderColor: highlight ? AMPS_ACCENT : "var(--border)" }}>
      {highlight && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-0.5 text-[10px] font-semibold text-white tracking-wider uppercase" style={{ background: AMPS_ACCENT, fontFamily: MONO }}>Most popular</span>
        </div>
      )}
      <div className="space-y-1">
        <p className="font-semibold" style={{ color: AMPS_ACCENT, fontFamily: MONO, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{plan.label}</p>
        <div className="flex items-baseline gap-1">
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "2.5rem", lineHeight: 1 }}>${plan.price}</span>
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>/month</span>
        </div>
        <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{sellerFeeLabel(plan.key, fees)} marketplace seller fee</p>
      </div>
      <ul className="space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <Check size={15} className="shrink-0 mt-0.5" style={{ color: AMPS_ACCENT }} /> {f}
          </li>
        ))}
      </ul>
      <button onClick={() => onSelect(plan.key)} className="w-full py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ background: AMPS_ACCENT }}>Get {plan.label}</button>
    </div>
  );
}
