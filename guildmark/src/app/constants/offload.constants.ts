/** Offload workflow constants — status palette, table headers, form options. */

// Theme-aware text tokens preserve contrast on both light and dark surfaces.
export const OFFLOAD_STATUS_COLOR: Record<string, string> = {
  awaiting_payment: "var(--grade-b-text)",
  funded: "var(--grade-a-text)",
  shipped: "var(--grade-a-text)",
  delivered: "var(--grade-a-text)",
  inspecting: "var(--grade-b-text)",
  complete: "var(--grade-a-text)",
  disputed: "var(--grade-c-text)",
  cancelled: "var(--muted-foreground)",
};

export const ORDER_HISTORY_HEADERS = [
  "Order ID",
  "Product",
  "Qty",
  "Status",
  "Date",
  "Value",
  "Tracking",
];

export const SHIPPING_METHOD_OPTIONS = [
  "Prepaid Labels (1–5 units)",
  "Pallet Pickup (6+ units)",
];

// Color used for the tracking-number link + in-transit shipment icon.
export const TRACKING_LINK_COLOR = "var(--grade-a-text)";

// Amber used for the active pipeline step highlight.
export const PIPELINE_ACTIVE_COLOR = "var(--grade-b-text)";
