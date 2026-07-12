/**
 * AMPS account Settings — company/subscription/billing/notifications (View).
 * All state lives in useAmpsSettingsViewModel; each section is a SettingsPanel
 * and the plan tiles / invoice rows / dialogs are their own components.
 */
import { AlertCircle, Bell, Building2, CreditCard, Loader2, Receipt, Sparkles } from "lucide-react";
import { CancelSubscriptionDialog } from "../../components/amps/CancelSubscriptionDialog";
import { InvoiceRow } from "../../components/amps/InvoiceRow";
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

export function Settings() {
  const {
    cancelConfirm, cancelSub, checkoutPlan, companyData, currentPlan, fees, handleCancel,
    notifications, setCancelConfirm, setCheckoutPlan, setCompanyData, setNotifications,
    subData, subLoading,
  } = useAmpsSettingsViewModel();

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto pb-20 space-y-6" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div>
        <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>Settings</h1>
        <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Manage your GuildMark account, subscription, and preferences</p>
      </div>

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
          <button className="px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ background: AMPS_ACCENT }}>Save Changes</button>
        </div>
      </SettingsPanel>

      {/* Subscription */}
      <SettingsPanel icon={Sparkles} title="Subscription" subtitle="Your current plan and billing details"
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
              plan={p}
              subActive={subData?.status === "active"}
            />
          ))}
        </div>
        {subData?.currentPeriodEnd && currentPlan !== "free" && subData.status === "active" && (
          <div className="flex items-center justify-between p-3 mt-4 border border-border text-sm" style={{ background: "var(--secondary)" }}>
            <span style={{ color: "var(--muted-foreground)" }}>Next billing date</span>
            <span className="font-medium" style={{ fontFamily: MONO }}>{fmtDate(subData.currentPeriodEnd)}</span>
          </div>
        )}
      </SettingsPanel>

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
          <div className="overflow-x-auto">
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
          <button className="px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ background: AMPS_ACCENT }}>Save Preferences</button>
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
