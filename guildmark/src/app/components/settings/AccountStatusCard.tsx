import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import type { SubscriptionData } from "../../lib/apiHooks";
import {
  planLabel,
  subscriptionStatusLabel,
} from "../../services/accountSettings.service";
interface Props {
  data: SubscriptionData | undefined;
  loading: boolean;
  error: boolean;
  fetching: boolean;
  onRetry: () => void;
  base: string;
  ampsEnabled: boolean;
}
export function AccountStatusCard({
  data,
  loading,
  error,
  fetching,
  onRetry,
  base,
  ampsEnabled,
}: Props) {
  return (
    <section className="gm-settings-card gm-settings-plan">
      <h2>Company plan</h2>
      {loading ? (
        <div className="gm-settings-loading" aria-busy="true">
          <p role="status">Loading plan records…</p>
          <div aria-hidden="true" />
        </div>
      ) : (
        <>
          <div className="gm-settings-plan-value">
            <strong>{data ? planLabel(data.plan) : "Unavailable"}</strong>
            {data && (
              <span
                className={`gm-settings-plan-status ${data.status === "active" ? "is-active" : "is-attention"}`}
              >
                {subscriptionStatusLabel(data.status)}
              </span>
            )}
          </div>
          <p>Subscription status applies to your company workspace.</p>
        </>
      )}
      {error && (
        <div className="gm-settings-notice" role="alert">
          <p>
            {data
              ? "Plan refresh failed. Showing the last available record."
              : "Plan records could not be loaded."}
          </p>
          <button
            className="gm-text-link"
            disabled={fetching}
            onClick={onRetry}
          >
            {fetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      )}
      {!loading && !error && (
        <button className="gm-text-link" disabled={fetching} onClick={onRetry}>
          {fetching ? "Refreshing…" : "Refresh plan record"}
        </button>
      )}
      {ampsEnabled && (
        <Link className="gm-text-link" to={`${base}/amps/settings`}>
          Manage plan & billing <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}
