/** ViewModel for the Offload workflow: orders fetch + tracked-shipment state. */
import { useState } from "react";
import { useOrders } from "../lib/apiHooks";
import { completeOrders, shippedOrders } from "../services/offload.service";

export function useOffloadViewModel() {
  const { data, isLoading, error } = useOrders();
  const orders = data?.orders ?? [];
  const shipped = shippedOrders(orders);
  const complete = completeOrders(orders);

  const [trackedId, setTrackedId] = useState<string | null>(null);
  const trackedOrder = shipped.find((o) => o.id === trackedId) ?? shipped[0] ?? null;

  return { complete, data, error, isLoading, orders, setTrackedId, shipped, trackedId, trackedOrder };
}
