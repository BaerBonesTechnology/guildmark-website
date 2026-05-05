import { useState } from "react";
import { FileText, Download, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

// Mock data
const invoices = [
  {
    id: "INV-2026-0042",
    date: "2026-05-01",
    asset: "MacBook Pro 16\" M2 (24 units)",
    type: "Sale",
    writeOffAmount: 48000,
    marketValue: 48000,
  },
  {
    id: "INV-2026-0041",
    date: "2026-04-28",
    asset: "Dell PowerEdge R640 (8 units)",
    type: "Disposal",
    writeOffAmount: 32000,
    marketValue: 32000,
  },
  {
    id: "INV-2026-0040",
    date: "2026-04-25",
    asset: "MacBook Air M1 (38 units)",
    type: "Sale",
    writeOffAmount: 30400,
    marketValue: 30400,
  },
  {
    id: "INV-2026-0039",
    date: "2026-04-20",
    asset: "HP EliteDesk 800 G6 (42 units)",
    type: "Donation",
    writeOffAmount: 25200,
    marketValue: 25200,
  },
  {
    id: "INV-2026-0038",
    date: "2026-04-18",
    asset: "iPad Pro 12.9\" (28 units)",
    type: "Sale",
    writeOffAmount: 22400,
    marketValue: 22400,
  },
];

const mockAssets = [
  "MacBook Pro 16\" M2",
  "Dell PowerEdge R640",
  "MacBook Air M1",
  "HP EliteDesk 800 G6",
  "iPad Pro 12.9\"",
  "Dell OptiPlex 7080",
];

export function Invoices() {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    asset: "",
    type: "",
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    marketValue: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.asset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerate = () => {
    console.log("Generating invoice:", formData);
    setGenerateDialogOpen(false);
    setFormData({
      asset: "",
      type: "",
      date: new Date().toISOString().split("T")[0],
      quantity: "",
      marketValue: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-semibold mb-2">Invoices</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Generate and manage write-off documentation for accounting
          </p>
        </div>
        <Button
          onClick={() => setGenerateDialogOpen(true)}
          className="bg-amps-accent hover:bg-amps-accent/90 text-white font-mono"
        >
          <Plus className="h-4 w-4" />
          Generate Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-mono text-muted-foreground mb-1">Total Invoices</p>
              <p className="text-3xl font-mono font-semibold">{invoices.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-mono text-muted-foreground mb-1">Total Write-Offs</p>
              <p className="text-3xl font-mono font-semibold">
                ${invoices.reduce((sum, inv) => sum + inv.writeOffAmount, 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-mono text-muted-foreground mb-1">This Month</p>
              <p className="text-3xl font-mono font-semibold">
                ${invoices.slice(0, 2).reduce((sum, inv) => sum + inv.writeOffAmount, 0).toLocaleString()}
              </p>
            </div>
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

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono">Invoice Number</TableHead>
                <TableHead className="font-mono">Date</TableHead>
                <TableHead className="font-mono">Asset</TableHead>
                <TableHead className="font-mono">Type</TableHead>
                <TableHead className="font-mono text-right">Write-Off Amount</TableHead>
                <TableHead className="font-mono text-right">Market Value</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono font-semibold">{invoice.id}</TableCell>
                  <TableCell className="font-mono text-sm">{invoice.date}</TableCell>
                  <TableCell className="font-mono">{invoice.asset}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono ${
                        invoice.type === "Sale"
                          ? "bg-success/10 text-success"
                          : invoice.type === "Disposal"
                          ? "bg-warning/10 text-warning"
                          : "bg-info/10 text-info"
                      }`}
                    >
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
        </CardContent>
      </Card>

      {/* Generate Invoice Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-xl font-mono">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Create a write-off invoice for tax and accounting purposes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={formData.asset} onValueChange={(value) => setFormData({ ...formData, asset: value })}>
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Select asset..." />
                </SelectTrigger>
                <SelectContent>
                  {mockAssets.map((asset) => (
                    <SelectItem key={asset} value={asset} className="font-mono">
                      {asset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Invoice Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale" className="font-mono">Sale</SelectItem>
                  <SelectItem value="disposal" className="font-mono">Disposal</SelectItem>
                  <SelectItem value="loss" className="font-mono">Loss</SelectItem>
                  <SelectItem value="donation" className="font-mono">Donation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Number of units"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>

            {formData.asset && formData.quantity && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fair Market Value</span>
                    <span className="font-mono font-semibold">$2,000 / unit</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-mono">{formData.quantity} units</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between">
                    <span className="font-semibold">Total Write-Off Amount</span>
                    <span className="text-xl font-mono font-semibold text-amps-accent">
                      ${(2000 * parseInt(formData.quantity || "0")).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="rounded-lg bg-info/10 border border-info/20 p-3">
              <div className="flex gap-2">
                <FileText className="h-5 w-5 text-info mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-info">Audit-Ready Documentation</p>
                  <p className="text-muted-foreground">
                    Invoice includes fair market value assessment, asset details, and depreciation calculations
                    for tax compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)} className="font-mono">
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!formData.asset || !formData.type || !formData.quantity}
              className="bg-amps-accent hover:bg-amps-accent/90 text-white font-mono"
            >
              <FileText className="h-4 w-4" />
              Generate & Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
