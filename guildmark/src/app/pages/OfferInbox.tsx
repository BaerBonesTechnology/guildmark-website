/** Offers page (View) — Received + Placed tabs; logic lives in the ViewModel. */
import { AlertTriangle } from "lucide-react";
import { OfferCard } from "../components/offers/OfferCard";
import { OfferDialog } from "../components/offers/OfferDialog";
import { OffersEmptyState } from "../components/offers/OffersEmptyState";
import { useOfferInboxViewModel } from "../viewmodels/useOfferInboxViewModel";
import type { OfferRole } from "../models/offer";

const TABS: { key: OfferRole; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "placed", label: "Placed" },
];

export function OfferInbox() {
  const model = useOfferInboxViewModel();

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6 pb-20 font-body">
      <header className="mb-6">
        <h1 className="font-display font-extrabold tracking-tight leading-none text-3xl md:text-4xl">Offers</h1>
        <p className="text-2xs font-mono text-muted-foreground mt-1.5">Respond to offers on your listings, and track the offers you've placed</p>
      </header>

      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => model.switchTab(key)}
            className={`px-4 py-2.5 text-xs tracking-wider uppercase font-mono -mb-px border-b-2 transition-colors ${model.activeTab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {label}
            {key === "received" && model.pendingReceived > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-4 h-4 px-1 text-2xs text-white bg-grade-b">{model.pendingReceived}</span>
            )}
          </button>
        ))}
      </div>

      {model.activeLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((ndx) => <div key={ndx} className="bg-card border border-border h-24 animate-pulse" />)}</div>
      ) : model.activeError ? (
        <div className="bg-card border border-border border-l-4 border-l-chart-4 p-8 flex items-start gap-4">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-chart-4" />
          <div>
            <p className="font-body font-medium mb-1">Couldn't load offers</p>
            <p className="text-sm font-body text-muted-foreground">
              {model.activeTab === "received"
                ? "The /seller/offers endpoint returned an error — the API may need a restart to pick up this route."
                : "The /buyer/offers endpoint returned an error."}
            </p>
          </div>
        </div>
      ) : model.activeOffers.length === 0 ? (
        <OffersEmptyState role={model.activeTab} />
      ) : (
        <div className="space-y-3">
          {model.activeOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} role={model.activeTab} onSelect={() => model.selectOffer(offer)} />
          ))}
        </div>
      )}

      <OfferDialog offer={model.selectedOffer} mode={model.activeTab} onOpenChange={(open) => { if (!open) model.clearSelection(); }} />
    </div>
  );
}
