import { useState } from "react";
import { Plus, Upload, Eye, MessageSquare, Edit, Trash2, Package, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { SpecPill } from "../components/SpecPill";
import { CreateListingDialog } from "../components/CreateListingDialog";
import { ImportListingsDialog } from "../components/ImportListingsDialog";
import { EditListingDialog } from "../components/EditListingDialog";
import { useMyListings, useWithdrawListing, usePublishListing } from "../lib/apiHooks";
import type { Listing } from "../models/listing";

const recentOffers: { id: string; listingId: string; buyer: string; item: string; quantity: number; offerPrice: number; yourPrice: number; status: string; timestamp: string }[] = [];

function priceColor(flag: string | undefined): string {
  switch (flag) {
    case "seller_overpriced": return "text-red-500";
    case "distressed":        return "text-amber-500";
    case "standard":          return "text-emerald-500";
    default:                  return "text-muted-foreground"; // insufficient_data or unknown
  }
}

const totalOffers = recentOffers.length;

export function MyListings() {
  const [activeTab, setActiveTab] = useState<"listings" | "offers">("listings");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editListing, setEditListing]           = useState<Listing | null>(null);
  const { data: myListings = [], isLoading } = useMyListings();
  const withdrawListing = useWithdrawListing();
  const publishListing  = usePublishListing();

  const activeListings = myListings.filter((l) => l.status === "active");
  const totalValue = myListings.reduce((sum, l) => sum + (l.listed_price ?? 0) * (l.quantity ?? 1), 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Listings</p>
            <p className="text-2xl  text-foreground mt-1">{activeListings.length}</p>
          </CardContent>
        </Card>
        <Card className="">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Value</p>
            <p className="text-2xl  text-primary mt-1">${totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Listings</p>
            <p className="text-2xl  text-foreground mt-1">{myListings.length}</p>
          </CardContent>
        </Card>
        <Card className="">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Valuation Flags</p>
            <p className="text-2xl  text-warning mt-1">
              {myListings.filter((l) => l.valuation_flag === "seller_overpriced").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="">
          <Upload />
          Import CSV
        </Button>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white ">
          <Plus />
          Create New Listing
        </Button>
      </div>

      <CreateListingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <ImportListingsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />

      <EditListingDialog
        listing={editListing}
        onOpenChange={(open) => { if (!open) setEditListing(null); }}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("listings")}
          className={`px-4 py-2  text-sm transition-colors border-b-2 ${
            activeTab === "listings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab("offers")}
          className={`px-4 py-2  text-sm transition-colors border-b-2 relative ${
            activeTab === "offers"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Offers Received
          {totalOffers > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-warning text-white text-xs rounded-full flex items-center justify-center">
              {totalOffers}
            </span>
          )}
        </button>
      </div>

      {/* Listings Table */}
      {activeTab === "listings" && (
        <Card className="">
          <CardHeader className="border-b">
            <CardTitle>Your Active Listings</CardTitle>
            <CardDescription>Manage your marketplace listings and track performance</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className=" text-xs uppercase">Listing ID</TableHead>
                  <TableHead className=" text-xs uppercase">Item</TableHead>
                  <TableHead className=" text-xs uppercase">Quantity</TableHead>
                  <TableHead className=" text-xs uppercase">Price/Unit</TableHead>
                  <TableHead className=" text-xs uppercase">Total Value</TableHead>
                  <TableHead className=" text-xs uppercase">Views</TableHead>
                  <TableHead className=" text-xs uppercase">Offers</TableHead>
                  <TableHead className=" text-xs uppercase">Status</TableHead>
                  <TableHead className=" text-xs uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-40 text-center text-muted-foreground  text-sm">
                      Loading listings…
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && myListings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Package className="w-8 h-8 opacity-30" />
                        <p className="text-sm ">No listings yet</p>
                        <Button variant="outline" size="sm" className=" mt-1" onClick={() => setCreateDialogOpen(true)}>
                          <Plus className="w-3 h-3 mr-1" /> Create your first listing
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {myListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <span className=" text-sm">{listing.id.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className=" text-sm">{listing.model_name}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {listing.asset_type && <SpecPill>{listing.asset_type}</SpecPill>}
                          {listing.condition_grade && <SpecPill>Grade {listing.condition_grade}</SpecPill>}
                          {listing.ram_gb && <SpecPill>{listing.ram_gb}GB RAM</SpecPill>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className=" text-sm">{listing.quantity ?? 1}</span>
                    </TableCell>
                    <TableCell>
                      <span className={` text-sm ${priceColor(listing.valuation_flag)}`}>
                        ${listing.listed_price?.toLocaleString() ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className=" text-sm">
                        ${((listing.listed_price ?? 0) * (listing.quantity ?? 1)).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-muted-foreground" />
                        <span className=" text-sm text-muted-foreground">—</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                        <span className=" text-sm text-muted-foreground">—</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={listing.status === "active" ? "default" : "secondary"}
                        className={
                          listing.status === "active"
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {listing.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80"
                            title="Publish to marketplace"
                            disabled={publishListing.isPending}
                            onClick={() => publishListing.mutate(listing.id)}
                          >
                            <Zap className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit price"
                          onClick={() => setEditListing(listing)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          title="Withdraw listing"
                          disabled={withdrawListing.isPending}
                          onClick={() => withdrawListing.mutate(listing.id)}
                        >
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
        <Card className="">
          <CardHeader className="border-b">
            <CardTitle>Offers Received</CardTitle>
            <CardDescription>Review and respond to buyer offers</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className=" text-xs uppercase">Buyer</TableHead>
                  <TableHead className=" text-xs uppercase">Item</TableHead>
                  <TableHead className=" text-xs uppercase">Quantity</TableHead>
                  <TableHead className=" text-xs uppercase">Their Offer</TableHead>
                  <TableHead className=" text-xs uppercase">Your Price</TableHead>
                  <TableHead className=" text-xs uppercase">Difference</TableHead>
                  <TableHead className=" text-xs uppercase">Timestamp</TableHead>
                  <TableHead className=" text-xs uppercase">Actions</TableHead>
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
                        <span className=" text-sm">{offer.buyer}</span>
                      </TableCell>
                      <TableCell>
                        <span className=" text-sm">{offer.item}</span>
                      </TableCell>
                      <TableCell>
                        <span className=" text-sm">{offer.quantity} units</span>
                      </TableCell>
                      <TableCell>
                        <span className=" text-sm text-foreground">${offer.offerPrice}/unit</span>
                      </TableCell>
                      <TableCell>
                        <span className=" text-sm text-muted-foreground">${offer.yourPrice}/unit</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={` text-sm ${
                            isHigher ? "text-primary" : "text-red-500"
                          }`}
                        >
                          {isHigher ? "+" : ""}${diff} ({isHigher ? "+" : ""}{diffPercent}%)
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className=" text-xs text-muted-foreground">{offer.timestamp}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white ">
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" className="">
                            Counter
                          </Button>
                          <Button variant="ghost" size="sm" className=" text-red-500">
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
