import { useState } from "react";
import {
  Wrench,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  useServices,
  useUpdateAssignment,
  type Assignment,
  type AssignmentStatus,
} from "../lib/apiHooks";
import {
  PageHeader,
  Card,
  StatusBadge,
  Button,
  EmptyState,
  formatCents,
} from "../components/ui";

// Defines what data each step needs and what it transitions to.
const STEP_CONFIG: {
  from: AssignmentStatus;
  to: AssignmentStatus;
  label: string;
  fields?: { key: string; label: string; placeholder: string }[];
}[] = [
  { from: "claimed",             to: "wipe_in_progress",    label: "Start Wipe" },
  { from: "wipe_in_progress",    to: "wipe_complete",       label: "Mark Wipe Complete",
    fields: [{ key: "wipe_method", label: "Wipe method", placeholder: "e.g. NIST Purge, DoD 3-pass" }] },
  { from: "wipe_complete",       to: "reimage_in_progress", label: "Start Reimage" },   // wipe_and_reimage only
  { from: "wipe_complete",       to: "awaiting_cert",       label: "Upload Certificate" }, // wipe_only
  { from: "reimage_in_progress", to: "reimage_complete",    label: "Mark Reimage Complete",
    fields: [{ key: "reimage_os", label: "OS installed", placeholder: "e.g. Windows 11 22H2" }] },
  { from: "reimage_complete",    to: "awaiting_cert",       label: "Ready for Cert Upload" },
  { from: "awaiting_cert",       to: "cert_uploaded",       label: "Submit Certificate",
    fields: [{ key: "cert_url", label: "Certificate URL", placeholder: "https://…/cert.pdf" }] },
  { from: "cert_uploaded",       to: "shipped",             label: "Mark as Shipped",
    fields: [
      { key: "tracking_number", label: "Tracking number", placeholder: "e.g. 1Z…" },
      { key: "carrier",         label: "Carrier",         placeholder: "UPS / FedEx / USPS" },
    ] },
  { from: "shipped",             to: "complete",            label: "Confirm Complete" },
];

