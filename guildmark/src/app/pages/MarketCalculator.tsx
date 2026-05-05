import { useMemo, useState } from "react";
import { Upload, DollarSign, Truck, ShieldCheck, Percent, Loader2, AlertTriangle } from "lucide-react";
import { useValuationEstimate } from "../lib/apiHooks";
import type { AssetType, ConditionGrade } from "../models/asset";
import type { ValuationEstimateRequest } from "../models/valuation";

// ---------------------------------------------------------------------------
// Form value → API contract translation tables. Kept inline so the mapping
// from human-friendly options to the ML feature space is reviewable in one
// place. If we ever move beyond laptops, expand asset_type accordingly.
// ---------------------------------------------------------------------------

const BRAND_LABELS: Record<string, string> = {
  apple:     "Apple",
  dell:      "Dell",
  hp:        "HP",
  lenovo:    "Lenovo",
  microsoft: "Microsoft",
};

const MODEL_LABELS: Record<string, string> = {
  "macbook-pro": "MacBook Pro 14\"",
  "macbook-air": "MacBook Air",
  "surface":     "Surface Laptop",
  "thinkpad":    "ThinkPad X1",
};

// PassMark-style scores. Indicative — the ML model is what actually matters.
const CPU_SCORES: Record<string, number> = {
  "m2":       220,
  "m2-pro":   280,
  "m2-max":   350,
  "intel-i5": 130,
  "intel-i7": 180,
  "intel-i9": 230,
};

const RAM_GB: Record<string, number> = {
  "8gb":  8,
  "16gb": 16,
  "32gb": 32,
  "64gb": 64,
};

const CONDITION_TO_GRADE: Record<string, ConditionGrade> = {
  excellent: "A",
  good:      "B",
  fair:      "C",
};

// Platform business rules — these stay client-side. They're not market data.
const PLATFORM_FEE_PCT = 0.08;
const SHIPPING_PER_UNIT = 15;
const DATA_WIPE_PER_UNIT = 8;

// ---------------------------------------------------------------------------

