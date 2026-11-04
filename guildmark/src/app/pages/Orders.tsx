import { Link, useLocation } from "react-router";
import { Search, ArrowUpRight, Package } from "lucide-react";
import { OrderCard } from "../components/orders/OrderCard";
import { ORDER_TABS } from "../constants/order.constants";
import { lifecycleLabel, orderMoney } from "../services/order.service";
import type { OrderLifecycleStatus } from "../models/order";
import { useOrdersViewModel } from "../viewmodels/useOrdersViewModel";
import "../../styles/orders.css";

export function Orders() {
  const vm = useOrdersViewModel();
  const hasFilters = Boolean(vm.search.trim()) || vm.status !== "all";
  const base = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  return (
    <div className="gm-orders gm-container">
      <header className="gm-orders-heading">
        <div>
          <h1>
            Every order.
            <br />A clear next step.
          </h1>
          <p>
            Follow purchases and sales from payment through delivery. Review
            shipment records and see where your attention is needed.
          </p>
        </div>
        <Link className="gm-text-link" to={`${base}/offload`}>
          Manage seller shipments <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>
      <dl className="gm-orders-summary">
        {[
          { label: "Orders", value: vm.stats?.totalOrders },
          { label: "Active orders", value: vm.stats?.activeOrders },
          {
            label: "Recorded order value",
            value: vm.stats ? orderMoney(vm.stats.totalValue) : null,
          },
          {
            label: "This month’s order value",
            value: vm.stats ? orderMoney(vm.stats.monthValue) : null,
          },
        ].map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>
              {vm.isLoading || (vm.isError && !vm.data) || stat.value == null
                ? "—"
                : stat.value}
            </dd>
          </div>
        ))}
      </dl>
      {vm.isError && (
        <div className="gm-order-notice" role="alert">
          <div>
            <strong>We couldn’t refresh your orders.</strong>
            <p>
              {vm.data
                ? "Showing the last available records. Refresh for current status."
                : "Order records are unavailable. Try again to see your purchases and sales."}
            </p>
          </div>
          <button
            className="gm-button gm-button-small"
            disabled={vm.isFetching}
            onClick={() => vm.refetch()}
          >
            {vm.isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      )}
      <section
        className="gm-orders-records"
        aria-label="Your orders"
        aria-busy={vm.isLoading}
      >
        <div className="gm-order-filters">
          <div className="gm-order-tabs" role="group" aria-label="Order type">
            {ORDER_TABS.map((tab) => (
              <button
                key={tab.value}
                aria-pressed={vm.activeTab === tab.value}
                onClick={() => vm.setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="gm-order-count" role="status">
            {vm.isLoading
              ? "Loading orders…"
              : vm.isError && !vm.data
                ? "Orders unavailable"
                : `${vm.filteredCount} matching orders`}
          </span>
        </div>
        <div className="gm-order-tools">
          <label className="gm-search">
            <Search size={17} aria-hidden="true" />
            <input
              aria-label="Search orders"
              placeholder="Search order, equipment, or business"
              value={vm.search}
              onChange={(e) => vm.setSearch(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter order status"
            value={vm.status}
            onChange={(e) => vm.setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {[
              "awaiting_payment",
              "funded",
              "shipped",
              "delivered",
              "inspecting",
              "complete",
              "disputed",
              "cancelled",
            ].map((status) => (
              <option key={status} value={status}>
                {lifecycleLabel(status as OrderLifecycleStatus)}
              </option>
            ))}
          </select>
        </div>
        {vm.isLoading ? (
          <div className="gm-order-loading">
            {[1, 2, 3].map((i) => (
              <div aria-hidden="true" key={i} />
            ))}
          </div>
        ) : (
          (!vm.isError || vm.data) &&
          (vm.pageItems.length ? (
            <ul className="gm-order-list">
              {vm.pageItems.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  base={base}
                  queryString={vm.queryString}
                />
              ))}
            </ul>
          ) : (
            <div className="gm-order-empty">
              <Package size={28} aria-hidden="true" />
              <h2>
                {hasFilters
                  ? "No matching orders"
                  : vm.activeTab === "all"
                    ? "Your next transaction starts here."
                    : `No ${vm.activeTab} yet`}
              </h2>
              <p>
                {hasFilters
                  ? "Try a different status, equipment name, or business."
                  : "Purchases and sales will appear here once an order is created."}
              </p>
              {hasFilters ? (
                <button className="gm-text-link" onClick={vm.clearFilters}>
                  Clear search and status
                </button>
              ) : (
                <Link
                  className="gm-button gm-button-small"
                  to={`${base}/${vm.activeTab === "sales" ? "my-listings" : "marketplace"}`}
                >
                  {vm.activeTab === "sales"
                    ? "Manage listings"
                    : "Browse marketplace"}
                </Link>
              )}
            </div>
          ))
        )}
        {vm.totalPages > 1 && (
          <nav className="gm-pagination" aria-label="Order pages">
            <span>
              Page {vm.page} of {vm.totalPages}
            </span>
            <div>
              <button
                disabled={vm.page === 1}
                onClick={() => vm.setPage(vm.page - 1)}
              >
                Previous
              </button>
              <button
                disabled={vm.page === vm.totalPages}
                onClick={() => vm.setPage(vm.page + 1)}
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </section>
    </div>
  );
}
