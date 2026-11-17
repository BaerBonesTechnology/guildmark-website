import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Check, FileText, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { Panel } from "../../components/amps/Panel";
import { AssistantTour } from "../../components/amps/AssistantTour";
import { PlanUsage } from "../../components/amps/PlanUsage";
import { BODY, DISPLAY, MONO } from "../../constants/typography";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import type { AssistantIntent, AssistantResponse } from "../../models/ampsAssistant";
import { ASSISTANT_SELECTION_LIMIT, assistantErrorMessage, formatAssistantMoney, toggleAssistantSelection } from "../../services/ampsAssistant.service";

const actionClass = "inline-flex items-center justify-center gap-2 border border-border px-4 py-2.5 text-sm transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";

export function Assistant() {
  const { user } = useAuth();
  // Reset selected assets and private results if the authenticated owner changes.
  return <AssistantWorkspace key={`${user?.company_id}:${user?.id}`} ownerKey={user?.company_id && user?.id ? `${user.company_id}:${user.id}` : null} />;
}

function AssistantWorkspace({ ownerKey }: { ownerKey: string | null }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState<AssistantIntent | null>(null);
  const inventory = useQuery({
    queryKey: ["amps-assistant", ownerKey],
    queryFn: ({ signal }) => api.post<AssistantResponse>("/amps/assistant", { intent: "portfolio_summary" }, { signal }),
    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const summary = inventory.data;
  const laptops = summary?.assets.filter((asset) => asset.asset_type === "laptop") ?? [];
  const selectedUnits = laptops.filter((asset) => selected.includes(asset.asset_id)).reduce((sum, asset) => sum + asset.quantity, 0);

  function toggle(id: string) {
    setSelected((current) => toggleAssistantSelection(current, id));
    setResult(null);
    setError(null);
  }

  async function request(intent: "value_assets" | "listing_previews") {
    if (!selected.length || pending) return;
    setPending(intent);
    setError(null);
    setResult(null);
    try {
      setResult(await api.post<AssistantResponse>("/amps/assistant", { intent, asset_ids: selected }));
    } catch (requestError) {
      setError(requestError);
    } finally {
      void qc.invalidateQueries({ queryKey: ["subscription"] });
      void qc.invalidateQueries({ queryKey: ["asset-valuations"] });
      setPending(null);
    }
  }

  async function refreshInventory() {
    setSelected([]);
    setResult(null);
    setError(null);
    await inventory.refetch();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12" style={{ fontFamily: BODY }}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-amps-accent" style={{ fontFamily: MONO }}><Sparkles size={14} aria-hidden="true" /> AMPS · Guided assistant</p>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: DISPLAY }}>Asset assistant</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Select laptop records to estimate their value or prepare a listing preview.</p>
        </div>
        <span className="inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-xs"><Check size={14} className="text-amps-accent" aria-hidden="true" /> Guided workspace · listings stay previews</span>
      </header>

      <PlanUsage />
      <AssistantTour ownerKey={ownerKey} />

      <Panel title="Your company inventory" subtitle="Asset records from your AMPS account" action={<button className={actionClass} onClick={refreshInventory} disabled={inventory.isFetching || !!pending} aria-label="Refresh company inventory"><RefreshCw size={14} aria-hidden="true" /><span className="hidden sm:inline">Refresh</span></button>}>
        {inventory.isPending ? <p role="status" className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Loading your company inventory…</p> : inventory.isError ? (
          <div role="alert" className="space-y-3"><p className="text-sm">{assistantErrorMessage(inventory.error)}</p><button className={actionClass} onClick={refreshInventory}>Try again</button></div>
        ) : summary ? (
          <div className="space-y-5">
            <p className="text-sm">{summary.message}</p>
            <dl className="grid gap-4 sm:grid-cols-3">
              <SummaryStat label="Inventory records" value={String(summary.portfolio?.asset_records ?? summary.assets.length)} />
              <SummaryStat label="Records in this view" value={String(summary.portfolio?.shown_records ?? summary.assets.length)} />
              <SummaryStat label="Units in this view" value={String(summary.portfolio?.shown_units ?? summary.assets.reduce((sum, asset) => sum + asset.quantity, 0))} />
            </dl>
            {summary.portfolio?.truncated && <p className="text-sm text-muted-foreground">This workspace shows a limited inventory sample. Counts and selection below cover the displayed records, not your entire fleet.</p>}
            {summary.warnings.length > 0 && <Warnings warnings={summary.warnings} />}
          </div>
        ) : null}
      </Panel>

      {summary && !inventory.isError && <Panel title="Choose the laptops you're considering for resale" subtitle={`Select up to ${ASSISTANT_SELECTION_LIMIT} asset records. You decide which devices are ready to retire.`}>
        {laptops.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No laptop records are available in this inventory view. Add laptops through Asset Inventory, then refresh this workspace.</p> : (
          <fieldset disabled={!!pending || inventory.isFetching} className="min-w-0">
            <legend className="sr-only">Laptop records for valuation</legend>
            <div className="space-y-2">
              {laptops.map((asset) => {
                const checked = selected.includes(asset.asset_id);
                const disabled = !checked && selected.length >= ASSISTANT_SELECTION_LIMIT;
                return <label key={asset.asset_id} className={`flex items-start gap-3 border p-4 ${checked ? 'border-amps-accent bg-secondary' : 'border-border'} ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
                  <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[var(--amps-accent)]" checked={checked} disabled={disabled} onChange={() => toggle(asset.asset_id)} aria-label={`Select ${asset.model_name}, ${asset.quantity} units, record ${asset.asset_id}`} />
                  <span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold">{asset.model_name}</span><span className="mt-1 block text-xs text-muted-foreground">{asset.quantity} unit{asset.quantity === 1 ? '' : 's'} · Grade {asset.condition_grade} · {asset.ram_gb === null ? 'RAM not recorded' : `${asset.ram_gb} GB RAM`} · {asset.storage_gb === null ? 'Storage not recorded' : `${asset.storage_gb} GB storage`}</span><span className="mt-1 block text-xs text-muted-foreground">Purchase date: {asset.purchase_date ? asset.purchase_date.slice(0, 10) : 'not recorded — needed for an estimate'}</span></span>
                  {checked && <Check size={16} className="shrink-0 text-amps-accent" aria-hidden="true" />}
                </label>;
              })}
            </div>
          </fieldset>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          <p role="status" className="text-xs text-muted-foreground">{selected.length} / {ASSISTANT_SELECTION_LIMIT} records selected · {selectedUnits} units</p>
          <div className="flex flex-wrap gap-2">
            <button className={`${actionClass} bg-amps-accent text-amps-accent-foreground hover:opacity-90`} disabled={!selected.length || !!pending || inventory.isFetching} onClick={() => request("value_assets")}>{pending === "value_assets" ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}Estimate selected assets</button>
            <button className={actionClass} disabled={!selected.length || !!pending || inventory.isFetching} onClick={() => request("listing_previews")}><FileText size={15} aria-hidden="true" />Prepare listing previews<ArrowRight size={14} aria-hidden="true" /></button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Guided actions use your asset records and the ML valuation service. This workspace does not automatically identify idle devices, publish listings, or schedule services.</p>
      </Panel>}

      {pending && <p role="status" className="flex items-center gap-2 border border-border bg-card p-5 text-sm"><LoaderCircle size={16} className="animate-spin text-amps-accent" aria-hidden="true" />{pending === "listing_previews" ? 'Preparing review-only previews…' : 'Requesting ML estimates for selected assets…'}</p>}
      {!!error && <div role="alert" className="border border-border bg-card p-5 text-sm"><AlertCircle size={16} className="mb-2" aria-hidden="true" />{assistantErrorMessage(error)} Use the action above to retry.</div>}
      {result && <section aria-label="Assistant results" aria-live="polite" className="space-y-4">
        <Panel title={result.intent === "listing_previews" ? "Listing previews" : "Valuation results"} subtitle="Estimates for the selected records only">
          <p className="text-sm">{result.message}</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3"><SummaryStat label="Estimated gross resale value" value={formatAssistantMoney(result.totals.estimated_units > 0 ? result.totals.estimated_value : null)} /><SummaryStat label="Units estimated" value={String(result.totals.estimated_units)} /><SummaryStat label="Units without an estimate" value={String(result.totals.unestimated_units)} /></dl>
          <p className="mt-4 text-xs text-muted-foreground">Gross estimates exclude platform fees, shipping, and service costs. They are not guaranteed sale prices.</p>
          <p className="mt-2 text-xs text-muted-foreground">Requested: {new Date(result.as_of).toLocaleString()}</p>
          {result.warnings.length > 0 && <div className="mt-4"><Warnings warnings={result.warnings} /></div>}
        </Panel>
        {result.results.map((item) => <Panel key={item.asset_id} title={item.model_name} subtitle={`${item.quantity} unit${item.quantity === 1 ? '' : 's'} · ${item.status === 'estimated' ? 'Estimate available' : 'Needs attention'}`}>
          {item.status !== "estimated" ? <p className="text-sm text-muted-foreground">{item.status === "missing_data" ? `An estimate needs: ${item.missing_fields.map((field) => field.replaceAll('_', ' ')).join(', ')}. Update the asset record, then refresh and try again.` : 'The valuation service could not estimate this record. Try the action again when the service is available.'}</p> : <>
            <dl className="grid gap-4 sm:grid-cols-2"><SummaryStat label="Estimated value per unit" value={formatAssistantMoney(item.fair_market_value_per_unit)} /><SummaryStat label="Estimated record total" value={formatAssistantMoney(item.total_value)} /></dl>
            <p className="mt-4 text-xs text-muted-foreground">Inputs include recorded type, condition, age, and available hardware specifications. Model: {item.model_version ?? 'not reported'}. Confidence score: {item.confidence === null ? 'not reported' : `${Math.round(item.confidence * 100)}%`} — a heuristic score, not a measured probability of accuracy.</p>
            {item.listing_preview && <div className="mt-5 space-y-3 border-t border-border pt-4"><span className="inline-block border border-border px-2 py-1 text-[10px] uppercase tracking-wider">Preview only · not saved or published</span><h3 className="text-lg font-semibold">{item.listing_preview.title}</h3><p className="whitespace-pre-wrap text-sm text-muted-foreground">{item.listing_preview.description}</p><p className="text-sm">Suggested unit price: <strong>{formatAssistantMoney(item.listing_preview.unit_price)}</strong> · Quantity: {item.listing_preview.quantity}</p></div>}
          </>}
        </Panel>)}
      </section>}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-2xl font-semibold" style={{ fontFamily: MONO }}>{value}</dd></div>;
}

function Warnings({ warnings }: { warnings: string[] }) {
  return <ul className="space-y-1 border-l-2 border-amps-accent pl-3 text-xs text-muted-foreground">{warnings.map((warning, index) => <li key={`${index}:${warning}`}>{warning}</li>)}</ul>;
}
