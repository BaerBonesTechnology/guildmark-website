import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL ?? "https://api.guildmark.co";

interface PlatformFees {
  seller_fee_free:     number;
  seller_fee_starter:  number;
  seller_fee_growth:   number;
  seller_fee_pro:      number;
  buyer_fee:           number;
  deferral_fee:        number;
  data_wipe_price:     number;
  updated_at:          string;
  updated_by:          string | null;
}

function pct(v: number) { return parseFloat((v * 100).toFixed(2)); }

interface FieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  prefix?: string;
}

function FeeField({ label, description, value, onChange, suffix = "%", prefix }: FieldProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
      <div className="flex-1 min-w-0 mr-6">
        <p className="text-sm text-slate-200 font-mono">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {prefix && <span className="text-slate-400 font-mono text-sm">{prefix}</span>}
        <input
          type="number"
          step="0.01"
          min="0"
          max={suffix === "%" ? "100" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-slate-100 text-right focus:outline-none focus:border-blue-500"
        />
        {suffix && <span className="text-slate-400 font-mono text-sm w-4">{suffix}</span>}
      </div>
    </div>
  );
}

export function Pricing() {
  const { token } = useAuth();
  const [fees, setFees]       = useState<PlatformFees | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [status, setStatus]   = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Local editable state as strings — HTML inputs always yield strings,
  // so we store them that way and parse to number explicitly at save time.
  const [form, setForm] = useState({
    seller_fee_free:    "8.00",
    seller_fee_starter: "6.00",
    seller_fee_growth:  "5.00",
    seller_fee_pro:     "3.00",
    buyer_fee:          "3.00",
    deferral_fee:       "1.30",
    data_wipe_price:    "8.00",
  });

  useEffect(() => {
    fetch(`${API}/admin/config`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: PlatformFees) => {
        setFees(data);
        setForm({
          seller_fee_free:    String(pct(data.seller_fee_free)),
          seller_fee_starter: String(pct(data.seller_fee_starter)),
          seller_fee_growth:  String(pct(data.seller_fee_growth)),
          seller_fee_pro:     String(pct(data.seller_fee_pro)),
          buyer_fee:          String(pct(data.buyer_fee)),
          deferral_fee:       String(pct(data.deferral_fee)),
          data_wipe_price:    data.data_wipe_price.toFixed(2),
        });
      })
      .catch(() => setErrorMsg("Failed to load config"))
      .finally(() => setLoading(false));
  }, [token]);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (v: string) => setForm((f) => ({ ...f, [key]: v })),
  });

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      // Parse all form strings to numbers before sending — the API expects
      // fee rates as decimals (0.08 = 8%) and data_wipe_price as a dollar amount.
      const parse = (v: string) => parseFloat(v) || 0;
      const body = {
        seller_fee_free:    parse(form.seller_fee_free)    / 100,
        seller_fee_starter: parse(form.seller_fee_starter) / 100,
        seller_fee_growth:  parse(form.seller_fee_growth)  / 100,
        seller_fee_pro:     parse(form.seller_fee_pro)     / 100,
        buyer_fee:          parse(form.buyer_fee)          / 100,
        deferral_fee:       parse(form.deferral_fee)       / 100,
        data_wipe_price:    parse(form.data_wipe_price),
        updated_by:         "admin",
      };

      const res = await fetch(`${API}/admin/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `HTTP ${res.status}`);
      }

      const updated: PlatformFees = await res.json();
      setFees(updated);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      setErrorMsg((e as Error).message);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-lg font-mono text-white mb-1">Platform Pricing</h1>
        <p className="text-sm text-slate-500 font-mono">
          Fee rates applied at order creation. Changes take effect on new orders only.
        </p>
        {fees?.updated_at && (
          <p className="text-xs text-slate-600 font-mono mt-1">
            Last updated {new Date(fees.updated_at).toLocaleString()}
            {fees.updated_by ? ` by ${fees.updated_by}` : ""}
          </p>
        )}
      </div>

      {/* Seller fees */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 mb-6">
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Seller Fees</p>
        </div>
        <div className="px-4">
          <FeeField label="Free Plan" description="Applied to all free-tier sellers" {...field("seller_fee_free")} />
          <FeeField label="Starter Plan" description="Reduced fee for Starter subscribers" {...field("seller_fee_starter")} />
          <FeeField label="Growth Plan" description="Growth tier seller fee" {...field("seller_fee_growth")} />
          <FeeField label="Pro Plan" description="Lowest rate for Pro subscribers" {...field("seller_fee_pro")} />
        </div>
      </div>

      {/* Buyer & deferral fees */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 mb-6">
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Buyer & Payment Fees</p>
        </div>
        <div className="px-4">
          <FeeField label="Buyer Fee" description="Flat fee charged to buyer at checkout, all plans" {...field("buyer_fee")} />
          <FeeField label="Deferral Fee (Net-30/60)" description="Added to buyer total when payment is deferred" {...field("deferral_fee")} />
        </div>
      </div>

      {/* Service pricing */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 mb-8">
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Add-On Services</p>
        </div>
        <div className="px-4">
          <FeeField
            label="Data Wipe Service"
            description="Per-unit price charged to seller opting in at listing creation"
            suffix=""
            prefix="$"
            {...field("data_wipe_price")}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-mono rounded-lg transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>

        {status === "success" && (
          <div className="flex items-center gap-1.5 text-green-400 text-sm font-mono">
            <CheckCircle className="w-4 h-4" />
            Saved
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-1.5 text-red-400 text-sm font-mono">
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
