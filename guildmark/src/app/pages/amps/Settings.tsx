import { useState } from "react";
import {
  Building2, CreditCard, Bell, Sparkles, Check,
  Receipt, Loader2, AlertCircle, ArrowUpRight, X,
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { useAuth } from "../../hooks/useAuth";
import {
  useSubscription,
  useCancelSubscription,
  usePlatformFees,
  type SubscriptionInvoice,
  type PlatformFees,
} from "../../lib/apiHooks";
import {
  SubscriptionCheckoutDialog,
  type PaidPlan,
} from "../../components/SubscriptionCheckoutDialog";

// ---------------------------------------------------------------------------
// Plan definitions (must match subscription_plan DB enum)
// ---------------------------------------------------------------------------

const PLANS = [
  {
    key:     "free" as const,
    label:   "Free",
    price:   0,
    devices: "Up to 10 devices",
    users:   "1 user",
    color:   "border-border",
    badge:   "",
  },
  {
    key:     "starter" as const,
    label:   "Starter",
    price:   49,
    devices: "Up to 100 devices",
    users:   "2 team members",
    color:   "border-blue-500/50",
    badge:   "text-blue-400 bg-blue-500/10",
  },
  {
    key:     "growth" as const,
    label:   "Growth",
    price:   149,
    devices: "Up to 500 devices",
    users:   "5 team members",
    color:   "border-violet-500/50",
    badge:   "text-violet-400 bg-violet-500/10",
  },
  {
    key:     "pro" as const,
    label:   "Pro",
    price:   349,
    devices: "Unlimited devices",
    users:   "Unlimited users",
    color:   "border-amber-500/50",
    badge:   "text-amber-400 bg-amber-500/10",
  },
] as const;

/** Format a decimal fee rate (0.08) as a percentage string ("8%"). */
function fmtFee(rate: number) {
  return `${parseFloat((rate * 100).toFixed(2))}%`;
}

/** Look up the seller fee for a given plan key from live API data. */
function sellerFeeLabel(key: PlanKey, fees: PlatformFees | undefined): string {
  if (!fees) return "—";
  const map: Record<PlanKey, number> = {
    free:    fees.seller_fee_free,
    starter: fees.seller_fee_starter,
    growth:  fees.seller_fee_growth,
    pro:     fees.seller_fee_pro,
  };
  return fmtFee(map[key]);
}

type PlanKey = (typeof PLANS)[number]["key"];

const PLAN_RANK: Record<PlanKey, number> = {
  free: 0, starter: 1, growth: 2, pro: 3,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function fmtAmount(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function InvoiceRow({ inv }: { inv: SubscriptionInvoice }) {
  const plan = PLANS.find((p) => p.key === inv.plan);
  return (
    <tr className="border-b border-border/50 last:border-0 hover:bg-muted/20">
      <td className="px-4 py-3 font-mono text-sm">{fmtDate(inv.created_at)}</td>
      <td className="px-4 py-3">
        {plan && plan.badge ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${plan.badge}`}>
            {plan.label}
          </span>
        ) : (
          <span className="font-mono text-sm text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-sm">
        {inv.period_start && inv.period_end
          ? `${fmtDate(inv.period_start)} – ${fmtDate(inv.period_end)}`
          : "—"}
      </td>
      <td className="px-4 py-3 font-mono text-sm font-medium">
        {fmtAmount(inv.amount_cents)}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-mono ${
          inv.status === "paid" ? "text-primary" : "text-destructive"
        }`}>
          {inv.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {inv.receipt_url ? (
          <a
            href={inv.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            Receipt <ArrowUpRight className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground font-mono">—</span>
        )}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function Settings() {
  const { user }          = useAuth();
  const { data: subData, isLoading: subLoading } = useSubscription();
  // Prefer live API plan over the JWT claim — the JWT is stale until next refresh,
  // whereas subData is invalidated and refetched immediately after checkout/cancel.
  const currentPlan = ((subData?.plan ?? user?.subscription_plan) ?? "free") as PlanKey;
  const { data: fees }    = usePlatformFees();
  const cancelSub         = useCancelSubscription();

  const [companyData, setCompanyData] = useState({
    name:     "",
    industry: "",
    size:     "",
  });
  const [notifications, setNotifications] = useState({
    syncFailures:    true,
    valuationAlerts: true,
    offerActivity:   false,
  });

  // Checkout dialog state
  const [checkoutPlan,   setCheckoutPlan]   = useState<PaidPlan | null>(null);
  const [cancelConfirm,  setCancelConfirm]  = useState(false);

  function openCheckout(plan: PlanKey) {
    if (plan === "free") return;
    setCheckoutPlan(plan as PaidPlan);
  }

  async function handleCancel() {
    await cancelSub.mutateAsync();
    setCancelConfirm(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-mono font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground font-mono text-sm">
          Manage your GuildMark account, subscription, and preferences
        </p>
      </div>

      {/* ── Company Profile ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amps-accent/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-amps-accent" />
            </div>
            <div>
              <CardTitle className="font-mono">Company Profile</CardTitle>
              <CardDescription className="font-mono">
                Your organization details and account information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-mono">Company Name</Label>
              <Input
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono">Industry</Label>
              <Input
                value={companyData.industry}
                onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                className="font-mono"
                placeholder="Technology"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-mono">Company Size</Label>
            <Input
              value={companyData.size}
              onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
              className="font-mono"
              placeholder="50-200"
            />
          </div>
          <div className="pt-2">
            <Button className="font-mono">Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Subscription ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amps-accent to-amps-highlight flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="font-mono">Subscription</CardTitle>
                <CardDescription className="font-mono">
                  Your current plan and billing details
                </CardDescription>
              </div>
            </div>

            {/* Current plan badge */}
            {subLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-mono">Current plan</p>
                <p className="font-mono font-semibold capitalize">
                  {currentPlan}
                </p>
                {subData?.status === "cancelled" && (
                  <p className="text-xs text-destructive font-mono mt-0.5">
                    Cancelled · access until {subData.currentPeriodEnd
                      ? fmtDate(subData.currentPeriodEnd) : "—"}
                  </p>
                )}
                {subData?.status === "past_due" && (
                  <p className="text-xs text-warning font-mono mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Payment past due
                  </p>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan cards */}
          <div className="grid grid-cols-4 gap-3">
            {PLANS.map((p) => {
              const isCurrent = p.key === currentPlan;
              const isUpgrade = PLAN_RANK[p.key] > PLAN_RANK[currentPlan];
              const isDowngrade = p.key !== "free" && PLAN_RANK[p.key] < PLAN_RANK[currentPlan];

              return (
                <div
                  key={p.key}
                  className={`relative rounded-xl border-2 p-4 space-y-3 transition-colors ${
                    isCurrent
                      ? "border-amps-accent bg-amps-accent/5"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amps-accent to-amps-highlight text-white text-xs font-semibold font-mono">
                        <Check className="w-2.5 h-2.5" /> Current
                      </span>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <p className={`font-mono font-semibold ${p.badge ? p.badge.split(" ")[0] : ""}`}>
                      {p.label}
                    </p>
                    <p className="text-2xl font-mono font-bold mt-1">
                      {p.price === 0 ? "Free" : `$${p.price}`}
                      {p.price > 0 && (
                        <span className="text-xs text-muted-foreground font-normal">/mo</span>
                      )}
                    </p>
                  </div>

                  <ul className="space-y-1 text-xs font-mono text-muted-foreground">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      {p.devices}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      {p.users}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      {sellerFeeLabel(p.key, fees)} seller fee
                    </li>
                  </ul>

                  {!isCurrent && p.key !== "free" && (
                    <Button
                      size="sm"
                      variant={isUpgrade ? "default" : "outline"}
                      className={`w-full font-mono text-xs ${
                        isUpgrade
                          ? "bg-amps-accent hover:bg-amps-accent/90 text-white"
                          : ""
                      }`}
                      onClick={() => openCheckout(p.key)}
                    >
                      {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Switch"}
                    </Button>
                  )}

                  {isCurrent && p.key !== "free" && subData?.status === "active" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full font-mono text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setCancelConfirm(true)}
                    >
                      Cancel plan
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next billing date */}
          {subData?.currentPeriodEnd && currentPlan !== "free" && subData.status === "active" && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border text-sm font-mono">
              <span className="text-muted-foreground">Next billing date</span>
              <span className="font-medium">{fmtDate(subData.currentPeriodEnd)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Billing History ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amps-accent/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-amps-accent" />
            </div>
            <div>
              <CardTitle className="font-mono">Billing History</CardTitle>
              <CardDescription className="font-mono">
                Your last 24 subscription payments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {subLoading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (subData?.invoices ?? []).length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <CreditCard className="w-7 h-7 opacity-30" />
              <p className="text-sm font-mono">No billing history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-xs text-muted-foreground font-mono uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Plan</th>
                    <th className="text-left px-4 py-3">Period</th>
                    <th className="text-left px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(subData?.invoices ?? []).map((inv) => (
                    <InvoiceRow key={inv.id} inv={inv} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Notification Preferences ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amps-accent/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-amps-accent" />
            </div>
            <div>
              <CardTitle className="font-mono">Notification Preferences</CardTitle>
              <CardDescription className="font-mono">
                Choose what alerts you want to receive
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key:   "syncFailures" as const,
              label: "MDM Sync Failures",
              desc:  "Get notified when device synchronisation encounters errors",
            },
            {
              key:   "valuationAlerts" as const,
              label: "Valuation Alerts",
              desc:  "Alerts when assets approach value cliffs or market changes are detected",
            },
            {
              key:   "offerActivity" as const,
              label: "Marketplace Offer Activity",
              desc:  "Updates when buyers make offers on your listed assets",
            },
          ].map(({ key, label, desc }) => (
            <label
              key={key}
              className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
            >
              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={(e) =>
                  setNotifications({ ...notifications, [key]: e.target.checked })
                }
                className="mt-0.5 rounded border-border"
              />
              <div>
                <p className="font-mono font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground font-mono">{desc}</p>
              </div>
            </label>
          ))}
          <div className="pt-2">
            <Button className="font-mono">Save Preferences</Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Checkout dialog ───────────────────────────────────────────────── */}
      {checkoutPlan && (
        <SubscriptionCheckoutDialog
          open={!!checkoutPlan}
          onOpenChange={(open) => { if (!open) setCheckoutPlan(null); }}
          plan={checkoutPlan}
          currentPlan={currentPlan}
        />
      )}

      {/* ── Cancel confirmation dialog ───────────────────────────────────── */}
      <Dialog open={cancelConfirm} onOpenChange={setCancelConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono flex items-center gap-2">
              <X className="w-4 h-4 text-destructive" />
              Cancel subscription?
            </DialogTitle>
            <DialogDescription className="font-mono">
              You'll keep access until the end of your current billing period.
              Your plan will revert to Free after that.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="font-mono"
              onClick={() => setCancelConfirm(false)}
              disabled={cancelSub.isPending}
            >
              Keep plan
            </Button>
            <Button
              variant="destructive"
              className="font-mono"
              onClick={handleCancel}
              disabled={cancelSub.isPending}
            >
              {cancelSub.isPending
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling…</>
                : "Yes, cancel"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
