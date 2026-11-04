import { Plus, Search, Upload, Package } from "lucide-react";
import { CreateListingDialog } from "../components/CreateListingDialog";
import { EditListingDialog } from "../components/EditListingDialog";
import { ImportListingsDialog } from "../components/ImportListingsDialog";
import { ListingRow } from "../components/listings/ListingRow";
import { useMyListingsViewModel } from "../viewmodels/useMyListingsViewModel";
import "../../styles/listings.css";
import { VerificationPrompt } from "../components/signup/VerificationPrompt";

export function MyListings() {
  const vm = useMyListingsViewModel();
  return (
    <div className="gm-inventory gm-container">
      <VerificationPrompt />
      <header className="gm-inventory-heading">
        <div>
          <h1>
            Your equipment.
            <br />
            Ready for what’s next.
          </h1>
          <p>
            Build clear, credible listings for business buyers. Review pricing,
            publish drafts, and keep your inventory current.
          </p>
        </div>
        <div className="gm-inventory-header-actions">
          <button
            className="gm-text-link"
            onClick={() => vm.setImportOpen(true)}
          >
            <Upload size={15} aria-hidden="true" />
            Import CSV
          </button>
          <button className="gm-button" onClick={() => vm.setCreateOpen(true)}>
            <Plus size={16} aria-hidden="true" />
            Create listing
          </button>
        </div>
      </header>
      <dl className="gm-inventory-summary">
        {[
          { label: "Active listings", value: vm.stats.activeCount },
          {
            label: "Drafts",
            value: vm.listings.filter((listing) => listing.status === "draft")
              .length,
          },
          {
            label: "Inventory asking value",
            value: `$${vm.stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          },
          { label: "Price reviews", value: vm.stats.flaggedCount },
        ].map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>
              {vm.isLoading || (vm.isError && !vm.data) ? "—" : stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <CreateListingDialog
        open={vm.createOpen}
        onOpenChange={vm.setCreateOpen}
      />
      <ImportListingsDialog
        open={vm.importOpen}
        onOpenChange={vm.setImportOpen}
      />
      <EditListingDialog
        listing={vm.editListing}
        onOpenChange={(open) => {
          if (!open) vm.setEditListing(null);
        }}
      />
      {vm.isError && (
        <div className="gm-inventory-notice" role="alert">
          <div>
            <strong>We couldn’t refresh your listings.</strong>
            <p>
              {vm.data
                ? "Showing the last available inventory."
                : "Inventory is unavailable. Try again to see your listings."}
            </p>
          </div>
          <button
            className="gm-button gm-button-small"
            disabled={vm.isFetching}
            onClick={() => vm.refetch()}
          >
            {vm.isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      )}
      {vm.actionError && (
        <p className="gm-inventory-notice" role="alert">
          {vm.actionError}
        </p>
      )}
      {vm.notice && (
        <p className="gm-inventory-notice is-success" role="status">
          {vm.notice}
        </p>
      )}
      <section
        className="gm-inventory-panel"
        aria-label="Your listings"
        aria-busy={vm.isLoading}
      >
        <div className="gm-inventory-panel-heading">
          <h2>My listings</h2>
          <span role="status">
            {vm.isLoading
              ? "Loading inventory…"
              : vm.isError && !vm.data
                ? "Inventory unavailable"
                : `${vm.filteredCount} of ${vm.listings.length} listings`}
          </span>
        </div>
        <div className="gm-inventory-tools">
          <label className="gm-search">
            <Search size={17} aria-hidden="true" />
            <input
              aria-label="Search your listings"
              placeholder="Search equipment or listing ID"
              value={vm.search}
              onChange={(event) => vm.setSearch(event.target.value)}
            />
          </label>
          <select
            aria-label="Filter listing status"
            value={vm.status}
            onChange={(event) => vm.setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            {["draft", "active", "sold", "withdrawn", "expired"].map(
              (status) => (
                <option key={status} value={status}>
                  {status[0].toUpperCase() + status.slice(1)}
                </option>
              ),
            )}
          </select>
        </div>
        {vm.isLoading ? (
          <div className="gm-inventory-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} aria-hidden="true" />
            ))}
          </div>
        ) : (
          (!vm.isError || vm.data) &&
          (vm.pageItems.length ? (
            <table className="gm-inventory-table">
              <caption className="sr-only">
                Your hardware listings and publishing actions
              </caption>
              <thead>
                <tr>
                  {[
                    "Equipment",
                    "Units",
                    "Price / unit",
                    "Gross value",
                    "Status",
                    "Actions",
                  ].map((title) => (
                    <th key={title} scope="col">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vm.pageItems.map((listing) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    isActing={vm.isActing}
                    isBusy={vm.busyId === listing.id}
                    busyAction={vm.busyAction}
                    onEdit={() => vm.setEditListing(listing)}
                    onPublish={() => vm.publish(listing.id)}
                    onWithdraw={() => vm.withdraw(listing.id)}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="gm-inventory-empty">
              <Package size={28} aria-hidden="true" />
              <h3>
                {vm.listings.length
                  ? "No matching listings"
                  : "Give your hardware a next chapter."}
              </h3>
              <p>
                {vm.listings.length
                  ? "Try another product or status."
                  : "Start with a draft. Add specifications, condition, and pricing before publishing."}
              </p>
              {vm.listings.length ? (
                <button className="gm-text-link" onClick={vm.clearFilters}>
                  Clear search and filters
                </button>
              ) : (
                <button
                  className="gm-button gm-button-small"
                  onClick={() => vm.setCreateOpen(true)}
                >
                  Create your first listing
                </button>
              )}
            </div>
          ))
        )}
        {vm.totalPages > 1 && (
          <nav className="gm-pagination" aria-label="Listing pages">
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
    </div>
  );
}
