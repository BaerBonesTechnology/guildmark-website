/** GM Pro signup page content — plans and value props. */
import { BarChart2, Cpu, Package, Shield, TrendingUp, Zap } from "lucide-react";
import type { PaidPlan } from "../components/SubscriptionCheckoutDialog";

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

export const PLANS: Plan[] = [
  { key: "starter", label: "Starter", price: 39, features: ["Up to 350 devices", "2 team members", "Full asset inventory", "MDM integrations (Jamf + Intune)", "AI-powered FMV valuations", "Tax invoice generation"] },
  { key: "growth", label: "Growth", price: 79, highlight: true, features: ["Up to 700 devices", "5 team members", "Everything in Starter", "Bulk quick-list to GuildMarket", "Portfolio trend analytics", "Priority support"] },
  { key: "pro", label: "Pro", price: 149, features: ["Unlimited devices", "Unlimited team members", "Everything in Growth", "Dedicated account manager", "Custom reporting", "Lowest seller fees (3%)"] },
];

export const VALUE_PROPS: ValueProp[] = [
  { icon: Zap, title: "Know what every asset is worth", body: "Our ML valuation engine pulls live eBay and BackMarket data to give you accurate FMV — so you never under-price or sit on overpriced inventory." },
  { icon: TrendingUp, title: "Recover more from every offload", body: null },
  { icon: Cpu, title: "Sync your entire fleet automatically", body: "Connect Jamf or Intune and your device inventory stays up to date — no spreadsheets, no manual entry, no surprises at audit time." },
  { icon: BarChart2, title: "Forecast depreciation before it hits", body: "Portfolio analytics surface devices approaching value cliffs 6 months out, so you can list them while the market still wants them." },
  { icon: Shield, title: "Compliance-ready from day one", body: "Generate tax-compliant write-off invoices for every disposition, and keep a full audit trail — all in the platform." },
  { icon: Package, title: "Sell faster with buyer demand signals", body: "Market Pulse shows real buyer demand for each model so you can prioritise what to list and set prices that close quickly." },
];
