import { useState } from "react";
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Inbox,
  DollarSign,
  Tag,
  CalendarClock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { BuyerOffer } from "../models/offer";

type OfferStatus = "pending" | "accepted" | "rejected" | "expired" | "countered";

function statusConfig(status: OfferStatus) {
  switch (status) {
    case "pending":
      return { label: "Pending", className: "bg-amber-500/10 text-amber-500 border-amber-500/30", Icon: Clock };
    case "accepted":
      return { label: "Accepted", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", Icon: CheckCircle2 };
    case "rejected":
      return { label: "Rejected", className: "bg-red-500/10 text-red-500 border-red-500/30", Icon: XCircle };
    case "expired":
      return { label: "Expired", className: "bg-muted text-muted-foreground border-border", Icon: RotateCcw };
    case "countered":
      return { label: "Counter Offer", className: "bg-violet-500/10 text-violet-500 border-violet-500/30", Icon: DollarSign };
  }
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

type OfferTab = "all" | "pending" | "accepted" | "countered";

export function OfferInbox() {
  const [activeTab, setActiveTab] = useState<OfferTab>("all");

  const { data: offers = [], isLoading } = useQuery<BuyerOffer[]>({
    queryKey: ["buyer-offers"],
    queryFn: () => api.get<BuyerOffer[]>("/buyer/offers"),
  });

  const tabs: { key: OfferTab; label: string }[] = [
    { key: "all",      label: "All Offers" },
    { key: "pending",  label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "countered", label: "Counter Offers" },
  ];

  const filtered =
    activeTab === "all"
      ? offers
      : offers.filter((o) => o.status === activeTab);

  const pendingCount = offers.filter((o) => o.status === "pending").length;
  const counterCount = offers.filter((o) => o.status === "countered").length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-mono font-semibold text-foreground">
            Offer Inbox
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Track offers you've placed on marketplace listings.
          </p>
        </div>
        <div className="flex gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-mono text-amber-500">{pendingCount} pending</span>
            </div>
          )}
          {counterCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30">
              <DollarSign className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-xs font-mono text-violet-500">{counterCount} counter{counterCount !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Offers", value: offers.length, color: "text-foreground" },
          { label: "Pending",      value: pendingCount,  color: "text-amber-500" },
          { label: "Accepted",     value: offers.filter((o) => o.status === "accepted").length, color: "text-emerald-500" },
          { label: "Counter Offers", value: counterCount, color: "text-violet-500" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-2xl font-mono ${color}`}>{isLoading ? "—" : value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 font-mono text-sm transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Offer list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-28" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-mono font-semibold text-foreground">No offers yet</p>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Offers you place on marketplace listings will appear here.
            </p>
          </div>
          <Button asChild variant="outline" className="font-mono text-sm mt-1">
            <a href="/marketplace">Browse Marketplace</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((offer) => {
            const { label: statusLabel, className: statusClass, Icon: StatusIcon } =
              statusConfig(offer.status as OfferStatus);

            return (
              <Card key={offer.id} className="font-mono">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Product name placeholder — BE returns model_name via a join when we upgrade */}
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-mono font-semibold text-foreground">
                            Listing {offer.listingId.slice(0, 8)}…
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {offer.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pl-10">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          Offer: <strong className="text-foreground ml-0.5">${offer.offerPrice.toLocaleString()}</strong>
                        </span>
                        {offer.counterPrice && (
                          <span className="flex items-center gap-1 text-violet-500">
                            <DollarSign className="h-3 w-3" />
                            Counter: <strong className="ml-0.5">${offer.counterPrice.toLocaleString()}</strong>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          Placed {fmt(offer.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires {fmt(offer.expiresAt)}
                        </span>
                      </div>

                      {offer.message && (
                        <p className="text-xs text-muted-foreground pl-10 italic">
                          "{offer.message}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge className={`flex items-center gap-1 border font-mono text-xs ${statusClass}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusLabel}
                      </Badge>

                      {offer.status === "accepted" && (
                        <Button
                          size="sm"
                          className="font-mono text-xs bg-primary hover:bg-primary/90 text-white"
                        >
                          <Package className="h-3.5 w-3.5 mr-1" />
                          Place Order
                        </Button>
                      )}

                      {offer.status === "countered" && offer.counterPrice && (
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            className="font-mono text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            Accept ${offer.counterPrice.toLocaleString()}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="font-mono text-xs border-red-500/40 text-red-500 hover:bg-red-500/10"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
