/// TierGate — renders children only when the user's subscription plan meets
/// the required tier. Below-tier users see a blurred preview with an upgrade
/// prompt overlay.
///
/// Usage:
///   <TierGate require="starter">
///     <FeatureComponent />
///   </TierGate>

import { Link } from "react-router";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/useAuth";

export type SubscriptionPlan = "free" | "starter" | "growth" | "pro";

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  free:    0,
  starter: 1,
  growth:  2,
  pro:     3,
};

const PLAN_LABEL: Record<SubscriptionPlan, string> = {
  free:    "Free",
  starter: "Starter",
  growth:  "Growth",
  pro:     "Pro",
};

interface TierGateProps {
  /** Minimum plan required to access the wrapped content. */
  require: SubscriptionPlan;
  children: React.ReactNode;
  /** Optional custom message shown in the upgrade prompt. */
  message?: string;
  /** If true, renders null instead of the blurred preview for below-tier users. */
  hide?: boolean;
}

export function TierGate({ require: required, children, message, hide = false }: TierGateProps) {
  const { user } = useAuth();
  const plan = user?.subscription_plan ?? "free";
  const hasAccess = PLAN_RANK[plan] >= PLAN_RANK[required];

  if (hasAccess) return <>{children}</>;
  if (hide) return null;

  return (
    <div className="relative">
      {/* Blurred preview of the content */}
      <div className="pointer-events-none select-none blur-sm opacity-40 overflow-hidden max-h-64">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/95 border border-border rounded-xl shadow-lg px-8 py-6 text-center max-w-sm mx-4">
          <div className="w-10 h-10 rounded-full bg-amps-accent/10 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-amps-accent" />
          </div>
          <p className="text-sm font-semibold mb-1">
            {PLAN_LABEL[required]} Plan Required
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {message ?? `This feature is available on the ${PLAN_LABEL[required]} plan and above.`}
          </p>
          <Button asChild size="sm" className="bg-amps-accent hover:bg-amps-accent/90 text-white  gap-1.5">
            <Link to="/amps">
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade to GM Pro
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Current plan: <span className="font-medium capitalize">{plan}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/** Inline variant — just renders an upgrade chip without blurred content. */
export function TierBadge({ require: required }: { require: SubscriptionPlan }) {
  const { user } = useAuth();
  const plan = user?.subscription_plan ?? "free";
  const hasAccess = PLAN_RANK[plan] >= PLAN_RANK[required];
  if (hasAccess) return null;

  return (
    <Link
      to="/amps"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amps-accent/10 text-amps-accent text-[10px] font-semibold hover:bg-amps-accent/20 transition-colors"
    >
      <Sparkles className="w-2.5 h-2.5" />
      {PLAN_LABEL[required]}+
    </Link>
  );
}
