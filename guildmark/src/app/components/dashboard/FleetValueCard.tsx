import { dashboardMoney, vsMarketPercent } from "../../services/dashboard.service";
interface Props { ampsPortfolioValue:number; inMarketValue:number; stagedValue:number; totalFleetValue:number; totalListedValue:number; totalMarketValue:number }
export function FleetValueCard(p:Props) {
 const percent = vsMarketPercent(p.totalListedValue,p.totalMarketValue);
 return <section className="gm-fleet-card gm-fleet-value"><span className="gm-fleet-label">Combined reported value</span><strong className="gm-fleet-number">{dashboardMoney(p.totalFleetValue)}</strong><p>Listing asking values plus the latest AMPS portfolio snapshot. This is not a payout estimate; sources may overlap.</p>
 <dl className="gm-fleet-breakdown">{[["Active asking value",p.inMarketValue],["Draft, expired & withdrawn",p.stagedValue],["AMPS snapshot",p.ampsPortfolioValue]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{dashboardMoney(value)}</dd></div>)}</dl>
 <details><summary>Compare asking and market values</summary><dl className="gm-fleet-breakdown"><div><dt>Unsold asking value</dt><dd>{dashboardMoney(p.totalListedValue)}</dd></div><div><dt>Reported market value</dt><dd>{p.totalMarketValue > 0 ? dashboardMoney(p.totalMarketValue) : "Unavailable"}</dd></div>{percent !== null && <div><dt>Asking vs. reported market</dt><dd>{percent > 0 ? "+" : ""}{percent.toFixed(1)}%</dd></div>}</dl><p>Aggregate comparison only. Market values may cover fewer listings than asking values.</p></details></section>;
}
