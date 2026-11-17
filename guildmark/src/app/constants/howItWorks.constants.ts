/** How-It-Works page content — the two sell workflows, fully data-driven. */
import { CheckCircle2, DollarSign, MapPin, Package, Shield, Truck } from "lucide-react";

export interface StepItem {
  icon: React.ElementType;
  iconClass: string;
  label: string;
}

export interface WorkflowStep {
  highlighted?: boolean;
  items: StepItem[];
  num: number;
  title: string;
}

export interface WorkflowSectionConfig {
  badgeClass: string;
  calloutBody: string;
  calloutIconClass: string;
  calloutTitle: string;
  circleClass: string;
  gridCols: string;
  headerIcon: React.ElementType;
  steps: WorkflowStep[];
  subtitle: string;
  title: string;
}

export const WITH_WIPE_SECTION: WorkflowSectionConfig = {
  title: "Option 1: With Data Wipe Service",
  subtitle: "Fastest payment, zero liability, compliance included (+$8/asset)",
  headerIcon: Shield,
  circleClass: "bg-primary",
  badgeClass: "bg-primary/10 text-primary",
  gridCols: "grid-cols-4",
  calloutIconClass: "text-primary",
  calloutTitle: "Best for: Corporate IT departments prioritizing speed & compliance",
  calloutBody: "You're paid immediately when assets arrive in Orlando. We handle all data destruction, compliance documentation, and delivery to buyer. Zero delivery liability after shipment.",
  steps: [
    {
      num: 1, title: "List Assets", items: [
        { icon: CheckCircle2, iconClass: "w-4 h-4 text-primary", label: "Upload inventory" },
        { icon: CheckCircle2, iconClass: "w-4 h-4 text-primary", label: "Set pricing" },
        { icon: CheckCircle2, iconClass: "w-4 h-4 text-primary", label: "Enable data wipe" },
      ],
    },
    {
      num: 2, title: "Ship to Orlando", items: [
        { icon: MapPin, iconClass: "w-4 h-4", label: "Our facility address" },
        { icon: Package, iconClass: "w-4 h-4", label: "Prepaid labels" },
        { icon: Truck, iconClass: "w-4 h-4", label: "Pallet pickup (6+)" },
      ],
    },
    {
      num: 3, title: "Get Paid Instantly", items: [
        { icon: DollarSign, iconClass: "w-4 h-4 text-primary", label: "Payment on arrival" },
        { icon: CheckCircle2, iconClass: "w-4 h-4 text-primary", label: "You're done!" },
        { icon: Shield, iconClass: "w-4 h-4", label: "Zero liability" },
      ],
    },
    {
      num: 4, title: "We Handle Rest", highlighted: true, items: [
        { icon: Shield, iconClass: "w-4 h-4 text-primary", label: "NIST 800-88 wipe" },
        { icon: Truck, iconClass: "w-4 h-4 text-primary", label: "Ship to buyer" },
        { icon: CheckCircle2, iconClass: "w-4 h-4 text-primary", label: "Compliance certs" },
      ],
    },
  ],
};

export const DIRECT_SECTION: WorkflowSectionConfig = {
  title: "Option 2: Direct to Buyer",
  subtitle: "Handle your own data wipe, ship directly to buyer (no service fee)",
  headerIcon: Truck,
  circleClass: "bg-slate-600",
  badgeClass: "bg-slate-600/10 text-slate-600",
  gridCols: "grid-cols-3",
  calloutIconClass: "text-slate-600",
  calloutTitle: "Best for: Companies with existing data wipe processes",
  calloutBody: "Save $8/asset if you already have NIST-compliant data destruction. Ship directly to buyer. Payment released upon buyer confirmation.",
  steps: [
    {
      num: 1, title: "List & Sell", items: [
        { icon: CheckCircle2, iconClass: "w-4 h-4", label: "Create listing" },
        { icon: CheckCircle2, iconClass: "w-4 h-4", label: "Accept offer" },
        { icon: Shield, iconClass: "w-4 h-4", label: "Wipe data yourself" },
      ],
    },
    {
      num: 2, title: "Ship to Buyer", items: [
        { icon: MapPin, iconClass: "w-4 h-4", label: "Buyer's address" },
        { icon: Truck, iconClass: "w-4 h-4", label: "Your shipping choice" },
        { icon: Package, iconClass: "w-4 h-4", label: "Track delivery" },
      ],
    },
    {
      num: 3, title: "Buyer Confirms", items: [
        { icon: CheckCircle2, iconClass: "w-4 h-4", label: "Buyer receives" },
        { icon: DollarSign, iconClass: "w-4 h-4", label: "Payment released" },
        { icon: CheckCircle2, iconClass: "w-4 h-4", label: "Transaction complete" },
      ],
    },
  ],
};

export const WORKFLOW_SECTIONS: WorkflowSectionConfig[] = [WITH_WIPE_SECTION, DIRECT_SECTION];
