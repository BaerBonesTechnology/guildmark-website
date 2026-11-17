import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRespondToOffer } from "../lib/apiHooks";
import { api } from "../lib/api";
import {
  canCreateOfferOrder,
  isOfferActionable,
  validateOfferTerms,
} from "../services/offer.service";
import type { OfferRole, SellerOffer } from "../models/offer";
import type { Order } from "../models/order";

type Action = "accept" | "reject" | "counter" | "order";
export function useOfferDialogViewModel(
  offer: SellerOffer,
  mode: OfferRole,
  stale: boolean,
  refresh: () => Promise<boolean>,
  onResolved: (text: string) => void,
  onOrderCreated: (id: string) => void,
) {
  const respond = useRespondToOffer();
  const client = useQueryClient();
  const createOrder = useMutation({
    mutationFn: () => api.post<Order>("/orders", { offer_id: offer.id }),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["orders"] }),
        client.invalidateQueries({ queryKey: ["my-listings"] }),
        client.invalidateQueries({ queryKey: ["marketplace"] }),
      ]);
    },
  });
  const [action, setAction] = useState<Action | null>(null);
  const [counterPrice, setCounterPrice] = useState(String(offer.offer_price));
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const lock = useRef(false);
  const busy = respond.isPending || createOrder.isPending;
  const blocked = stale || needsRefresh || refreshing;
  function start(next: Action) {
    if (busy || blocked) return;
    setAction(next);
    setFieldError(null);
    setActionError(null);
  }
  async function submit() {
    if (!action || busy || blocked || lock.current) return;
    if (
      action === "order"
        ? !canCreateOfferOrder(offer, mode)
        : !isOfferActionable(offer, mode)
    ) {
      setActionError(
        "These terms are no longer actionable. Refresh the offer to see its current status.",
      );
      setNeedsRefresh(true);
      return;
    }
    if (action === "counter") {
      const error = validateOfferTerms(counterPrice, String(offer.quantity));
      if (error) {
        setFieldError(error);
        return;
      }
    }
    lock.current = true;
    setFieldError(null);
    setActionError(null);
    try {
      if (action === "order") {
        const result = await createOrder.mutateAsync();
        if (!result?.id) throw new Error("Missing order record");
        onOrderCreated(result.id);
      } else {
        await respond.mutateAsync({
          offerId: offer.id,
          action,
          counter_price:
            action === "counter" ? Number(counterPrice) : undefined,
        });
        onResolved(
          action === "accept"
            ? "Offer accepted. Review it to prepare an order."
            : action === "counter"
              ? "Counteroffer sent."
              : "Offer declined.",
        );
      }
    } catch {
      setActionError(
        action === "order"
          ? "We couldn’t verify order creation. Check Orders, then refresh this offer before trying again."
          : "We couldn’t verify your response. Your counter price is preserved. Refresh the offer before trying again.",
      );
      setNeedsRefresh(true);
    } finally {
      lock.current = false;
    }
  }
  async function refreshOffer() {
    setRefreshing(true);
    try {
      if (await refresh()) {
        setNeedsRefresh(false);
        setActionError(null);
        respond.reset();
        createOrder.reset();
      }
    } finally {
      setRefreshing(false);
    }
  }
  return {
    action,
    start,
    back: () => {
      if (!busy) setAction(null);
    },
    counterPrice,
    setCounterPrice: (value: string) => {
      setCounterPrice(value);
      setFieldError(null);
    },
    fieldError,
    actionError,
    busy,
    blocked,
    refreshing,
    needsRefresh,
    submit,
    refreshOffer,
  };
}
