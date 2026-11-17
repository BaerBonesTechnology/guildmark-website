/** Uppercase mono field label for the Market Pulse form. */
import { MONO } from "../../constants/typography";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{children}</label>;
}
