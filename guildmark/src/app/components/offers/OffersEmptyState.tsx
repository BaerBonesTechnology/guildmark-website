/** Empty state for either Offers tab, with a link back to the marketplace. */
import { Link } from "react-router";
import { Inbox } from "lucide-react";
import { ROUTE } from "../../constants/routes.constants";
import type { OfferRole } from "../../models/offer";

const EMPTY_COPY: Record<OfferRole, { body: string; title: string }> = {
  placed:   { body: "Offers you place on marketplace listings show up here.", title: "No offers placed yet" },
  received: { body: "Offers other companies place on your listings show up here.", title: "No offers received yet" },
};

export function OffersEmptyState({ role }: { role: OfferRole }) {
  const copy = EMPTY_COPY[role];

  return (
    <div className="bg-card border border-border py-16 flex flex-col items-center gap-3">
      <Inbox size={28} className="opacity-30 text-muted-foreground" />
      <p className="text-sm font-body font-medium">{copy.title}</p>
      <p className="text-xs font-body text-muted-foreground">{copy.body}</p>
      <Link to={ROUTE.marketplace} className="mt-1 inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border hover:border-foreground transition-colors">
        Browse GuildMarket
      </Link>
    </div>
  );
}
