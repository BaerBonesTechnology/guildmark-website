/** Shared order queries use the same cache as seller offload and tracking. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  useOrders as useOrdersQuery,
  useOrder as useOrderQuery,
} from "../lib/apiHooks";
import { mergeOrderLifecycle } from "../services/order.service";
import type { Order } from "../models/order";

export function useOrders() {
  const query = useOrdersQuery();
  return {
    ...query,
    orders: query.data?.orders ?? [],
    stats: query.data?.stats ?? null,
  };
}
export function useOrder(id: string) {
  const query = useOrderQuery(id);
  return { ...query, order: query.data };
}
function useOrderAction(action: "confirm" | "dispute") {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      action === "confirm"
        ? api.patch<Order>(`/orders/${encodeURIComponent(id)}/confirm`, {})
        : api.post<Order>(`/orders/${encodeURIComponent(id)}/dispute`, {}),
    retry: false,
    onSuccess: async (result, id) => {
      client.setQueryData<Order>(["order", id], (current) =>
        current ? mergeOrderLifecycle(current, result) : current,
      );
      await Promise.all([
        client.invalidateQueries({ queryKey: ["orders"] }),
        client.invalidateQueries({ queryKey: ["order", id] }),
        client.invalidateQueries({ queryKey: ["order-tracking", id] }),
      ]);
    },
  });
}
export function useConfirmOrder() {
  return useOrderAction("confirm");
}
export function useDisputeOrder() {
  return useOrderAction("dispute");
}
