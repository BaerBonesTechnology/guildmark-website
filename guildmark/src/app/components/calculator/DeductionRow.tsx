/** One line in the Market Pulse "Transparent Deductions" breakdown. */
import { BODY, MONO } from "../../constants/typography";

interface DeductionRowProps {
  icon: React.ElementType;
  label: string;
  positive?: boolean;
  sub: string;
  value: string;
}

export function DeductionRow({ icon: Icon, label, positive = false, sub, value }: DeductionRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ border: "1px solid var(--border)", background: "var(--secondary)" }}>
          <Icon size={13} style={{ color: "var(--muted-foreground)" }} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ fontFamily: BODY }}>{label}</p>
          <p className="text-[10px]" style={{ color: "var(--muted-foreground)", fontFamily: BODY }}>{sub}</p>
        </div>
      </div>
      <span className="text-sm tabular-nums" style={{ fontFamily: MONO, color: positive ? "var(--chart-3)" : "var(--foreground)" }}>{value}</span>
    </div>
  );
}
