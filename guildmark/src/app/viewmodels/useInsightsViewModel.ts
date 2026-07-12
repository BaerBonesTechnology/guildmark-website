/** ViewModel for Market Insights: calculator state, live decay tick, metrics. */
import { useEffect, useState } from "react";
import { brand, semantic } from "../lib/tokens";
import { PURCHASING_DATA, SUPPLY_DATA } from "../constants/insights.constants";
import { computeStockpileMetrics } from "../services/insights.service";

export type SeasonalityView = "purchasing" | "supply";

export function useInsightsViewModel() {
  const [assetValue, setAssetValue] = useState(500_000);
  const [activeView, setActiveView] = useState<SeasonalityView>("purchasing");
  const [tickSeconds, setTickSeconds] = useState(0);

  // Tick every second so the decay clock feels live.
  useEffect(() => {
    const id = setInterval(() => setTickSeconds((s) => s + 1), 1_000);
    return () => clearInterval(id);
  }, []);

  const metrics = computeStockpileMetrics(assetValue, tickSeconds);
  const seasonalityData = activeView === "purchasing" ? PURCHASING_DATA : SUPPLY_DATA;
  const barColor = activeView === "purchasing" ? brand.primary : semantic.warning;

  return { activeView, assetValue, barColor, metrics, seasonalityData, setActiveView, setAssetValue };
}
