/** ViewModel for the Orders page: tab state + filtered data. */
import { useState } from "react";
import { useOrders } from "../hooks/useOrders";
import { filterOrdersByTab } from "../services/order.service";
import type { OrderTab } from "../constants/order.constants";

export function useOrdersViewModel() {
  const { isLoading, orders, stats } = useOrders();
  const [activeTab, setActiveTab] = useState<OrderTab>("all");

  const filteredOrders = filterOrdersByTab(orders, activeTab);

  return {
    activeTab,
    filteredOrders,
    isLoading,
    setActiveTab,
    stats,
  };
}
