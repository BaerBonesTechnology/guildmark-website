/** AMPS hero stat card with an accent-bordered icon. */
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { DISPLAY, MONO } from "../../constants/typography";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  sub?: React.ReactNode;
  subColor?: string;
  value: string;
}

export function StatCard({ icon: Icon, label, sub, subColor, value }: StatCardProps) {
  return (
    <div className="p-5" style={{ background: "var(--card)" }}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{label}</p>
          <p className="text-3xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{value}</p>
          {sub && <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: subColor ?? "var(--muted-foreground)", fontFamily: MONO }}>{sub}</div>}
        </div>
        <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ border: `1px solid color-mix(in srgb, ${AMPS_ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${AMPS_ACCENT} 8%, transparent)` }}>
          <Icon size={16} style={{ color: AMPS_ACCENT }} />
        </div>
      </div>
    </div>
  );
}
