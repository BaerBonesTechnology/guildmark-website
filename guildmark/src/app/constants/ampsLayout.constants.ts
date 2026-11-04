/** AMPS layout constants — sidebar nav + upgrade-wall plan features. */
import { Cloud, FileText, LayoutDashboard, Package, Settings, Sparkles } from "lucide-react";
import { PAID_PLANS, planFeatures } from "./planCatalog.ts";

export interface AmpsNavItem {
  href: string;
  icon: React.ElementType;
  name: string;
}

export const AMPS_NAV: AmpsNavItem[] = [
  { name: "Portfolio", href: "/pre/amps", icon: LayoutDashboard },
  { name: "Assistant", href: "/pre/amps/assistant", icon: Sparkles },
  { name: "Assets", href: "/pre/amps/assets", icon: Package },
  { name: "MDM Connections", href: "/pre/amps/mdm", icon: Cloud },
  { name: "Invoices", href: "/pre/amps/invoices", icon: FileText },
  { name: "Settings", href: "/pre/amps/settings", icon: Settings },
];

export const PLAN_TIERS = PAID_PLANS;

export const PLAN_FEATURES = Object.fromEntries(PAID_PLANS.map(key => [key, planFeatures(key)]));
