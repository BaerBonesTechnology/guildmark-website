import { Link } from "react-router";
import { ArrowRight, Search } from "lucide-react";
import type { Order } from "../../models/order";
import { fmt, statusStyle, usd } from "../../services/offload.service";
import { lifecycleLabel } from "../../services/order.service";

interface Props {
  orders: Order[];
  total: number;
  filteredCount: number;
  search: string;
  status: string;
  setSearch: (value: string) => void;
  setStatus: (value: string) => void;
  clearFilters: () => void;
  onTrack: (id: string) => void;
  trackedOrder: Order | null;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  base: string;
}
export function OrderHistoryTable(props: Props) {
  const {
    orders,
    total,
    filteredCount,
    search,
    status,
    setSearch,
    setStatus,
    clearFilters,
    onTrack,
    trackedOrder,
    page,
    totalPages,
    setPage,
    base,
  } = props;
  function track(id: string) {
    onTrack(id);
    const target = document.getElementById("shipment-tracker");
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  }
  return (
    <section className="gm-offload-card gm-sales-history">
      <div className="gm-offload-section-heading">
        <h2>Sales history</h2>
        <span role="status">
          {filteredCount} of {total} sales
        </span>
      </div>
      <div className="gm-offload-history-tools">
        <label className="gm-search">
          <Search size={17} aria-hidden="true" />
          <input
            aria-label="Search sales"
            placeholder="Search order, product, or buyer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter sales by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
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
          ].map((value) => (
            <option key={value} value={value}>
              {lifecycleLabel(value as Order["orderStatus"])}
            </option>
          ))}
        </select>
      </div>
      {orders.length === 0 ? (
        <div className="gm-offload-quiet">
          <h3>{total ? "No matching sales" : "Ready for your first sale?"}</h3>
          <p>
            {total
              ? "Try a different order, buyer, or status."
              : "Create a listing to put your equipment in front of business buyers."}
          </p>
          {total ? (
            <button className="gm-text-link" onClick={clearFilters}>
              Clear search and filters
            </button>
          ) : (
            <Link
              className="gm-button gm-button-small"
              to={`${base}/my-listings`}
            >
              Manage listings <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
        </div>
      ) : (
        <table className="gm-offload-table">
          <caption className="sr-only">
            Your sales orders, status and order actions
          </caption>
          <thead>
            <tr>
              {[
                "Order / equipment",
                "Buyer",
                "Status",
                "Order value",
                "Actions",
              ].map((header) => (
                <th scope="col" key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className={
                  trackedOrder?.id === order.id ? "is-selected" : undefined
                }
              >
                <td data-label="Order / equipment">
                  <Link to={`${base}/orders/${encodeURIComponent(order.id)}`}>
                    {order.transactionId}
                  </Link>
                  <strong>{order.productName}</strong>
                  <small>
                    {order.quantity} units · {fmt(order.createdAt)}
                  </small>
                </td>
                <td data-label="Buyer">
                  {order.counterparty || "Business buyer"}
                </td>
                <td data-label="Status">
                  <span
                    className="gm-offload-status"
                    style={statusStyle(order.orderStatus)}
                  >
                    {lifecycleLabel(order.orderStatus)}
                  </span>
                </td>
                <td data-label="Order value">{usd(order.totalValue * 100)}</td>
                <td data-label="Actions">
                  {!["cancelled", "disputed"].includes(order.orderStatus) ? (
                    <button
                      aria-label={`Follow ${order.transactionId}`}
                      className="gm-text-link"
                      onClick={() => track(order.id)}
                    >
                      Follow sale <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  ) : (
                    <Link
                      className="gm-text-link"
                      to={`${base}/orders/${encodeURIComponent(order.id)}`}
                    >
                      View order <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {totalPages > 1 && (
        <nav className="gm-pagination" aria-label="Sales history pages">
          <span>
            Page {page} of {totalPages}
          </span>
          <div>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}
