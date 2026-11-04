/** Marketplace (PLP) constants. */
import { Laptop, Monitor, Network, Server, Smartphone, Tablet } from "lucide-react";

export type MarketplaceSort = "newest" | "price-low" | "price-high" | "demand";

export const PAGE_SIZE = 12;

export const CONDITION_LABEL: Record<string, string> = {
  A: "Grade A",
  B: "Grade B",
  C: "Grade C",
};

/** Plain-language gloss per grade, shown in the marketplace condition legend. */
export const GRADE_BLURB: Record<string, string> = {
  A: "Excellent — minimal wear, fully tested.",
  B: "Good — light wear, fully functional.",
  C: "Fair — visible wear or minor faults.",
};

export const CATEGORY_ICON: Record<string, React.ElementType> = {
  laptop: Laptop, desktop: Monitor, server: Server, phone: Smartphone,
  tablet: Tablet, networking: Network, monitor: Monitor,
};

/** asset_type value → label. Multi-select filters operate on these keys. */
export const MARKETPLACE_CATEGORIES: { label: string; type: string }[] = [
  { label: "Laptops", type: "laptop" },
  { label: "Desktops", type: "desktop" },
  { label: "Monitors", type: "monitor" },
  { label: "Servers", type: "server" },
  { label: "Phones", type: "phone" },
  { label: "Tablets", type: "tablet" },
  { label: "Networking", type: "networking" },
];

export const MARKETPLACE_GRADES: { grade: string; label: string }[] = [
  { grade: "A", label: "Grade A" },
  { grade: "B", label: "Grade B" },
  { grade: "C", label: "Grade C" },
];

export const MARKETPLACE_SORTS: { label: string; value: MarketplaceSort }[] = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "High Demand", value: "demand" },
];