export function ServicesPage() {
  const { data: items, isLoading, error } = useServices();

  const active    = items?.filter((a) => !["complete", "cancelled"].includes(a.status)) ?? [];
  const completed = items?.filter((a) => a.status === "complete") ?? [];

  if (isLoading) return <LoadingSkeleton />;
  if (error)     return <ErrorBanner message={error.message} />;

  return (
    <div>
      <PageHeader
        title="Active Services"
        subtitle={
          active.length > 0
            ? `${active.length} order${active.length !== 1 ? "s" : ""} in progress`
            : "No active orders"
        }
      />

      {active.length === 0 && completed.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wrench}
            title="No active services"
            body="Claim orders from the Workboard to see them here."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {active.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}

          {completed.length > 0 && (
            <>
              <div className="pt-4">
                <h2
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--prt-muted)" }}
                >
                  Completed (last 30 days)
                </h2>
                {completed.map((a) => (
                  <AssignmentCard key={a.id} assignment={a} readOnly />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({
  assignment,
  readOnly = false,
}: {
  assignment: Assignment;
  readOnly?: boolean;
}) {
  const [expanded, setExpanded] = useState(!readOnly);
  const update = useUpdateAssignment();

  // Find the action the partner can take next.
  const nextStep = STEP_CONFIG.find((s) => {
    if (s.from !== assignment.status) return false;
    // For wipe_complete, show "start reimage" only for wipe_and_reimage jobs.
    if (s.to === "reimage_in_progress" && assignment.service_type === "wipe_only")
      return false;
    // For wipe_complete, show "awaiting cert" only for wipe_only jobs.
    if (s.to === "awaiting_cert" && s.from === "wipe_complete" && assignment.service_type === "wipe_and_reimage")
      return false;
    return true;
  });

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [stepError,   setStepError]   = useState<string | null>(null);

  async function handleAdvance() {
    if (!nextStep) return;
    setStepError(null);
    try {
      await update.mutateAsync({
        id:     assignment.id,
        status: nextStep.to,
        ...Object.fromEntries(
          Object.entries(fieldValues).filter(([, v]) => v.trim() !== "")
        ),
      } as Parameters<typeof update.mutateAsync>[0]);
      setFieldValues({});
    } catch (err: unknown) {
      setStepError(err instanceof Error ? err.message : "Update failed");
    }
  }

  const totalPayout = assignment.wipe_payout_cents + assignment.reimage_payout_cents;

  return (
    <Card className="overflow-hidden">
      {/* Header row */}
      <button
        className="w-full flex items-center gap-4 p-5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-mono font-semibold"
              style={{ color: "var(--prt-text)" }}
            >
              {assignment.order_ref}
            </span>
            <StatusBadge status={assignment.status} />
          </div>
          <p className="mt-0.5 text-xs" style={{ color: "var(--prt-muted)" }}>
            {assignment.buyer_name} · {assignment.buyer_city} ·{" "}
            {assignment.item_count} device
            {assignment.item_count !== 1 ? "s" : ""} ·{" "}
            <span style={{ color: "var(--prt-success)" }}>
              {formatCents(totalPayout)}
            </span>
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0" style={{ color: "var(--prt-muted)" }} />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--prt-muted)" }} />
        )}
      </button>

      {/* Expanded body */}
      {expanded && (
        <div
          className="border-t px-5 pb-5 pt-4"
          style={{ borderColor: "var(--prt-border)" }}
        >
          {/* Workflow progress stepper */}
          <WorkflowStepper assignment={assignment} />

          {/* Action panel */}
          {!readOnly && nextStep && assignment.status !== "complete" && (
            <div
              className="mt-5 rounded-xl p-4"
              style={{
                background: "var(--prt-card)",
                border: "1px solid var(--prt-border)",
              }}
            >
              <p
                className="text-sm font-medium mb-3"
                style={{ color: "var(--prt-text)" }}
              >
                Next step: {nextStep.label}
              </p>

              {nextStep.fields && nextStep.fields.length > 0 && (
                <div className="space-y-3 mb-4">
                  {nextStep.fields.map((f) => (
                    <div key={f.key}>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: "var(--prt-muted)" }}
                      >
                        {f.label}
                      </label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={fieldValues[f.key] ?? ""}
                        onChange={(e) =>
                          setFieldValues((prev) => ({
                            ...prev,
                            [f.key]: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                          background: "var(--prt-surface)",
                          border: "1px solid var(--prt-border)",
                          color: "var(--prt-text)",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {stepError && (
                <p
                  className="mb-3 text-xs"
                  style={{ color: "var(--prt-danger)" }}
                >
                  {stepError}
                </p>
              )}

              <Button
                onClick={handleAdvance}
                disabled={update.isPending}
              >
                {update.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  nextStep.label
                )}
              </Button>
            </div>
          )}

          {assignment.status === "complete" && (
            <div
              className="mt-4 flex items-center gap-2 text-sm"
              style={{ color: "var(--prt-success)" }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Completed — payout has been queued.
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

const WORKFLOW_STEPS: AssignmentStatus[] = [
  "claimed",
  "wipe_in_progress",
  "wipe_complete",
  "reimage_in_progress",
  "reimage_complete",
  "awaiting_cert",
  "cert_uploaded",
  "shipped",
  "complete",
];

const STEP_LABELS: Partial<Record<AssignmentStatus, string>> = {
  claimed:             "Claimed",
  wipe_in_progress:    "Wiping",
  wipe_complete:       "Wipe Done",
  reimage_in_progress: "Reimaging",
  reimage_complete:    "Reimage Done",
  awaiting_cert:       "Awaiting Cert",
  cert_uploaded:       "Cert Uploaded",
  shipped:             "Shipped",
  complete:            "Complete",
};

function WorkflowStepper({ assignment }: { assignment: Assignment }) {
  // For wipe_only, skip the reimage steps.
  const steps = WORKFLOW_STEPS.filter((s) => {
    if (assignment.service_type === "wipe_only") {
      return !["reimage_in_progress", "reimage_complete"].includes(s);
    }
    return true;
  });

  const currentIdx = steps.indexOf(assignment.status);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const done    = i < currentIdx;
        const current = i === currentIdx;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{
                  background: done
                    ? "var(--prt-success)"
                    : current
                    ? "var(--prt-accent-light)"
                    : "var(--prt-border)",
                }}
              />
              <span
                className="mt-1 text-[10px] whitespace-nowrap"
                style={{
                  color: current
                    ? "var(--prt-text)"
                    : done
                    ? "var(--prt-success)"
                    : "var(--prt-muted)",
                  fontWeight: current ? 600 : 400,
                }}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="h-px w-6 shrink-0 mb-3"
                style={{
                  background: done ? "var(--prt-success)" : "var(--prt-border)",
                }}
              />
            )}
          </div>
        );
      })}
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
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl animate-pulse"
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
      Failed to load services: {message}
    </div>
  );
}
