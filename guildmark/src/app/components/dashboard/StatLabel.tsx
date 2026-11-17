/** Small uppercase mono stat label used across the dashboard. */
import { MONO } from "../../constants/typography";

export function StatLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
      {children}
    </span>
  );
}
