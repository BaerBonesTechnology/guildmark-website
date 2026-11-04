import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { useOrders } from "../hooks/useOrders";
import { ordersPage } from "../services/order.service";
import type { OrderTab } from "../constants/order.constants";

export function useOrdersViewModel() {
  const query = useOrders();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const activeTab: OrderTab =
    tabParam === "purchases" || tabParam === "sales" ? tabParam : "all";
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
  const search = params.get("q") ?? "";
  const history = useMemo(
    () =>
      ordersPage(query.orders, activeTab, status, search, params.get("page")),
    [query.orders, activeTab, status, search, params],
  );
  function patch(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== "page") next.delete("page");
        return next;
      },
      { replace: key === "q", preventScrollReset: true },
    );
  }
  return {
    ...query,
    ...history,
    activeTab,
    status,
    search,
    queryString: params.toString(),
    setActiveTab: (tab: OrderTab) => patch("tab", tab === "all" ? "" : tab),
    setStatus: (value: string) => patch("status", value === "all" ? "" : value),
    setSearch: (value: string) => patch("q", value),
    setPage: (value: number) => patch("page", value > 1 ? String(value) : ""),
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
