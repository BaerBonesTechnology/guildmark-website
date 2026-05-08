import { useState } from "react";
import { Search, Filter, Download, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Link } from "react-router";

const assets: typeof import('../../../testbed/asset-inventory.json') = [];

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
