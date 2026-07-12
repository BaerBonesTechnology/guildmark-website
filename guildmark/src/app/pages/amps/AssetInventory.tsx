/**
 * AMPS Asset Inventory — full device catalog with valuations (View).
 * List/filter/selection state lives in useAssetInventoryViewModel; CSV export
 * and filtering are in assetInventory.service. Presentation only.
 */
import { Download, ExternalLink, Plus, Search, Upload } from "lucide-react";
import { Link } from "react-router";
import { AddAssetDialog } from "../../components/AddAssetDialog";
import { ImportCSVDialog } from "../../components/ImportCSVDialog";
import { SourceBadge } from "../../components/amps/SourceBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { ASSET_GRADE_COLOR, ASSET_TABLE_HEADERS, ASSET_TYPE_OPTIONS } from "../../constants/assetInventory.constants";
import { BODY, DISPLAY, MONO } from "../../constants/typography";
import { exportCSV } from "../../services/assetInventory.service";
import { useAssetInventoryViewModel } from "../../viewmodels/useAssetInventoryViewModel";

export function AssetInventory() {
  const {
    addAsset, addOpen, assets, conditionFilter, filteredAssets, importAssets, importOpen,
    searchTerm, selectedAssets, setAddOpen, setConditionFilter, setImportOpen, setSearchTerm,
    setTypeFilter, toggleAll, toggleAsset, typeFilter,
  } = useAssetInventoryViewModel();

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto pb-20" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>Asset Inventory</h1>
          <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Full catalog of devices with real-time valuations · {assets.length} total</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => exportCSV(filteredAssets)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border hover:border-foreground transition-colors">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border hover:border-foreground transition-colors">
            <Upload size={13} /> Import CSV
          </button>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity" style={{ background: AMPS_ACCENT, color: "#fff" }}>
            <Plus size={13} /> Add asset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="border border-border p-4 mb-4 flex gap-3" style={{ background: "var(--card)" }}>
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input placeholder="Search by model…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border focus:outline-none focus:border-primary"
            style={{ background: "var(--input-background)", fontFamily: BODY }} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Asset type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {ASSET_TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Condition" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All conditions</SelectItem>
            <SelectItem value="A">Grade A — Excellent</SelectItem>
            <SelectItem value="B">Grade B — Good</SelectItem>
            <SelectItem value="C">Grade C — Fair</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selectedAssets.length > 0 && (
        <div className="border p-4 mb-4 flex items-center justify-between" style={{ background: `color-mix(in srgb, ${AMPS_ACCENT} 6%, var(--card))`, borderColor: `color-mix(in srgb, ${AMPS_ACCENT} 30%, transparent)` }}>
          <p className="text-sm"><span className="font-semibold">{selectedAssets.length}</span> asset{selectedAssets.length !== 1 ? "s" : ""} selected</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs border border-border hover:border-foreground transition-colors">Create listings</button>
            <button className="px-3 py-1.5 text-xs border border-border hover:border-foreground transition-colors">Generate invoices</button>
            <button onClick={() => exportCSV(assets.filter((a) => selectedAssets.includes(a.id)))} className="px-3 py-1.5 text-xs border border-border hover:border-foreground transition-colors">Export selected</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-border overflow-x-auto" style={{ background: "var(--card)" }}>
        <table className="w-full text-sm" style={{ minWidth: 900 }}>
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 py-2.5 px-4">
                <input type="checkbox" checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0} onChange={toggleAll} className="align-middle" />
              </th>
              {ASSET_TABLE_HEADERS.map((h, i) => (
                <th key={i} className={`py-2.5 px-4 text-[10px] tracking-wider uppercase font-normal ${["Grade"].includes(h) ? "text-center" : ["Age (mo)", "Fair Market Value", "Book Value", "Depreciation"].includes(h) ? "text-right" : "text-left"}`}
                  style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-16 text-sm" style={{ color: "var(--muted-foreground)" }}>No assets match your filters — connect your MDM or add assets manually.</td></tr>
            ) : filteredAssets.map((asset, i) => (
              <tr key={asset.id} className="border-b border-border last:border-0" style={{ background: i % 2 ? "var(--secondary)" : "transparent" }}>
                <td className="py-2.5 px-4"><input type="checkbox" checked={selectedAssets.includes(asset.id)} onChange={() => toggleAsset(asset.id)} className="align-middle" /></td>
                <td className="py-2.5 px-4 font-medium">{asset.model}<SourceBadge source={asset.source} /></td>
                <td className="py-2.5 px-4 capitalize" style={{ color: "var(--muted-foreground)" }}>{asset.type}</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-6 text-xs font-semibold" style={{ fontFamily: MONO, color: ASSET_GRADE_COLOR[asset.condition], border: `1px solid color-mix(in srgb, ${ASSET_GRADE_COLOR[asset.condition]} 30%, transparent)` }}>{asset.condition}</span>
                </td>
                <td className="py-2.5 px-4 text-right" style={{ fontFamily: MONO }}>{asset.age}</td>
                <td className="py-2.5 px-4 text-right font-medium" style={{ fontFamily: MONO }}>${asset.fairMarketValue.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right" style={{ fontFamily: MONO, color: "var(--muted-foreground)" }}>${asset.bookValue.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right" style={{ fontFamily: MONO, color: asset.depreciation < 20 ? "var(--grade-a)" : asset.depreciation < 30 ? "var(--grade-b)" : "var(--chart-4)" }}>{asset.depreciation.toFixed(1)}%</td>
                <td className="py-2.5 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider uppercase" style={{ fontFamily: MONO, color: asset.status === "Active" ? "var(--grade-a)" : "var(--grade-b)", border: `1px solid color-mix(in srgb, ${asset.status === "Active" ? "var(--grade-a)" : "var(--grade-b)"} 30%, transparent)` }}>{asset.status}</span>
                </td>
                <td className="py-2.5 px-4 text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{asset.lastSync}</td>
                <td className="py-2.5 px-4">
                  <Link to={`/pre/amps/assets/${asset.id}`} className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors" style={{ color: "var(--muted-foreground)" }}><ExternalLink size={13} /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs mt-4" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Showing {filteredAssets.length} of {assets.length} assets</p>

      <AddAssetDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addAsset} />
      <ImportCSVDialog open={importOpen} onOpenChange={setImportOpen} onImport={importAssets} />
    </div>
  );
}
