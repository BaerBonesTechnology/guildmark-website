import { useState } from "react";
import { Link } from "react-router";
import {
  Sparkles, Check, ArrowLeft, Zap, Shield, TrendingUp,
  BarChart2, Cpu, Package,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import {
  SubscriptionCheckoutDialog,
  type PaidPlan,
} from "../../components/SubscriptionCheckoutDialog";
import { usePlatformFees, type PlatformFees } from "../../lib/apiHooks";

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

/** Format a decimal fee rate (e.g. 0.06) as a percentage string ("6%"). */
function fmtFee(rate: number) {
  return `${parseFloat((rate * 100).toFixed(2))}%`;
}

/** Seller fee label for a plan key, falling back to "—" while loading. */
function sellerFeeLabel(key: PaidPlan, fees: PlatformFees | undefined): string {
  if (!fees) return "—";
  const map: Record<PaidPlan, number> = {
    starter: fees.seller_fee_starter,
    growth:  fees.seller_fee_growth,
    pro:     fees.seller_fee_pro,
  };
  return fmtFee(map[key]);
}

const PLANS = [
  {
    key:      "starter" as PaidPlan,
    label:    "Starter",
    price:    49,
    color:    "from-blue-500 to-blue-600",
    ring:     "ring-blue-500/30",
    badge:    "text-blue-400",
    features: [
      "Up to 100 devices",
      "2 team members",
      "Full asset inventory",
      "MDM integrations (Jamf + Intune)",
      "AI-powered FMV valuations",
      "Tax invoice generation",
    ],
  },
  {
    key:      "growth" as PaidPlan,
    label:    "Growth",
    price:    149,
    color:    "from-violet-500 to-violet-600",
    ring:     "ring-violet-500/30",
    badge:    "text-violet-400",
    highlight: true,
    features: [
      "Up to 500 devices",
      "5 team members",
      "Everything in Starter",
      "Bulk quick-list to GuildMarket",
      "Portfolio trend analytics",
      "Priority support",
    ],
  },
  {
    key:      "pro" as PaidPlan,
    label:    "Pro",
    price:    349,
    color:    "from-amber-500 to-amber-600",
    ring:     "ring-amber-500/30",
    badge:    "text-amber-400",
    features: [
      "Unlimited devices",
      "Unlimited team members",
      "Everything in Growth",
      "Dedicated account manager",
      "Custom reporting",
      "Lowest seller fees (3%)",
    ],
  },
] as const;

const VALUE_PROPS = [
  {
    icon:  Zap,
    title: "Know what every asset is worth",
    body:  "Our ML valuation engine pulls live eBay and BackMarket data to give you accurate FMV — so you never under-price or sit on overpriced inventory.",
  },
  {
    icon:  TrendingUp,
    title: "Recover more from every offload",
    body:  null, // rendered dynamically with live fee rates
  },
  {
    icon:  Cpu,
    title: "Sync your entire fleet automatically",
    body:  "Connect Jamf or Intune and your device inventory stays up to date — no spreadsheets, no manual entry, no surprises at audit time.",
  },
  {
    icon:  BarChart2,
    title: "Forecast depreciation before it hits",
    body:  "Portfolio analytics surface devices approaching value cliffs 6 months out, so you can list them while the market still wants them.",
  },
  {
    icon:  Shield,
    title: "Compliance-ready from day one",
    body:  "Generate tax-compliant write-off invoices for every disposition, and keep a full audit trail — all in the platform.",
  },
  {
    icon:  Package,
    title: "Sell faster with buyer demand signals",
    body:  "Market Pulse shows real buyer demand for each model so you can prioritise what to list and set prices that close quickly.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProSignup() {
  const { user } = useAuth();
  const currentPlan = user?.subscription_plan ?? "free";
  const { data: fees } = usePlatformFees();

  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlan | null>(null);

  return (
    <div className="min-h-screen bg-amps-surface">
      {/* Top bar */}
      <div className="border-b border-border bg-card px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amps-accent to-amps-highlight">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-mono font-semibold">
            Guild<span className="text-amps-accent">Mark</span>
          </span>
          <span className="ml-1 rounded bg-gradient-to-r from-amps-accent to-amps-highlight px-1.5 py-0.5 text-xs font-semibold text-white">
            GM Pro
          </span>
        </div>
        <Link
          to="/marketplace"
          className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Marketplace
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-16 space-y-20">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amps-accent/30 bg-amps-accent/5 text-amps-accent text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            GM Pro — Fleet Intelligence Platform
          </div>
          <h1 className="text-4xl font-mono font-bold tracking-tight">
            Stop guessing what your IT assets are worth
          </h1>
          <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
            GM Pro connects your MDM, values every device with live market data,
            and puts your surplus hardware in front of verified B2B buyers —
            all from one dashboard.
          </p>
        </div>

        {/* ── Plan cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl border bg-card p-6 space-y-5 ring-2 ${
                plan.highlight
                  ? `${plan.ring} shadow-lg`
                  : "ring-transparent"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-gradient-to-r ${plan.color} text-white text-xs font-semibold font-mono`}>
                    Most popular
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <p className={`font-mono font-semibold ${plan.badge}`}>{plan.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-bold">${plan.price}</span>
                  <span className="text-sm text-muted-foreground font-mono">/month</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {sellerFeeLabel(plan.key, fees)} marketplace seller fee
                </p>
              </div>

              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-mono text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-mono bg-gradient-to-r ${plan.color} text-white hover:opacity-90 transition-opacity`}
                onClick={() => setCheckoutPlan(plan.key)}
              >
                Get {plan.label}
              </Button>
            </div>
          ))}
        </div>

        {/* ── Value props ──────────────────────────────────────────────── */}
        <div className="space-y-6">
          <h2 className="text-xl font-mono font-semibold text-center">
            Why finance and IT ops teams choose GM Pro
          </h2>
          <div className="grid grid-cols-3 gap-5">
            {VALUE_PROPS.map(({ icon: Icon, title, body }) => {
              const resolvedBody = body ?? (fees
                ? `Free-tier seller fees are ${fmtFee(fees.seller_fee_free)}. Starter drops to ${fmtFee(fees.seller_fee_starter)}, Growth to ${fmtFee(fees.seller_fee_growth)}, Pro to ${fmtFee(fees.seller_fee_pro)}. On a $50k equipment offload that difference is real money.`
                : "Paid plans carry lower seller fees than the free tier — the savings add up fast on large offloads.");
              return (
                <div key={title} className="bg-card border border-border rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-amps-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-amps-accent" />
                    </div>
                    <p className="font-mono font-semibold text-sm">{title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed">{resolvedBody}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA footer ───────────────────────────────────────────────── */}
        <div className="text-center space-y-3 pb-8">
          <p className="text-sm text-muted-foreground font-mono">
            No long-term contracts · Cancel any time · Instant access after payment
          </p>
          <div className="flex items-center justify-center gap-3">
            {PLANS.map((plan) => (
              <Button
                key={plan.key}
                variant="outline"
                className="font-mono"
                onClick={() => setCheckoutPlan(plan.key)}
              >
                Start with {plan.label} — ${plan.price}/mo
              </Button>
            ))}
          </div>
        </div>
      </div>

      {checkoutPlan && (
        <SubscriptionCheckoutDialog
          open={!!checkoutPlan}
          onOpenChange={(open) => { if (!open) setCheckoutPlan(null); }}
          plan={checkoutPlan}
          currentPlan={currentPlan}
        />
      )}
    </div>
  );
}
