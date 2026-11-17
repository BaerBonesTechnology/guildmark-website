/** Large display figure used for dashboard KPIs. */
import { DISPLAY } from "../../constants/typography";

export function BigNumber({ children, color = "var(--foreground)" }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="text-4xl leading-none tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 700, color }}>
      {children}
    </div>
  );
}
