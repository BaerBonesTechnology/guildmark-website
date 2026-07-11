import { useState } from "react";
import { FileText, Download, Plus, Search, Receipt } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const ACCENT = "var(--amps-accent)";

interface Invoice {
  id: string; date: string; asset: string;
  type: "Sale" | "Disposal" | "Loss" | "Donation";
  quantity: number; writeOffAmount: number; marketValue: number;
}

const emptyForm = {
  asset: "", type: "" as Invoice["type"] | "",
  date: new Date().toISOString().split("T")[0], quantity: "", marketValue: "",
};

const TYPE_COLOR: Record<string, string> = {
  Sale: "var(--grade-a)", Disposal: "var(--grade-b)", Donation: "var(--primary)", Loss: "var(--chart-4)",
};

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5" style={{ background: "var(--card)" }}>
      <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{label}</p>
      <p className="text-3xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{value}</p>
    </div>
  );
}

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = invoices.filter((inv) =>
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || inv.asset.toLowerCase().includes(searchTerm.toLowerCase()));

  const qty = parseInt(formData.quantity || "0");
  const fmv = parseFloat(formData.marketValue || "0");
  const total = qty * fmv;

  function handleGenerate() {
    if (!formData.asset || !formData.type || !qty || !fmv) return;
    const nextNum = (invoices.length + 1).toString().padStart(4, "0");
    const year = new Date().getFullYear();
    setInvoices((prev) => [{
      id: `INV-${year}-${nextNum}`, date: formData.date,
      asset: `${formData.asset}${qty > 1 ? ` (${qty} units)` : ""}`,
      type: formData.type as Invoice["type"], quantity: qty, writeOffAmount: total, marketValue: total,
    }, ...prev]);
    setGenerateOpen(false);
    setFormData(emptyForm);
  }

  const totalWriteOffs = invoices.reduce((s, i) => s + i.writeOffAmount, 0);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const thisMonth = invoices.filter((i) => i.date >= monthStart).reduce((s, i) => s + i.writeOffAmount, 0);

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto pb-20" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>Invoices</h1>
          <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Generate and manage write-off documentation for accounting</p>
        </div>
        <button onClick={() => setGenerateOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity shrink-0" style={{ background: ACCENT, color: "#fff" }}>
          <Plus size={13} /> Generate invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-border mb-6" style={{ background: "var(--border)" }}>
        <StatCell label="Total Invoices" value={String(invoices.length)} />
        <StatCell label="Total Write-offs" value={`$${totalWriteOffs.toLocaleString()}`} />
        <StatCell label="This Month" value={`$${thisMonth.toLocaleString()}`} />
      </div>

      {/* Search */}
      <div className="border border-border p-4 mb-4" style={{ background: "var(--card)" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input placeholder="Search by invoice number or asset…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border focus:outline-none focus:border-primary" style={{ background: "var(--input-background)", fontFamily: BODY }} />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border" style={{ background: "var(--card)" }}>
        <div className="px-5 py-3.5 border-b border-border">
          <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Invoice History</span>
        </div>
        {invoices.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Receipt size={28} className="opacity-30" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No invoices yet</p>
            <button onClick={() => setGenerateOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border hover:border-foreground transition-colors">Generate your first invoice</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 720 }}>
              <thead>
                <tr className="border-b border-border">
                  {["Invoice #", "Date", "Asset", "Type", "Write-off", "Market Value", ""].map((h, i) => (
                    <th key={i} className={`py-2.5 px-4 text-[10px] tracking-wider uppercase font-normal ${["Write-off", "Market Value"].includes(h) ? "text-right" : "text-left"}`} style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <tr key={inv.id} className="border-b border-border last:border-0" style={{ background: i % 2 ? "var(--secondary)" : "transparent" }}>
                    <td className="py-2.5 px-4 font-semibold" style={{ fontFamily: MONO }}>{inv.id}</td>
                    <td className="py-2.5 px-4 text-sm" style={{ fontFamily: MONO }}>{inv.date}</td>
                    <td className="py-2.5 px-4">{inv.asset}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider uppercase" style={{ fontFamily: MONO, color: TYPE_COLOR[inv.type], border: `1px solid color-mix(in srgb, ${TYPE_COLOR[inv.type]} 30%, transparent)` }}>{inv.type}</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold" style={{ fontFamily: MONO }}>${inv.writeOffAmount.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right" style={{ fontFamily: MONO, color: "var(--muted-foreground)" }}>${inv.marketValue.toLocaleString()}</td>
                    <td className="py-2.5 px-4"><button className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors" style={{ color: "var(--muted-foreground)" }}><Download size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Generate invoice</DialogTitle>
            <DialogDescription>Create a write-off invoice for tax and accounting purposes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Asset name</Label>
              <Input placeholder='e.g., MacBook Pro 14" M3' value={formData.asset} onChange={(e) => setFormData({ ...formData, asset: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Invoice type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Invoice["type"] })}>
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>
                  {["Sale", "Disposal", "Loss", "Donation"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Date</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Quantity</Label>
                <Input type="number" min="1" placeholder="Units" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Fair market value per unit ($)</Label>
              <Input type="number" min="0" step="50" placeholder="e.g., 1200" value={formData.marketValue} onChange={(e) => setFormData({ ...formData, marketValue: e.target.value })} />
            </div>
            {qty > 0 && fmv > 0 && (
              <div className="bg-muted/50 border p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Fair market value</span><span style={{ fontFamily: MONO }}>${fmv.toLocaleString()} / unit</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span style={{ fontFamily: MONO }}>{qty} units</span></div>
                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="font-medium">Total write-off</span>
                  <span className="text-xl" style={{ fontFamily: DISPLAY, fontWeight: 700, color: ACCENT }}>${total.toLocaleString()}</span>
                </div>
              </div>
            )}
            <div className="border p-3" style={{ background: "color-mix(in srgb, var(--primary) 6%, transparent)", borderColor: "color-mix(in srgb, var(--primary) 20%, transparent)" }}>
              <div className="flex gap-2">
                <FileText size={18} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                <div className="text-sm space-y-1">
                  <p className="font-medium" style={{ color: "var(--primary)" }}>Audit-ready documentation</p>
                  <p className="text-muted-foreground">Invoice includes fair market value assessment, asset details, and depreciation calculations for tax compliance.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setGenerateOpen(false); setFormData(emptyForm); }}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={!formData.asset || !formData.type || !qty || !fmv} className="text-white" style={{ background: ACCENT }}>
              <FileText className="h-4 w-4" /> Generate &amp; download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
