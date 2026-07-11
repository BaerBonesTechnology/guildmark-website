/** Empty state for the Orders list, per active tab. */
import { Link } from "react-router";
import { Inbox } from "lucide-react";
import { ORDERS_EMPTY_COPY } from "../../constants/order.constants";
import type { OrderTab } from "../../constants/order.constants";

export function OrdersEmptyState({ activeTab }: { activeTab: OrderTab }) {
  return (
    <div className="border border-border py-20 flex flex-col items-center gap-3" style={{ background: "var(--card)" }}>
      <Inbox size={28} className="opacity-30" style={{ color: "var(--muted-foreground)" }} />
      <p className="text-sm font-medium">No {activeTab === "all" ? "orders" : activeTab} yet</p>
      <p className="text-xs max-w-sm text-center" style={{ color: "var(--muted-foreground)" }}>{ORDERS_EMPTY_COPY[activeTab]}</p>
      <Link to="/pre/marketplace" className="mt-1 inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border hover:border-foreground transition-colors">Browse GuildMarket</Link>
    </div>
  );
}
