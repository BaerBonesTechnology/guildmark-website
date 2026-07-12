/** Shared AMPS (Asset Management & Portfolio System) constants. */
import { AlertCircle, Cloud, FileText } from "lucide-react";

export interface QuickAction {
  icon: React.ElementType;
  label: string;
  sub: string;
  to: string;
}

// AMPS brand accent + the recharts tooltip styling shared across AMPS charts.
export const AMPS_ACCENT = "var(--amps-accent)";

export const AMPS_TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
};

// Pie-slice palette for the "fleet by asset type" chart.
export const FLEET_TYPE_COLORS = ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"];

export const PORTFOLIO_QUICK_ACTIONS: QuickAction[] = [
  { to: "/pre/amps/assets?filter=aging", icon: AlertCircle, label: "List Aging Assets", sub: "Assets > 36 months" },
  { to: "/pre/amps/invoices?action=generate", icon: FileText, label: "Generate Report", sub: "Portfolio PDF" },
  { to: "/pre/amps/mdm", icon: Cloud, label: "Connect MDM", sub: "Sync devices" },
];
