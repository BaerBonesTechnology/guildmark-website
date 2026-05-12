import { useState, useEffect, useMemo } from "react";
import { Search, TrendingUp, ChevronLeft, ChevronRight, Building2, Package, Cpu, HardDrive, MemoryStick } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { SpecPill } from "../components/SpecPill";
import { MarketSignal } from "../components/MarketSignal";
import { useMarketplaceListings, useMakeOffer } from "../lib/apiHooks";
import { api } from "../lib/api";
import type { MarketplaceListing } from "../models/marketplace";
import type { AssetType } from "../models/asset";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
}

function buildSpecs(listing: MarketplaceListing): string[] {
  const parts: string[] = [];
  if (listing.ram_gb)     parts.push(`${listing.ram_gb} GB RAM`);
  if (listing.storage_gb) parts.push(`${listing.storage_gb} GB SSD`);
  if (listing.cpu_score)  parts.push(`CPU ${listing.cpu_score}`);
  if (listing.asset_type) parts.push(listing.asset_type);
  return parts;
}

/** Derive a 1–5 demand signal from the valuation flag + listing age. */
function demandSignal(listing: MarketplaceListing): 1 | 2 | 3 | 4 | 5 {
  const age = daysAgo(listing.created_at);
  const newBoost = age <= 3 ? 1 : 0;
  const base: Record<string, number> = {
    distressed:        4,
    standard:          3,
    insufficient_data: 2,
    seller_overpriced: 1,
  };
  const score = (base[listing.valuation_flag] ?? 2) + newBoost;
  return Math.min(5, Math.max(1, score)) as 1 | 2 | 3 | 4 | 5;
}

const conditionLabel: Record<string, string> = { A: "Grade A", B: "Grade B", C: "Grade C" };

const categoryToAssetType: Record<string, AssetType | undefined> = {
  all:        undefined,
  laptops:    "laptop",
  desktops:   "desktop",
  servers:    "server",
  phones:     "phone",
  tablets:    "tablet",
  networking: "networking",
};

// ---------------------------------------------------------------------------
// Skeleton card shown during initial load
// ---------------------------------------------------------------------------

