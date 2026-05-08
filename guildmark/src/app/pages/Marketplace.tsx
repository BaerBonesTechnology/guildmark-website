import { useState, useEffect } from "react";
import { Search, TrendingUp, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { SpecPill } from "../components/SpecPill";
import { MarketSignal } from "../components/MarketSignal";
import { api } from "../lib/api";

const marketplaceListings: {
  id: string;
  seller: string;
  location: string;
  quantity: number;
  item: string;
  specs: string;
  condition: string;
  pricePerUnit: number;
  totalValue: number;
  demand: number;
  verified: boolean;
  daysListed: number;
}[] = [];

export function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [totalListingCount, setTotalListingCount] = useState(0);
  const [totalListingAvailable, setTotalListingAvailable] = useState(0);
  const [totalListingValue, setTotalListingValue] = useState("0");
  const [avgPPU, setAvgPPU] = useState("0");

  useEffect(() => {
    api.get<{
      totalListings: number;
      totalUnits: number;
      avgPricePerUnit: number;
      totalMarketValue: number;
    }>("/marketplace/stats")
      .then((res) => {
        setTotalListingCount(res.totalListings);
        setTotalListingAvailable(res.totalUnits);
        setAvgPPU(res.avgPricePerUnit.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
        setTotalListingValue(res.totalMarketValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
      })
      .catch(() => {});
  }, []);

  const filteredListings = marketplaceListings
    .filter((listing) => {
      if (search && !listing.item.toLowerCase().includes(search.toLowerCase())) return false;
      if (condition !== "all" && listing.condition.toLowerCase() !== condition) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.pricePerUnit - b.pricePerUnit;
      if (sortBy === "price-high") return b.pricePerUnit - a.pricePerUnit;
      if (sortBy === "demand") return b.demand - a.demand;
      return a.daysListed - b.daysListed; // newest
    });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-mono font-semibold mb-2">Browse Marketplace</h1>
        <p className="text-muted-foreground font-mono text-sm">
          Discover enterprise hardware from verified B2B sellers across the country
        </p>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Listings</p>
            <p className="text-2xl font-mono text-foreground mt-1">{totalListingCount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Units Available</p>
            <p className="text-2xl font-mono text-foreground mt-1">{totalListingAvailable.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Price/Unit</p>
            <p className="text-2xl font-mono text-[#3B82F6] mt-1">${avgPPU}</p>
          </CardContent>
        </Card>
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Market Value</p>
            <p className="text-2xl font-mono text-[#3B82F6] mt-1">${totalListingValue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono">All Categories</SelectItem>
                <SelectItem value="laptops" className="font-mono">Laptops</SelectItem>
                <SelectItem value="desktops" className="font-mono">Desktops</SelectItem>
                <SelectItem value="servers" className="font-mono">Servers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono">All Conditions</SelectItem>
                <SelectItem value="excellent" className="font-mono">Excellent</SelectItem>
                <SelectItem value="good" className="font-mono">Good</SelectItem>
                <SelectItem value="fair" className="font-mono">Fair</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" className="font-mono">Newest First</SelectItem>
                <SelectItem value="price-low" className="font-mono">Price: Low to High</SelectItem>
                <SelectItem value="price-high" className="font-mono">Price: High to Low</SelectItem>
                <SelectItem value="demand" className="font-mono">High Demand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="font-mono hover:border-[#3B82F6]/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base">{listing.item}</CardTitle>
                    {listing.verified && (
                      <Badge variant="secondary" className="text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing.seller} • {listing.location}
                  </p>
                </div>
                <MarketSignal strength={listing.demand as 1 | 2 | 3 | 4 | 5} />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-1.5 flex-wrap">
                {listing.specs.split(" / ").map((spec) => (
                  <SpecPill key={spec}>{spec}</SpecPill>
                ))}
                <SpecPill>{listing.condition}</SpecPill>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Price/Unit</p>
                  <p className="text-lg font-mono text-[#3B82F6]">${listing.pricePerUnit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="text-lg font-mono">{listing.quantity} units</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="text-xl font-mono text-foreground">${listing.totalValue.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="font-mono">
                    Details
                  </Button>
                  <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-mono">
                    Make Offer
                  </Button>
                </div>
              </div>

              {listing.daysListed <= 3 && (
                <div className="flex items-center gap-2 text-xs text-[#60A5FA]">
                  <TrendingUp className="w-3 h-3" />
                  <span>New listing • {listing.daysListed}d ago</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
