/**
 * OffloadWorkflow — seller logistics/tracking/compliance hub (View).
 * Orders data and tracked-shipment state live in useOffloadViewModel; each
 * card is its own component. Presentation only.
 */
import { ComplianceVault } from "../components/offload/ComplianceVault";
import { LogisticsGenerationCard } from "../components/offload/LogisticsGenerationCard";
import { OrderHistoryTable } from "../components/offload/OrderHistoryTable";
import { ShipmentTrackerCard } from "../components/offload/ShipmentTrackerCard";
import { BODY } from "../constants/typography";
import { useOffloadViewModel } from "../viewmodels/useOffloadViewModel";

export function OffloadWorkflow() {
  const { complete, data, error, isLoading, orders, setTrackedId, shipped, trackedId, trackedOrder } = useOffloadViewModel();

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto space-y-4" style={{ fontFamily: BODY }}>
      <LogisticsGenerationCard />
      <ShipmentTrackerCard
        isLoading={isLoading}
        onSelect={setTrackedId}
        shipped={shipped}
        trackedId={trackedId}
        trackedOrder={trackedOrder}
      />
      <OrderHistoryTable
        data={data}
        error={error}
        isLoading={isLoading}
        onTrack={setTrackedId}
        orders={orders}
        trackedOrder={trackedOrder}
      />
      <ComplianceVault complete={complete} />
    </div>
  );
}
