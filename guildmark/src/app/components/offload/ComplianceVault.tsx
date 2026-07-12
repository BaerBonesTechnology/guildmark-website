/** Compliance Vault — certificates of data destruction for completed orders. */
import { Download, FileText } from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { MONO } from "../../constants/typography";
import type { Order } from "../../models/order";
import { fmt } from "../../services/offload.service";

export function ComplianceVault({ complete }: { complete: Order[] }) {
  return (
    <div className="border border-border p-6" style={{ background: "var(--card)" }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <SectionTitle>Compliance Vault</SectionTitle>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Certificates of data destruction for legal and audit purposes</p>
        </div>
        <FileText className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
      </div>

      {complete.length === 0 ? (
        <p className="text-sm py-4" style={{ color: "var(--muted-foreground)" }}>
          Certificates appear here once orders reach the <strong>complete</strong> status.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {complete.map((order) => (
            <div key={order.id} className="border border-border p-4 hover:border-primary transition-colors cursor-pointer" style={{ background: "var(--secondary)" }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
                  <FileText className="w-6 h-6" style={{ color: "var(--primary)" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm truncate">{order.transactionId}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>NIST 800-88 · {order.quantity} unit{order.quantity !== 1 ? "s" : ""}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{fmt(order.completedAt ?? order.createdAt)}</p>
                </div>
              </div>
              <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs py-1.5 border transition-colors"
                style={{ color: "var(--primary)", borderColor: "color-mix(in srgb, var(--primary) 25%, transparent)" }}>
                <Download className="w-3 h-3" /> Download Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