function ListingSkeleton() {
  return (
    <Card className="font-mono animate-pulse">
      <CardHeader>
        <div className="h-4 bg-muted rounded w-2/3 mb-2" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1.5">
          {[60, 80, 50].map((w) => (
            <div key={w} className="h-5 bg-muted rounded" style={{ width: w }} />
          ))}
        </div>
        <div className="h-16 bg-muted/60 rounded-lg" />
        <div className="h-10 bg-muted/40 rounded" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Details dialog
// ---------------------------------------------------------------------------

function ListingDetailDialog({ listing, onClose, onOffer }: {
  listing:  MarketplaceListing | null;
  onClose:  () => void;
  onOffer:  (l: MarketplaceListing) => void;
}) {
  if (!listing) return null;
  const price = listing.listed_price ?? listing.buyer_ask_price ?? 0;
  return (
    <Dialog open={!!listing} onOpenChange={onClose}>
      <DialogContent className="max-w-lg font-mono">
        <DialogHeader>
          <DialogTitle className="font-mono">{listing.model_name ?? "Listing"}</DialogTitle>
          <DialogDescription className="font-mono text-xs flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {listing.seller_name ?? "B2B Seller"}
            {listing.seller_industry ? ` · ${listing.seller_industry}` : ""}
            {listing.seller_size_band ? ` · ${listing.seller_size_band}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            {listing.condition_grade && (
              <div className="bg-muted/50 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">Condition</p>
                <p className="font-mono">{conditionLabel[listing.condition_grade]}</p>
              </div>
            )}
            <div className="bg-muted/50 rounded p-3">
              <p className="text-xs text-muted-foreground mb-1">Quantity</p>
              <p className="font-mono">{listing.quantity ?? 1} units</p>
            </div>
            {listing.ram_gb && (
              <div className="bg-muted/50 rounded p-3 flex items-center gap-2">
                <MemoryStick className="w-3 h-3 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">RAM</p>
                  <p className="font-mono">{listing.ram_gb} GB</p>
                </div>
              </div>
            )}
            {listing.storage_gb && (
              <div className="bg-muted/50 rounded p-3 flex items-center gap-2">
                <HardDrive className="w-3 h-3 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Storage</p>
                  <p className="font-mono">{listing.storage_gb} GB</p>
                </div>
              </div>
            )}
            {listing.cpu_score && (
              <div className="bg-muted/50 rounded p-3 flex items-center gap-2">
                <Cpu className="w-3 h-3 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">CPU Score</p>
                  <p className="font-mono">{listing.cpu_score}</p>
                </div>
              </div>
            )}
            {listing.asset_type && (
              <div className="bg-muted/50 rounded p-3 flex items-center gap-2">
                <Package className="w-3 h-3 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-mono capitalize">{listing.asset_type}</p>
                </div>
              </div>
            )}
          </div>
          <div className="border-t pt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Listed Price / Unit</p>
              <p className="text-2xl font-mono text-foreground">
                {price > 0 ? `$${price.toLocaleString()}` : "—"}
              </p>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-white font-mono"
              onClick={() => { onClose(); onOffer(listing); }}
            >
              Make Offer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Make Offer dialog
// ---------------------------------------------------------------------------

function MakeOfferDialog({ listing, onClose }: {
  listing: MarketplaceListing | null;
  onClose: () => void;
}) {
  const [offerPrice, setOfferPrice] = useState("");
  const [quantity,   setQuantity]   = useState("1");
  const [error,      setError]      = useState<string | null>(null);
  const [submitted,  setSubmitted]  = useState(false);
  const makeOffer = useMakeOffer();

  useEffect(() => {
    if (listing) {
      setOfferPrice(String(listing.listed_price ?? ""));
      setQuantity("1");
      setError(null);
      setSubmitted(false);
    }
  }, [listing]);

  function handleSubmit() {
    const price = parseFloat(offerPrice);
    const qty   = parseInt(quantity, 10);
    if (isNaN(price) || price <= 0) { setError("Enter a valid offer price"); return; }
    if (isNaN(qty)   || qty   <= 0) { setError("Enter a valid quantity"); return; }
    makeOffer.mutate(
      { listing_id: listing!.id, offer_price: price, quantity: qty },
      { onSuccess: () => setSubmitted(true) },
    );
  }

  return (
    <Dialog open={!!listing} onOpenChange={onClose}>
      <DialogContent className="max-w-sm font-mono">
        <DialogHeader>
          <DialogTitle className="font-mono">Make an Offer</DialogTitle>
          <DialogDescription className="font-mono text-xs truncate">
            {listing?.model_name} · {listing?.seller_name ?? "B2B Seller"}
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-primary font-mono text-sm">✓ Offer submitted</p>
            <p className="text-xs text-muted-foreground">The seller will be notified and can accept, counter, or decline.</p>
            <Button className="mt-4 font-mono" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="font-mono text-xs uppercase tracking-wide">Offer Price / Unit (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  className="pl-6 font-mono"
                  type="number" min="0.01" step="0.01"
                  value={offerPrice}
                  onChange={(e) => { setOfferPrice(e.target.value); setError(null); }}
                  autoFocus
                />
              </div>
              {listing?.listed_price && (
                <p className="text-xs text-muted-foreground font-mono">
                  Listed at ${listing.listed_price.toLocaleString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="font-mono text-xs uppercase tracking-wide">Quantity</Label>
              <Input
                className="font-mono"
                type="number" min="1" step="1"
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setError(null); }}
              />
              {listing?.quantity && (
                <p className="text-xs text-muted-foreground font-mono">
                  {listing.quantity} units available
                </p>
              )}
            </div>
            {error && <p className="text-xs text-red-500 font-mono">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" className="font-mono" onClick={onClose} disabled={makeOffer.isPending}>
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white font-mono"
                onClick={handleSubmit}
                disabled={makeOffer.isPending}
              >
                {makeOffer.isPending ? "Submitting…" : "Submit Offer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Listing card
// ---------------------------------------------------------------------------

function ListingCard({ listing, onDetails, onOffer }: {
  listing:   MarketplaceListing;
  onDetails: (l: MarketplaceListing) => void;
  onOffer:   (l: MarketplaceListing) => void;
}) {
  const price    = listing.listed_price ?? listing.buyer_ask_price ?? 0;
  const quantity = listing.quantity ?? 1;
  const total    = price * quantity;
  const specs    = buildSpecs(listing);
  const signal   = demandSignal(listing);
  const age      = daysAgo(listing.created_at);

  return (
    <Card className="font-mono hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CardTitle className="text-base truncate">
                {listing.model_name ?? "Unknown Model"}
              </CardTitle>
              {listing.condition_grade && (
                <Badge
                  variant="secondary"
                  className={
                    listing.condition_grade === "A"
                      ? "text-grade-a-text bg-grade-a-subtle border-grade-a/20"
                      : listing.condition_grade === "B"
                      ? "text-grade-b-text bg-grade-b-subtle border-grade-b/20"
                      : "text-grade-c-text bg-grade-c-subtle border-grade-c/20"
                  }
                >
                  {conditionLabel[listing.condition_grade]}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Building2 className="w-3 h-3 shrink-0" />
              {listing.seller_name ?? "B2B Seller"}
              {listing.seller_industry ? ` · ${listing.seller_industry}` : ""}
            </p>
          </div>
          <MarketSignal strength={signal} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {specs.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {specs.map((spec) => <SpecPill key={spec}>{spec}</SpecPill>)}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Price / Unit</p>
            <p className="text-lg font-mono text-foreground">
              {price > 0 ? `$${price.toLocaleString()}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="text-lg font-mono">{quantity} {quantity === 1 ? "unit" : "units"}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-xl font-mono text-foreground">
              {total > 0 ? `$${total.toLocaleString()}` : "—"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="font-mono" onClick={() => onDetails(listing)}>
              Details
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-mono" onClick={() => onOffer(listing)}>
              Make Offer
            </Button>
          </div>
        </div>

        {age <= 3 && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <TrendingUp className="w-3 h-3" />
            <span>New listing · {age === 0 ? "today" : `${age}d ago`}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function Marketplace() {
  const [search, setSearch]               = useState("");
  const [debouncedSearch, setDebounced]   = useState("");
  const [category, setCategory]           = useState("all");
  const [condition, setCondition]         = useState("all");
  const [sortBy, setSortBy]               = useState("newest");
  const [page, setPage]                   = useState(1);
  const [detailListing, setDetailListing] = useState<MarketplaceListing | null>(null);
  const [offerListing,  setOfferListing]  = useState<MarketplaceListing | null>(null);

  const [stats, setStats] = useState({
    totalListings: 0, totalUnits: 0,
    avgPricePerUnit: "0", totalMarketValue: "0",
  });

  // Debounce search input — 350 ms
  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [category, condition]);

  // Stats (lightweight, separate fetch)
  useEffect(() => {
    api.get<{ totalListings: number; totalUnits: number; avgPricePerUnit: number; totalMarketValue: number }>(
      "/marketplace/stats"
    )
      .then((r) => setStats({
        totalListings:    r.totalListings,
        totalUnits:       r.totalUnits,
        avgPricePerUnit:  r.avgPricePerUnit.toLocaleString("en-US", { maximumFractionDigits: 0 }),
        totalMarketValue: r.totalMarketValue.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      }))
      .catch(() => {});
  }, []);

  const { data, isLoading, isError } = useMarketplaceListings({
    search:          debouncedSearch || undefined,
    asset_type:      categoryToAssetType[category],
    condition_grade: condition !== "all" ? condition.toUpperCase() : undefined,
    page,
    page_size: 12,
  });

  const listings    = data?.data ?? [];
  const totalPages  = data?.total_pages ?? 1;
  const totalCount  = data?.total ?? 0;

  // Client-side sort within the current page
  const sorted = useMemo(() => {
    if (!listings.length) return listings;
    return [...listings].sort((a, b) => {
      const ap = a.listed_price ?? a.buyer_ask_price ?? 0;
      const bp = b.listed_price ?? b.buyer_ask_price ?? 0;
      if (sortBy === "price-low")  return ap - bp;
      if (sortBy === "price-high") return bp - ap;
      if (sortBy === "demand")     return demandSignal(b) - demandSignal(a);
      return 0; // newest — backend already sorts by created_at DESC
    });
  }, [listings, sortBy]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-mono font-semibold mb-2">Browse the GuildMarket</h1>
        <p className="text-muted-foreground font-mono text-sm">
          Discover enterprise hardware from verified B2B sellers across the country
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Listings</p>
            <p className="text-2xl font-mono text-foreground mt-1">{stats.totalListings.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Units Available</p>
            <p className="text-2xl font-mono text-foreground mt-1">{stats.totalUnits.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Price / Unit</p>
            <p className="text-2xl font-mono text-primary mt-1">${stats.avgPricePerUnit}</p>
          </CardContent>
        </Card>
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Market Value</p>
            <p className="text-2xl font-mono text-primary mt-1">${stats.totalMarketValue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="font-mono">
        <CardContent className="pt-6">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 font-mono"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="font-mono"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all"        className="font-mono">All Categories</SelectItem>
                <SelectItem value="laptops"    className="font-mono">Laptops</SelectItem>
                <SelectItem value="desktops"   className="font-mono">Desktops</SelectItem>
                <SelectItem value="servers"    className="font-mono">Servers</SelectItem>
                <SelectItem value="phones"     className="font-mono">Phones</SelectItem>
                <SelectItem value="tablets"    className="font-mono">Tablets</SelectItem>
                <SelectItem value="networking" className="font-mono">Networking</SelectItem>
              </SelectContent>
            </Select>

            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="font-mono"><SelectValue placeholder="Condition" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono">All Conditions</SelectItem>
                <SelectItem value="a"   className="font-mono">Grade A</SelectItem>
                <SelectItem value="b"   className="font-mono">Grade B</SelectItem>
                <SelectItem value="c"   className="font-mono">Grade C</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="font-mono"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest"     className="font-mono">Newest First</SelectItem>
                <SelectItem value="price-low"  className="font-mono">Price: Low to High</SelectItem>
                <SelectItem value="price-high" className="font-mono">Price: High to Low</SelectItem>
                <SelectItem value="demand"     className="font-mono">High Demand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ListingSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <Card className="font-mono">
          <CardContent className="py-16 text-center text-muted-foreground">
            <p className="text-sm">Failed to load listings. Please try again.</p>
          </CardContent>
        </Card>
      ) : sorted.length === 0 ? (
        <Card className="font-mono">
          <CardContent className="py-16 text-center text-muted-foreground">
            <p className="text-base font-mono mb-1">No listings found</p>
            <p className="text-sm">Try adjusting your filters or search term.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {sorted.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onDetails={setDetailListing}
              onOffer={setOfferListing}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground font-mono">
            Page {page} of {totalPages} · {totalCount.toLocaleString()} listings
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm" className="font-mono"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <Button
              variant="outline" size="sm" className="font-mono"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
      <ListingDetailDialog
        listing={detailListing}
        onClose={() => setDetailListing(null)}
        onOffer={(l) => { setDetailListing(null); setOfferListing(l); }}
      />

      <MakeOfferDialog
        listing={offerListing}
        onClose={() => setOfferListing(null)}
      />
    </div>
  );
}
