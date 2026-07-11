/** Order-feature constants. */
export type OrderTab = "all" | "purchases" | "sales";

export const ORDER_TABS: { label: string; value: OrderTab }[] = [
  { label: "All Orders", value: "all" },
  { label: "Purchases", value: "purchases" },
  { label: "Sales", value: "sales" },
];

export const ORDERS_EMPTY_COPY: Record<OrderTab, string> = {
  all: "Your completed and active orders will show here once you start trading.",
  purchases: "Items you buy from the marketplace will appear here.",
  sales: "Orders placed by buyers for your listings will appear here.",
};
