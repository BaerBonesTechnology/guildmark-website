/**
 * AMPS account Settings — company/subscription/billing/notifications (View).
 * All state lives in useAmpsSettingsViewModel; each section is a SettingsPanel
 * and the plan tiles / invoice rows / dialogs are their own components.
 */
import { useState } from "react";
import { AlertCircle, Bell, Building2, CreditCard, Loader2, Receipt } from "lucide-react";
import { SeatPricingDialog } from "../../components/amps/SeatPricingDialog";
import { CancelSubscriptionDialog } from "../../components/amps/CancelSubscriptionDialog";
import { InvoiceRow, InvoiceCard } from "../../components/amps/InvoiceRow";
import { PlanTierCard } from "../../components/amps/PlanTierCard";
import { SettingsPanel } from "../../components/amps/SettingsPanel";
import { SubscriptionCheckoutDialog } from "../../components/SubscriptionCheckoutDialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { BILLING_HEADERS, PLANS, SETTINGS_NOTIFICATION_ROWS } from "../../constants/ampsSettings.constants";
import { BODY, DISPLAY, MONO } from "../../constants/typography";
import { fmtDate } from "../../services/ampsSettings.service";
import { useAmpsSettingsViewModel } from "../../viewmodels/useAmpsSettingsViewModel";
import { BillingRecovery } from "../../components/amps/BillingRecovery";
import { PlanUsage } from "../../components/amps/PlanUsage";

