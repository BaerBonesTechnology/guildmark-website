// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type OrderStatus =
  | "delivered"
  | "in_transit"
  | "processing"
  | "cancelled"
  | "refunded";

/**
 * Internal order lifecycle status (maps 1:1 with the DB order_status enum).
 * The API returns this in the `orderStatus` field alongside the simplified
 * `status` field which maps to OrderStatus for backward-compatibility.
 */
export type OrderLifecycleStatus =
  | "awaiting_payment"   // escrow created; buyer must fund
  | "funded"             // escrow funded; waiting for shipment
  | "shipped"            // tracking number attached
  | "delivered"          // FedEx confirmed delivery; inspection active
  | "inspecting"         // buyer in inspection window
  | "complete"           // buyer confirmed; funds released
  | "disputed"           // dispute raised
  | "cancelled";

export interface Order {
  id:              string;
  transactionId:   string;
  type:            "sale" | "purchase";
  productName:     string;
  specs:           string | null;
  quantity:        number;
  totalValue:      number;
  status:          OrderStatus;
  /** Raw DB lifecycle status — use this for detailed UI logic. */
  orderStatus:     OrderLifecycleStatus;
  counterparty:    string;
  destination:     string | null;
  carrier:         string | null;
  trackingNumber:  string | null;
  createdAt:       string;
  // Escrow fields
  escrowTransactionId: string | null | undefined;
  escrowPaymentUrl:    string | null | undefined;
  escrowStatus:        string | null | undefined;
  // Shipping timestamps
  shippedAt:           string | null | undefined;
  deliveredAt:         string | null | undefined;
  inspectionEndsAt:    string | null | undefined;
  completedAt:         string | null | undefined;
}

export interface OrderStats {
  totalOrders:  number;
  activeOrders: number;
  totalValue:   number;
  monthValue:   number;
}

export interface OrdersResponse {
  orders: Order[];
  stats:  OrderStats;
}
