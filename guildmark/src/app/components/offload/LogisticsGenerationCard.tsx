/** Logistics Generation card — shipping method selection (actions disabled). */
import { Download, Truck } from "lucide-react";
import { MonoLabel } from "./MonoLabel";
import { SectionTitle } from "./SectionTitle";
import { SHIPPING_METHOD_OPTIONS } from "../../constants/offload.constants";
import { BODY } from "../../constants/typography";

const selectClass = "px-2 py-1 text-xs border border-border text-foreground focus:outline-none focus:border-primary appearance-none";
const selectStyle = { fontFamily: BODY, background: "var(--input-background)" } as const;

export function LogisticsGenerationCard() {
  return (
    <div className="border border-border p-6" style={{ background: "var(--card)" }}>
      <SectionTitle>Logistics Generation</SectionTitle>
      <div className="grid md:grid-cols-2 gap-6 mt-5">
        <div>
          <label className="block mb-2"><MonoLabel>Shipping Method</MonoLabel></label>
          <select className={`w-full ${selectClass} py-2.5 text-sm`} style={selectStyle}>
            {SHIPPING_METHOD_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Labels are generated per order when a buyer offer is accepted and the escrow is funded.
          </p>
        </div>
      </div>
      <div className="flex gap-4 mt-6">
        <button disabled className="flex-1 px-4 py-3 text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-50" style={{ background: "var(--primary)", color: "#fff" }}>
          <Download className="w-4 h-4" /> Generate Shipping Labels
        </button>
        <button disabled className="flex-1 px-4 py-3 text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-50 border border-border" style={{ color: "var(--muted-foreground)" }}>
          <Truck className="w-4 h-4" /> Schedule Pallet Pickup
        </button>
      </div>
      <p className="text-xs mt-3" style={{ color: "var(--muted-foreground)" }}>
        Logistics actions are triggered automatically through the order flow — select a funded order to proceed.
      </p>
    </div>
  );
}
