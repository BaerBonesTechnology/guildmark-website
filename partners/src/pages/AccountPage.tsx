import { useState } from "react";
import {
  Wallet,
  Star,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowDownToLine,
} from "lucide-react";
import { useAccount, useWithdraw, type Payout } from "../lib/apiHooks";
import type { PartnerUser } from "../hooks/useAuth";
import {
  PageHeader,
  Card,
  StatusBadge,
  Button,
  EmptyState,
  formatCents,
  relativeDate,
} from "../components/ui";

export function AccountPage() {
  const { data, isLoading, error } = useAccount();

  if (isLoading) return <LoadingSkeleton />;
  if (error)     return <ErrorBanner message={error.message} />;
  if (!data)     return null;

  const partner = data.partner as PartnerUser & {
    service_radius_miles: number;
    created_at: string;
  };
  const payouts = data.payouts as Payout[];

  return (
    <div>
      <PageHeader title="Account & Payouts" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — profile + balance */}
        <div className="lg:col-span-1 space-y-4">
          <ProfileCard partner={partner} />
          <BalanceCard partner={partner} />
        </div>

        {/* Right column — payout history */}
        <div className="lg:col-span-2">
          <PayoutHistory payouts={payouts} />
        </div>
      </div>
    </div>
  );
}

function ProfileCard({
  partner,
}: {
  partner: PartnerUser & { service_radius_miles: number; created_at: string };
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
          style={{ background: "var(--prt-accent)" }}
        >
          {partner.company_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--prt-text)" }}>
            {partner.company_name}
          </p>
          <p className="text-xs" style={{ color: "var(--prt-muted)" }}>
            {partner.email}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <InfoRow label="Partner code"   value={partner.partner_code} mono />
        <InfoRow
          label="Status"
          value={<StatusBadge status={partner.status} />}
        />
        <InfoRow
          label="Rating"
          value={
            <span className="flex items-center gap-1 text-sm" style={{ color: "var(--prt-text)" }}>
              <Star className="h-3.5 w-3.5" style={{ color: "var(--prt-warning)" }} />
              {partner.rating.toFixed(1)}
            </span>
          }
        />
        <InfoRow
          label="Jobs completed"
          value={partner.total_jobs_completed.toString()}
        />
        {(partner.city || partner.state) && (
          <InfoRow
            label="Location"
            value={[partner.city, partner.state].filter(Boolean).join(", ")}
          />
        )}
        <InfoRow
          label="Service radius"
          value={`${partner.service_radius_miles} mi`}
        />
        <InfoRow
          label="Member since"
          value={new Date(partner.created_at).toLocaleDateString("en-US", {
            month: "long",
            year:  "numeric",
          })}
        />
      </div>
    </Card>
  );
}

function BalanceCard({
  partner,
}: {
  partner: PartnerUser;
}) {
  const withdraw = useWithdraw();
  const [success, setSuccess] = useState(false);

  const balanceCents = Math.round(partner.available_balance * 100);

  async function handleWithdraw() {
    setSuccess(false);
    try {
      await withdraw.mutateAsync();
      setSuccess(true);
    } catch {
      /* error shown below */
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-4 w-4" style={{ color: "var(--prt-accent-light)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--prt-text)" }}>
          Available Balance
        </p>
      </div>

      <p
        className="text-3xl font-semibold font-mono mb-1"
        style={{ color: "var(--prt-success)" }}
      >
        {formatCents(balanceCents)}
      </p>
      <p className="text-xs mb-5" style={{ color: "var(--prt-muted)" }}>
        Accrued from completed orders
      </p>

      {success ? (
        <div
          className="flex items-center gap-2 rounded-lg p-3 text-sm"
          style={{
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
            color: "var(--prt-success)",
          }}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Withdrawal request submitted. GuildMark will process it within 3 business days.
        </div>
      ) : (
        <>
          {withdraw.isError && (
            <div
              className="mb-3 flex items-center gap-2 rounded-lg p-3 text-xs"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "var(--prt-danger)",
              }}
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {withdraw.error?.message ?? "Withdrawal failed"}
            </div>
          )}
          <Button
            onClick={handleWithdraw}
            disabled={withdraw.isPending || balanceCents <= 0 || partner.status !== "active"}
            className="w-full"
          >
            {withdraw.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Requesting…
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-3.5 w-3.5" />
                Request Payout
              </>
            )}
          </Button>
          {partner.status !== "active" && (
            <p className="mt-2 text-xs text-center" style={{ color: "var(--prt-muted)" }}>
              Account must be approved to withdraw
            </p>
          )}
        </>
      )}
    </Card>
  );
}

function PayoutHistory({ payouts }: { payouts: Payout[] }) {
  return (
    <Card>
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--prt-border)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--prt-text)" }}>
          Payout History
        </p>
        <p className="text-xs" style={{ color: "var(--prt-muted)" }}>
          Last 20 payouts
        </p>
      </div>

      {payouts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payouts yet"
          body="Completed jobs accrue balance above. Request a payout when you're ready."
        />
      ) : (
        <div className="divide-y" style={{ borderColor: "var(--prt-border)" }}>
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-medium" style={{ color: "var(--prt-text)" }}>
                  {p.payout_ref}
                </p>
                <p className="text-xs" style={{ color: "var(--prt-muted)" }}>
                  {relativeDate(p.created_at)} · {p.method.replace(/_/g, " ")}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--prt-success)" }}
                >
                  {formatCents(p.amount_cents)}
                </p>
                <StatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs" style={{ color: "var(--prt-muted)" }}>
        {label}
      </span>
      {typeof value === "string" ? (
        <span
          className={`text-xs font-medium ${mono ? "font-mono" : ""}`}
          style={{ color: "var(--prt-text)" }}
        >
          {value}
        </span>
      ) : (
        value
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <div
        className="mb-8 h-8 w-48 rounded-lg animate-pulse"
        style={{ background: "var(--prt-surface)" }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="h-64 rounded-xl animate-pulse" style={{ background: "var(--prt-surface)" }} />
          <div className="h-40 rounded-xl animate-pulse" style={{ background: "var(--prt-surface)" }} />
        </div>
        <div className="lg:col-span-2">
          <div className="h-80 rounded-xl animate-pulse" style={{ background: "var(--prt-surface)" }} />
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl p-4 text-sm"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.3)",
        color: "var(--prt-danger)",
      }}
    >
      Failed to load account: {message}
    </div>
  );
}
