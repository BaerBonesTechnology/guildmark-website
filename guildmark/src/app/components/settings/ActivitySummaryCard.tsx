import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
/** Account shortcuts replace unavailable lifetime statistics. */
export function ActivitySummaryCard({ base }: { base: string }) {
  return (
    <section className="gm-settings-card">
      <h2>Your workspace</h2>
      <nav
        className="gm-settings-shortcuts"
        aria-label="Account workspace links"
      >
        {[
          { path: "my-listings", label: "Manage listings" },
          { path: "offload", label: "Seller shipments" },
          { path: "orders", label: "Orders & payment records" },
          { path: "offers", label: "My Offers" },
        ].map((link) => (
          <Link key={link.path} to={`${base}/${link.path}`}>
            {link.label}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </section>
  );
}
