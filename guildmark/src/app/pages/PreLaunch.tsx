/**
 * Pre-launch hero page — shown for all routes when didLaunch === false.
 *
 * Two sign-up paths:
 *   1. Waitlist  — IT teams wanting early access (source: "waitlist")
 *   2. Partner   — resellers, MSPs, refurbishers, etc. (source: "partner")
 */

import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import { useTranslation, Trans } from "react-i18next";
import {
  ArrowRight, Mail, Check, AlertCircle,
  Layers, Store, Truck, Shield, BarChart2,
  Lock, Zap, CheckCircle2, Users, Handshake,
} from "lucide-react";
import { apiUrl } from "../config";

interface PreLaunchContext {
  openInsights: () => void;
}

async function submitWaitlist(email: string): Promise<void> {
  const res = await fetch(`${apiUrl}/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, source: "waitlist" }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? "Something went wrong. Please try again.");
  }
}
// Small shared components
// ---------------------------------------------------------------------------

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function TrustBadge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-mono text-white bg-primary border rounded-full px-3 py-2">
      <Icon className="w-3.5 h-3.5 text-primary fill-white" />
      {text}
    </div>
  );
}

type Status = "idle" | "loading" | "success" | "error";

function WaitlistForm() {
  const { t } = useTranslation();
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await submitWaitlist(email.trim());
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl px-5 py-4">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground font-sans">{t("prelaunch.successTitle")}</p>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">{t("prelaunch.successBody")}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("prelaunch.emailPlaceholder")}
            required
            disabled={status === "loading"}
            className="w-full bg-input-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-sans rounded-lg transition-colors flex items-center gap-2 shrink-0"
        >
          {status === "loading" ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {t("prelaunch.joinButton")}
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs font-sans ml-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errorMsg}
        </p>
      )}
      <p className="text-xs text-muted-foreground font-sans ml-1">{t("prelaunch.noSpam")}</p>
    </form>
  );
}

const PARTNER_TYPES = [
  { value: "reseller",   label: "Reseller / VAR" },
  { value: "msp",        label: "Managed Service Provider (MSP)" },
  { value: "refurbisher",label: "Hardware Refurbisher" },
  { value: "itservices", label: "IT Services / Consultancy" },
  { value: "other",      label: "Other" },
];

function PartnerForm() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    name: "", company: "", partnerType: "", email: "", phone: "",
  });

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields(f => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate("/compliance/partner-loi", { state: fields });
  }

  const inputClass =
    "w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm font-sans text-black placeholder:text-black-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Your name"
          value={fields.name}
          onChange={set("name")}
          required
          disabled={status === "loading"}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Company name"
          value={fields.company}
          onChange={set("company")}
          required
          disabled={status === "loading"}
          className={inputClass}
        />
      </div>
      <select
        value={fields.partnerType}
        onChange={set("partnerType")}
        required
        disabled={status === "loading"}
        className={`${inputClass} text-${fields.partnerType ? "black" : "black-400"}`}
      >
        <option value="" disabled>What best describes your business?</option>
        {PARTNER_TYPES.map(pt => (
          <option key={pt.value} value={pt.value}>{pt.label}</option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="email"
            placeholder="Work email"
            value={fields.email}
            onChange={set("email")}
            required
            className={`${inputClass} pl-9`}
          />
        </div>
        <input
          type="tel"
          placeholder="Phone number"
          value={fields.phone}
          onChange={set("phone")}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-sans rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        Review LOI
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
      <p className="text-xs text-muted-foreground font-sans ml-1">
        You'll review and sign a Letter of Intent before we follow up.
      </p>
    </form>
  );
}

export function PreLaunch() {
  const { t }            = useTranslation();
  const { openInsights } = useOutletContext<PreLaunchContext>();
  const navigate         = useNavigate();

  return (
    <div className="px-6 py-16 space-y-20 max-w-3/4 mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-primary">
            {t("prelaunch.badge")}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center max-w-3xl leading-tight mb-5">
          <Trans
            i18nKey="prelaunch.headline"
            components={{ accent: <span className="text-primary" /> }}
          />
        </h1>

        <p className="text-lg text-muted-foreground text-center max-w-2xl leading-relaxed mb-12 font-sans">
          {t("prelaunch.description")}
        </p>
        <div className="flex 3xl:flex-row 3xl:space-x-16 space-y-4 flex-col">
          <div className="space-y-4">
            <h2 className="text-2xl font-sans font-bold">Sign up to stay in the loop on development.</h2>
            <p className="text-sm text-muted-foreground font-sans">
              We're offering mailing list and partner applications.</p>
        <div className="flex-2 w-full grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Waitlist card */}
          <div className="border border-primary rounded-xl p-6 space-y-4 text-left bg-background">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold font-sans">For IT Teams</h3>
                <p className="text-xs text-muted-foreground font-sans">Manage and sell retired hardware</p>
              </div>
            </div>
            <WaitlistForm />
          </div>

          {/* Partner card */}
          <div className="border border-primary rounded-xl p-6 space-y-4 text-left bg-background">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Handshake className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold font-sans">Become a Partner</h3>
                <p className="text-xs text-muted-foreground font-sans">Resellers, MSPs &amp; refurbishers</p>
              </div>
            </div>
            <PartnerForm />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <TrustBadge icon={Lock}   text="Escrow-secured payments" />
          <TrustBadge icon={Shield} text="NIST 800-88 certified wipe" />
          <TrustBadge icon={Zap}    text="Live market valuations" />
        </div>
      </div>

      <div className="space-y-4 max-w-5xl">
        <div className="text-center space-y-1 mb-8">
          <h2 className="text-2xl font-bold font-sans">One platform. Two powerful tools.</h2>
          <p className="text-sm text-muted-foreground font-sans">
            GuildMark combines fleet management with a B2B hardware marketplace — so you can
            track what you own, know what it's worth, and sell it when you're ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* AMPS */}
          <div className="border rounded-xl p-6 space-y-4 bg-background">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold font-sans">Guildmark PRO</h3>
                <p className="text-xs text-muted-foreground font-sans">Asset Management &amp; Portfolio Valuation System</p>
              </div>
            </div>
            <ul className="space-y-2">
              <FeatureItem>
                <strong>Depreciation analytics</strong> — real-time value tracking with AI "value cliff" warnings
              </FeatureItem>
              <FeatureItem>
                <strong>MDM sync</strong> — pull your fleet from Jamf Pro, Jamf School, or Microsoft Intune
              </FeatureItem>
              <FeatureItem>
                <strong>Portfolio overview</strong> — total fleet value, per-asset valuations, judged against MSRP, devaluation, and marketplace activity.
              </FeatureItem>
              <FeatureItem>
                <strong>Discounted platform fees</strong> - Sales from Growth* and Pro* accounts have discounted platform fees.
              </FeatureItem>
              <FeatureItem>
                <strong>Invoice generation</strong> — tax invoices for every sale, directly from the platform
              </FeatureItem>
            </ul>
          </div>

          <div className="border rounded-xl p-6 space-y-4 bg-background">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold font-sans">B2B Marketplace</h3>
                <p className="text-xs text-muted-foreground font-sans">Hardware trading between verified businesses</p>
              </div>
            </div>
            <ul className="space-y-2">
              <FeatureItem>
                <strong>List instantly</strong> — push assets directly to the marketplace with fair market prices, thanks to our AI-powered valuation engine
              </FeatureItem>
              <FeatureItem>
                <strong>Offer management</strong> — receive, counter, and accept offers with a full negotiation inbox
              </FeatureItem>
               <FeatureItem>
                <strong>CSV bulk import</strong> — upload hundreds of assets at once; market value calculated automatically
              </FeatureItem>
              <FeatureItem>
                <strong>The payment option you need</strong> — We are business tailored and offer a multitude of payment options: Escrow, Credit Card, ACH, and Net 30/60
              </FeatureItem>
              <FeatureItem>
                <strong>Optional data wipe</strong> — ship to our Orlando facility, get paid on arrival; Certified to your needs such as NIST 800-88, R2v3, HIPAA, and DOD
              </FeatureItem>
              <FeatureItem>
                <strong>Prepaid shipping</strong> — labels for 1–5 units or pallet pickup for 6+; or ship direct
              </FeatureItem>
            </ul>
          </div>
        </div>
      </div>
      </div>
</div>
      <div className="border rounded-xl p-8 bg-background space-y-6">
        <h2 className="text-sm font-sans uppercase tracking-wide text-muted-foreground">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              n: 1,
              title: "Import your fleet",
              body: "Connect your MDM or upload a CSV. GuildMark instantly values every asset against live market data.",
            },
            {
              n: 2,
              title: "List what you want to sell",
              body: "Push assets to the marketplace with one click. Buyers submit offers — you accept, counter, or decline.",
            },
            {
              n: 3,
              title: "Get paid, securely",
              body:"We offer multiple secure payment options through our trusted Payment Partners: Escrow, Credit Card, ACH, and Net 30/60",
            },
          ].map(({ n, title, body }) => (
            <div key={n} className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-sans font-bold shrink-0 mt-0.5">
                {n}
              </div>
              <div>
                <p className="text-sm font-semibold font-sans">{title}</p>
                <p className="text-xs text-muted-foreground font-sans mt-1 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-primary/20 bg-primary/5 rounded-xl p-8 space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-sans text-primary">$0</span>
          <span className="text-sm text-muted-foreground font-sans">to get started, only subscribe if you need <b>GuildMark Pro</b></span>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-2">
          {[
            { icon: BarChart2, label: "Platform fee", value: "12% on sale" },
            { icon: Shield,    label: "Data wipe",    value: "Flat rate / asset" },
            { icon: Truck,     label: "Shipping",     value: "Actual cost" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center space-y-1">
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-sm font-semibold font-sans">{value}</p>
              <p className="text-xs text-muted-foreground font-sans">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-10 pb-6 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10">

        <div className="flex flex-col gap-2">
          <img src="/img/logo-long.svg" className="w-36 " alt="GuildMark" />
          <p className="text-xs text-muted-foreground font-sans max-w-[180px] leading-relaxed">
            B2B hardware asset management &amp; marketplace.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:justify-end">

          <div className="space-y-2">
            <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground/60 mb-3">Platform</p>
            <button
              onClick={openInsights}
              className="block text-sm font-sans text-muted-foreground hover:text-primary transition-colors text-left"
            >
              {t("prelaunch.readResearch")}
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              {t("prelaunch.getInTouch")}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground/60 mb-3">Legal</p>
            <a
              href="/compliance/privacy-policy"
              className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/compliance/terms"
              className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
