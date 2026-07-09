import { useMemo, useState } from "react";
import { Upload, DollarSign, Truck, ShieldCheck, Percent, Loader2, AlertTriangle, BarChart2 } from "lucide-react";
import { useValuationEstimate, usePlatformFees, formatFeeRate } from "../lib/apiHooks";
import type { AssetType, ConditionGrade } from "../models/asset";
import type { ValuationEstimateRequest } from "../models/valuation";

// ---------------------------------------------------------------------------
// Form value → API contract translation tables. Kept inline so the mapping
// from human-friendly options to the ML feature space is reviewable in one
// place. If we ever move beyond laptops, expand asset_type accordingly.
// ---------------------------------------------------------------------------

const BRAND_LABELS: Record<string, string> = {
  apple: "Apple", dell: "Dell", hp: "HP", lenovo: "Lenovo", microsoft: "Microsoft",
};
const MODEL_LABELS: Record<string, string> = {
  "macbook-pro": "MacBook Pro 14\"", "macbook-air": "MacBook Air",
  "surface": "Surface Laptop", "thinkpad": "ThinkPad X1",
};
const CPU_SCORES: Record<string, number> = {
  "m2": 220, "m2-pro": 280, "m2-max": 350, "intel-i5": 130, "intel-i7": 180, "intel-i9": 230,
};
const RAM_GB: Record<string, number> = { "8gb": 8, "16gb": 16, "32gb": 32, "64gb": 64 };
const CONDITION_TO_GRADE: Record<string, ConditionGrade> = { excellent: "A", good: "B", fair: "C" };

// Add-on service pricing — platform rules, not market data. The platform fee
// itself comes from the API (usePlatformFees), never hardcoded.
const SHIPPING_PER_UNIT = 15;
const DATA_WIPE_PER_UNIT = 8;

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const selectClass = "w-full px-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary transition-colors appearance-none";
const inputClass = "w-full px-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary transition-colors";
const fieldStyle = { fontFamily: BODY, background: "var(--input-background)" } as const;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{children}</label>;
}

function DeductionRow({ icon: Icon, label, sub, value, positive = false }: {
  icon: React.ElementType; label: string; sub: string; value: string; positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ border: "1px solid var(--border)", background: "var(--secondary)" }}>
          <Icon size={13} style={{ color: "var(--muted-foreground)" }} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ fontFamily: BODY }}>{label}</p>
          <p className="text-[10px]" style={{ color: "var(--muted-foreground)", fontFamily: BODY }}>{sub}</p>
        </div>
      </div>
      <span className="text-sm tabular-nums" style={{ fontFamily: MONO, color: positive ? "var(--chart-3)" : "var(--foreground)" }}>{value}</span>
    </div>
  );
}

