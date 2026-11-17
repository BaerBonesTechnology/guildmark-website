import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api";
import type { Order } from "../models/order";

/** Records real dispatch only; does not generate a label or book collection. */
export function useOffloadShippingViewModel(funded: Order[]) {
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState({ orderId: "", value: "" });
  const [notice, setNotice] = useState("");
  const client = useQueryClient();
  const selected = funded.find((order) => order.id === selectedId) ?? funded[0];
  // A draft must never move to another order when a background refresh changes
  // the funded list or a seller changes the selected order.
  const trackingNumber = draft.orderId === selected?.id ? draft.value : "";
  function setTrackingNumber(value: string) {
    setDraft({ orderId: selected?.id ?? "", value });
  }
  const mutation = useMutation({
    mutationFn: ({ id, tracking }: { id: string; tracking: string }) =>
      api.patch<Order>(`/orders/${encodeURIComponent(id)}/ship`, {
        carrier: "fedex",
        tracking_number: tracking,
      }),
    onSuccess: async (_order, variables) => {
      setTrackingNumber("");
      setNotice("Shipment recorded. Your sales are being refreshed.");
      await Promise.all([
        client.invalidateQueries({ queryKey: ["orders"] }),
        client.invalidateQueries({ queryKey: ["order", variables.id] }),
        client.invalidateQueries({
          queryKey: ["order-tracking", variables.id],
        }),
      ]);
    },
  });
  function select(id: string) {
    setSelectedId(id);
    setTrackingNumber("");
    setNotice("");
    mutation.reset();
  }
  function submit() {
    const tracking = trackingNumber.trim();
    if (!selected || !tracking || mutation.isPending) return;
    setNotice("");
    mutation.mutate({ id: selected.id, tracking });
  }
  const error =
    mutation.error instanceof ApiError && mutation.error.status === 422
      ? "This order can no longer be shipped. Refresh your sales and review its current status."
      : mutation.error
        ? "We couldn’t record this shipment. Your tracking number is saved here; try again."
        : null;
  return {
    selected,
    select,
    trackingNumber,
    setTrackingNumber,
    submit,
    error,
    notice,
    isPending: mutation.isPending,
  };
}
