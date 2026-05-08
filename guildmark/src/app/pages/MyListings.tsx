import { useState } from "react";
import { Plus, Eye, MessageSquare, DollarSign, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { SpecPill } from "../components/SpecPill";
import { CreateListingDialog } from "../components/CreateListingDialog";

const myListings: { id: string; item: string; specs: string; condition: string; quantity: number; pricePerUnit: number; views: number; offers: number; status: string; listedDate: string }[] = [];

const recentOffers: { id: string; listingId: string; buyer: string; item: string; quantity: number; offerPrice: number; yourPrice: number; status: string; timestamp: string }[] = [];

export function MyListings() {
  const [activeTab, setActiveTab] = useState<"listings" | "offers">("listings");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const totalValue = myListings.reduce((sum, l) => sum + l.quantity * l.pricePerUnit, 0);
  const totalOffers = myListings.reduce((sum, l) => sum + l.offers, 0);
  const totalViews = myListings.reduce((sum, l) => sum + l.views, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Listings</p>
            <p className="text-2xl font-mono text-foreground mt-1">{myListings.length}</p>
          </CardContent>
        </Card>
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Value</p>
            <p className="text-2xl font-mono text-[#3B82F6] mt-1">${totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Views</p>
            <p className="text-2xl font-mono text-foreground mt-1">{totalViews}</p>
          </CardContent>
        </Card>
        <Card className="font-mono">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending Offers</p>
            <p className="text-2xl font-mono text-[#F59E0B] mt-1">{totalOffers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-mono">
          <Plus />
          Create New Listing
        </Button>
      </div>

      <CreateListingDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("listings")}
          className={`px-4 py-2 font-mono text-sm transition-colors border-b-2 ${
            activeTab === "listings"
              ? "border-[#3B82F6] text-[#3B82F6]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab("offers")}
          className={`px-4 py-2 font-mono text-sm transition-colors border-b-2 relative ${
            activeTab === "offers"
              ? "border-[#3B82F6] text-[#3B82F6]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Offers Received
          {totalOffers > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F59E0B] text-white text-xs rounded-full flex items-center justify-center">
              {totalOffers}
            </span>
          )}
        </button>
      </div>

      {/* Listings Table */}
      {activeTab === "listings" && (
        <Card className="font-mono">
          <CardHeader className="border-b">
            <CardTitle>Your Active Listings</CardTitle>
            <CardDescription>Manage your marketplace listings and track performance</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs uppercase">Listing ID</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Item</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Quantity</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Price/Unit</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Total Value</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Views</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Offers</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Status</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <span className="font-mono text-sm">{listing.id}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-mono text-sm">{listing.item}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {listing.specs.split(" / ").slice(0, 2).map((spec) => (
                            <SpecPill key={spec}>{spec}</SpecPill>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{listing.quantity}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-[#3B82F6]">${listing.pricePerUnit}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">${(listing.quantity * listing.pricePerUnit).toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-muted-foreground" />
                        <span className="font-mono text-sm">{listing.views}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                        <span className="font-mono text-sm">{listing.offers}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={listing.status === "active" ? "default" : "secondary"}
                        className={
                          listing.status === "active"
                            ? "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30"
                            : "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30"
                        }
                      >
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Offers Table */}
      {activeTab === "offers" && (
        <Card className="font-mono">
          <CardHeader className="border-b">
            <CardTitle>Offers Received</CardTitle>
            <CardDescription>Review and respond to buyer offers</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs uppercase">Buyer</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Item</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Quantity</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Their Offer</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Your Price</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Difference</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Timestamp</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOffers.map((offer) => {
                  const diff = offer.offerPrice - offer.yourPrice;
                  const diffPercent = ((diff / offer.yourPrice) * 100).toFixed(1);
                  const isHigher = diff > 0;

                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <span className="font-mono text-sm">{offer.buyer}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{offer.item}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{offer.quantity} units</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-foreground">${offer.offerPrice}/unit</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-muted-foreground">${offer.yourPrice}/unit</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-mono text-sm ${
                            isHigher ? "text-[#3B82F6]" : "text-red-500"
                          }`}
                        >
                          {isHigher ? "+" : ""}${diff} ({isHigher ? "+" : ""}{diffPercent}%)
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">{offer.timestamp}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-mono">
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" className="font-mono">
                            Counter
                          </Button>
                          <Button variant="ghost" size="sm" className="font-mono text-red-500">
                            Decline
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
