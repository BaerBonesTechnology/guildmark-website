/** Pre-launch landing page content — benefits, perks, form options, styles. */
import { Award, BarChart3, Globe, RefreshCw, Server, ShieldCheck, Users, Zap } from "lucide-react";
import { BODY } from "./typography";

export interface IconCopy {
  body: string;
  icon: React.ElementType;
  title: string;
}

// Shared form field styling (kept here so all three sections stay identical).
export const FIELD_CLASS =
  "w-full px-3 py-2.5 text-sm border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";
export const FIELD_STYLE = { fontFamily: BODY, background: "var(--input-background)" } as const;
export const LABEL_CLASS = "block text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-2";

export const REFRESH_SIZE_OPTIONS = ["Under 50 units", "50 – 200 units", "200 – 1,000 units", "1,000+ units"];

export const SUPPLY_ROLE_OPTIONS = [
  "MSR — Managed Service Reseller",
  "ITAD — IT Asset Disposition",
  "Broker / Independent reseller",
  "OEM / Manufacturer",
];

export const SUPPLY_VOLUME_OPTIONS = ["Under $25k", "$25k – $100k", "$100k – $500k", "Over $500k"];

export const PARTNER_SERVICE_OPTIONS = [
  "Full ITAD — pickup, wipe, resale",
  "Data destruction only",
  "Logistics & pickup",
  "Refurbishment & remarketing",
  "End-of-life recycling (R2/e-Stewards)",
];

export const PARTNER_COVERAGE_OPTIONS = [
  "National",
  "Regional — Northeast",
  "Regional — Southeast",
  "Regional — Midwest",
  "Regional — West",
  "International",
];

export const SUPPLY_BENEFITS: IconCopy[] = [
  { icon: Globe, title: "Reach verified buyers directly", body: "List once, reach hundreds of vetted IT teams actively looking for certified supply — no cold calls, no brokered leads." },
  { icon: BarChart3, title: "Market-rate pricing intelligence", body: "GuildMark surfaces live comparable sales data so you list at the right price the first time, not the wrong one." },
  { icon: ShieldCheck, title: "Certification builds buyer trust", body: "Our grading and disclosure standards give buyers confidence to transact without inspections or back-and-forth." },
  { icon: Zap, title: "Bulk listings via CSV or MDM sync", body: "Upload your full inventory in minutes. GuildMark structures and publishes each listing with the right fields automatically." },
];

export const PARTNER_PERKS: IconCopy[] = [
  { icon: Award, title: "GuildMark Certified Partner badge", body: "Display your certification on your website, proposals, and email — buyers actively filter for Certified Partners." },
  { icon: Users, title: "Inbound referral leads", body: "When IT teams need ITAD services on the platform, Certified Partners are presented first. No ad spend required." },
  { icon: Server, title: "Co-branded pickup & processing", body: "Offer pickup, data destruction, and logistics as add-on services directly within GuildMark transactions." },
  { icon: RefreshCw, title: "Closed-loop asset recovery", body: "Receive unsold inventory from the exchange for downstream remarketing, recycling, or parts — your choice." },
];
