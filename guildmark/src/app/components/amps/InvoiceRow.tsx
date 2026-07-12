/** One row in the AMPS Settings billing-history table. */
import { ArrowUpRight } from "lucide-react";
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { PLANS } from "../../constants/ampsSettings.constants";
import { MONO } from "../../constants/typography";
import type { SubscriptionInvoice } from "../../lib/apiHooks";
import { fmtAmount, fmtDate } from "../../services/ampsSettings.service";

export function InvoiceRow({ inv }: { inv: SubscriptionInvoice }) {
  const plan = PLANS.find((p) => p.key === inv.plan);
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-sm" style={{ fontFamily: MONO }}>{fmtDate(inv.created_at)}</td>
      <td className="px-4 py-3">
        {plan ? <span className="text-[10px] px-2 py-0.5 tracking-wider uppercase" style={{ fontFamily: MONO, color: AMPS_ACCENT, border: `1px solid color-mix(in srgb, ${AMPS_ACCENT} 30%, transparent)` }}>{plan.label}</span> : <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>—</span>}
      </td>
      <td className="px-4 py-3 text-sm" style={{ fontFamily: MONO }}>{inv.period_start && inv.period_end ? `${fmtDate(inv.period_start)} – ${fmtDate(inv.period_end)}` : "—"}</td>
      <td className="px-4 py-3 text-sm font-medium" style={{ fontFamily: MONO }}>{fmtAmount(inv.amount_cents)}</td>
      <td className="px-4 py-3"><span className="text-xs" style={{ color: inv.status === "paid" ? "var(--grade-a)" : "var(--chart-4)", fontFamily: MONO }}>{inv.status}</span></td>
      <td className="px-4 py-3 text-right">
        {inv.receipt_url ? (
          <a href={inv.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs hover:text-foreground transition-colors" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Receipt <ArrowUpRight size={12} /></a>
        ) : <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>}
      </td>
    </tr>
  );
}
