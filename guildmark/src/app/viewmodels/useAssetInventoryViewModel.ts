/** ViewModel for AMPS Asset Inventory: list, filters, selection, dialogs. */
import { useState } from "react";
import type { LocalAsset } from "../models/localAsset";
import { filterAssets } from "../services/assetInventory.service";

const SEED: LocalAsset[] = [];

export function useAssetInventoryViewModel() {
  const [assets, setAssets] = useState<LocalAsset[]>(SEED);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const filteredAssets = filterAssets(assets, searchTerm, typeFilter, conditionFilter);

  const toggleAsset = (id: string) =>
    setSelectedAssets((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelectedAssets(selectedAssets.length === filteredAssets.length ? [] : filteredAssets.map((a) => a.id));

  const addAsset = (asset: LocalAsset) => setAssets((prev) => [asset, ...prev]);
  const importAssets = (next: LocalAsset[]) => setAssets((prev) => [...next, ...prev]);

  return {
    addAsset, addOpen, assets, conditionFilter, filteredAssets, importAssets, importOpen,
    searchTerm, selectedAssets, setAddOpen, setConditionFilter, setImportOpen, setSearchTerm,
    setTypeFilter, toggleAll, toggleAsset, typeFilter,
  };
}
