import { Link, useLocation } from "react-router";
import { Search, Inbox } from "lucide-react";
import { OfferCard } from "../components/offers/OfferCard";
import { OfferDialog } from "../components/offers/OfferDialog";
import { useOfferInboxViewModel } from "../viewmodels/useOfferInboxViewModel";
import { useState } from "react";
import { OFFER_STATUS_LABEL } from "../constants/offer.constants";
import "../../styles/offers.css";

export function OfferInbox() {
  const vm = useOfferInboxViewModel();
  const [notice, setNotice] = useState("");
  const base = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  const filtered = Boolean(vm.search.trim()) || vm.status !== "all";
  return (
    <div className="gm-offers gm-container">
      <header className="gm-offers-heading">
        <h1>
          Good terms.
          <br />
          Clear decisions.
        </h1>
        <p>
          Review offers on your equipment and follow the quotes you’ve placed.
          Compare unit prices, quantities, and expiry before responding.
        </p>
      </header>
      <dl className="gm-offers-summary">
        {[
          {
            label:
              vm.activeTab === "received" ? "Received offers" : "Placed offers",
            value: vm.activeOffers.length,
          },
          { label: "Awaiting response", value: vm.pendingCount },
          { label: "Accepted quotes", value: vm.acceptedCount },
        ].map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>
              {vm.isLoading || (vm.isError && !vm.data) ? "—" : stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="gm-offers-tabs" role="group" aria-label="Offer direction">
        {(["received", "placed"] as const).map((tab) => (
          <button
            key={tab}
            aria-pressed={vm.activeTab === tab}
            onClick={() => {
              setNotice("");
              vm.switchTab(tab);
            }}
          >
            {tab === "received" ? "Received" : "Placed"}
          </button>
        ))}
      </div>
      {vm.isError && (
        <div className="gm-offers-notice" role="alert">
          <div>
            <strong>We couldn’t refresh your offers.</strong>
            <p>
              {vm.data
                ? "Showing the last available quotes. Refresh before responding."
                : "Offer records are unavailable. Try again to see the latest terms."}
            </p>
          </div>
          <button
            className="gm-button gm-button-small"
            disabled={vm.isFetching}
            onClick={vm.refresh}
          >
            {vm.isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      )}
      {notice && (
        <p className="gm-offers-notice is-success" role="status">
          {notice}
        </p>
      )}
      <section aria-label="Your offers" aria-busy={vm.isLoading}>
        <div className="gm-offer-tools">
          <label className="gm-search">
            <Search size={17} aria-hidden="true" />
            <input
              aria-label="Search offers"
              placeholder="Search equipment, buyer, or offer ID"
              value={vm.search}
              onChange={(e) => vm.setSearch(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter offer status"
            value={vm.status}
            onChange={(e) => vm.setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {Object.entries(OFFER_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <p className="gm-offer-count" role="status">
          {vm.isLoading
            ? "Loading offers…"
            : vm.isError && !vm.data
              ? "Offers unavailable"
              : `${vm.filteredCount} matching offers`}
        </p>
        {vm.isLoading ? (
          <div className="gm-offers-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} aria-hidden="true" />
            ))}
          </div>
        ) : (
          (!vm.isError || vm.data) &&
          (vm.pageItems.length ? (
            <ul className="gm-offer-list">
              {vm.pageItems.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  role={vm.activeTab}
                  onSelect={() => vm.selectOffer(offer)}
                  now={vm.now}
                />
              ))}
            </ul>
          ) : (
            <div className="gm-offers-empty">
              <Inbox size={28} aria-hidden="true" />
              <h2>
                {filtered
                  ? "No matching offers"
                  : vm.activeTab === "received"
                    ? "Your next conversation starts with a listing."
                    : "Your next offer starts with the right equipment."}
              </h2>
              <p>
                {filtered
                  ? "Try a different product, buyer, or status."
                  : vm.activeTab === "received"
                    ? "Publish equipment to receive offers from business buyers."
                    : "Review a listing and send a unit price and quantity to the seller."}
              </p>
              {filtered ? (
                <button className="gm-text-link" onClick={vm.clearFilters}>
                  Clear search and status
                </button>
              ) : (
                <Link
                  className="gm-button gm-button-small"
                  to={`${base}/${vm.activeTab === "received" ? "my-listings" : "marketplace"}`}
                >
                  {vm.activeTab === "received"
                    ? "Manage listings"
                    : "Browse marketplace"}
                </Link>
              )}
            </div>
          ))
        )}
        {vm.totalPages > 1 && (
          <nav className="gm-pagination" aria-label="Offer pages">
            <span>
              Page {vm.page} of {vm.totalPages}
            </span>
            <div>
              <button
                disabled={vm.page === 1}
                onClick={() => vm.setPage(vm.page - 1)}
              >
                Previous
              </button>
              <button
                disabled={vm.page === vm.totalPages}
                onClick={() => vm.setPage(vm.page + 1)}
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </section>
      {vm.selectedOffer && (
        <OfferDialog
          key={`${vm.activeTab}-${vm.selectedOffer.id}`}
          offer={vm.selectedOffer}
          mode={vm.activeTab}
          stale={vm.isError || vm.isFetching}
          refresh={vm.refresh}
          onResolved={setNotice}
          onOpenChange={(open) => {
            if (!open) vm.clearSelection();
          }}
        />
      )}
    </div>
  );
}
