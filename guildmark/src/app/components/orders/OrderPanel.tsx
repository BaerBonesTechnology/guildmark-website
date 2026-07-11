/** A titled bordered panel used across the OrderDetail view. */
import { MONO } from "../../constants/typography";

interface OrderPanelProps {
  children: React.ReactNode;
  title: string;
}

export function OrderPanel({ children, title }: OrderPanelProps) {
  return (
    <div className="border border-border" style={{ background: "var(--card)" }}>
      <div className="px-5 py-3 border-b border-border">
        <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{title}</span>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );
}
