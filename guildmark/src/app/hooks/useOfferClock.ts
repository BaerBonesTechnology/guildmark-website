import { useEffect, useState } from "react";
import type { SellerOffer } from "../models/offer";
/** One timer at the next expiry, rather than polling or refetching the inbox. */
export function useOfferClock(offers: readonly SellerOffer[]) {
  const [now, setNow] = useState(Date.now);
  const nextExpiry = Math.min(
    ...offers
      .filter((offer) => ["pending", "accepted"].includes(offer.status))
      .map((offer) => Date.parse(offer.expires_at))
      .filter((time) => time > now),
  );
  useEffect(() => {
    const current = Date.now();
    setNow(current);
    if (!Number.isFinite(nextExpiry)) return;
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.min(2_147_483_647, Math.max(10, nextExpiry - current + 10)),
    );
    return () => clearTimeout(timer);
  }, [offers, nextExpiry]);
  return now;
}
