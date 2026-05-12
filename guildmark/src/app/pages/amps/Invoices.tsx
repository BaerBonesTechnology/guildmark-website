import { useState } from "react";
import { FileText, Download, Plus, Search, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

interface Invoice {
  id:              string;
  date:            string;
  asset:           string;
  type:            "Sale" | "Disposal" | "Loss" | "Donation";
  quantity:        number;
  writeOffAmount:  number;
  marketValue:     number;
}

const emptyForm = {
  asset:       "",
  type:        "" as Invoice["type"] | "",
  date:        new Date().toISOString().split("T")[0],
  quantity:    "",
  marketValue: "",
};

export function Invoices() {
  const [invoices,           setInvoices]           = useState<Invoice[]>([]);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [formData,           setFormData]           = useState(emptyForm);
  const [searchTerm,         setSearchTerm]         = useState("");

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.asset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const qty    = parseInt(formData.quantity  || "0");
  const fmv    = parseFloat(formData.marketValue || "0");
  const total  = qty * fmv;

  function handleGenerate() {
    if (!formData.asset || !formData.type || !qty || !fmv) return;
    const nextNum = (invoices.length + 1).toString().padStart(4, "0");
    const year    = new Date().getFullYear();
    const inv: Invoice = {
      id:             `INV-${year}-${nextNum}`,
      date:           formData.date,
      asset:          `${formData.asset}${qty > 1 ? ` (${qty} units)` : ""}`,
      type:           formData.type as Invoice["type"],
      quantity:       qty,
      writeOffAmount: total,
      marketValue:    total,
    };
    setInvoices((prev) => [inv, ...prev]);
    setGenerateDialogOpen(false);
    setFormData(emptyForm);
  }

  function handleClose() {
    setGenerateDialogOpen(false);
    setFormData(emptyForm);
  }

  const totalWriteOffs    = invoices.reduce((s, i) => s + i.writeOffAmount, 0);
  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split("T")[0];
  const thisMonthTotal    = invoices
    .filter((i) => i.date >= currentMonthStart)
    .reduce((s, i) => s + i.writeOffAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-semibold mb-2">Invoices</h1>
          <p className="text-muted-foreground text-sm">
            Generate and manage write-off documentation for accounting
          </p>
        </div>
        <Button
          onClick={() => setGenerateDialogOpen(true)}
          className="bg-amps-accent hover:bg-amps-accent/90 text-white"
        >
          <Plus className="h-4 w-4" />
          Generate invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total invoices</p>
            <p className="text-3xl font-mono font-semibold">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total write-offs</p>
            <p className="text-3xl font-mono font-semibold">
              ${totalWriteOffs.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">This month</p>
            <p className="text-3xl font-mono font-semibold">
              ${thisMonthTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number or asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice history</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Receipt className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGenerateDialogOpen(true)}
              >
                Generate your first invoice
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono">Invoice #</TableHead>
                  <TableHead className="font-mono">Date</TableHead>
                  <TableHead className="font-mono">Asset</TableHead>
                  <TableHead className="font-mono">Type</TableHead>
                  <TableHead className="font-mono text-right">Write-off amount</TableHead>
                  <TableHead className="font-mono text-right">Market value</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono font-semibold">{invoice.id}</TableCell>
                    <TableCell className="font-mono text-sm">{invoice.date}</TableCell>
                    <TableCell className="font-mono">{invoice.asset}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono ${
                        invoice.type === "Sale"     ? "bg-success/10 text-success" :
                        invoice.type === "Disposal" ? "bg-warning/10 text-warning" :
                        invoice.type === "Donation" ? "bg-info/10 text-info"       :
                                                      "bg-danger/10 text-danger"
                      }`}>
                        {invoice.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-right font-semibold">
                      ${invoice.writeOffAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">
                      ${invoice.marketValue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Generate Invoice Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Generate invoice</DialogTitle>
            <DialogDescription>
              Create a write-off invoice for tax and accounting purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Asset name</Label>
              <Input
                placeholder='e.g., MacBook Pro 14" M3'
                value={formData.asset}
                onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                className="font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Invoice type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as Invoice["type"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sale">Sale</SelectItem>
                  <SelectItem value="Disposal">Disposal</SelectItem>
                  <SelectItem value="Loss">Loss</SelectItem>
                  <SelectItem value="Donation">Donation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Units"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Fair market value per unit ($)
              </Label>
              <Input
                type="number"
                min="0"
                step="50"
                placeholder="e.g., 1200"
                value={formData.marketValue}
                onChange={(e) => setFormData({ ...formData, marketValue: e.target.value })}
                className="font-mono"
              />
            </div>

            {qty > 0 && fmv > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fair market value</span>
                  <span className="font-mono">${fmv.toLocaleString()} / unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-mono">{qty} units</span>
                </div>
                <div className="pt-2 border-t flex justify-between">
                  <span className="font-medium">Total write-off amount</span>
                  <span className="text-xl font-mono font-semibold text-amps-accent">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-lg bg-info/10 border border-info/20 p-3">
              <div className="flex gap-2">
                <FileText className="h-5 w-5 text-info mt-0.5 shrink-0" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-info">Audit-ready documentation</p>
                  <p className="text-muted-foreground">
                    Invoice includes fair market value assessment, asset details, and
                    depreciation calculations for tax compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleGenerate}
              disabled={!formData.asset || !formData.type || !qty || !fmv}
              className="bg-amps-accent hover:bg-amps-accent/90 text-white"
            >
              <FileText className="h-4 w-4" />
              Generate & download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
