import { Link, useLocation } from "react-router";
import { RefreshCw } from "lucide-react";
import { FleetValueCard } from "../components/dashboard/FleetValueCard";
import { HighIntentAssetsTable } from "../components/dashboard/HighIntentAssetsTable";
import { ResaleCliffChart } from "../components/dashboard/ResaleCliffChart";
import { useDashboardViewModel } from "../viewmodels/useDashboardViewModel";
import { dashboardMoney, dashboardCount } from "../services/dashboard.service";
import "../../styles/dashboard.css";
import { VerificationPrompt } from "../components/signup/VerificationPrompt";

export function ExecutiveDashboard() {
  const vm = useDashboardViewModel();
  const base = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  const d = vm.data;
  return <div className="gm-fleet gm-container">
    <VerificationPrompt />
    <header className="gm-fleet-heading"><div><h1>Your fleet.<br />A clearer next move.</h1><p>Review listing value, pricing signals, and the offers that need your attention.</p></div>
      <Link className="gm-button gm-button-primary" to={`${base}/my-listings`}>Manage listings <span aria-hidden="true">â†—</span></Link></header>
    <div className="gm-fleet-toolbar"><h2>Fleet overview</h2><button className="gm-button" disabled={vm.isFetching} onClick={() => void vm.refetch()}><RefreshCw size={14} aria-hidden="true" />{vm.isFetching ? "Refreshingâ€¦" : "Refresh overview"}</button></div>
    {vm.isError && <div className="gm-fleet-notice" role="alert"><strong>{d ? "Couldnâ€™t refresh the overview." : "Your overview couldnâ€™t be loaded."}</strong><p>{d ? "Showing the last available overview. Refresh to try again." : "Your fleet values are unavailable. Refresh to try again."}</p></div>}
    {vm.isPending && <div className="gm-fleet-loading" role="status" aria-label="Loading fleet overview"><span>Loading fleet overviewâ€¦</span><div /><div /><div /></div>}
    {d && <>
      <div className="gm-fleet-primary"><FleetValueCard ampsPortfolioValue={d.amps_portfolio_value} inMarketValue={d.in_market_value} stagedValue={d.staged_value} totalFleetValue={d.total_fleet_value} totalListedValue={d.total_listed_value} totalMarketValue={d.total_market_value} />
        <section className="gm-fleet-card gm-fleet-attention"><span className="gm-fleet-label">Pricing review</span><strong className="gm-fleet-number">{dashboardCount(d.overpriced_count)}</strong><h2>Listings flagged above market</h2><p>Review asking prices and valuation coverage before making changes. A pricing flag isnâ€™t a guarantee of a sale.</p><Link className="gm-text-link" to={`${base}/my-listings`}>Review your listings â†—</Link></section>
      </div>
      <dl className="gm-fleet-stats">{[
        ["Active listings", dashboardCount(d.active_listings), "Published equipment", `${base}/my-listings`],
        ["Pending offers", dashboardCount(d.pending_offers), "Review current terms and expiry", `${base}/offers`],
        ["Not flagged overpriced", dashboardCount(d.recovery_opportunity), "Includes listings without valuation coverage", `${base}/my-listings`],
        ["Sold asking value", dashboardMoney(d.total_recovered), "Sum of sold listing prices; excludes fees", `${base}/orders`],
      ].map(([label,value,help,to]) => <div key={label}><dt>{label}</dt><dd>{value}</dd><p>{help}</p><Link to={to} aria-label={`View ${label.toLowerCase()}`}>View <span aria-hidden="true">â†—</span></Link></div>)}</dl>
      <ResaleCliffChart chartData={d.value_trend ?? []} />
      <HighIntentAssetsTable assets={d.high_demand_assets ?? []} base={base} />
    </>}
  </div>;
}
