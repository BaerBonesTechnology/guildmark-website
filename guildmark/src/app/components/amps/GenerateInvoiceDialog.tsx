/** AMPS "Generate invoice" dialog — write-off documentation form. */
import { FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { INVOICE_TYPE_OPTIONS, type InvoiceForm, type InvoiceType } from "../../constants/invoices.constants";
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { DISPLAY, MONO } from "../../constants/typography";

interface GenerateInvoiceDialogProps {
  fmv: number;
  formData: InvoiceForm;
  onGenerate: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  qty: number;
  resetForm: () => void;
  setFormData: (form: InvoiceForm) => void;
  total: number;
}

export function GenerateInvoiceDialog({
  fmv, formData, onGenerate, onOpenChange, open, qty, resetForm, setFormData, total,
}: GenerateInvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as InvoiceType })}>
              <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
              <SelectContent>
                {INVOICE_TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
                <span className="text-xl" style={{ fontFamily: DISPLAY, fontWeight: 700, color: AMPS_ACCENT }}>${total.toLocaleString()}</span>
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
          <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }}>Cancel</Button>
          <Button onClick={onGenerate} disabled={!formData.asset || !formData.type || !qty || !fmv} className="text-amps-accent-foreground" style={{ background: AMPS_ACCENT }}>
            <FileText className="h-4 w-4" /> Generate &amp; download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
