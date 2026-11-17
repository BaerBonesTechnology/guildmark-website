/** Compare drawer constants — category maps, grade colours, comparison rows. */
import { Laptop, Monitor, Network, Package, Server, Smartphone, Tablet } from "lucide-react";

export type RowKey = "condition" | "cpu" | "demand" | "price" | "qty" | "ram" | "seller" | "storage";

export const CATEGORY_ICON: Record<string, React.ElementType> = {
  laptop: Laptop, desktop: Monitor, server: Server, phone: Smartphone,
  tablet: Tablet, networking: Network, monitor: Monitor, other: Package,
};

export const CATEGORY_LABEL: Record<string, string> = {
  laptop: "Laptops", desktop: "Desktops", server: "Servers", phone: "Phones",
  tablet: "Tablets", networking: "Networking", monitor: "Monitors", other: "Other",
};

export const COMPARE_CONDITION_LABEL: Record<string, string> = { A: "Grade A", B: "Grade B", C: "Grade C" };

export const COMPARE_GRADE_COLOR: Record<string, string> = { A: "var(--grade-a)", B: "var(--grade-b)", C: "var(--grade-c)" };

export const COMPARE_ROWS: { key: RowKey; label: string }[] = [
  { key: "price", label: "Price / unit" },
  { key: "condition", label: "Condition" },
  { key: "demand", label: "Demand" },
  { key: "seller", label: "Seller" },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "cpu", label: "CPU Score" },
  { key: "qty", label: "Qty Available" },
];
