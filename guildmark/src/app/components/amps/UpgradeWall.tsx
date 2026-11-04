/** Free-tier upgrade wall shown in place of the AMPS suite. */
import { CheckCircle, Lock, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Button } from "../ui/button";
import { PLAN_FEATURES, PLAN_TIERS } from "../../constants/ampsLayout.constants";

export function UpgradeWall({ plan }: { plan: string }) {
  const prefix = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  return (
    <div className="min-h-screen bg-amps-surface flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amps-accent to-amps-highlight flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-amps-accent-foreground" />
          </div>
          <h1 className="text-2xl  font-semibold mb-2">
            AMPS plan required
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            You're on the <span className="font-semibold capitalize">{plan}</span> plan.
            Starter, Growth and Pro include AMPS inventory and guided laptop valuation workflows. MDM integrations are still prototypes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
          {PLAN_TIERS.map((tier) => (
            <div key={tier} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <p className="text-sm  font-semibold capitalize">{tier}</p>
              <ul className="space-y-1.5">
                {PLAN_FEATURES[tier].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-amps-accent shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild className="bg-amps-accent hover:bg-amps-accent/90 text-amps-accent-foreground  gap-2 px-8">
            <Link to={`${prefix}/amps/pro-signup`}>
              <Sparkles className="w-4 h-4" />
              View Plans &amp; Upgrade
            </Link>
          </Button>
          <p className="mt-4"><Link className="text-sm underline" to={`${prefix}/amps/settings`}>Manage billing and cancellation</Link></p>
          <p className="text-xs text-muted-foreground mt-3">
            No contracts · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
