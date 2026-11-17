import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { INVENTORY_CSV_TEMPLATE, INVENTORY_TYPES, downloadInventoryCSV, fitsPhysicalCapacity, physicalInventoryUnits, inventoryError, inventoryInput, parseInventoryCSV, type InventoryAsset, type InventoryInput } from "../../services/persistentInventory.service";

const action = "rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50";
const fieldClass = "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
export function InventoryEditor({ asset, capacity, onClose, onSave }: { asset?: InventoryAsset; capacity?: {used: number; limit: number}; onClose: () => void; onSave: (data: InventoryInput, key: string) => Promise<void> }) {
  const [form, setForm] = useState<Record<string, string>>(() => Object.fromEntries(["model_name", "asset_type", "condition_grade", "quantity", "purchase_date", "original_purchase_price", "cpu_score", "ram_gb", "storage_gb", "serial_number", "department"].map(key => [key, key === "quantity" ? String(asset?.quantity ?? 1) : key === "purchase_date" ? asset?.purchase_date?.slice(0,10) ?? "" : String(asset?.[key as keyof InventoryAsset] ?? ({asset_type: "laptop",condition_grade: "B"}[key] ?? ""))])));
  const key = useRef(crypto.randomUUID());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const set = (name: string, value: string) => setForm(f => ({...f, [name]: value}));
  return <Dialog open onOpenChange={open => {if (!open && !pending) onClose();}}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto"><DialogHeader><DialogTitle>{asset ? "Edit saved asset" : "Add asset"}</DialogTitle><DialogDescription>Hardware quantities count toward physical-device capacity. Software and licenses do not. Purchase date and specifications are needed for laptop estimates; this form does not generate a valuation.</DialogDescription></DialogHeader>
    <form className="space-y-4" onSubmit={async e => {e.preventDefault();setError("");let data: InventoryInput;try {data = inventoryInput(form);if (capacity && !fitsPhysicalCapacity([data],capacity.used,capacity.limit,asset)) throw new Error("This change exceeds your remaining physical-device capacity. Reduce hardware quantities, archive retired devices, or choose a larger plan. Software and licenses do not use physical capacity.");} catch (err) {setError((err as Error).message);return;}setPending(true);try {await onSave(data, key.current);} catch (err) {setError(inventoryError(err));} finally {setPending(false);}}}>
      <fieldset disabled={pending} className="grid grid-cols-1 gap-4 sm:grid-cols-2"><legend className="sr-only">Asset details</legend>
        <label className="text-xs sm:col-span-2">Model name *<input className={fieldClass} required maxLength={200} value={form.model_name} onChange={e => set("model_name", e.target.value)} /></label>
        <label className="text-xs">Asset type *<select className={fieldClass} value={form.asset_type} onChange={e => set("asset_type", e.target.value)}>{INVENTORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></label>
        <label className="text-xs">Condition grade *<select className={fieldClass} value={form.condition_grade} onChange={e => set("condition_grade", e.target.value)}>{["A", "B", "C"].map(g => <option key={g}>{g}</option>)}</select></label>
        <label className="text-xs">Quantity *<input className={fieldClass} type="number" required min={1} max={100000} step={1} value={form.quantity} onChange={e => set("quantity", e.target.value)} /></label>
        <label className="text-xs">Purchase date<input className={fieldClass} type="date" max={new Date().toISOString().slice(0,10)} value={form.purchase_date} onChange={e => set("purchase_date", e.target.value)} /></label>
        {[["cpu_score", "CPU score"], ["ram_gb", "RAM (GB)"], ["storage_gb", "Storage (GB)"], ["original_purchase_price", "Original purchase price / unit (USD)"]].map(([name,label]) => <label key={name} className="text-xs">{label}<input className={fieldClass} type="number" min={0} step="any" value={form[name]} onChange={e => set(name, e.target.value)} /></label>)}
        {[["serial_number", "Serial number"], ["department", "Department"]].map(([name,label]) => <label key={name} className="text-xs">{label}<input className={fieldClass} value={form[name]} onChange={e => set(name, e.target.value)} /></label>)}
      </fieldset>
      {!!error && <p role="alert" className="rounded-md border border-destructive p-3 text-sm">{error}</p>}
      <div className="flex justify-end gap-2"><button type="button" className={action} disabled={pending} onClick={onClose}>Cancel</button><button type="submit" className={`${action} bg-amps-accent text-amps-accent-foreground`} disabled={pending}>{pending ? "Saving…" : "Save asset"}</button></div>
    </form>
  </DialogContent></Dialog>;
}

export function InventoryImport({capacity, onClose, onImport}: {capacity?: {used: number; limit: number}; onClose: () => void; onImport: (assets: InventoryInput[], key: string) => Promise<void>}) {
  const [rows, setRows] = useState<InventoryInput[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [reading, setReading] = useState(false);
  const key = useRef(crypto.randomUUID());
  const readVersion = useRef(0);
  const overCapacity = !!capacity && !fitsPhysicalCapacity(rows,capacity.used,capacity.limit);
  return <Dialog open onOpenChange={open => {if (!open && !pending) onClose();}}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Import saved inventory</DialogTitle><DialogDescription>Import 1–50 new records per CSV. Required columns: model_name, asset_type, condition_grade, quantity. Imports are atomic: a rejected batch saves no rows. Existing IDs are ignored; this creates new records, not updates.</DialogDescription></DialogHeader>
    <button type="button" className={action} onClick={() => downloadInventoryCSV(INVENTORY_CSV_TEMPLATE, "guildmark-inventory-template.csv")}>Download CSV template</button>
    <label className="text-sm">CSV file (1 MB maximum)<input className={fieldClass} type="file" accept=".csv,text/csv" disabled={pending || reading} onChange={async e => {const file = e.target.files?.[0];if (!file) return;const version = ++readVersion.current;setError("");setRows([]);setReading(true);try {if (file.size > 1000000) throw new Error("Choose a CSV no larger than 1 MB.");const parsed = parseInventoryCSV(await file.text());if (version === readVersion.current) {setRows(parsed);key.current = crypto.randomUUID();}} catch (err) {setError((err as Error).message);} finally {if (version === readVersion.current) setReading(false);}}} /></label>
    {reading && <p role="status">Reading CSV…</p>}
    {!!rows.length && <><p role="status" className="text-sm">{rows.length} records · {physicalInventoryUnits(rows)} physical devices · {rows.reduce((sum,a) => sum+a.quantity,0)} total quantity. Review quantities before saving.</p><div className="max-h-56 overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th scope="col">Model</th><th scope="col">Type</th><th scope="col">Grade</th><th scope="col">Quantity</th></tr></thead><tbody>{rows.map((r,i) => <tr key={i}><td className="break-words py-2">{r.model_name}</td><td>{r.asset_type}</td><td>{r.condition_grade}</td><td>{r.quantity}</td></tr>)}</tbody></table></div></>}
    {overCapacity && <p role="alert" className="text-sm">This batch exceeds available physical-device capacity. Reduce hardware quantities in the CSV or choose a larger plan. Software and license quantities do not use physical capacity. No records have been saved.</p>}
    {!!error && <p role="alert" className="rounded-md border border-destructive p-3 text-sm">{error}</p>}
    <div className="flex justify-end gap-2"><button type="button" className={action} disabled={pending} onClick={onClose}>Cancel</button><button type="button" className={`${action} bg-amps-accent text-amps-accent-foreground`} disabled={!rows.length || pending || reading || overCapacity} onClick={async () => {setError("");setPending(true);try {await onImport(rows, key.current);} catch (err) {setError(inventoryError(err));} finally {setPending(false);}}}>{pending ? "Saving batch…" : `Save ${rows.length} records`}</button></div>
  </DialogContent></Dialog>;
}
