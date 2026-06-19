/**
 * useOrders — fetches the current user's orders + aggregate stats.
 * useOrder  — fetches a single order by ID.
 * useConfirmOrder — PATCH /orders/:id/confirm
 * useDisputeOrder — POST /orders/:id/dispute
 *
 * Endpoint: GET /orders         → { orders: Order[], stats: OrderStats }
 * Endpoint: GET /orders/:id     → Order
 * Endpoint: PATCH /orders/:id/confirm
 * Endpoint: POST  /orders/:id/dispute
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Order, OrdersResponse } from "../models/order";

export function useOrders() {
  const { data, isLoading, error } = useQuery<OrdersResponse>({
    queryKey: ["orders"],
    queryFn: () => api.get<OrdersResponse>("/pre/orders"),
  });

  return {
    orders:   data?.orders   ?? [],
    stats:    data?.stats    ?? null,
    isLoading,
    error,
  };
}

export function useOrder(id: string) {
  const { data, isLoading, error } = useQuery<Order>({
    queryKey: ["orders", id],
    queryFn: () => api.get<Order>(`/orders/${id}`),
    enabled: !!id,
  });

  return { order: data, isLoading, error };
}

export function useConfirmOrder() {
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => api.patch(`/orders/${id}/confirm`, {}),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["orders", id] });
    },
  });

  return { confirm: mutate, isConfirming: isPending };
}

export function useDisputeOrder() {
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => api.post(`/orders/${id}/dispute`, {}),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["orders", id] });
    },
  });

  return { dispute: mutate, isDisputing: isPending };
}
