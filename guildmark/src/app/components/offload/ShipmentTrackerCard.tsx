/** Active Shipment Tracker card — order selector + live TrackingPanel. */
import { Loader2, Truck } from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { TrackingPanel } from "./TrackingPanel";
import { BODY, MONO } from "../../constants/typography";
import type { Order } from "../../models/order";

const selectClass = "px-2 py-1 text-xs border border-border text-foreground focus:outline-none focus:border-primary appearance-none";
const selectStyle = { fontFamily: BODY, background: "var(--input-background)" } as const;

interface ShipmentTrackerCardProps {
  isLoading: boolean;
  onSelect: (orderId: string) => void;
  shipped: Order[];
  trackedId: string | null;
  trackedOrder: Order | null;
}

export function ShipmentTrackerCard({ isLoading, onSelect, shipped, trackedId, trackedOrder }: ShipmentTrackerCardProps) {
  return (
    <div className="border border-border p-6" style={{ background: "var(--card)" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionTitle>{trackedOrder ? `Active Shipment: ${trackedOrder.transactionId}` : "Shipment Tracker"}</SectionTitle>
          {trackedOrder?.trackingNumber && (
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>FedEx {trackedOrder.trackingNumber}</p>
          )}
        </div>
        {shipped.length > 1 && (
          <select value={trackedId ?? trackedOrder?.id ?? ""} onChange={(e) => onSelect(e.target.value)} className={selectClass} style={selectStyle}>
            {shipped.map((o) => <option key={o.id} value={o.id}>{o.transactionId}</option>)}
          </select>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm py-8 justify-center" style={{ color: "var(--muted-foreground)" }}>
          <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
        </div>
      )}
      {!isLoading && trackedOrder && <TrackingPanel orderId={trackedOrder.id} order={trackedOrder} />}
      {!isLoading && !trackedOrder && (
        <div className="py-10 flex flex-col items-center gap-2 text-center">
          <Truck className="w-10 h-10" style={{ color: "var(--muted-foreground)", opacity: 0.5 }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No active shipments. Orders in transit will appear here.</p>
        </div>
      )}
    </div>
  );
}
