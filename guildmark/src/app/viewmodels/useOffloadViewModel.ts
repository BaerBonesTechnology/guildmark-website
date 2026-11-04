/** Seller-only orders, URL-backed history filters and shipment selection. */
import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { useOrders } from "../lib/apiHooks";
import {
  completeOrders,
  historyPage,
  sellerOrders,
} from "../services/offload.service";
import type { Order } from "../models/order";

export function useOffloadViewModel() {
  const query = useOrders();
  const [params, setParams] = useSearchParams();
  const orders = useMemo(
    () => sellerOrders(query.data?.orders ?? []),
    [query.data],
  );
  const complete = useMemo(() => completeOrders(orders), [orders]);
  const search = params.get("q") ?? "";
  const statusParam = params.get("status") ?? "all";
  const status = [
    "awaiting_payment",
    "funded",
    "shipped",
    "delivered",
    "inspecting",
    "complete",
    "disputed",
    "cancelled",
  ].includes(statusParam)
    ? statusParam
    : "all";
  const history = useMemo(
    () => historyPage(orders, search, status, params.get("page")),
    [orders, search, status, params],
  );
  const trackable = orders.filter(
    (order) => !["cancelled", "disputed"].includes(order.orderStatus),
  );
  const trackedOrder =
    trackable.find((order) => order.id === params.get("order")) ??
    trackable.find((order) => order.orderStatus === "shipped") ??
    trackable.find((order) => order.orderStatus === "funded") ??
    trackable[0] ??
    null;
  function patch(key: string, value: string, resetPage = false) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        if (resetPage) next.delete("page");
        return next;
      },
      { preventScrollReset: true, replace: key === "q" },
    );
  }
  const funded = orders.filter((order) => order.orderStatus === "funded");
  const inTransit = orders.filter((order) => order.orderStatus === "shipped");
  const salesValue = orders
    .filter((order) => order.orderStatus !== "cancelled")
    .reduce((sum, order) => sum + order.totalValue, 0);
  return {
    ...query,
    orders,
    complete,
    funded,
    inTransit,
    salesValue,
    trackable,
    trackedOrder,
    search,
    status,
    ...history,
    setSearch: (value: string) => patch("q", value, true),
    setStatus: (value: string) =>
      patch("status", value === "all" ? "" : value, true),
    setPage: (value: number) => patch("page", value <= 1 ? "" : String(value)),
    onTrack: (orderId: Order["id"]) => patch("order", orderId),
    clearFilters: () =>
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          ["q", "status", "page"].forEach((key) => next.delete(key));
          return next;
        },
        { preventScrollReset: true },
      ),
  };
}
