/** Offload workflow constants — status palette, table headers, form options. */

// Semantic status colors (inline hex so they work in both themes).
export const OFFLOAD_STATUS_COLOR: Record<string, string> = {
  awaiting_payment: "#f59e0b",
  funded:           "#2d6ef0",
  shipped:          "#8b5cf6",
  delivered:        "#10b981",
  inspecting:       "#f97316",
  complete:         "var(--primary)",
  disputed:         "#ef4444",
  cancelled:        "var(--muted-foreground)",
};

export const ORDER_HISTORY_HEADERS = ["Order ID", "Product", "Qty", "Status", "Date", "Value", "Tracking"];

export const SHIPPING_METHOD_OPTIONS = ["Prepaid Labels (1–5 units)", "Pallet Pickup (6+ units)"];

// Color used for the tracking-number link + in-transit shipment icon.
export const TRACKING_LINK_COLOR = "#8b5cf6";

// Amber used for the active pipeline step highlight.
export const PIPELINE_ACTIVE_COLOR = "#f59e0b";
