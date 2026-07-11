/** A single figure in the My Listings stat strip. */
import { DISPLAY, MONO } from "../../constants/typography";

interface ListingStatCellProps {
  color?: string;
  label: string;
  value: string;
}

export function ListingStatCell({ color, label, value }: ListingStatCellProps) {
  return (
    <div className="p-5" style={{ background: "var(--card)" }}>
      <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{label}</p>
      <p className="text-3xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700, color: color ?? "var(--foreground)" }}>{value}</p>
    </div>
  );
}
