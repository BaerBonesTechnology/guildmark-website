/** ViewModel for the OrderDetail page: data fetch + confirm/dispute actions. */
import { useParams } from "react-router";
import { useConfirmOrder, useDisputeOrder, useOrder } from "../hooks/useOrders";

export function useOrderDetailViewModel() {
  const { id = "" } = useParams<{ id: string }>();
  const { error, isLoading, order } = useOrder(id);
  const { confirm, isConfirming } = useConfirmOrder();
  const { dispute, isDisputing } = useDisputeOrder();

  const isBuyer = order?.type === "purchase";
  const canAct = !!isBuyer && (order?.orderStatus === "delivered" || order?.orderStatus === "inspecting");

  return {
    canAct,
    confirm,
    dispute,
    error,
    isBuyer,
    isConfirming,
    isDisputing,
    isLoading,
    order,
  };
}
