import { OfferDialog as OfferManagementDialog } from "./offers/OfferDialog";
import type { SellerOffer } from "../models/offer";
/** Compatibility entry point for older seller/buyer callers. */
export function OfferDialog({
  offer,
  mode,
  onOpenChange,
}: {
  offer: SellerOffer | null;
  mode: "seller" | "buyer";
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <OfferManagementDialog
      offer={offer}
      mode={mode === "seller" ? "received" : "placed"}
      onOpenChange={onOpenChange}
    />
  );
}
