import { useState } from "react";
import { Search, Download, Plus, ExternalLink, Upload } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Link } from "react-router";
import { AddAssetDialog } from "../../components/AddAssetDialog";
import { ImportCSVDialog } from "../../components/ImportCSVDialog";

// ---------------------------------------------------------------------------
// Local asset shape
// ---------------------------------------------------------------------------

export interface LocalAsset {
  id:              string;
  model:           string;
  type:            string;
  condition:       "A" | "B" | "C";
  quantity?:       number;
  age:             number;
  fairMarketValue: number;
  bookValue:       number;
  depreciation:    number;
  serialNumber?:   string | null;
  department?:     string | null;
  status:          "Active" | "At Risk";
  lastSync:        string;
  source?:         "mdm" | "manual" | "csv";
}

const seed: LocalAsset[] = [];

// ---------------------------------------------------------------------------
// CSV export helper
// ---------------------------------------------------------------------------

function exportCSV(assets: LocalAsset[]) {
  const headers = [
    "id","model","type","condition","age_months",
    "fair_market_value","book_value","depreciation_pct",
    "serial_number","department","status","source",
  ];
  const rows = assets.map((a) =>
    [
      a.id, `"${a.model}"`, a.type, a.condition, a.age,
      a.fairMarketValue, a.bookValue, a.depreciation,
      a.serialNumber ?? "", a.department ?? "", a.status, a.source ?? "mdm",
    ].join(",")
  );
  const csv  = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `guildmark-assets-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Source badge
// ---------------------------------------------------------------------------

function SourceBadge({ source }: { source?: string }) {
  if (!source || source === "mdm") return null;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono ml-1.5 ${
      source === "csv"    ? "bg-amps-accent/10 text-amps-accent" :
      source === "manual" ? "bg-warning/10 text-warning" : ""
    }`}>
      {source}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AssetInventory() {
  const [assets,          setAssets]          = useState<LocalAsset[]>(seed);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [typeFilter,      setTypeFilter]      = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [selectedAssets,  setSelectedAssets]  = useState<string[]>([]);
  const [addOpen,         setAddOpen]         = useState(false);
  const [importOpen,      setImportOpen]      = useState(false);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch    = asset.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType      = typeFilter === "all" || asset.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesCondition = conditionFilter === "all" || asset.condition === conditionFilter;
    return matchesSearch && matchesType && matchesCondition;
  });

  function toggleAsset(id: string) {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    setSelectedAssets(
      selectedAssets.length === filteredAssets.length
        ? []
        : filteredAssets.map((a) => a.id)
    );
  }

  function handleAddAsset(asset: LocalAsset) {
    setAssets((prev) => [asset, ...prev]);
  }

  function handleImportAssets(newAssets: LocalAsset[]) {
    setAssets((prev) => [...newAssets, ...prev]);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-semibold mb-2">Asset Inventory</h1>
          <p className="text-muted-foreground text-sm">
            Full catalog of devices with real-time valuations
            <span className="font-mono ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
              {assets.length} total
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportCSV(filteredAssets)}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button
            className="bg-amps-accent hover:bg-amps-accent/90 text-white"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add asset
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 font-mono"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Asset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Laptop">Laptop</SelectItem>
                <SelectItem value="Desktop">Desktop</SelectItem>
                <SelectItem value="Tablet">Tablet</SelectItem>
                <SelectItem value="Server">Server</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Monitor">Monitor</SelectItem>
                <SelectItem value="Networking">Networking</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All conditions</SelectItem>
                <SelectItem value="A">Grade A — Excellent</SelectItem>
                <SelectItem value="B">Grade B — Good</SelectItem>
                <SelectItem value="C">Grade C — Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions bar */}
      {selectedAssets.length > 0 && (
        <Card className="border-amps-accent bg-amps-accent/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                <span className="font-semibold font-mono">{selectedAssets.length}</span>
                {" "}asset{selectedAssets.length !== 1 ? "s" : ""} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Create listings</Button>
                <Button variant="outline" size="sm">Generate invoices</Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCSV(assets.filter((a) => selectedAssets.includes(a.id)))}
                >
                  Export selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border"
                  />
                </TableHead>
                <TableHead className="font-mono">Model</TableHead>
                <TableHead className="font-mono">Type</TableHead>
                <TableHead className="font-mono text-center">Grade</TableHead>
                <TableHead className="font-mono text-right">Age (mo)</TableHead>
                <TableHead className="font-mono text-right">Fair market value</TableHead>
                <TableHead className="font-mono text-right">Book value</TableHead>
                <TableHead className="font-mono text-right">Depreciation</TableHead>
                <TableHead className="font-mono">Status</TableHead>
                <TableHead className="font-mono">Last sync</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-12 text-muted-foreground text-sm">
                    No assets match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-amps-surface/50">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset.id)}
                        onChange={() => toggleAsset(asset.id)}
                        className="rounded border-border"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-medium">{asset.model}</span>
                      <SourceBadge source={asset.source} />
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{asset.type}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-6 rounded font-mono text-xs font-semibold ${
                        asset.condition === "A"
                          ? "bg-grade-a-subtle text-grade-a-text"
                          : asset.condition === "B"
                          ? "bg-grade-b-subtle text-grade-b-text"
                          : "bg-grade-c-subtle text-grade-c-text"
                      }`}>
                        {asset.condition}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-right">{asset.age}</TableCell>
                    <TableCell className="font-mono text-right font-medium">
                      ${asset.fairMarketValue.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">
                      ${asset.bookValue.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-right">
                      <span className={
                        asset.depreciation < 20 ? "text-success" :
                        asset.depreciation < 30 ? "text-warning" : "text-danger"
                      }>
                        {asset.depreciation.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono ${
                        asset.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}>
                        {asset.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {asset.lastSync}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                        <Link to={`/amps/assets/${asset.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground font-mono">
        Showing {filteredAssets.length} of {assets.length} assets
      </p>

      {/* Dialogs */}
      <AddAssetDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddAsset}
      />
      <ImportCSVDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImportAssets}
      />
    </div>
  );
}
