import { Link } from "react-router";
export function PortalFooterLinks() {
  return (
    <nav
      aria-label="Portal links"
      className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted-foreground"
    >
      <Link to="/admin">Administration</Link>
      <Link to="/partners">Partner Hub</Link>
    </nav>
  );
}
