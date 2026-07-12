/**
 * Market Pulse valuation service — pure functions translating form state into
 * the valuation API contract and deriving the net-recovery breakdown.
 */
import {
  BRAND_LABELS, CONDITION_TO_GRADE, CPU_SCORES, DATA_WIPE_PER_UNIT,
  MODEL_LABELS, RAM_GB, SHIPPING_PER_UNIT,
} from "../constants/calculator.constants";
import type { AssetType } from "../models/asset";
import type { ValuationEstimateRequest } from "../models/valuation";

export interface CalculatorForm {
  ageMonths: number;
  brand: string;
  condition: string;
  cpu: string;
  model: string;
  ram: string;
}

export interface RecoveryBreakdown {
  dataWipe: number;
  estimatedValue: number;
  netProfit: number;
  platformFee: number;
  shipping: number;
}

export function buildValuationRequest(form: CalculatorForm): ValuationEstimateRequest | undefined {
  const { ageMonths, brand, condition, cpu, model, ram } = form;
  if (!brand || !model || !cpu || !ram || !condition) return undefined;
  const grade = CONDITION_TO_GRADE[condition];
  if (!grade) return undefined;
  const modelName = `${BRAND_LABELS[brand] ?? brand} ${MODEL_LABELS[model] ?? model}`.trim();
  return {
    asset_type: "laptop" as AssetType,
    model_name: modelName,
    condition_grade: grade,
    age_months: ageMonths,
    cpu_score: CPU_SCORES[cpu],
    ram_gb: RAM_GB[ram],
  };
}

export function computeRecovery(
  fmvPerUnit: number, quantity: number, includeDataWipe: boolean, platformFeePct: number,
): RecoveryBreakdown {
  const estimatedValue = fmvPerUnit * quantity;
  const shipping = SHIPPING_PER_UNIT * quantity;
  const dataWipe = includeDataWipe ? DATA_WIPE_PER_UNIT * quantity : 0;
  const platformFee = estimatedValue * platformFeePct;
  const netProfit = estimatedValue - shipping - dataWipe - platformFee;
  return { dataWipe, estimatedValue, netProfit, platformFee, shipping };
}
