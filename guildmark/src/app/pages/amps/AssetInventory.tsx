import { useState } from "react";
import { Search, Filter, Download, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Link } from "react-router";

// Mock data
const assets = [
  { id: "1", model: "MacBook Pro 16\" M2", type: "Laptop", condition: "A", age: 14, fairMarketValue: 2000, bookValue: 2400, depreciation: 16.7, status: "Active", lastSync: "2 mins ago" },
  { id: "2", model: "Dell PowerEdge R640", type: "Server", condition: "B", age: 28, fairMarketValue: 4000, bookValue: 5200, depreciation: 23.1, status: "Active", lastSync: "2 mins ago" },
  { id: "3", model: "MacBook Air M1", type: "Laptop", condition: "B", age: 22, fairMarketValue: 800, bookValue: 1000, depreciation: 20.0, status: "Active", lastSync: "2 mins ago" },
  { id: "4", model: "HP EliteDesk 800 G6", type: "Desktop", condition: "A", age: 18, fairMarketValue: 600, bookValue: 720, depreciation: 16.7, status: "Active", lastSync: "2 mins ago" },
  { id: "5", model: "iPad Pro 12.9\"", type: "Tablet", condition: "A", age: 12, fairMarketValue: 800, bookValue: 900, depreciation: 11.1, status: "Active", lastSync: "2 mins ago" },
  { id: "6", model: "Dell OptiPlex 7080", type: "Desktop", condition: "B", age: 24, fairMarketValue: 600, bookValue: 800, depreciation: 25.0, status: "Active", lastSync: "2 mins ago" },
  { id: "7", model: "Surface Pro 8", type: "Tablet", condition: "C", age: 32, fairMarketValue: 800, bookValue: 1200, depreciation: 33.3, status: "At Risk", lastSync: "2 mins ago" },
  { id: "8", model: "Lenovo ThinkPad X1", type: "Laptop", condition: "B", age: 26, fairMarketValue: 700, bookValue: 980, depreciation: 28.6, status: "Active", lastSync: "2 mins ago" },
  { id: "9", model: "Mac Mini M1", type: "Desktop", condition: "A", age: 16, fairMarketValue: 700, bookValue: 820, depreciation: 14.6, status: "Active", lastSync: "2 mins ago" },
  { id: "10", model: "HP ProDesk 600 G5", type: "Desktop", condition: "C", age: 38, fairMarketValue: 400, bookValue: 680, depreciation: 41.2, status: "At Risk", lastSync: "2 mins ago" },
  { id: "11", model: "MacBook Pro 14\" M1", type: "Laptop", condition: "B", age: 20, fairMarketValue: 1500, bookValue: 1950, depreciation: 23.1, status: "Active", lastSync: "5 mins ago" },
  { id: "12", model: "Dell XPS 13", type: "Laptop", condition: "A", age: 10, fairMarketValue: 1100, bookValue: 1250, depreciation: 12.0, status: "Active", lastSync: "5 mins ago" },
];

export function AssetInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || asset.type === typeFilter;
    const matchesCondition = conditionFilter === "all" || asset.condition === conditionFilter;
    return matchesSearch && matchesType && matchesCondition;
  });

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((assetId) => assetId !== id) : [...prev, id]
    );
  };

  const toggleAllAssets = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map((a) => a.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-semibold mb-2">Asset Inventory</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Full catalog of MDM-synced devices with real-time valuations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="font-mono">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button asChild className="bg-amps-accent hover:bg-amps-accent/90 text-white font-mono">
            <Link to="/amps/mdm">
              <Plus className="h-4 w-4" />
              Sync MDM
            </Link>
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
              <SelectTrigger className="w-48 font-mono">
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono">All Types</SelectItem>
                <SelectItem value="Laptop" className="font-mono">Laptop</SelectItem>
                <SelectItem value="Desktop" className="font-mono">Desktop</SelectItem>
                <SelectItem value="Tablet" className="font-mono">Tablet</SelectItem>
                <SelectItem value="Server" className="font-mono">Server</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-48 font-mono">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono">All Conditions</SelectItem>
                <SelectItem value="A" className="font-mono">Excellent (A)</SelectItem>
                <SelectItem value="B" className="font-mono">Good (B)</SelectItem>
                <SelectItem value="C" className="font-mono">Fair (C)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedAssets.length > 0 && (
        <Card className="border-amps-accent bg-amps-accent/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm">
                <span className="font-semibold">{selectedAssets.length}</span> asset
                {selectedAssets.length !== 1 ? "s" : ""} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="font-mono">
                  Create Listings
                </Button>
                <Button variant="outline" size="sm" className="font-mono">
                  Generate Invoices
                </Button>
                <Button variant="outline" size="sm" className="font-mono">
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                    onChange={toggleAllAssets}
                    className="rounded border-border"
                  />
                </TableHead>
                <TableHead className="font-mono">Model</TableHead>
                <TableHead className="font-mono">Type</TableHead>
                <TableHead className="font-mono text-center">Condition</TableHead>
                <TableHead className="font-mono text-right">Age (mo)</TableHead>
                <TableHead className="font-mono text-right">Fair Market Value</TableHead>
                <TableHead className="font-mono text-right">Book Value</TableHead>
                <TableHead className="font-mono text-right">Depreciation</TableHead>
                <TableHead className="font-mono">Status</TableHead>
                <TableHead className="font-mono">Last Sync</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-amps-surface/50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => toggleAssetSelection(asset.id)}
                      className="rounded border-border"
                    />
                  </TableCell>
                  <TableCell className="font-mono font-semibold">{asset.model}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{asset.type}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-6 rounded font-mono text-xs font-semibold ${
                        asset.condition === "A"
                          ? "bg-success/10 text-success"
                          : asset.condition === "B"
                          ? "bg-warning/10 text-warning"
                          : "bg-danger/10 text-danger"
                      }`}
                    >
                      {asset.condition}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-right">{asset.age}</TableCell>
                  <TableCell className="font-mono text-right font-semibold">
                    ${asset.fairMarketValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-right text-muted-foreground">
                    ${asset.bookValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-right">
                    <span
                      className={
                        asset.depreciation < 20
                          ? "text-success"
                          : asset.depreciation < 30
                          ? "text-warning"
                          : "text-danger"
                      }
                    >
                      {asset.depreciation.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono ${
                        asset.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {asset.lastSync}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-center text-sm text-muted-foreground font-mono">
        Showing {filteredAssets.length} of {assets.length} assets
      </div>
    </div>
  );
}
