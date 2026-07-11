/** Orders page (View) — stat strip, tabs, and the order list. */
import { Package, ShoppingBag, ShoppingCart, Truck } from "lucide-react";
import { OrderCard } from "../components/orders/OrderCard";
import { OrderStatCell } from "../components/orders/OrderStatCell";
import { OrdersEmptyState } from "../components/orders/OrdersEmptyState";
import { ORDER_TABS } from "../constants/order.constants";
import { BODY, DISPLAY, MONO } from "../constants/typography";
import { useOrdersViewModel } from "../viewmodels/useOrdersViewModel";

export function Orders() {
  const { activeTab, filteredOrders, isLoading, setActiveTab, stats } = useOrdersViewModel();

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto pb-20" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>Orders &amp; Transactions</h1>
        <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Track your purchases, sales, and shipment activity</p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-border mb-6" style={{ background: "var(--border)" }}>
        <OrderStatCell label="Total Orders" value={isLoading ? "—" : String(stats?.totalOrders ?? 0)} icon={Package} />
        <OrderStatCell label="Active Orders" value={isLoading ? "—" : String(stats?.activeOrders ?? 0)} icon={Truck} color="var(--primary)" />
        <OrderStatCell label="Total Value" value={isLoading ? "—" : `$${(stats?.totalValue ?? 0).toLocaleString()}`} icon={ShoppingBag} color="var(--grade-a)" />
        <OrderStatCell label="This Month" value={isLoading ? "—" : `$${(stats?.monthValue ?? 0).toLocaleString()}`} icon={ShoppingCart} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {ORDER_TABS.map(({ label, value }) => (
          <button key={value} onClick={() => setActiveTab(value)}
            className="px-4 py-2.5 text-[11px] tracking-wider uppercase transition-colors -mb-px border-b-2"
            style={{ fontFamily: MONO, borderColor: activeTab === value ? "var(--primary)" : "transparent", color: activeTab === value ? "var(--primary)" : "var(--muted-foreground)" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Order list */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((ndx) => <div key={ndx} className="border border-border h-28 animate-pulse" style={{ background: "var(--card)" }} />)}</div>
      ) : filteredOrders.length === 0 ? (
        <OrdersEmptyState activeTab={activeTab} />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
