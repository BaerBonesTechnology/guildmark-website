import { useState } from "react";
import { Download, Plus, RefreshCw, Upload } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { InventoryEditor, InventoryImport } from "../../components/amps/InventoryEditor";
import { PlanUsage } from "../../components/amps/PlanUsage";
import { AssetHistoryDialog } from "../../components/amps/AssetHistoryDialog";
import { useAuth } from "../../hooks/useAuth";
import { useSubscription } from "../../lib/apiHooks";
import { downloadInventoryCSV, inventoryCSV, inventoryError, type InventoryAsset } from "../../services/persistentInventory.service";
import { usePersistentInventory } from "../../viewmodels/usePersistentInventory";

const action = "inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
export function AssetInventory() {
  const { user } = useAuth();
  return <InventoryWorkspace key={user?.company_id ?? "signed-out"} />;
}
function InventoryWorkspace() {
  const { query, save, archive, importRecords, includeArchived, setIncludeArchived } = usePersistentInventory();
  const { data: subscription } = useSubscription();
  const location = useLocation();
  const prefix = location.pathname.startsWith("/pre/") ? "/pre" : "";
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [editor, setEditor] = useState<InventoryAsset | "new" | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<InventoryAsset | null>(null);
  const [historyTarget, setHistoryTarget] = useState<InventoryAsset | null>(null);
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const records = query.data ?? [];
  const filtered = records.filter(a => (type === "all" || a.asset_type === type) && `${a.model_name} ${a.serial_number ?? ""} ${a.department ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const busy = save.isPending || archive.isPending || importRecords.isPending;
  // Capacity does not gate access to the form: software/license records consume no physical units.
  const canAdd = subscription?.eligibility?.paid === true;
  const capacity = subscription?.limits && subscription.usage ? {used: subscription.usage.asset_units, limit: subscription.limits.asset_limit} : undefined;
  const activePhysical = records.filter(a => !a.archived && !a.archived_at && a.asset_type !== "software" && a.asset_type !== "license").reduce((sum, a) => sum + a.quantity, 0);
  const allSelected = filtered.length > 0 && filtered.every(a => selected.includes(a.id));
  return <div className="mx-auto max-w-[1600px] space-y-5 pb-16">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-3xl font-semibold tracking-tight">Asset inventory</h1><p className="mt-2 text-sm text-muted-foreground">Saved company records · {records.length} records · {activePhysical.toLocaleString()} active physical devices</p></div>
      <div className="flex flex-wrap gap-2">
        <button className={action} disabled={query.isFetching || busy} onClick={() => query.refetch()}><RefreshCw size={15} />Refresh</button>
        <button className={action} disabled={!query.data || query.isError || query.isFetching} onClick={() => downloadInventoryCSV(inventoryCSV(filtered))}><Download size={15} />Export CSV</button>
        <button className={action} disabled={!canAdd || busy} onClick={() => {setNotice("");setImportOpen(true);}}><Upload size={15} />Import CSV</button>
        <button className={`${action} bg-amps-accent text-amps-accent-foreground`} disabled={!canAdd || busy} onClick={() => {setNotice("");setEditor("new");}}><Plus size={15} />Add asset</button>
      </div>
    </header>
    <PlanUsage />
    {canAdd && capacity && capacity.used >= capacity.limit && <p role="status" className="rounded-md border border-border p-3 text-sm">Your physical-device allowance is full. You can still add software and license records, reduce hardware quantities, or archive retired assets. Additional physical devices require capacity or a larger plan.</p>}
    {historyTarget && <AssetHistoryDialog asset={historyTarget} onClose={() => setHistoryTarget(null)} />}
    {!!notice && <p role="status" className="rounded-md border border-border bg-card p-4 text-sm">{notice}</p>}
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-4">
      <label className="min-w-48 flex-1 text-xs">Search model, serial or department<input className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <label className="text-xs">Type<select className="mt-1 block rounded-md border border-border bg-background p-2 text-sm" value={type} onChange={e => setType(e.target.value)}><option value="all">All types</option>{[...new Set(records.map(a => a.asset_type))].map(t => <option key={t} value={t}>{t}</option>)}</select></label>
      <label className="flex items-center gap-2 py-2 text-sm"><input type="checkbox" checked={includeArchived} disabled={busy} onChange={e => {setSelected([]);setIncludeArchived(e.target.checked);}} />Include archived records</label>
    </div>
    <p className="text-xs text-muted-foreground">CSV exports include quantities and saved metadata for the complete loaded selection, without using valuation credits. Archived records are retained. Request valuations separately through the <Link className="underline" to={`${prefix}/amps/assistant`}>guided assistant</Link>; up to 5 records per request.</p>
    {selected.length > 0 && <button className={action} disabled={query.isFetching || query.isError} onClick={() => downloadInventoryCSV(inventoryCSV(records.filter(a => selected.includes(a.id))))}>Export {records.filter(a => selected.includes(a.id)).length} selected records</button>}
    {query.isPending ? <p role="status" className="py-12 text-center">Loading all inventory pages…</p> : query.isError ? <div role="alert" className="rounded-md border border-border p-6"><p>{inventoryError(query.error)}</p><button className={`${action} mt-3`} onClick={() => query.refetch()}>Retry loading inventory</button></div> : <div className="relative overflow-x-auto rounded-md border border-border bg-card">
      <table className="w-full min-w-[850px] text-left text-sm"><caption className="sr-only">Saved company inventory. Quantities represent devices, not row counts.</caption><thead className="border-b border-border text-xs text-muted-foreground"><tr>
        <th className="p-3"><input aria-label="Select all displayed records" type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : filtered.map(a => a.id))} /></th>{["Model / serial", "Type", "Grade", "Quantity", "Recorded specifications", "Purchase date", "Status", "Actions"].map(h => <th className="p-3" key={h} scope="col">{h}</th>)}
      </tr></thead><tbody>
        {!filtered.length ? <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">{records.length ? "No records match these filters." : "No saved assets yet. Add an asset or import a CSV to get started."}</td></tr> : filtered.map(asset => <tr key={asset.id} className="border-b border-border last:border-0">
          <td className="p-3"><input aria-label={`Select ${asset.model_name}, record ${asset.id}`} type="checkbox" checked={selected.includes(asset.id)} onChange={() => setSelected(s => s.includes(asset.id) ? s.filter(id => id !== asset.id) : [...s, asset.id])} /></td>
          <th scope="row" className="max-w-64 break-words p-3 font-medium">{asset.model_name}<span className="mt-1 block text-xs font-normal text-muted-foreground">{asset.serial_number || "No serial recorded"}</span></th>
          <td className="p-3 capitalize">{asset.asset_type}</td><td className="p-3">{asset.condition_grade}</td><td className="p-3 font-mono">{asset.quantity.toLocaleString()}</td>
          <td className="p-3 text-xs">CPU score: {asset.cpu_score ?? "—"}<br />RAM: {asset.ram_gb ?? "—"} GB · Storage: {asset.storage_gb ?? "—"} GB</td><td className="p-3">{asset.purchase_date?.slice(0, 10) || "Not recorded"}</td><td className="p-3">{asset.archived || asset.archived_at ? "Archived" : "Active"}</td>
          <td className="p-3"><div className="flex gap-2"><button className={action} onClick={() => setHistoryTarget(asset)}>History<span className="sr-only"> {asset.model_name}</span></button><button className={action} disabled={busy || !!asset.archived || !!asset.archived_at} onClick={() => setEditor(asset)}>Edit<span className="sr-only"> {asset.model_name}</span></button><button className={action} disabled={busy || !!asset.archived || !!asset.archived_at} onClick={() => {archive.reset();setArchiveTarget(asset);}}>Archive<span className="sr-only"> {asset.model_name}</span></button></div></td>
        </tr>)}
      </tbody></table>
    </div>}
    <p className="text-xs text-muted-foreground">{filtered.length} displayed of {records.length} saved records. Software and licenses do not count toward the active physical-device limit.</p>
    {editor && <InventoryEditor asset={editor === "new" ? undefined : editor} capacity={capacity} onClose={() => setEditor(null)} onSave={async (data, key) => {await save.mutateAsync({ id: editor === "new" ? undefined : editor.id, data, key });setEditor(null);setNotice("Asset saved to your company inventory.");}} />}
    {importOpen && <InventoryImport capacity={capacity} onClose={() => setImportOpen(false)} onImport={async (assets, key) => {const result = await importRecords.mutateAsync({assets, key});setImportOpen(false);setNotice(`Saved ${result.imported_records} records (${result.imported_units} units) to your company inventory.`);}} />}
    <Dialog open={!!archiveTarget} onOpenChange={open => {if (!open && !archive.isPending) setArchiveTarget(null);}}><DialogContent><DialogHeader><DialogTitle>Archive this asset record?</DialogTitle><DialogDescription>{archiveTarget?.model_name} · {archiveTarget?.quantity} units. This removes the record from active inventory and retains its history. Reserved or listed assets may need their listing resolved first.</DialogDescription></DialogHeader>{archive.isError && <p role="alert" className="text-sm">{inventoryError(archive.error)}</p>}<div className="flex justify-end gap-2"><button className={action} disabled={archive.isPending} onClick={() => setArchiveTarget(null)}>Cancel</button><button className={action} disabled={archive.isPending} onClick={async () => {if (!archiveTarget) return;try {await archive.mutateAsync(archiveTarget.id);setArchiveTarget(null);setNotice("Asset archived. Use Include archived records to view or export it.");} catch {/* Keep review open and display the mutation error. */}}}>{archive.isPending ? "Archiving…" : "Archive record"}</button></div></DialogContent></Dialog>
  </div>;
}
