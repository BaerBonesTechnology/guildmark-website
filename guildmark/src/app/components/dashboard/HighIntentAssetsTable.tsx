import { Link } from "react-router";
import type { DashboardData } from "../../lib/apiHooks";
export function HighIntentAssetsTable({assets,base=""}:{assets:DashboardData["high_demand_assets"];base?:string}) {
 return <section className="gm-fleet-card gm-fleet-assets"><header><div><h2>Listings to review</h2><p>Up to eight active assets, ordered by pricing flags. These signals do not measure buyer demand.</p></div><Link className="gm-text-link" to={`${base}/my-listings`}>Manage listings ↗</Link></header>
 {assets.length === 0 ? <div className="gm-fleet-empty"><h3>No assets in this overview</h3><p>Published listings appear here when they’re included in the fleet summary.</p><Link className="gm-button" to={`${base}/my-listings`}>Go to My Listings</Link></div> : <ul>{assets.map((a,i)=><li key={`${a.asset_id}-${i}`}><div><h3>{a.model_name?.trim() || "Unnamed asset"}</h3><p>{a.specs?.trim() && a.specs !== "—" ? a.specs : "Specifications unavailable"}</p></div><span className={`gm-fleet-signal ${a.status === "ready" ? "is-ready" : ""}`}>{a.status === "ready" ? "Review for sale" : a.status === "hold" ? "Needs pricing review" : "Signal unavailable"}</span></li>)}</ul>}
 <p className="gm-fleet-footnote">Review listing details before acting. Sale timing and buyer demand forecasts are unavailable.</p></section>;
}
