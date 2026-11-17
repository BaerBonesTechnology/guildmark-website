import { FileCheck2, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import type { Order } from "../../models/order";

export function ComplianceVault({
  complete,
  base,
}: {
  complete: Order[];
  base: string;
}) {
  return (
    <section className="gm-offload-card gm-offload-documents">
      <FileCheck2 size={26} aria-hidden="true" />
      <div>
        <h2>Keep the proof with the hardware.</h2>
        <p>
          Data erasure certificates are not available for download here. A
          completed sale does not confirm certified data erasure. Retain
          documentation from your erasure provider with your asset records.
        </p>
        <span>
          {complete.length} completed {complete.length === 1 ? "sale" : "sales"}
        </span>
      </div>
      <Link to={`${base}/orders`} className="gm-text-link">
        View order records <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
