/** Market Pulse contains static scenarios, not a live market feed. */
import { useState } from "react";
import { PURCHASING_DATA, SUPPLY_DATA } from "../constants/insights.constants";
import {
  computeStockpileMetrics,
  normalizeFleetValue,
} from "../services/insights.service";
export type SeasonalityView = "purchasing" | "supply";
export function useInsightsViewModel() {
  const [assetValue, setValue] = useState(500_000);
  const [activeView, setActiveView] = useState<SeasonalityView>("purchasing");
  return {
    assetValue,
    setAssetValue: (v: number) => setValue(normalizeFleetValue(v)),
    activeView,
    setActiveView,
    metrics: computeStockpileMetrics(assetValue, 0),
    seasonalityData:
      activeView === "purchasing" ? PURCHASING_DATA : SUPPLY_DATA,
  };
}
