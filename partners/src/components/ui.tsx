/**
 * Tiny shared UI primitives for the partner portal.
 */

import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Page header
// ---------------------------------------------------------------------------

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--prt-text)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: "var(--prt-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{
        background: "var(--prt-surface)",
        borderColor: "var(--prt-border)",
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  available:           { bg: "rgba(37,99,235,0.1)",   text: "#3b82f6", border: "rgba(37,99,235,0.2)" },
  claimed:             { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  wipe_in_progress:    { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  wipe_complete:       { bg: "rgba(34,197,94,0.1)",   text: "#22c55e", border: "rgba(34,197,94,0.2)" },
  reimage_in_progress: { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  reimage_complete:    { bg: "rgba(34,197,94,0.1)",   text: "#22c55e", border: "rgba(34,197,94,0.2)" },
  awaiting_cert:       { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", border: "rgba(239,68,68,0.2)" },
  cert_uploaded:       { bg: "rgba(34,197,94,0.1)",   text: "#22c55e", border: "rgba(34,197,94,0.2)" },
  shipped:             { bg: "rgba(37,99,235,0.1)",   text: "#3b82f6", border: "rgba(37,99,235,0.2)" },
  complete:            { bg: "rgba(34,197,94,0.1)",   text: "#22c55e", border: "rgba(34,197,94,0.2)" },
  cancelled:           { bg: "rgba(107,114,128,0.1)", text: "#6b7280", border: "rgba(107,114,128,0.2)" },
  pending:             { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  active:              { bg: "rgba(34,197,94,0.1)",   text: "#22c55e", border: "rgba(34,197,94,0.2)" },
  paid:                { bg: "rgba(34,197,94,0.1)",   text: "#22c55e", border: "rgba(34,197,94,0.2)" },
  failed:              { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", border: "rgba(239,68,68,0.2)" },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    bg: "rgba(107,114,128,0.1)",
    text: "#6b7280",
    border: "rgba(107,114,128,0.2)",
  };
  const label = status.replace(/_/g, " ");
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{
        background: style.bg,
        color:      style.text,
        border:     `1px solid ${style.border}`,
      }}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
}) {
  const bg: Record<string, string> = {
    primary: "var(--prt-accent)",
    ghost:   "transparent",
    danger:  "transparent",
  };
  const color: Record<string, string> = {
    primary: "white",
    ghost:   "var(--prt-muted)",
    danger:  "var(--prt-danger)",
  };
  const border: Record<string, string> = {
    primary: "transparent",
    ghost:   "var(--prt-border)",
    danger:  "rgba(239,68,68,0.3)",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-opacity ${
        size === "sm" ? "px-3 py-1.5 text-xs gap-1.5" : "px-4 py-2 text-sm gap-2"
      } ${className}`}
      style={{
        background:   disabled ? "var(--prt-border)" : bg[variant],
        color:        disabled ? "var(--prt-muted)"  : color[variant],
        border:       `1px solid ${disabled ? "transparent" : border[variant]}`,
        cursor:       disabled ? "not-allowed" : "pointer",
        opacity:      disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "var(--prt-card)" }}
      >
        <Icon className="h-7 w-7" style={{ color: "var(--prt-muted)" }} />
      </div>
      <p className="text-base font-medium" style={{ color: "var(--prt-text)" }}>
        {title}
      </p>
      <p className="mt-1 max-w-sm text-sm" style={{ color: "var(--prt-muted)" }}>
        {body}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format cents as a dollar string, e.g. 45000 → "$450.00" */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Relative date, e.g. "3 days ago" */
export function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30)  return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
