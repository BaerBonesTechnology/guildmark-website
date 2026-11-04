import { useRef, useState } from "react";
import { useParams } from "react-router";
import { useConfirmOrder, useDisputeOrder, useOrder } from "../hooks/useOrders";
import { canReviewDelivery } from "../services/order.service";

export function useOrderDetailViewModel() {
  const { id = "" } = useParams<{ id: string }>();
  const query = useOrder(id);
  const confirm = useConfirmOrder();
  const dispute = useDisputeOrder();
  const [review, setReview] = useState<"confirm" | "dispute" | null>(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const submitting = useRef(false);
  const busy = confirm.isPending || dispute.isPending;
  const canAct =
    canReviewDelivery(query.order) &&
    !query.isError &&
    !query.isFetching &&
    !needsRefresh &&
    !confirm.isSuccess &&
    !dispute.isSuccess;
  async function submit() {
    if (!canAct || !review || busy || submitting.current) return;
    submitting.current = true;
    try {
      await (review === "confirm" ? confirm : dispute).mutateAsync(id);
      setReview(null);
    } catch {
      setNeedsRefresh(true);
      setReview(null);
    } finally {
      submitting.current = false;
    }
  }
  async function refresh() {
    const result = await query.refetch();
    if (!result.isError) {
      setNeedsRefresh(false);
      confirm.reset();
      dispute.reset();
    }
  }
  return {
    ...query,
    review,
    setReview,
    submit,
    busy,
    canAct,
    refresh,
    needsRefresh,
    isBuyer: query.order?.type === "purchase",
    actionError:
      confirm.isError || dispute.isError
        ? "We couldn’t verify the outcome. Refresh this order before trying again."
        : null,
    notice: confirm.isSuccess
      ? "Receipt confirmed. The order record has been updated."
      : dispute.isSuccess
        ? "Dispute opened. Review the order status for updates."
        : null,
  };
}
