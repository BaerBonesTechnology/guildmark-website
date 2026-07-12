/** Uppercase mono micro-label used across the offload workflow. */
import { MONO } from "../../constants/typography";

export function MonoLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{children}</span>;
}