export function MarketCalculator() {
  const [brand,      setBrand]      = useState("");
  const [model,      setModel]      = useState("");
  const [cpu,        setCpu]        = useState("");
  const [ram,        setRam]        = useState("");
  const [condition,  setCondition]  = useState("");
  const [ageMonths,  setAgeMonths]  = useState<number>(12);
  const [quantity,   setQuantity]   = useState<number>(1);
  const [includeDataWipe, setIncludeDataWipe] = useState(true);

  // Build the API request only when the form is fully populated. Memoized so
  // useValuationEstimate gets a stable identity for its query key.
  const valuationRequest = useMemo<ValuationEstimateRequest | undefined>(() => {
    if (!brand || !model || !cpu || !ram || !condition) return undefined;
    const grade = CONDITION_TO_GRADE[condition];
    if (!grade) return undefined;

    const modelName = `${BRAND_LABELS[brand] ?? brand} ${MODEL_LABELS[model] ?? model}`.trim();

    return {
      asset_type:      "laptop" as AssetType,
      model_name:      modelName,
      condition_grade: grade,
      age_months:      ageMonths,
      cpu_score:       CPU_SCORES[cpu],
      ram_gb:          RAM_GB[ram],
    };
  }, [brand, model, cpu, ram, condition, ageMonths]);

  const valuation = useValuationEstimate(valuationRequest);
  const showResults = !!valuationRequest;

  const fmvPerUnit  = valuation.data?.fair_market_value ?? 0;
  const confidence  = valuation.data?.confidence ?? 0;

  // Derived numbers — gross is FMV × quantity, deductions are platform rules.
  const estimatedValue = fmvPerUnit * quantity;
  const shipping       = SHIPPING_PER_UNIT  * quantity;
  const dataWipe       = includeDataWipe ? DATA_WIPE_PER_UNIT * quantity : 0;
  const platformFee    = estimatedValue * PLATFORM_FEE_PCT;
  const netProfit      = estimatedValue - shipping - dataWipe - platformFee;

  return (
    <div className="grid grid-cols-3 gap-6 pb-20">
      {/* Input Rail */}
      <div className="col-span-1 space-y-4">
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
          <h2 className="font-mono text-slate-900 dark:text-slate-100 mb-6">Asset Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="">Select...</option>
                <option value="apple">Apple</option>
                <option value="dell">Dell</option>
                <option value="hp">HP</option>
                <option value="lenovo">Lenovo</option>
                <option value="microsoft">Microsoft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="">Select...</option>
                <option value="macbook-pro">MacBook Pro 14"</option>
                <option value="macbook-air">MacBook Air</option>
                <option value="surface">Surface Laptop</option>
                <option value="thinkpad">ThinkPad X1</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">CPU</label>
              <select
                value={cpu}
                onChange={(e) => setCpu(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="">Select...</option>
                <option value="m2">Apple M2</option>
                <option value="m2-pro">Apple M2 Pro</option>
                <option value="m2-max">Apple M2 Max</option>
                <option value="intel-i5">Intel i5</option>
                <option value="intel-i7">Intel i7</option>
                <option value="intel-i9">Intel i9</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">RAM</label>
              <select
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="">Select...</option>
                <option value="8gb">8 GB</option>
                <option value="16gb">16 GB</option>
                <option value="32gb">32 GB</option>
                <option value="64gb">64 GB</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="">Select...</option>
                <option value="excellent">Excellent (Grade A)</option>
                <option value="good">Good (Grade B)</option>
                <option value="fair">Fair (Grade C)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Age (months)</label>
              <input
                type="number"
                min="0"
                max="240"
                value={ageMonths}
                onChange={(e) => setAgeMonths(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
          </div>
        </div>

        <button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-3 rounded-lg font-mono text-sm transition-colors flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" />
          Bulk Upload (CSV/Excel)
        </button>
      </div>

      {/* Value Breakdown */}
      <div className="col-span-2 space-y-6">
        {!showResults ? (
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-12 flex items-center justify-center">
            <p className="text-slate-400 dark:text-slate-500 font-mono text-sm">Select asset details to view market valuation</p>
          </div>
        ) : valuation.isPending ? (
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">Estimating market value...</p>
          </div>
        ) : valuation.isError ? (
          <div className="bg-white dark:bg-slate-800/50 border border-amber-300 dark:border-amber-700/50 rounded-lg p-8 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5" />
            <div>
              <p className="font-mono text-slate-900 dark:text-slate-100 mb-1">Valuation service unavailable</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                {valuation.error instanceof Error ? valuation.error.message : "Unable to reach the pricing model. Try again shortly."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[#3B82F6]/10 to-white dark:to-slate-800/50 border border-[#3B82F6]/30 rounded-lg p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wide">Estimated Net Recovery</p>
                  <p className="text-5xl font-mono text-[#3B82F6] mt-2">${netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-2">
                    Model confidence: {(confidence * 100).toFixed(0)}%
                    {valuation.data?.model_version && ` · ${valuation.data.model_version}`}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-[#3B82F6]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">Per Unit (Net)</p>
                  <p className="text-2xl font-mono text-slate-800 dark:text-slate-200">${(netProfit / quantity).toFixed(2)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">Total Units</p>
                  <p className="text-2xl font-mono text-slate-800 dark:text-slate-200">{quantity}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
              <h3 className="font-mono text-slate-900 dark:text-slate-100 mb-6">Transparent Deductions</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-slate-800 dark:text-slate-200">Fair Market Value</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">${fmvPerUnit.toFixed(2)} × {quantity} unit{quantity === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                  <p className="text-lg font-mono text-[#3B82F6]">+${estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-slate-800 dark:text-slate-200">Estimated Shipping</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Prepaid labels included</p>
                    </div>
                  </div>
                  <p className="text-lg font-mono text-slate-600 dark:text-slate-400">-${shipping.toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-mono text-slate-800 dark:text-slate-200">Data Wipe Service</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">NIST 800-88 certified (optional)</p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer mr-4">
                        <input
                          type="checkbox"
                          checked={includeDataWipe}
                          onChange={(e) => setIncludeDataWipe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]"
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-lg font-mono text-slate-600 dark:text-slate-400">
                    {includeDataWipe ? `-$${dataWipe.toLocaleString()}` : "$0"}
                  </p>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                      <Percent className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-slate-800 dark:text-slate-200">Platform Fee</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{(PLATFORM_FEE_PCT * 100).toFixed(0)}% of gross value</p>
                    </div>
                  </div>
                  <p className="text-lg font-mono text-slate-600 dark:text-slate-400">-${platformFee.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="font-mono text-slate-900 dark:text-slate-100">Net Payment</p>
                  <p className="text-2xl font-mono text-[#3B82F6]">${netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
