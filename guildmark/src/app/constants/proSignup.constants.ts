/** GM Pro signup page content — plans and value props. */
import { BarChart2, Cpu, Package, Shield, TrendingUp, Zap } from "lucide-react";
import type { PaidPlan } from "../components/SubscriptionCheckoutDialog";
import { PAID_PLANS, PLAN_CATALOG, planFeatures } from "./planCatalog.ts";

export interface Plan {
  features: string[];
  highlight?: boolean;
  key: PaidPlan;
  label: string;
  price: number;
}

export interface ValueProp {
  body: string | null;
  icon: React.ElementType;
  title: string;
}

export const PLANS: Plan[] = PAID_PLANS.map(key => ({key, label: PLAN_CATALOG[key].label, price: PLAN_CATALOG[key].price, highlight: key === "growth", features: planFeatures(key)}));

export const VALUE_PROPS: ValueProp[] = [
  { icon: Zap, title: "Estimate supported laptops", body: "Use recorded specifications, condition and age to request ML-assisted estimates. Estimates have limitations and are not guaranteed sale prices." },
  { icon: TrendingUp, title: "Recover more from every offload", body: null },
  { icon: Cpu, title: "Keep your inventory portable", body: "Manage recorded quantities and import or export CSV data. Jamf and Intune connections are prototypes, not working fleet integrations." },
  { icon: BarChart2, title: "Review your valuation history", body: "Review saved estimates. Portfolio trend reports and expanded batch workflows are planned for Growth and Pro." },
  { icon: Shield, title: "Prepare records for review", body: "Invoice drafts are a prototype. PDF generation and tax compliance require verification before use." },
  { icon: Package, title: "Control the resale decision", body: "The guided assistant prepares listing previews. You review asset details and decide what to publish." },
];
