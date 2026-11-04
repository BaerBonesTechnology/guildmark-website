/**
 * MarketCalculator — "Market Pulse" valuation calculator (View).
 * Form state, valuation lookup, and the net-recovery math live in
 * useMarketCalculatorViewModel; this file is presentation only.
 */
import { AlertTriangle, BarChart2, DollarSign, Loader2, Percent, ShieldCheck, Truck, Upload } from "lucide-react";
import { DeductionRow } from "../components/calculator/DeductionRow";
import { FieldLabel } from "../components/calculator/FieldLabel";
import {
  BRAND_OPTIONS, CONDITION_OPTIONS, CPU_OPTIONS, MODEL_OPTIONS, RAM_OPTIONS,
} from "../constants/calculator.constants";
import { BODY, DISPLAY, MONO } from "../constants/typography";
import { formatFeeRate } from "../lib/apiHooks";
import { useMarketCalculatorViewModel } from "../viewmodels/useMarketCalculatorViewModel";

const selectClass = "w-full px-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary transition-colors appearance-none";
const inputClass = "w-full px-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary transition-colors";
const fieldStyle = { fontFamily: BODY, background: "var(--input-background)" } as const;

export function MarketCalculator() {
  const {
    ageMonths, brand, condition, confidence, cpu, fees, fmvPerUnit, includeDataWipe,
    model, platformFeePct, quantity, ram, recovery, setAgeMonths, setBrand, setCondition, setCpu,
    setIncludeDataWipe, setModel, setQuantity, setRam, showResults, valuation,
  } = useMarketCalculatorViewModel();

  const { dataWipe, estimatedValue, netProfit, platformFee, shipping } = recovery;

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
                {BRAND_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div>
              <FieldLabel>Model</FieldLabel>
              <select value={model} onChange={(e) => setModel(e.target.value)} className={selectClass} style={fieldStyle}>
                <option value="">Select...</option>
                {MODEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div>
              <FieldLabel>CPU</FieldLabel>
              <select value={cpu} onChange={(e) => setCpu(e.target.value)} className={selectClass} style={fieldStyle}>
                <option value="">Select...</option>
                {CPU_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div>
              <FieldLabel>RAM</FieldLabel>
              <select value={ram} onChange={(e) => setRam(e.target.value)} className={selectClass} style={fieldStyle}>
                <option value="">Select...</option>
                {RAM_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div>
              <FieldLabel>Condition</FieldLabel>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className={selectClass} style={fieldStyle}>
                <option value="">Select...</option>
                {CONDITION_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
                  <DeductionRow icon={Percent} label="Platform Fee" sub={`${formatFeeRate(platformFeePct)} of gross value${fees ? '' : ' · default estimate'}`}
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
