/** Small spec chip (asset type, RAM, …) shown on a listing row. */
import { MONO } from "../../constants/typography";

export function ListingSpecPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] px-1.5 py-0.5 tracking-wide uppercase" style={{ fontFamily: MONO, border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>{children}</span>
  );
}
