/** AMPS Asset Inventory service — filtering + CSV export. */
import type { LocalAsset } from "../models/localAsset";

export function exportCSV(assets: LocalAsset[]): void {
  const headers = [
    "id", "model", "type", "condition", "age_months", "fair_market_value",
    "book_value", "depreciation_pct", "serial_number", "department", "status", "source",
  ];
  const rows = assets.map((a) => [
    a.id, `"${a.model}"`, a.type, a.condition, a.age, a.fairMarketValue,
    a.bookValue, a.depreciation, a.serialNumber ?? "", a.department ?? "", a.status, a.source ?? "mdm",
  ].join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `guildmark-assets-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function filterAssets(
  assets: LocalAsset[], searchTerm: string, typeFilter: string, conditionFilter: string,
): LocalAsset[] {
  return assets.filter((asset) => {
    const matchesSearch = asset.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || asset.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesCondition = conditionFilter === "all" || asset.condition === conditionFilter;
    return matchesSearch && matchesType && matchesCondition;
  });
}
