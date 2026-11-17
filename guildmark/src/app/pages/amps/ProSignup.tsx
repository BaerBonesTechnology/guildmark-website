/**
 * ProSignup — GM Pro subscription landing + checkout (View).
 * Plan/checkout state lives in useProSignupViewModel; plan and value-prop
 * cards are their own components; copy lives in proSignup.constants.
 */
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router";
import { PlanCard } from "../../components/amps/PlanCard";
import { ValuePropCard } from "../../components/amps/ValuePropCard";
import { SubscriptionCheckoutDialog } from "../../components/SubscriptionCheckoutDialog";
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { PLANS, VALUE_PROPS } from "../../constants/proSignup.constants";
import { BODY, DISPLAY, MONO } from "../../constants/typography";
import { useProSignupViewModel } from "../../viewmodels/useProSignupViewModel";

export function ProSignup() {
  const { checkoutPlan, currentPlan, fees, onCheckoutSuccess, setCheckoutPlan } = useProSignupViewModel();
  const prefix = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";

  return (
    <div className="min-h-screen" style={{ fontFamily: BODY, background: "var(--background)" }}>
      {/* Top bar */}
      <div className="border-b border-border px-6 sm:px-8 py-4 flex items-center justify-between" style={{ background: "var(--card)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center" style={{ background: AMPS_ACCENT }}>
            <Sparkles size={15} className="text-amps-accent-foreground" />
          </div>
          <span className="font-semibold" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "1.1rem" }}>
            Guild<span style={{ color: AMPS_ACCENT }}>Mark</span>
          </span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold text-amps-accent-foreground tracking-wider" style={{ background: AMPS_ACCENT, fontFamily: MONO }}>GM PRO</span>
        </div>
        <Link to={`${prefix}/marketplace`} className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
          <ArrowLeft size={13} /> Back to Marketplace
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 space-y-20">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-wider uppercase" style={{ fontFamily: MONO, color: AMPS_ACCENT, border: `1px solid color-mix(in srgb, ${AMPS_ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${AMPS_ACCENT} 6%, transparent)` }}>
            <Sparkles size={13} /> GM Pro — Fleet Intelligence Platform
          </div>
          <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(2.2rem, 5vw, 3.2rem)", lineHeight: 1 }}>Stop guessing what your IT assets are worth</h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "var(--muted-foreground)" }}>
            AMPS brings your asset inventory, supported laptop estimates and guided resale preparation into one workspace. You review every listing decision. MDM integrations and expanded reporting are still in development.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => <PlanCard key={plan.key} fees={fees} onSelect={setCheckoutPlan} plan={plan} />)}
        </div>

        {/* Value props */}
        <div className="space-y-6">
          <h2 className="text-center" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "1.6rem" }}>A guided workflow for asset owners</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUE_PROPS.map((prop) => <ValuePropCard key={prop.title} fees={fees} prop={prop} />)}
          </div>
        </div>

        {/* CTA footer */}
        <div className="text-center space-y-3 pb-8">
          <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Monthly company plans · Cancel any time · Limits do not trigger automatic overage charges</p>
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
          onSuccess={onCheckoutSuccess}
        />
      )}
    </div>
  );
}
