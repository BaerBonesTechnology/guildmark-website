import { useState } from "react";
import { Truck, Package, ShieldCheck, CheckCircle2, FileText, Download } from "lucide-react";

const mockOrders = [
  {
    id: "ORD-2026-042",
    units: 12,
    status: "payment_sent",
    created: "2026-04-15",
    value: "$10,200",
  },
  {
    id: "ORD-2026-038",
    units: 8,
    status: "quality_check",
    created: "2026-04-20",
    value: "$6,800",
  },
  {
    id: "ORD-2026-041",
    units: 5,
    status: "in_transit",
    created: "2026-04-25",
    value: "$4,250",
  },
];

export function OffloadWorkflow() {
  const [selectedUnits, setSelectedUnits] = useState(12);

  const steps = [
    { id: "pickup", label: "Pickup Scheduled", icon: Truck, status: "complete" },
    { id: "arrival", label: "Arrival Confirmed", icon: Package, status: "complete" },
    { id: "wipe", label: "Data Wiping", icon: ShieldCheck, status: "active" },
    { id: "quality", label: "Quality Check", icon: CheckCircle2, status: "pending" },
    { id: "payment", label: "Payment Sent", icon: FileText, status: "pending" },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Logistics Generation */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
        <h2 className="font-mono text-slate-900 dark:text-slate-100 mb-6">Logistics Generation</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wide">
              Number of Units
            </label>
            <input
              type="number"
              min="1"
              value={selectedUnits}
              onChange={(e) => setSelectedUnits(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wide">
              Shipping Method
            </label>
            <select className="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-[#3B82F6]">
              <option>Prepaid Labels (1-5 units)</option>
              <option>Pallet Pickup (6+ units)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-3 rounded-lg font-mono text-sm transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Generate Shipping Labels
          </button>
          <button className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-lg font-mono text-sm transition-colors flex items-center justify-center gap-2">
            <Truck className="w-4 h-4" />
            Schedule Pallet Pickup
          </button>
        </div>
      </div>

      {/* Active Shipment Tracker */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
        <h2 className="font-mono text-slate-900 dark:text-slate-100 mb-6">Active Shipment: ORD-2026-041</h2>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-slate-300 dark:bg-slate-700" />
          <div className="absolute top-8 left-0 h-0.5 bg-[#3B82F6] transition-all duration-500" style={{ width: "40%" }} />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = step.status === "complete";
              const isActive = step.status === "active";

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      isComplete
                        ? "bg-[#3B82F6] text-white"
                        : isActive
                        ? "bg-[#F59E0B] text-white animate-pulse"
                        : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <p
                    className={`text-xs font-mono mt-3 text-center ${
                      isComplete || isActive ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <span className="text-xs text-[#F59E0B] font-mono mt-1">In Progress</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
          <h2 className="font-mono text-slate-900 dark:text-slate-100">Order History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/50">
                <th className="text-left p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">Order ID</th>
                <th className="text-left p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">Units</th>
                <th className="text-left p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                <th className="text-left p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">Created</th>
                <th className="text-left p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">Value</th>
                <th className="text-left p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order, idx) => (
                <tr key={order.id} className={idx !== mockOrders.length - 1 ? "border-b border-slate-100 dark:border-slate-700/30" : ""}>
                  <td className="p-4">
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-200">{order.id}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-slate-600 dark:text-slate-300">{order.units}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-mono ${
                        order.status === "payment_sent"
                          ? "bg-[#3B82F6]/20 text-[#3B82F6]"
                          : order.status === "quality_check"
                          ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                          : "bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-slate-600 dark:text-slate-300">{order.created}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-[#3B82F6]">{order.value}</span>
                  </td>
                  <td className="p-4">
                    <button className="text-sm font-mono text-[#3B82F6] hover:text-[#2563EB] flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Vault */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-mono text-slate-900 dark:text-slate-100">Compliance Vault</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">Certificates of destruction for legal/audit purposes</p>
          </div>
          <FileText className="w-6 h-6 text-slate-500 dark:text-slate-400" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {mockOrders.filter(o => o.status === "payment_sent").map((order) => (
            <div key={order.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-[#3B82F6] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-sm font-mono text-slate-800 dark:text-slate-200">{order.id}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">NIST 800-88 Cert</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
