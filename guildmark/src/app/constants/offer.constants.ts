import type { OfferRole, OfferStatus } from "../models/offer";
export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  pending: "Awaiting response",
  accepted: "Accepted",
  countered: "Counter sent",
  expired: "Expired",
  rejected: "Declined",
};
export const OFFER_STATUS_COLOR: Record<OfferStatus, string> = {
  pending: "var(--grade-b-text)",
  accepted: "var(--grade-a-text)",
  countered: "var(--grade-a-text)",
  expired: "var(--muted-foreground)",
  rejected: "var(--grade-c-text)",
};
export const OFFER_STATUS_COPY: Record<
  OfferStatus,
  Record<OfferRole, string>
> = {
  pending: {
    received: "Review the buyer’s price and quantity before responding.",
    placed: "Your offer is awaiting the seller’s response.",
  },
  accepted: {
    received:
      "The quote is accepted. Create an order to reserve inventory and prepare the payment record.",
    placed:
      "The seller accepted your quote. Check Orders for a payment record once the seller prepares it.",
  },
  countered: {
    received:
      "Your counteroffer is recorded. It has not been accepted by the buyer.",
    placed:
      "The seller proposed a different unit price. Counteroffer acceptance is not available here; review the listing before making a revised offer.",
  },
  expired: {
    received: "This offer has expired. A new offer is needed to continue.",
    placed:
      "This offer has expired. Review the listing if you want to send a new offer.",
  },
  rejected: {
    received: "This offer was declined.",
    placed: "The seller declined this offer.",
  },
};
