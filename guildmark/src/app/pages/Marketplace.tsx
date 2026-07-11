/** Marketplace / GuildMarket (PLP) page — View. Logic lives in the ViewModel. */
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ListingCard } from "../components/marketplace/ListingCard";
import { ListingCardSkeleton } from "../components/marketplace/ListingCardSkeleton";
import { MarketplaceFilterRow } from "../components/marketplace/MarketplaceFilterRow";
import { MarketplaceFilterSection } from "../components/marketplace/MarketplaceFilterSection";
import { MARKETPLACE_CATEGORIES, MARKETPLACE_GRADES, MARKETPLACE_SORTS } from "../constants/marketplace.constants";
import { BODY, DISPLAY, MONO } from "../constants/typography";
import { useMarketplaceViewModel } from "../viewmodels/useMarketplaceViewModel";

export function Marketplace() {
  const {
    anyFilter, categories, clearFilters, filteredListings, goToNextPage, goToPrevPage,
    grades, isError, isLoading, page, pageItems, search, setSearch, setSortBy, sortBy,
    stats, toggleCategory, toggleGrade, totalPages,
  } = useMarketplaceViewModel();

  return (
    <div className="px-6 py-6  mx-auto" style={{ fontFamily: BODY }}>
      {/* Header + stats */}
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>GuildMarket</p>
        <h1 className="tracking-tight mb-4" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(2.2rem, 4vw, 3.2rem)", letterSpacing: 1.5 }}>
          Certified enterprise hardware,<br />from verified B2B sellers.
        </h1>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar filters */}
        <aside className="hidden lg:block">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Filters</p>
            {anyFilter && (
              <button onClick={clearFilters}
                className="text-[10px] hover:text-foreground transition-colors" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Clear</button>
            )}
          </div>
          <MarketplaceFilterSection title="Category">
            {MARKETPLACE_CATEGORIES.map((category) => <MarketplaceFilterRow key={category.type} label={category.label} checked={categories.has(category.type)} onToggle={() => toggleCategory(category.type)} />)}
          </MarketplaceFilterSection>
          <MarketplaceFilterSection title="Condition">
            {MARKETPLACE_GRADES.map((entry) => <MarketplaceFilterRow key={entry.grade} label={entry.label} checked={grades.has(entry.grade)} onToggle={() => toggleGrade(entry.grade)} />)}
          </MarketplaceFilterSection>
        </aside>

        {/* Main */}
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assets…"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                style={{ fontFamily: BODY, background: "var(--input-background)" }} />
            </div>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="px-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary appearance-none"
              style={{ fontFamily: BODY, background: "var(--input-background)" }}>
              {MARKETPLACE_SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, ndx) => <ListingCardSkeleton key={ndx} />)}</div>
          ) : isError ? (
            <div className="border border-border py-16 text-center text-sm" style={{ background: "var(--card)", color: "var(--muted-foreground)" }}>Failed to load listings. Please try again.</div>
          ) : pageItems.length === 0 ? (
            <div className="border border-border py-16 text-center" style={{ background: "var(--card)", color: "var(--muted-foreground)" }}>
              <p className="text-sm font-medium mb-1">No listings found</p>
              <p className="text-xs">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <>
            <div className="flex flex-wrap gap-px w-fit mb-6">
              <div>
                <span className="text-[10px] tracking-widest uppercase mr-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Results</span>
                <span className="text-sm" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{stats.totalListings.toLocaleString()}</span>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">{pageItems.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
          </>
          )}

          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex items-center justify-between pt-6">
              <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Page {page} of {totalPages} · {filteredListings.length.toLocaleString()} listings</p>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={goToPrevPage}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors" style={{ fontFamily: BODY }}>
                  <ChevronLeft size={14} /> Prev
                </button>
                <button disabled={page >= totalPages} onClick={goToNextPage}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors" style={{ fontFamily: BODY }}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
