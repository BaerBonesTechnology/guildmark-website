/** Free-tier upgrade wall shown in place of the AMPS suite. */
import { CheckCircle, Lock, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { PLAN_FEATURES, PLAN_TIERS } from "../../constants/ampsLayout.constants";

export function UpgradeWall({ plan }: { plan: string }) {
  return (
    <div className="min-h-screen bg-amps-surface flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amps-accent to-amps-highlight flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl  font-semibold mb-2">
            GM Pro Required
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            You're on the <span className="font-semibold capitalize">{plan}</span> plan.
            Upgrade to unlock fleet intelligence, MDM integrations, and AI-powered valuations.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
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
          <Button asChild className="bg-amps-accent hover:bg-amps-accent/90 text-white  gap-2 px-8">
            <Link to="/pre/amps/pro-signup">
              <Sparkles className="w-4 h-4" />
              View Plans &amp; Upgrade
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            No contracts · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
