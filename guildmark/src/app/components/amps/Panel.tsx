/** AMPS card panel with a mono title header and optional action slot. */
import { MONO } from "../../constants/typography";

interface PanelProps {
  action?: React.ReactNode;
  children: React.ReactNode;
  subtitle?: string;
  title: string;
}

export function Panel({ action, children, subtitle, title }: PanelProps) {
  return (
    <div className="border border-border" style={{ background: "var(--card)" }}>
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] tracking-widest uppercase block" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{title}</span>
          {subtitle && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{subtitle}</span>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
