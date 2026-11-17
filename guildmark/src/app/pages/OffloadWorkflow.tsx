import { ArrowRight, PackageCheck, Truck, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router";
import { ComplianceVault } from "../components/offload/ComplianceVault";
import { LogisticsGenerationCard } from "../components/offload/LogisticsGenerationCard";
import { OrderHistoryTable } from "../components/offload/OrderHistoryTable";
import { ShipmentTrackerCard } from "../components/offload/ShipmentTrackerCard";
import { useOffloadViewModel } from "../viewmodels/useOffloadViewModel";
import { usd } from "../services/offload.service";
import "../../styles/offload.css";

export function OffloadWorkflow() {
  const vm = useOffloadViewModel();
  const base = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  return (
    <div className="gm-offload gm-container">
      <header className="gm-offload-heading">
        <div>
          <h1>
            Good hardware.
            <br />A new chapter.
          </h1>
          <p>
            Move your business equipment forward. Manage sales, prepare
            shipments, and follow every order through completion.
          </p>
        </div>
        <Link to={`${base}/my-listings`} className="gm-button">
          Manage listings <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </header>
      <div className="gm-offload-summary" aria-label="Your sales overview">
        {[
          {
            label: "Ready to ship",
            value: vm.funded.length,
            Icon: PackageCheck,
          },
          { label: "In transit", value: vm.inTransit.length, Icon: Truck },
          {
            label: "Sales order value",
            value: usd(vm.salesValue * 100),
            Icon: Wallet,
          },
        ].map(({ label, value, Icon }) => (
          <div key={label}>
            <Icon size={20} aria-hidden="true" />
            <div>
              <span>{label}</span>
              <strong>
                {vm.isLoading || (vm.isError && !vm.data) ? "—" : value}
              </strong>
            </div>
          </div>
        ))}
      </div>
      {vm.isError && (
        <div className="gm-offload-notice" role="alert">
          <div>
            <strong>We couldn’t refresh your sales.</strong>
            <p>
              {vm.data
                ? "Showing the last available orders. Try again for the latest status."
                : "Your order status is unavailable. Try again before preparing a shipment."}
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
      {vm.isLoading ? (
        <section
          className="gm-offload-card gm-offload-loading"
          aria-busy="true"
          aria-label="Loading seller orders"
        >
          <p role="status">Loading your sales…</p>
          {[1, 2, 3].map((i) => (
            <div className="gm-offload-skeleton" key={i} aria-hidden="true" />
          ))}
        </section>
      ) : (
        (!vm.isError || vm.data) && (
          <>
            <div className="gm-offload-workspace">
              <LogisticsGenerationCard funded={vm.funded} base={base} />
              <ShipmentTrackerCard
                orders={vm.trackable}
                onSelect={vm.onTrack}
                trackedOrder={vm.trackedOrder}
                base={base}
              />
            </div>
            <OrderHistoryTable
              orders={vm.pageItems}
              total={vm.orders.length}
              filteredCount={vm.filteredCount}
              search={vm.search}
              status={vm.status}
              setSearch={vm.setSearch}
              setStatus={vm.setStatus}
              clearFilters={vm.clearFilters}
              onTrack={vm.onTrack}
              trackedOrder={vm.trackedOrder}
              page={vm.page}
              totalPages={vm.totalPages}
              setPage={vm.setPage}
              base={base}
            />
            <ComplianceVault complete={vm.complete} base={base} />
          </>
        )
      )}
    </div>
  );
}
