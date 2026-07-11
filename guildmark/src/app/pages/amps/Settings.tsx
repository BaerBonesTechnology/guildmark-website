import { useState } from "react";
import { Building2, CreditCard, Bell, Sparkles, Check, Receipt, Loader2, AlertCircle, ArrowUpRight, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { useAuth } from "../../hooks/useAuth";
import { useSubscription, useCancelSubscription, usePlatformFees, type SubscriptionInvoice, type PlatformFees } from "../../lib/apiHooks";
import { SubscriptionCheckoutDialog, type PaidPlan } from "../../components/SubscriptionCheckoutDialog";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const ACCENT = "var(--amps-accent)";

const PLANS = [
  { key: "free" as const, label: "Free", price: 0, devices: "Up to 10 devices", users: "1 user" },
  { key: "starter" as const, label: "Starter", price: 49, devices: "Up to 100 devices", users: "2 team members" },
  { key: "growth" as const, label: "Growth", price: 149, devices: "Up to 500 devices", users: "5 team members" },
  { key: "pro" as const, label: "Pro", price: 349, devices: "Unlimited devices", users: "Unlimited users" },
] as const;

type PlanKey = (typeof PLANS)[number]["key"];
const PLAN_RANK: Record<PlanKey, number> = { free: 0, starter: 1, growth: 2, pro: 3 };

function fmtFee(rate: number) { return `${parseFloat((rate * 100).toFixed(2))}%`; }
function sellerFeeLabel(key: PlanKey, fees: PlatformFees | undefined): string {
  if (!fees) return "—";
  const map: Record<PlanKey, number> = { free: fees.seller_fee_free, starter: fees.seller_fee_starter, growth: fees.seller_fee_growth, pro: fees.seller_fee_pro };
  return fmtFee(map[key]);
}
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
function fmtAmount(cents: number) { return `$${(cents / 100).toFixed(2)}`; }

function Panel({ icon: Icon, title, subtitle, action, children, pad = true }: {
  icon: React.ElementType; title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; pad?: boolean;
}) {
  return (
    <div className="border border-border" style={{ background: "var(--card)" }}>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ border: `1px solid color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}>
            <Icon size={16} style={{ color: ACCENT }} />
          </div>
          <div>
            <p className="font-medium text-sm">{title}</p>
            {subtitle && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className={pad ? "p-5" : ""}>{children}</div>
    </div>
  );
}

function InvoiceRow({ inv }: { inv: SubscriptionInvoice }) {
  const plan = PLANS.find((p) => p.key === inv.plan);
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-sm" style={{ fontFamily: MONO }}>{fmtDate(inv.created_at)}</td>
      <td className="px-4 py-3">
        {plan ? <span className="text-[10px] px-2 py-0.5 tracking-wider uppercase" style={{ fontFamily: MONO, color: ACCENT, border: `1px solid color-mix(in srgb, ${ACCENT} 30%, transparent)` }}>{plan.label}</span> : <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>—</span>}
      </td>
      <td className="px-4 py-3 text-sm" style={{ fontFamily: MONO }}>{inv.period_start && inv.period_end ? `${fmtDate(inv.period_start)} – ${fmtDate(inv.period_end)}` : "—"}</td>
      <td className="px-4 py-3 text-sm font-medium" style={{ fontFamily: MONO }}>{fmtAmount(inv.amount_cents)}</td>
      <td className="px-4 py-3"><span className="text-xs" style={{ color: inv.status === "paid" ? "var(--grade-a)" : "var(--chart-4)", fontFamily: MONO }}>{inv.status}</span></td>
      <td className="px-4 py-3 text-right">
        {inv.receipt_url ? (
          <a href={inv.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs hover:text-foreground transition-colors" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Receipt <ArrowUpRight size={12} /></a>
        ) : <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>}
      </td>
    </tr>
  );
}

export function Settings() {
  const { user } = useAuth();
  const { data: subData, isLoading: subLoading } = useSubscription();
  const currentPlan = ((subData?.plan ?? user?.subscription_plan) ?? "free") as PlanKey;
  const { data: fees } = usePlatformFees();
  const cancelSub = useCancelSubscription();

  const [companyData, setCompanyData] = useState({ name: "", industry: "", size: "" });
  const [notifications, setNotifications] = useState({ syncFailures: true, valuationAlerts: true, offerActivity: false });
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlan | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  async function handleCancel() { await cancelSub.mutateAsync(); setCancelConfirm(false); }

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto pb-20 space-y-6" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div>
        <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>Settings</h1>
        <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Manage your GuildMark account, subscription, and preferences</p>
      </div>

      {/* Company Profile */}
      <Panel icon={Building2} title="Company Profile" subtitle="Your organization details and account information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={companyData.name} onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input value={companyData.industry} onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })} placeholder="Technology" />
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <Label>Company Size</Label>
          <Input value={companyData.size} onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })} placeholder="50-200" className="max-w-xs" />
        </div>
        <div className="pt-4">
          <button className="px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ background: ACCENT }}>Save Changes</button>
        </div>
      </Panel>

      {/* Subscription */}
      <Panel icon={Sparkles} title="Subscription" subtitle="Your current plan and billing details"
        action={subLoading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--muted-foreground)" }} /> : (
          <div className="text-right">
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Current plan</p>
            <p className="font-semibold capitalize" style={{ fontFamily: DISPLAY, fontSize: "1.1rem" }}>{currentPlan}</p>
            {subData?.status === "cancelled" && <p className="text-[10px] mt-0.5" style={{ color: "var(--chart-4)", fontFamily: MONO }}>Cancelled · until {subData.currentPeriodEnd ? fmtDate(subData.currentPeriodEnd) : "—"}</p>}
            {subData?.status === "past_due" && <p className="text-[10px] mt-0.5 flex items-center gap-1 justify-end" style={{ color: "var(--grade-b)", fontFamily: MONO }}><AlertCircle size={11} /> Past due</p>}
          </div>
        )}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PLANS.map((p) => {
            const isCurrent = p.key === currentPlan;
            const isUpgrade = PLAN_RANK[p.key] > PLAN_RANK[currentPlan];
            const isDowngrade = p.key !== "free" && PLAN_RANK[p.key] < PLAN_RANK[currentPlan];
            return (
              <div key={p.key} className="relative border p-4 space-y-3" style={{ borderColor: isCurrent ? ACCENT : "var(--border)", background: isCurrent ? `color-mix(in srgb, ${ACCENT} 5%, var(--card))` : "var(--card)" }}>
                {isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold text-white tracking-wider uppercase" style={{ background: ACCENT, fontFamily: MONO }}><Check size={10} /> Current</span>
                  </div>
                )}
                <div className="text-center pt-2">
                  <p className="font-semibold" style={{ fontFamily: MONO, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: isCurrent ? ACCENT : "var(--foreground)" }}>{p.label}</p>
                  <p className="mt-1" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "1.8rem", lineHeight: 1 }}>
                    {p.price === 0 ? "Free" : `$${p.price}`}{p.price > 0 && <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>/mo</span>}
                  </p>
                </div>
                <ul className="space-y-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <li className="flex items-center gap-1.5"><Check size={12} className="shrink-0" style={{ color: ACCENT }} /> {p.devices}</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="shrink-0" style={{ color: ACCENT }} /> {p.users}</li>
                  <li className="flex items-center gap-1.5"><Check size={12} className="shrink-0" style={{ color: ACCENT }} /> {sellerFeeLabel(p.key, fees)} seller fee</li>
                </ul>
                {!isCurrent && p.key !== "free" && (
                  <button onClick={() => setCheckoutPlan(p.key as PaidPlan)}
                    className="w-full py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
                    style={isUpgrade ? { background: ACCENT, color: "#fff" } : { border: "1px solid var(--border)" }}>
                    {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Switch"}
                  </button>
                )}
                {isCurrent && p.key !== "free" && subData?.status === "active" && (
                  <button onClick={() => setCancelConfirm(true)} className="w-full py-1.5 text-xs transition-colors hover:bg-secondary" style={{ color: "var(--chart-4)" }}>Cancel plan</button>
                )}
              </div>
            );
          })}
        </div>
        {subData?.currentPeriodEnd && currentPlan !== "free" && subData.status === "active" && (
          <div className="flex items-center justify-between p-3 mt-4 border border-border text-sm" style={{ background: "var(--secondary)" }}>
            <span style={{ color: "var(--muted-foreground)" }}>Next billing date</span>
            <span className="font-medium" style={{ fontFamily: MONO }}>{fmtDate(subData.currentPeriodEnd)}</span>
          </div>
        )}
      </Panel>

      {/* Billing History */}
      <Panel icon={Receipt} title="Billing History" subtitle="Your last 24 subscription payments" pad={false}>
        {subLoading ? (
          <div className="flex items-center justify-center h-24"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--muted-foreground)" }} /></div>
        ) : (subData?.invoices ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12" style={{ color: "var(--muted-foreground)" }}>
            <CreditCard size={26} className="opacity-30" />
            <p className="text-sm">No billing history yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Plan", "Period", "Amount", "Status", ""].map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-[10px] tracking-wider uppercase font-normal" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{(subData?.invoices ?? []).map((inv) => <InvoiceRow key={inv.id} inv={inv} />)}</tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Notifications */}
      <Panel icon={Bell} title="Notification Preferences" subtitle="Choose what alerts you want to receive">
        <div className="space-y-3">
          {[
            { key: "syncFailures" as const, label: "MDM Sync Failures", desc: "Get notified when device synchronisation encounters errors" },
            { key: "valuationAlerts" as const, label: "Valuation Alerts", desc: "Alerts when assets approach value cliffs or market changes are detected" },
            { key: "offerActivity" as const, label: "Marketplace Offer Activity", desc: "Updates when buyers make offers on your listed assets" },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-start gap-3 p-3 border border-border cursor-pointer hover:bg-secondary transition-colors">
              <input type="checkbox" checked={notifications[key]} onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })} className="mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="pt-4">
          <button className="px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ background: ACCENT }}>Save Preferences</button>
        </div>
      </Panel>

      {/* Checkout dialog */}
      {checkoutPlan && (
        <SubscriptionCheckoutDialog open={!!checkoutPlan} onOpenChange={(open) => { if (!open) setCheckoutPlan(null); }} plan={checkoutPlan} currentPlan={currentPlan} />
      )}

      {/* Cancel confirmation */}
      <Dialog open={cancelConfirm} onOpenChange={setCancelConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><X className="w-4 h-4" style={{ color: "var(--chart-4)" }} /> Cancel subscription?</DialogTitle>
            <DialogDescription>You'll keep access until the end of your current billing period. Your plan will revert to Free after that.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelConfirm(false)} disabled={cancelSub.isPending}>Keep plan</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelSub.isPending}>
              {cancelSub.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling…</> : "Yes, cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
