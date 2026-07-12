/** Signup page story-panel data — steps, pricing tiles, trust signals. */
import { BarChart2, Lock, Shield, Truck, Zap } from "lucide-react";

export interface HowItWorksStep {
  body: string;
  num: number;
  title: string;
}

export interface PricingTile {
  icon: React.ElementType;
  label: string;
  value: string;
}

export interface TrustSignal {
  icon: React.ElementType;
  text: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  { num: 1, title: "Import your fleet", body: "Connect your MDM or upload a CSV. GuildMark instantly values every asset against live market data." },
  { num: 2, title: "List what you want to sell", body: "Push assets to the marketplace. Buyers submit offers — you accept, counter, or decline." },
  { num: 3, title: "Get paid", body: "With data wipe: ship to Orlando, paid on arrival. Without: ship direct to buyer, payment on delivery confirmation." },
];

// Pricing tiles — the seller-fee value is filled in by the View (comes from API).
export const TRUST_SIGNALS: TrustSignal[] = [
  { icon: Lock, text: "Escrow-secured payments" },
  { icon: Shield, text: "NIST 800-88 certified" },
  { icon: Zap, text: "Live market valuations" },
];

export function pricingTiles(freeFee: string): PricingTile[] {
  return [
    { icon: BarChart2, label: "Seller fee (free)", value: `${freeFee} on sale` },
    { icon: Shield, label: "Data wipe", value: "Flat rate / asset" },
    { icon: Truck, label: "Shipping", value: "Actual cost" },
  ];
}
