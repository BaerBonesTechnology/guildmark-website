import { PromotionSlot } from "../components/PromotionSlot";
import { Fragment, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { ListingCard } from "../components/marketplace/ListingCard";
import { ListingCardSkeleton } from "../components/marketplace/ListingCardSkeleton";
import { MarketplaceFilterRow } from "../components/marketplace/MarketplaceFilterRow";
import { MarketplaceFilterSection } from "../components/marketplace/MarketplaceFilterSection";
import {
  GRADE_BLURB,
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_GRADES,
  MARKETPLACE_SORTS,
} from "../constants/marketplace.constants";
import { useMarketplaceViewModel } from "../viewmodels/useMarketplaceViewModel";

export function Marketplace() {
  const base = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    minQuantity,
    minPrice,
    maxPrice,
    setNumberFilter,
    anyFilter,
    categories,
    clearFilters,
    filteredListings,
    goToNextPage,
    goToPrevPage,
    grades,
    isError,
    isLoading,
    page,
    pageItems,
    refetch,
    search,
    setSearch,
    setSortBy,
    sortBy,
    toggleCategory,
    toggleGrade,
    totalPages,
  } = useMarketplaceViewModel();
  return (
    <div className="gm-market gm-container">
      <header className="gm-market-heading gm-market-heading-compact">
        <h1>GuildMarket</h1>
        <Link to={`${base}/offload`} className="gm-text-link">
          Sell equipment <ArrowRight size={16} />
        </Link>
      </header>
      <PromotionSlot placement="marketplace-banner" />
      <nav className="gm-quick-filters" aria-label="Quick equipment filters">
        {MARKETPLACE_CATEGORIES.map((c) => (
          <button
            key={c.type}
            aria-pressed={categories.has(c.type)}
            onClick={() => toggleCategory(c.type)}
          >
            {c.label}
          </button>
        ))}
      </nav>
      <div className="gm-market-toolbar">
        <label className="gm-search">
          <Search size={18} />
          <input
            aria-label="Search hardware"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by model or specification"
          />
        </label>
        <button
          className="gm-filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="market-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={16} />
          Filters {anyFilter && <span>•</span>}
        </button>
        <select
          aria-label="Sort listings"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
        >
          {MARKETPLACE_SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="gm-market-grid">
        <aside
          id="market-filters"
          className={`gm-market-filters${filtersOpen ? " is-open" : ""}`}
        >
          <div className="gm-filter-title">
            <h2>Refine your search</h2>
            {anyFilter && <button onClick={clearFilters}>Clear all</button>}
          </div>
          <MarketplaceFilterSection title="Equipment">
            {MARKETPLACE_CATEGORIES.map((category) => (
              <MarketplaceFilterRow
                key={category.type}
                label={category.label}
                checked={categories.has(category.type)}
                onToggle={() => toggleCategory(category.type)}
              />
            ))}
          </MarketplaceFilterSection>
          <MarketplaceFilterSection title="Condition">
            {MARKETPLACE_GRADES.map((entry) => (
              <MarketplaceFilterRow
                key={entry.grade}
                label={entry.label}
                checked={grades.has(entry.grade)}
                onToggle={() => toggleGrade(entry.grade)}
                description={GRADE_BLURB[entry.grade]}
              />
            ))}
          </MarketplaceFilterSection>
          <MarketplaceFilterSection title="Price per unit · USD">
            <div className="gm-price-inputs">
              <label>
                Minimum
                <input
                  type="number"
                  min="0"
                  value={minPrice || ""}
                  onChange={(e) => setNumberFilter("minPrice", e.target.value)}
                  placeholder="Any"
                />
              </label>
              <label>
                Maximum
                <input
                  type="number"
                  min="0"
                  value={maxPrice || ""}
                  onChange={(e) => setNumberFilter("maxPrice", e.target.value)}
                  placeholder="Any"
                />
              </label>
            </div>
            {maxPrice > 0 && minPrice > maxPrice && (
              <p role="status">Maximum is below minimum.</p>
            )}
          </MarketplaceFilterSection>
          <MarketplaceFilterSection title="Available quantity">
            <label className="gm-quantity-input">
              At least
              <input
                type="number"
                min="1"
                step="1"
                value={minQuantity || ""}
                onChange={(e) => setNumberFilter("minQty", e.target.value)}
                placeholder="Any quantity"
              />
            </label>
          </MarketplaceFilterSection>
        </aside>
        <section aria-label="Available hardware" aria-busy={isLoading}>
          <div className="gm-results-heading">
            <span role="status">
              {isLoading
                ? "Loading hardware…"
                : isError
                  ? "Available hardware"
                  : `${filteredListings.length} ${filteredListings.length === 1 ? "listing" : "listings"}`}
            </span>
            <span>Prices per unit · USD</span>
          </div>
          {isLoading ? (
            <div className="gm-listing-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="gm-market-empty">
              <h2>We couldn’t load the marketplace.</h2>
              <p>Please try again in a moment.</p>
              <button
                className="gm-button gm-button-small"
                onClick={() => refetch()}
              >
                Try again
              </button>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="gm-market-empty">
              <Search size={28} strokeWidth={1.2} />
              <h2>No matching hardware.</h2>
              <p>Try another model or a broader set of filters.</p>
              {(anyFilter || search) && (
                <button
                  className="gm-button gm-button-small"
                  onClick={() => {
                    clearFilters();
                    setSearch("");
                  }}
                >
                  Reset search
                </button>
              )}
            </div>
          ) : (
            <div className="gm-listing-grid">
              {pageItems.map((listing, index) => (
                <Fragment key={listing.id}>
                  <ListingCard listing={listing} />
                  {index === Math.min(3, pageItems.length - 1) && (
                    <PromotionSlot placement="marketplace-native" />
                  )}
                </Fragment>
              ))}
            </div>
          )}
          {!isLoading && !isError && totalPages > 1 && (
            <div className="gm-pagination">
              <span>
                Page {page} of {totalPages}
              </span>
              <div>
                <button disabled={page <= 1} onClick={goToPrevPage}>
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button disabled={page >= totalPages} onClick={goToNextPage}>
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
