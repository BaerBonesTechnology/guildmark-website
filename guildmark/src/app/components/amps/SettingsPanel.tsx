/** AMPS Settings section panel — icon header, optional action + padding. */
import { AMPS_ACCENT } from "../../constants/amps.constants";

interface SettingsPanelProps {
  action?: React.ReactNode;
  children: React.ReactNode;
  icon: React.ElementType;
  pad?: boolean;
  subtitle?: string;
  title: string;
}

export function SettingsPanel({ action, children, icon: Icon, pad = true, subtitle, title }: SettingsPanelProps) {
  return (
    <div className="border border-border" style={{ background: "var(--card)" }}>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ border: `1px solid color-mix(in srgb, ${AMPS_ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${AMPS_ACCENT} 8%, transparent)` }}>
            <Icon size={16} style={{ color: AMPS_ACCENT }} />
          </div>
          <div>
            <p className="font-medium text-sm">{title}</p>
            {subtitle && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className={pad ? "p-5" : ""}>{children}</div>
    </div>
  );
}
