import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Sparkles, Check, ArrowLeft, Zap, Shield, TrendingUp, BarChart2, Cpu, Package } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { SubscriptionCheckoutDialog, type PaidPlan } from "../../components/SubscriptionCheckoutDialog";
import { usePlatformFees, type PlatformFees } from "../../lib/apiHooks";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const ACCENT = "var(--amps-accent)";

function fmtFee(rate: number) { return `${parseFloat((rate * 100).toFixed(2))}%`; }

function sellerFeeLabel(key: PaidPlan, fees: PlatformFees | undefined): string {
  if (!fees) return "—";
  const map: Record<PaidPlan, number> = { starter: fees.seller_fee_starter, growth: fees.seller_fee_growth, pro: fees.seller_fee_pro };
  return fmtFee(map[key]);
}

const PLANS = [
  { key: "starter" as PaidPlan, label: "Starter", price: 39, features: ["Up to 350 devices", "2 team members", "Full asset inventory", "MDM integrations (Jamf + Intune)", "AI-powered FMV valuations", "Tax invoice generation"] },
  { key: "growth" as PaidPlan, label: "Growth", price: 79, highlight: true, features: ["Up to 700 devices", "5 team members", "Everything in Starter", "Bulk quick-list to GuildMarket", "Portfolio trend analytics", "Priority support"] },
  { key: "pro" as PaidPlan, label: "Pro", price: 149, features: ["Unlimited devices", "Unlimited team members", "Everything in Growth", "Dedicated account manager", "Custom reporting", "Lowest seller fees (3%)"] },
] as const;

const VALUE_PROPS = [
  { icon: Zap, title: "Know what every asset is worth", body: "Our ML valuation engine pulls live eBay and BackMarket data to give you accurate FMV — so you never under-price or sit on overpriced inventory." },
  { icon: TrendingUp, title: "Recover more from every offload", body: null },
  { icon: Cpu, title: "Sync your entire fleet automatically", body: "Connect Jamf or Intune and your device inventory stays up to date — no spreadsheets, no manual entry, no surprises at audit time." },
  { icon: BarChart2, title: "Forecast depreciation before it hits", body: "Portfolio analytics surface devices approaching value cliffs 6 months out, so you can list them while the market still wants them." },
  { icon: Shield, title: "Compliance-ready from day one", body: "Generate tax-compliant write-off invoices for every disposition, and keep a full audit trail — all in the platform." },
  { icon: Package, title: "Sell faster with buyer demand signals", body: "Market Pulse shows real buyer demand for each model so you can prioritise what to list and set prices that close quickly." },
];

export function ProSignup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentPlan = user?.subscription_plan ?? "free";
  const { data: fees } = usePlatformFees();
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlan | null>(null);

  return (
    <div className="min-h-screen" style={{ fontFamily: BODY, background: "var(--background)" }}>
      {/* Top bar */}
      <div className="border-b border-border px-6 sm:px-8 py-4 flex items-center justify-between" style={{ background: "var(--card)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center" style={{ background: ACCENT }}>
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-semibold" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "1.1rem" }}>
            Guild<span style={{ color: ACCENT }}>Mark</span>
          </span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold text-white tracking-wider" style={{ background: ACCENT, fontFamily: MONO }}>GM PRO</span>
        </div>
        <Link to="/pre/marketplace" className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
          <ArrowLeft size={13} /> Back to Marketplace
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 space-y-20">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-wider uppercase" style={{ fontFamily: MONO, color: ACCENT, border: `1px solid color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 6%, transparent)` }}>
            <Sparkles size={13} /> GM Pro — Fleet Intelligence Platform
          </div>
          <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(2.2rem, 5vw, 3.2rem)", lineHeight: 1 }}>Stop guessing what your IT assets are worth</h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "var(--muted-foreground)" }}>
            GM Pro connects your MDM, values every device with live market data, and puts your surplus hardware in front of verified B2B buyers — all from one dashboard.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const highlight = "highlight" in plan && plan.highlight;
            return (
              <div key={plan.key} className="relative border p-6 space-y-5" style={{ background: "var(--card)", borderColor: highlight ? ACCENT : "var(--border)" }}>
                {highlight && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-0.5 text-[10px] font-semibold text-white tracking-wider uppercase" style={{ background: ACCENT, fontFamily: MONO }}>Most popular</span>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="font-semibold" style={{ color: ACCENT, fontFamily: MONO, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{plan.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "2.5rem", lineHeight: 1 }}>${plan.price}</span>
                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>/month</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{sellerFeeLabel(plan.key, fees)} marketplace seller fee</p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      <Check size={15} className="shrink-0 mt-0.5" style={{ color: ACCENT }} /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setCheckoutPlan(plan.key)} className="w-full py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ background: ACCENT }}>Get {plan.label}</button>
              </div>
            );
          })}
        </div>

        {/* Value props */}
        <div className="space-y-6">
          <h2 className="text-center" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "1.6rem" }}>Why finance and IT ops teams choose GM Pro</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUE_PROPS.map(({ icon: Icon, title, body }) => {
              const resolvedBody = body ?? (fees
                ? `Free-tier seller fees are ${fmtFee(fees.seller_fee_free)}. Starter drops to ${fmtFee(fees.seller_fee_starter)}, Growth to ${fmtFee(fees.seller_fee_growth)}, Pro to ${fmtFee(fees.seller_fee_pro)}. On a $50k equipment offload that difference is real money.`
                : "Paid plans carry lower seller fees than the free tier — the savings add up fast on large offloads.");
              return (
                <div key={title} className="border border-border p-5 space-y-2" style={{ background: "var(--card)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ border: `1px solid color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}>
                      <Icon size={15} style={{ color: ACCENT }} />
                    </div>
                    <p className="font-semibold text-sm">{title}</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{resolvedBody}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA footer */}
        <div className="text-center space-y-3 pb-8">
          <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>No long-term contracts · Cancel any time · Instant access after payment</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PLANS.map((plan) => (
              <button key={plan.key} onClick={() => setCheckoutPlan(plan.key)} className="px-4 py-2 text-xs border border-border hover:border-foreground transition-colors">
                Start with {plan.label} — ${plan.price}/mo
              </button>
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
          onSuccess={() => navigate("/pre/amps")}
        />
      )}
    </div>
  );
}
