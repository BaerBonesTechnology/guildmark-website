/** AMPS Settings section panel — icon header, optional action + padding. */
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { ChevronDown } from "lucide-react";

interface SettingsPanelProps {
  action?: React.ReactNode;
  children: React.ReactNode;
  icon: React.ElementType;
  pad?: boolean;
  subtitle?: string;
  title: string;
  collapsible?: boolean;
}

export function SettingsPanel({ action, children, icon: Icon, pad = true, subtitle, title, collapsible = false }: SettingsPanelProps) {
  const header = (
      <div className={`px-5 py-4 flex items-center justify-between gap-3 ${collapsible ? "group-open:border-b border-border" : "border-b border-border"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ border: `1px solid color-mix(in srgb, ${AMPS_ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${AMPS_ACCENT} 8%, transparent)` }}>
            <Icon size={16} style={{ color: AMPS_ACCENT }} />
          </div>
          <div>
            <p className="font-medium text-sm">{title}</p>
            {subtitle && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">{action}{collapsible && <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />}</div>
      </div>
  );
  if (collapsible) return (
    <details className="group border border-border" style={{ background: "var(--card)" }}>
      <summary aria-label={title} className="list-none cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amps-accent [&::-webkit-details-marker]:hidden">{header}</summary>
      <div className={pad ? "p-5" : ""}>{children}</div>
    </details>
  );
  return (
    <div className="border border-border" style={{ background: "var(--card)" }}>
      {header}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </div>
  );
}