export function MarketCalculator() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [cpu, setCpu] = useState("");
  const [ram, setRam] = useState("");
  const [condition, setCondition] = useState("");
  const [ageMonths, setAgeMonths] = useState<number>(12);
  const [quantity, setQuantity] = useState<number>(1);
  const [includeDataWipe, setIncludeDataWipe] = useState(true);

  const { data: fees } = usePlatformFees();
  const platformFeePct = fees?.seller_fee_free ?? 0;

  const valuationRequest = useMemo<ValuationEstimateRequest | undefined>(() => {
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
  }, [brand, model, cpu, ram, condition, ageMonths]);

  const valuation = useValuationEstimate(valuationRequest);
  const showResults = !!valuationRequest;

  const fmvPerUnit = valuation.data?.fair_market_value ?? 0;
  const confidence = valuation.data?.confidence ?? 0;

  const estimatedValue = fmvPerUnit * quantity;
  const shipping = SHIPPING_PER_UNIT * quantity;
  const dataWipe = includeDataWipe ? DATA_WIPE_PER_UNIT * quantity : 0;
  const platformFee = estimatedValue * platformFeePct;
  const netProfit = estimatedValue - shipping - dataWipe - platformFee;

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
      <div className="grid lg:grid-cols-[360px_1fr] gap-6">

        {/* Left — inputs */}
        <div className="flex flex-col gap-4">
          <div className="border border-border p-6 flex flex-col gap-5" style={{ background: "var(--card)" }}>
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Market Pulse</p>
              <h2 className="text-xl" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>Asset Details</h2>
            </div>

            <div>
              <FieldLabel>Brand</FieldLabel>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectClass} style={fieldStyle}>
                <option value="">Select...</option>
                <option value="apple">Apple</option>
                <option value="dell">Dell</option>
                <option value="hp">HP</option>
                <option value="lenovo">Lenovo</option>
                <option value="microsoft">Microsoft</option>
              </select>
            </div>

            <div>
              <FieldLabel>Model</FieldLabel>
              <select value={model} onChange={(e) => setModel(e.target.value)} className={selectClass} style={fieldStyle}>
                <option value="">Select...</option>
                <option value="macbook-pro">MacBook Pro 14"</option>
                <option value="macbook-air">MacBook Air</option>
                <option value="surface">Surface Laptop</option>
                <option value="thinkpad">ThinkPad X1</option>
              </select>
            </div>

            <div>
              <FieldLabel>CPU</FieldLabel>
              <select value={cpu} onChange={(e) => setCpu(e.target.value)} className={selectClass} style={fieldStyle}>
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
              <FieldLabel>RAM</FieldLabel>
              <select value={ram} onChange={(e) => setRam(e.target.value)} className={selectClass} style={fieldStyle}>
                <option value="">Select...</option>
                <option value="8gb">8 GB</option>
                <option value="16gb">16 GB</option>
                <option value="32gb">32 GB</option>
                <option value="64gb">64 GB</option>
              </select>
            </div>

            <div>
              <FieldLabel>Condition</FieldLabel>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className={selectClass} style={fieldStyle}>
                <option value="">Select...</option>
                <option value="excellent">Excellent (Grade A)</option>
                <option value="good">Good (Grade B)</option>
                <option value="fair">Fair (Grade C)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Age (Months)</FieldLabel>
                <input type="number" min="0" max="240" value={ageMonths} onChange={(e) => setAgeMonths(parseInt(e.target.value) || 0)} className={inputClass} style={fieldStyle} />
              </div>
              <div>
                <FieldLabel>Quantity</FieldLabel>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className={inputClass} style={fieldStyle} />
              </div>
            </div>
          </div>

          <button className="w-full py-3 text-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors flex items-center justify-center gap-2" style={{ fontFamily: BODY }}>
            <Upload size={13} /> Bulk Upload (CSV/Excel)
          </button>
        </div>

        {/* Right — result */}
        <div>
          {!showResults ? (
            <div className="border border-border h-full min-h-[300px] flex flex-col items-center justify-center gap-3" style={{ background: "var(--card)" }}>
              <BarChart2 size={28} style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>Select asset details to view market valuation</p>
            </div>
          ) : valuation.isPending ? (
            <div className="border border-border h-full min-h-[300px] flex flex-col items-center justify-center gap-3" style={{ background: "var(--card)" }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Estimating market value…</p>
            </div>
          ) : valuation.isError ? (
            <div className="border border-border p-8 flex items-start gap-4" style={{ background: "var(--card)", borderLeft: "3px solid var(--chart-4)" }}>
              <AlertTriangle className="w-6 h-6 mt-0.5 shrink-0" style={{ color: "var(--chart-4)" }} />
              <div>
                <p className="font-medium mb-1">Valuation service unavailable</p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {valuation.error instanceof Error ? valuation.error.message : "Unable to reach the pricing model. Try again shortly."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Net recovery */}
              <div className="border border-border p-6 flex items-start justify-between gap-6" style={{ background: "var(--card)" }}>
                <div>
                  <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Estimated Net Recovery</p>
                  <p className="text-5xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700, color: "var(--primary)" }}>
                    ${netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
                    Model confidence: {(confidence * 100).toFixed(0)}%
                    {valuation.data?.model_version && ` · ${valuation.data.model_version}`}
                  </p>
                </div>
                <DollarSign size={28} style={{ color: "var(--muted-foreground)" }} />
              </div>

              {/* Per unit + total */}
              <div className="grid grid-cols-2 gap-px border border-border" style={{ background: "var(--border)" }}>
                {[
                  { label: "Per Unit (Net)", val: `$${(netProfit / quantity).toFixed(2)}` },
                  { label: "Total Units", val: `${quantity}` },
                ].map(({ label, val }) => (
                  <div key={label} className="p-5" style={{ background: "var(--card)" }}>
                    <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{label}</p>
                    <p className="text-2xl" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Transparent deductions */}
              <div className="border border-border p-6" style={{ background: "var(--card)" }}>
                <p className="text-[10px] tracking-widest uppercase mb-5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Transparent Deductions</p>
                <div className="space-y-4">
                  <DeductionRow icon={DollarSign} label="Fair Market Value" sub={`$${fmvPerUnit.toFixed(2)} × ${quantity} unit${quantity === 1 ? "" : "s"}`}
                    value={`+$${estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} positive />
                  <DeductionRow icon={Truck} label="Estimated Shipping" sub="Prepaid labels included" value={`−$${shipping.toLocaleString()}`} />
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ border: "1px solid var(--border)", background: "var(--secondary)" }}>
                        <ShieldCheck size={13} style={{ color: "var(--muted-foreground)" }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ fontFamily: BODY }}>Data Wipe Service</p>
                        <p className="text-[10px]" style={{ color: "var(--muted-foreground)", fontFamily: BODY }}>NIST 800-88 certified (optional)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={includeDataWipe} onChange={(e) => setIncludeDataWipe(e.target.checked)}
                        className="accent-[var(--primary)]" style={{ width: 14, height: 14 }} />
                      <span className="text-sm tabular-nums" style={{ fontFamily: MONO }}>{includeDataWipe ? `−$${dataWipe.toLocaleString()}` : "$0"}</span>
                    </div>
                  </div>
                  <DeductionRow icon={Percent} label="Platform Fee" sub={`${formatFeeRate(fees?.seller_fee_free)} of gross value`}
                    value={`−$${platformFee.toFixed(2)}`} />
                  <div className="flex items-center justify-between pt-1">
                    <p className="font-medium">Net Payment</p>
                    <p className="text-2xl" style={{ fontFamily: DISPLAY, fontWeight: 700, color: "var(--primary)" }}>
                      ${netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
