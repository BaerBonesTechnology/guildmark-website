/** My Listings page (View) — stat strip, dialogs, and the listings table. */
import { Package, Plus, Upload } from "lucide-react";
import { CreateListingDialog } from "../components/CreateListingDialog";
import { EditListingDialog } from "../components/EditListingDialog";
import { ImportListingsDialog } from "../components/ImportListingsDialog";
import { ListingRow } from "../components/listings/ListingRow";
import { ListingStatCell } from "../components/listings/ListingStatCell";
import { LISTING_TABLE_HEADERS } from "../constants/listing.constants";
import { BODY, MONO, DISPLAY } from "../constants/typography";
import { useMyListingsViewModel } from "../viewmodels/useMyListingsViewModel";

export function MyListings() {
  const {
    createOpen, editListing, importOpen, isLoading, isPublishing, isWithdrawing,
    listings, publish, setCreateOpen, setEditListing, setImportOpen, stats, withdraw,
  } = useMyListingsViewModel();

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto pb-20" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>My Listings</h1>
          <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Manage your marketplace listings and track valuation flags</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border hover:border-foreground transition-colors" style={{ fontFamily: BODY }}>
            <Upload size={13} /> Import CSV
          </button>
          <button onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity" style={{ background: "var(--primary)", color: "#fff", fontFamily: BODY }}>
            <Plus size={13} /> Create Listing
          </button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-border mb-6" style={{ background: "var(--border)" }}>
        <ListingStatCell label="Active Listings" value={String(stats.activeCount)} />
        <ListingStatCell label="Total Value" value={`$${stats.totalValue.toLocaleString()}`} color="var(--primary)" />
        <ListingStatCell label="Total Listings" value={String(listings.length)} />
        <ListingStatCell label="Overpriced Flags" value={String(stats.flaggedCount)} color={stats.flaggedCount > 0 ? "var(--chart-4)" : undefined} />
      </div>

      <CreateListingDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ImportListingsDialog open={importOpen} onOpenChange={setImportOpen} />
      <EditListingDialog listing={editListing} onOpenChange={(open) => { if (!open) setEditListing(null); }} />

      {/* Listings table */}
      <div className="border border-border" style={{ background: "var(--card)" }}>
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Your Listings</span>
          <span className="text-[10px]" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{listings.length} total</span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading listings…</div>
        ) : listings.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Package size={28} className="opacity-30" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No listings yet</p>
            <button onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border hover:border-foreground transition-colors" style={{ fontFamily: BODY }}>
              <Plus size={13} /> Create your first listing
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 720 }}>
              <thead>
                <tr className="border-b border-border">
                  {LISTING_TABLE_HEADERS.map((header, ndx) => (
                    <th key={ndx} className="text-left py-2.5 px-4 text-[10px] tracking-wider uppercase font-normal" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((listing, ndx) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    striped={ndx % 2 === 1}
                    isPublishing={isPublishing}
                    isWithdrawing={isWithdrawing}
                    onEdit={() => setEditListing(listing)}
                    onPublish={() => publish(listing.id)}
                    onWithdraw={() => withdraw(listing.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
