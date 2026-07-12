/** AMPS layout constants — sidebar nav + upgrade-wall plan features. */
import { Cloud, FileText, LayoutDashboard, Package, Settings } from "lucide-react";

export interface AmpsNavItem {
  href: string;
  icon: React.ElementType;
  name: string;
}

export const AMPS_NAV: AmpsNavItem[] = [
  { name: "Portfolio", href: "/pre/amps", icon: LayoutDashboard },
  { name: "Assets", href: "/pre/amps/assets", icon: Package },
  { name: "MDM Connections", href: "/pre/amps/mdm", icon: Cloud },
  { name: "Invoices", href: "/pre/amps/invoices", icon: FileText },
  { name: "Settings", href: "/pre/amps/settings", icon: Settings },
];

export const PLAN_TIERS = ["starter", "growth", "pro"] as const;

export const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["Full asset inventory", "MDM integrations (Jamf + Intune)", "Market Pulse valuations", "Tax invoices"],
  growth: ["Everything in Starter", "Bulk quick-list to GuildMarket", "Portfolio trend analytics", "Priority support"],
  pro: ["Everything in Growth", "Dedicated account manager", "Custom reporting", "Lowest seller fees (3%)"],
};
