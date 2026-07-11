/** A single figure in the Orders stat strip. */
import { DISPLAY, MONO } from "../../constants/typography";

interface OrderStatCellProps {
  color?: string;
  icon: React.ElementType;
  label: string;
  value: string;
}

export function OrderStatCell({ color, icon: Icon, label, value }: OrderStatCellProps) {
  return (
    <div className="p-5" style={{ background: "var(--card)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} style={{ color: "var(--muted-foreground)" }} />
        <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{label}</p>
      </div>
      <p className="text-3xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700, color: color ?? "var(--foreground)" }}>{value}</p>
    </div>
  );
}
