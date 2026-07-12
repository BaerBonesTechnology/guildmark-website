/** One plan tier card in the AMPS Settings subscription grid. */
import { Check } from "lucide-react";
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { PLAN_RANK, type PlanKey, type PlanTier } from "../../constants/ampsSettings.constants";
import { DISPLAY, MONO } from "../../constants/typography";
import type { PaidPlan } from "../SubscriptionCheckoutDialog";
import type { PlatformFees } from "../../lib/apiHooks";
import { sellerFeeLabel } from "../../services/ampsSettings.service";

interface PlanTierCardProps {
  currentPlan: PlanKey;
  fees: PlatformFees | undefined;
  onCancel: () => void;
  onSelect: (plan: PaidPlan) => void;
  plan: PlanTier;
  subActive: boolean;
}

export function PlanTierCard({ currentPlan, fees, onCancel, onSelect, plan: p, subActive }: PlanTierCardProps) {
  const isCurrent = p.key === currentPlan;
  const isUpgrade = PLAN_RANK[p.key] > PLAN_RANK[currentPlan];
  const isDowngrade = p.key !== "free" && PLAN_RANK[p.key] < PLAN_RANK[currentPlan];
  return (
    <div className="relative border p-4 space-y-3" style={{ borderColor: isCurrent ? AMPS_ACCENT : "var(--border)", background: isCurrent ? `color-mix(in srgb, ${AMPS_ACCENT} 5%, var(--card))` : "var(--card)" }}>
      {isCurrent && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold text-white tracking-wider uppercase" style={{ background: AMPS_ACCENT, fontFamily: MONO }}><Check size={10} /> Current</span>
        </div>
      )}
      <div className="text-center pt-2">
        <p className="font-semibold" style={{ fontFamily: MONO, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: isCurrent ? AMPS_ACCENT : "var(--foreground)" }}>{p.label}</p>
        <p className="mt-1" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "1.8rem", lineHeight: 1 }}>
          {p.price === 0 ? "Free" : `$${p.price}`}{p.price > 0 && <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>/mo</span>}
        </p>
      </div>
      <ul className="space-y-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
        <li className="flex items-center gap-1.5"><Check size={12} className="shrink-0" style={{ color: AMPS_ACCENT }} /> {p.devices}</li>
        <li className="flex items-center gap-1.5"><Check size={12} className="shrink-0" style={{ color: AMPS_ACCENT }} /> {p.users}</li>
        <li className="flex items-center gap-1.5"><Check size={12} className="shrink-0" style={{ color: AMPS_ACCENT }} /> {sellerFeeLabel(p.key, fees)} seller fee</li>
      </ul>
      {!isCurrent && p.key !== "free" && (
        <button onClick={() => onSelect(p.key as PaidPlan)}
          className="w-full py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
          style={isUpgrade ? { background: AMPS_ACCENT, color: "#fff" } : { border: "1px solid var(--border)" }}>
          {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Switch"}
        </button>
      )}
      {isCurrent && p.key !== "free" && subActive && (
        <button onClick={onCancel} className="w-full py-1.5 text-xs transition-colors hover:bg-secondary" style={{ color: "var(--chart-4)" }}>Cancel plan</button>
      )}
    </div>
  );
}
