import { useState } from "react";
import { ClipboardList, MapPin, Package, CheckCircle, Loader2 } from "lucide-react";
import { useWorkboard, useClaimOrder, type WorkboardItem } from "../lib/apiHooks";
import {
  PageHeader,
  Card,
  StatusBadge,
  Button,
  EmptyState,
  formatCents,
  relativeDate,
} from "../components/ui";

export function WorkboardPage() {
  const { data: items, isLoading, error } = useWorkboard();

  if (isLoading) return <LoadingSkeleton />;
  if (error)    return <ErrorBanner message={error.message} />;

  return (
    <div>
      <PageHeader
        title="Workboard"
        subtitle={
          items && items.length > 0
            ? `${items.length} order${items.length !== 1 ? "s" : ""} available to claim`
            : "No orders available right now"
        }
      />

      {!items || items.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No orders available"
            body="New service requests will appear here when GuildMark publishes them. Check back soon."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <WorkboardCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkboardCard({ item }: { item: WorkboardItem }) {
  const claimMutation = useClaimOrder();
  const [claimed,     setClaimed] = useState(false);

  async function handleClaim() {
    try {
      await claimMutation.mutateAsync(item.id);
      setClaimed(true);
    } catch {
      // error shown inline
    }
  }

  const totalPayout = item.wipe_payout_cents + item.reimage_payout_cents;

  if (claimed) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3" style={{ color: "var(--prt-success)" }}>
          <CheckCircle className="h-5 w-5" />
          <p className="text-sm font-medium">
            {item.order_ref} claimed — head to Active Services to begin work.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--prt-card)" }}
        >
          <Package className="h-5 w-5" style={{ color: "var(--prt-accent-light)" }} />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-mono font-semibold"
              style={{ color: "var(--prt-text)" }}
            >
              {item.order_ref}
            </span>
            <StatusBadge status="available" />
            <StatusBadge
              status={
                item.service_type === "wipe_only" ? "wipe only" : "wipe + reimage"
              }
            />
          </div>

          <p className="mt-1 text-sm font-medium" style={{ color: "var(--prt-text)" }}>
            {item.buyer_name}
          </p>

          <div
            className="mt-1 flex items-center gap-1 text-xs"
            style={{ color: "var(--prt-muted)" }}
          >
            <MapPin className="h-3.5 w-3.5" />
            {item.buyer_city}
          </div>

          <div className="mt-3 flex flex-wrap gap-4">
            <StatItem label="Devices" value={item.item_count.toString()} />
            <StatItem label="Wipe payout"   value={formatCents(item.wipe_payout_cents)} />
            {item.reimage_payout_cents > 0 && (
              <StatItem label="Reimage payout" value={formatCents(item.reimage_payout_cents)} />
            )}
            <StatItem
              label="Total"
              value={formatCents(totalPayout)}
              highlight
            />
            <StatItem label="Posted" value={relativeDate(item.created_at)} />
          </div>
        </div>

        {/* Claim button */}
        <div className="shrink-0 pt-0.5">
          <Button
            onClick={handleClaim}
            disabled={claimMutation.isPending}
          >
            {claimMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Claiming…
              </>
            ) : (
              "Claim Order"
            )}
          </Button>
          {claimMutation.isError && (
            <p className="mt-1 text-xs text-right" style={{ color: "var(--prt-danger)" }}>
              {claimMutation.error?.message ?? "Failed to claim"}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function StatItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs" style={{ color: "var(--prt-muted)" }}>
        {label}
      </p>
      <p
        className="text-sm font-semibold"
        style={{ color: highlight ? "var(--prt-success)" : "var(--prt-text)" }}
      >
        {value}
      </p>
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
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl animate-pulse"
            style={{ background: "var(--prt-surface)" }}
          />
        ))}
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
      Failed to load workboard: {message}
    </div>
  );
}
