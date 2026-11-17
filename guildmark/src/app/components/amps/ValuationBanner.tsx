/**
 * Valuation banner — shown while the background valuation job is running and
 * briefly after it completes (auto-dismisses via the ViewModel). View only.
 */
import { CheckCircle2, Loader2 } from "lucide-react";
import { useValuationBannerViewModel } from "../../viewmodels/useValuationBannerViewModel";

export function ValuationBanner() {
  const { data, visible } = useValuationBannerViewModel();

  if (!visible || !data) return null;

  if (data.status === "running") {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-amps-accent/30 bg-amps-accent/5 px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-amps-accent shrink-0" />
        <div>
          <p className="text-sm  font-medium text-amps-accent">
            Valuation in progress
          </p>
          <p className="text-xs  text-muted-foreground">
            Running AI valuations across{" "}
            {data.asset_count} asset{data.asset_count !== 1 ? "s" : ""} —
            this usually takes less than a minute. You can navigate freely while
            this runs.
          </p>
        </div>
      </div>
    );
  }

  if (data.status === "complete") {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
        <p className="text-sm  font-medium text-success">
          Portfolio valuations updated — your asset values are now current.
        </p>
      </div>
    );
  }

  return null;
}
