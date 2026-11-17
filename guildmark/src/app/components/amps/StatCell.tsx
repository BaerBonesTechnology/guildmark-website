/** Simple AMPS stat cell (label + big value), no icon. */
import { DISPLAY, MONO } from "../../constants/typography";

export function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5" style={{ background: "var(--card)" }}>
      <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{label}</p>
      <p className="text-3xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{value}</p>
    </div>
  );
}
