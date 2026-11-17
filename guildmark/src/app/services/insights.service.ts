/** Market Insights service — currency formatting + idle-fleet cost metrics. */
import {
  AVG_DEVICE_VALUE,
  REFRESH_CYCLE_MONTHS,
} from "../constants/insights.constants";

export interface StockpileMetrics {
  accumulated: number;
  carryingCost: number;
  costPerDay: number;
  costPerHour: number;
  costPerSecond: number;
  estimatedDevices: number;
  idleDevices: number;
  lostValue: number;
  monthlyOffload: number;
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function computeStockpileMetrics(
  assetValue: number,
  tickSeconds: number,
): StockpileMetrics {
  assetValue = normalizeFleetValue(assetValue);
  tickSeconds = Number.isFinite(tickSeconds) ? Math.max(0, tickSeconds) : 0;
  const carryingCost = assetValue * 0.21;
  const lostValue = assetValue * 0.5;
  const costPerSecond = carryingCost / 365 / 24 / 3600;
  const costPerDay = carryingCost / 365;
  const costPerHour = carryingCost / 365 / 24;
  const accumulated = costPerSecond * tickSeconds;

  const estimatedDevices = Math.round(assetValue / AVG_DEVICE_VALUE);
  const idleDevices = Math.round(estimatedDevices * 0.25);
  const monthlyOffload = Math.max(
    1,
    Math.round(estimatedDevices / REFRESH_CYCLE_MONTHS),
  );

  return {
    accumulated,
    carryingCost,
    costPerDay,
    costPerHour,
    costPerSecond,
    estimatedDevices,
    idleDevices,
    lostValue,
    monthlyOffload,
  };
}

/** Slider contract: $50k�$2m in $10k increments. */
export function normalizeFleetValue(value: number): number {
  if (!Number.isFinite(value)) return 500_000;
  return Math.min(
    2_000_000,
    Math.max(50_000, Math.round(value / 10_000) * 10_000),
  );
}