export function Settings() {
  const [seatPricingOpen, setSeatPricingOpen] = useState(false);
  const {
    cancelConfirm, cancelSub, checkoutPlan, companyData, currentPlan, fees, handleCancel,
    notifications, setCancelConfirm, setCheckoutPlan, setCompanyData, setNotifications,
    subData, subLoading, reconcile,
  } = useAmpsSettingsViewModel();

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto pb-20 space-y-6" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div>
        <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>Settings</h1>
        <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Manage your GuildMark account, subscription, and preferences</p>
      </div>

      <PlanUsage />
      <div className="space-y-2"><button className="border border-border px-4 py-2 text-sm" disabled={reconcile.isPending} onClick={() => reconcile.mutate()}>{reconcile.isPending ? "Checking billing…" : "Refresh billing status"}</button>{subData?.billing?.recurring && !subData.billing.cancel_at_period_end && <button className="ml-3 border border-border px-4 py-2 text-sm" onClick={() => setCancelConfirm(true)} disabled={cancelSub.isPending}>Cancel recurring billing</button>}{reconcile.isError && <p role="alert" className="text-sm text-destructive">Billing could not be confirmed. Your existing agreement has been retained; try refreshing again.</p>}{cancelSub.isError && <p role="alert" className="text-sm text-destructive">Cancellation was not confirmed. Refresh billing status before retrying.</p>}{subData?.billing?.recurring && <p className="text-sm text-muted-foreground">{subData.billing.cancel_at_period_end ? `Renewal cancelled. Paid access ends ${subData.currentPeriodEnd ? fmtDate(subData.currentPeriodEnd) : "after the verified period"} (UTC).` : "This plan renews monthly using your saved card. Plan changes are unavailable while this recurring agreement is active."}</p>}</div>
      <p className="text-xs text-muted-foreground">Company-profile and notification editing below are local prototypes. Saving these preferences is not available yet. Subscription and billing records use your company account.</p>
      <BillingRecovery recurring={subData?.billing?.recurring === true} />
      {/* Company Profile */}
      <SettingsPanel icon={Building2} title="Company Profile" subtitle="Your organization details and account information">
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
          <button disabled className="px-4 py-2 text-sm font-medium text-amps-accent-foreground opacity-50" style={{ background: AMPS_ACCENT }}>Profile saving unavailable</button>
        </div>
      </SettingsPanel>

      {/* Subscription */}
      <SettingsPanel collapsible icon={CreditCard} title="Subscription" subtitle="Your current plan and billing details"
        action={subLoading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--muted-foreground)" }} /> : (
          <div className="text-right">
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Current plan</p>
            <p className="font-semibold capitalize" style={{ fontFamily: DISPLAY, fontSize: "1.1rem" }}>{currentPlan}</p>
            {subData?.status === "cancelled" && <p className="text-[10px] mt-0.5" style={{ color: "var(--chart-4)", fontFamily: MONO }}>Cancelled · until {subData.currentPeriodEnd ? fmtDate(subData.currentPeriodEnd) : "—"}</p>}
            {subData?.status === "past_due" && <p className="text-[10px] mt-0.5 flex items-center gap-1 justify-end" style={{ color: "var(--grade-b)", fontFamily: MONO }}><AlertCircle size={11} /> Past due</p>}
          </div>
        )}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PLANS.map((p) => (
            <PlanTierCard
              key={p.key}
              currentPlan={currentPlan}
              fees={fees}
              onCancel={() => setCancelConfirm(true)}
              onSelect={setCheckoutPlan}
              onAddSeats={() => setSeatPricingOpen(true)}
              plan={p}
              subActive={subData?.status === "active" && !subData?.billing?.recurring}
              billingLocked={subData?.billing?.recurring}
            />
          ))}
        </div>
        {subData?.currentPeriodEnd && currentPlan !== "free" && subData.status === "active" && (
          <div className="flex items-center justify-between p-3 mt-4 border border-border text-sm" style={{ background: "var(--secondary)" }}>
            <span style={{ color: "var(--muted-foreground)" }}>{subData?.billing?.cancel_at_period_end ? "Paid access ends" : subData?.billing?.recurring ? "Next billing date (UTC)" : "Paid access ends (UTC)"}</span>
            <span className="font-medium" style={{ fontFamily: MONO }}>{fmtDate(subData.currentPeriodEnd)}</span>
          </div>
        )}
      </SettingsPanel>

      {currentPlan !== "free" && <SeatPricingDialog plan={currentPlan} open={seatPricingOpen} onOpenChange={setSeatPricingOpen} />}

      {/* Billing History */}
      <SettingsPanel icon={Receipt} title="Billing History" subtitle="Your last 24 subscription payments" pad={false}>
        {subLoading ? (
          <div className="flex items-center justify-center h-24"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--muted-foreground)" }} /></div>
        ) : (subData?.invoices ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12" style={{ color: "var(--muted-foreground)" }}>
            <CreditCard size={26} className="opacity-30" />
            <p className="text-sm">No billing history yet</p>
          </div>
        ) : (
          <>
          <div className="md:hidden divide-y divide-border">{(subData?.invoices ?? []).map(inv => <InvoiceCard key={inv.id} inv={inv} />)}</div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {BILLING_HEADERS.map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-[10px] tracking-wider uppercase font-normal" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{(subData?.invoices ?? []).map((inv) => <InvoiceRow key={inv.id} inv={inv} />)}</tbody>
            </table>
          </div>
          </>
        )}
      </SettingsPanel>

      {/* Notifications */}
      <SettingsPanel icon={Bell} title="Notification Preferences" subtitle="Choose what alerts you want to receive">
        <div className="space-y-3">
          {SETTINGS_NOTIFICATION_ROWS.map(({ key, label, desc }) => (
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
          <button disabled className="px-4 py-2 text-sm font-medium text-amps-accent-foreground opacity-50" style={{ background: AMPS_ACCENT }}>Preference saving unavailable</button>
        </div>
      </SettingsPanel>

      {/* Checkout dialog */}
      {checkoutPlan && (
        <SubscriptionCheckoutDialog open={!!checkoutPlan} onOpenChange={(open) => { if (!open) setCheckoutPlan(null); }} plan={checkoutPlan} currentPlan={currentPlan} />
      )}

      {/* Cancel confirmation */}
      <CancelSubscriptionDialog
        onCancel={handleCancel}
        onOpenChange={setCancelConfirm}
        open={cancelConfirm}
        pending={cancelSub.isPending}
      />
    </div>
  );
}
