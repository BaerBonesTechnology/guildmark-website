/**
 * Pre-launch hero — the canonical GuildMark landing experience.
 *
 * Three full-height audience panels (IT teams / supply side / partner
 * network), each with its own early-access form wired to the real
 * POST /waitlist endpoint. The backend stores `source` plus the extra
 * fields (company / role / services…) as notes, so every submission is
 * segmentable by audience.
 *
 * Design language: Barlow Condensed display, DM Sans body, JetBrains Mono
 * labels; sharp borders; layered section backgrounds (--section-1/2/3).
 */

import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { useTheme } from "../hooks/useTheme";
import {
  ArrowRight, CheckCircle2, Sun, Moon, BookOpen,
  Server, RefreshCw, Users, BarChart3, ShieldCheck, Zap, Globe, Award,
} from "lucide-react";
import { apiUrl } from "../config";
import logoLong from "../../logo-long.svg";

interface PreLaunchContext {
  openInsights: () => void;
}

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

// ── Waitlist wiring ─────────────────────────────────────────────────────────

interface WaitlistPayload {
  email: string;
  source: string;
  company?: string;
  partner_type?: string;
}

type Status = "idle" | "loading" | "success" | "error";

function useWaitlist() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(payload: WaitlistPayload) {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${apiUrl}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return { status, error, submit };
}

function SubmitSuccess({ audience }: { audience: string }) {
  return (
    <div className="border border-border p-5 flex items-start gap-4 mt-2" style={{ background: "var(--card)" }}>
      <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
      <div>
        <p className="text-sm font-medium mb-1" style={{ fontFamily: BODY }}>You're on the list.</p>
        <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: BODY }}>
          We'll reach out as {audience} access opens. Expect a short onboarding call.
        </p>
      </div>
    </div>
  );
}

const fieldClass =
  "w-full px-3 py-2.5 text-sm border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";
const fieldStyle = { fontFamily: BODY, background: "var(--input-background)" } as const;
const labelClass = "block text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-2";

function FormError({ msg }: { msg: string }) {
  return <p className="text-xs text-destructive" style={{ fontFamily: BODY }}>{msg}</p>;
}

function SubmitButton({ status, label, filled = true }: { status: Status; label: string; filled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={status === "loading"}
      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{
        background: filled ? "var(--primary)" : "var(--secondary)",
        color: filled ? "#fff" : "var(--foreground)",
        fontFamily: BODY,
      }}
    >
      {status === "loading" ? (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight size={14} />
        </>
      )}
    </button>
  );
}

// ── Section 1 — IT Teams (waitlist) ─────────────────────────────────────────

function ITTeamsSection() {
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [size, setSize] = useState("");
  const { status, error, submit } = useWaitlist();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    void submit({
      email: email.trim(),
      source: "waitlist",
      company: org.trim() || undefined,
      partner_type: size ? `Refresh size: ${size}` : undefined,
    });
  }

  return (
    <section className="flex flex-col" style={{ background: "var(--section-1)" }}>
      <div className="flex-1 flex items-center">
        <div className="max-w-[1600px] mx-auto px-8 md:px-20 w-full py-24">
          <div className="grid md:grid-cols-[3fr_1fr] gap-16 md:gap-24 items-center">
            <div>
              <h1 className="leading-[0.93] tracking-tight mb-7"
                style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(3.2rem, 7.5vw, 6rem)" }}>
                GuildMark helps you<br />
                stop leaving money<br />
                on the table when<br />
                you refresh hardware.
              </h1>
              <p className="text-base leading-relaxed max-w-md mb-8"
                style={{ color: "var(--muted-foreground)", fontFamily: BODY, fontWeight: 300 }}>
                A direct path for IT teams to sell end-of-lease and surplus equipment at fair
                market value — no brokers skimming margin, no spreadsheet chaos.
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  "Instant valuations against live market data",
                  "Certified listings — graded, spec-disclosed",
                  "8% platform fee. $0 to list.",
                ].map((pt) => (
                  <div key={pt} className="flex items-center gap-2.5">
                    <div className="w-1 h-1 rounded-full shrink-0" style={{ background: "var(--primary)" }} />
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: BODY }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border p-7" style={{ background: "var(--card)" }}>
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-1"
                style={{ color: "var(--primary)", fontFamily: MONO }}>Early Access</p>
              <h2 className="text-2xl mb-1" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>Join the waitlist.</h2>
              <p className="text-xs text-muted-foreground mb-6" style={{ fontFamily: BODY }}>
                We're onboarding IT teams ahead of launch. Access is limited.
              </p>
              {status === "success" ? (
                <SubmitSuccess audience="IT team" />
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className={labelClass}>Work email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com" className={fieldClass} style={fieldStyle} />
                  </div>
                  <div>
                    <label className={labelClass}>Organization</label>
                    <input type="text" value={org} onChange={(e) => setOrg(e.target.value)}
                      placeholder="Company name" className={fieldClass} style={fieldStyle} />
                  </div>
                  <div>
                    <label className={labelClass}>Estimated refresh size</label>
                    <select value={size} onChange={(e) => setSize(e.target.value)}
                      className={`${fieldClass} appearance-none`} style={fieldStyle}>
                      <option value="">Select range</option>
                      <option>Under 50 units</option>
                      <option>50 – 200 units</option>
                      <option>200 – 1,000 units</option>
                      <option>1,000+ units</option>
                    </select>
                  </div>
                  {status === "error" && <FormError msg={error} />}
                  <SubmitButton status={status} label="Request early access" />
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 2 — Supply side ─────────────────────────────────────────────────

const SUPPLY_BENEFITS = [
  { icon: Globe, title: "Reach verified buyers directly", body: "List once, reach hundreds of vetted IT teams actively looking for certified supply — no cold calls, no brokered leads." },
  { icon: BarChart3, title: "Market-rate pricing intelligence", body: "GuildMark surfaces live comparable sales data so you list at the right price the first time, not the wrong one." },
  { icon: ShieldCheck, title: "Certification builds buyer trust", body: "Our grading and disclosure standards give buyers confidence to transact without inspections or back-and-forth." },
  { icon: Zap, title: "Bulk listings via CSV or MDM sync", body: "Upload your full inventory in minutes. GuildMark structures and publishes each listing with the right fields automatically." },
];

function SupplySection() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [volume, setVolume] = useState("");
  const { status, error, submit } = useWaitlist();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    void submit({
      email: email.trim(),
      source: "supply",
      partner_type: [role, volume && `Volume: ${volume}`].filter(Boolean).join(" · ") || undefined,
    });
  }

  return (
    <section className="flex items-center border-t border-border" style={{ background: "var(--section-2)" }}>
      <div className="max-w-[1600px] mx-auto px-8 md:px-20 w-full py-28">
        <div className="grid md:grid-cols-[1fr_3fr] gap-16 md:gap-24 items-start">
          <div>
            <h2 className="leading-[0.95] tracking-tight mb-6"
              style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(2.6rem, 5vw, 4.2rem)" }}>
              GuildMark helps you<br />
              list your supply and<br />
              skip the middleman.
            </h2>
            <p className="text-sm leading-relaxed mb-8 max-w-sm"
              style={{ color: "var(--muted-foreground)", fontFamily: BODY, fontWeight: 300 }}>
              Early access for resellers, ITAD providers, and brokers to list inventory directly
              on the GuildMark exchange ahead of public launch.
            </p>
            <div className="border border-border p-6" style={{ background: "var(--card)" }}>
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-4 text-muted-foreground" style={{ fontFamily: MONO }}>
                Supply-Side Early Access
              </p>
              {status === "success" ? (
                <SubmitSuccess audience="supply-side" />
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className={labelClass}>Work email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com" className={fieldClass} style={fieldStyle} />
                  </div>
                  <div>
                    <label className={labelClass}>Your role</label>
                    <select required value={role} onChange={(e) => setRole(e.target.value)}
                      className={`${fieldClass} appearance-none`} style={fieldStyle}>
                      <option value="">Select your role</option>
                      <option>MSR — Managed Service Reseller</option>
                      <option>ITAD — IT Asset Disposition</option>
                      <option>Broker / Independent reseller</option>
                      <option>OEM / Manufacturer</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Avg. monthly supply volume</label>
                    <select value={volume} onChange={(e) => setVolume(e.target.value)}
                      className={`${fieldClass} appearance-none`} style={fieldStyle}>
                      <option value="">Select range</option>
                      <option>Under $25k</option>
                      <option>$25k – $100k</option>
                      <option>$100k – $500k</option>
                      <option>Over $500k</option>
                    </select>
                  </div>
                  {status === "error" && <FormError msg={error} />}
                  <SubmitButton status={status} label="Apply for early access" />
                </form>
              )}
            </div>
          </div>

          <div className="space-y-0 divide-y divide-border border-t border-b border-border">
            {SUPPLY_BENEFITS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="py-6 flex gap-5 items-start">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5"
                  style={{ border: "1px solid var(--border)", background: "var(--secondary)" }}>
                  <Icon size={14} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1.5" style={{ fontFamily: BODY }}>{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: BODY, fontWeight: 300 }}>{body}</p>
                </div>
              </div>
            ))}
            <div className="py-6">
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                {[{ val: "$0", label: "To list" }, { val: "8%", label: "On sale only" }].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-3xl mb-1" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{s.val}</div>
                    <div className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase" style={{ fontFamily: MONO }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 3 — Partner network ─────────────────────────────────────────────

const PARTNER_PERKS = [
  { icon: Award, title: "GuildMark Certified Partner badge", body: "Display your certification on your website, proposals, and email — buyers actively filter for Certified Partners." },
  { icon: Users, title: "Inbound referral leads", body: "When IT teams need ITAD services on the platform, Certified Partners are presented first. No ad spend required." },
  { icon: Server, title: "Co-branded pickup & processing", body: "Offer pickup, data destruction, and logistics as add-on services directly within GuildMark transactions." },
  { icon: RefreshCw, title: "Closed-loop asset recovery", body: "Receive unsold inventory from the exchange for downstream remarketing, recycling, or parts — your choice." },
];

function PartnerNetworkSection() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [services, setServices] = useState("");
  const [coverage, setCoverage] = useState("");
  const [accepted, setAccepted] = useState(false);

  const canApply = name.trim() !== "" && email.trim() !== "" && accepted;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canApply) return;
    // Hand off to the LOI flow — the partner reviews and signs the Letter of
    // Intent, which POSTs /waitlist with loi_accepted: true on signature.
    navigate("/compliance/partner-loi", {
      state: {
        name: name.trim(),
        company: company.trim(),
        partnerType: [services, coverage].filter(Boolean).join(" · "),
        email: email.trim(),
        phone: "",
      },
    });
  }

  return (
    <section className="flex flex-col border-t border-border" style={{ background: "var(--section-3)" }}>
      <div className="flex-1 flex items-center">
        <div className="max-w-[1600px] mx-auto px-8 md:px-20 w-full py-28">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end mb-14">
            <h2 className="leading-[0.93] tracking-tight"
              style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(2.8rem, 6vw, 5rem)" }}>
              GuildMark helps you<br />
              advertise your services<br />
              to buyers who are<br />
              already looking.
            </h2>
            <div className="shrink-0 self-end pb-1">
              <div className="px-4 py-2 border text-xs font-mono tracking-widest"
                style={{ borderColor: "var(--primary)", color: "var(--primary)", fontFamily: MONO }}>
                PARTNER NETWORK
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[3fr_1fr] gap-16 md:gap-24 items-start">
            <div className="grid sm:grid-cols-2 gap-px border border-border" style={{ background: "var(--border)" }}>
              {PARTNER_PERKS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="p-6 flex flex-col gap-4" style={{ background: "var(--card)" }}>
                  <div className="w-9 h-9 flex items-center justify-center"
                    style={{ border: "1px solid var(--border)", background: "var(--secondary)" }}>
                    <Icon size={15} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2" style={{ fontFamily: BODY }}>{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: BODY, fontWeight: 300 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="border border-border p-6" style={{ background: "var(--card)" }}>
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-1 text-muted-foreground" style={{ fontFamily: MONO }}>
                  Partner Application
                </p>
                <h3 className="text-xl mb-1" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>Apply to the network.</h3>
                <p className="text-xs text-muted-foreground mb-6" style={{ fontFamily: BODY }}>
                  We review ITAD providers individually. Certified Partners are listed in the GuildMark
                  directory and receive inbound referrals at launch.
                </p>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className={labelClass}>Contact name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Full name" className={fieldClass} style={fieldStyle} />
                  </div>
                  <div>
                    <label className={labelClass}>Work email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@itadcompany.com" className={fieldClass} style={fieldStyle} />
                  </div>
                  <div>
                    <label className={labelClass}>Company name</label>
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                      placeholder="ITAD provider name" className={fieldClass} style={fieldStyle} />
                  </div>
                  <div>
                    <label className={labelClass}>Services offered</label>
                    <select value={services} onChange={(e) => setServices(e.target.value)}
                      className={`${fieldClass} appearance-none`} style={fieldStyle}>
                      <option value="">Select primary service</option>
                      <option>Full ITAD — pickup, wipe, resale</option>
                      <option>Data destruction only</option>
                      <option>Logistics & pickup</option>
                      <option>Refurbishment & remarketing</option>
                      <option>End-of-life recycling (R2/e-Stewards)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Geographic coverage</label>
                    <select value={coverage} onChange={(e) => setCoverage(e.target.value)}
                      className={`${fieldClass} appearance-none`} style={fieldStyle}>
                      <option value="">Select coverage</option>
                      <option>National</option>
                      <option>Regional — Northeast</option>
                      <option>Regional — Southeast</option>
                      <option>Regional — Midwest</option>
                      <option>Regional — West</option>
                      <option>International</option>
                    </select>
                  </div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                    <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
                      className="mt-0.5 shrink-0 accent-[var(--primary)]" style={{ width: 15, height: 15 }} />
                    <span className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: BODY }}>
                      I have read and agree to review and sign the GuildMark Partner Letter of Intent
                      before proceeding.
                    </span>
                  </label>
                  <button type="submit" disabled={!canApply}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "var(--primary)", color: "#fff", fontFamily: BODY }}>
                    Continue to Letter of Intent
                    <ArrowRight size={14} />
                  </button>
                </form>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed px-1" style={{ fontFamily: BODY }}>
                Partner listings are reviewed within 5 business days. We verify certifications
                (R2, e-Stewards, NAID) and service capabilities before approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Header / footer (page owns its own chrome) ──────────────────────────────

function PreLaunchHeader({ openInsights }: { openInsights: () => void }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="border-b border-border sticky top-0 z-50" style={{ background: "var(--background)", backdropFilter: "blur(8px)" }}>
      <div className="px-8 md:px-20 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={logoLong} className="h-6" alt="GuildMark" />
          <span className="text-[9px] font-mono tracking-[0.15em] text-muted-foreground border border-border px-2 py-0.5 hidden sm:block" style={{ fontFamily: MONO }}>
            IT ASSET MARKETPLACE
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={openInsights}
            className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: BODY }}>
            <BookOpen size={14} />
            Market Research
          </button>
          <div className="w-px h-4 bg-border hidden md:block" />
          <span className="text-[10px] font-mono tracking-widest items-center gap-1.5 hidden sm:flex" style={{ color: "var(--primary)", fontFamily: MONO }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--primary)" }} />
            Early Access
          </span>
          <Link to="/pre/marketplace"
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 hover:opacity-90 transition-opacity"
            style={{ background: "var(--primary)", color: "#fff", fontFamily: BODY }}>
            Demo the platform
            <ArrowRight size={13} />
          </Link>
          <button onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function PreLaunchFooter({ openInsights }: { openInsights: () => void }) {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1600px] mx-auto px-8 md:px-20 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-mono text-muted-foreground" style={{ fontFamily: MONO }}>
            © {new Date().getFullYear()} Baerhous Media Group, LLC — GuildMark™
          </p>
          <div className="flex gap-5 mt-1">
            <button onClick={openInsights} className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: MONO }}>
              Market Research
            </button>
            <a href="/compliance/privacy-policy" className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: MONO }}>
              Privacy Policy
            </a>
            <a href="/compliance/terms" className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: MONO }}>
              Terms of Service
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/pre/marketplace"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-mono border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            style={{ fontFamily: MONO }}>
            Preview the marketplace
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────

export function PreLaunch() {
  const { openInsights } = useOutletContext<PreLaunchContext>();
  return (
    <>
      <PreLaunchHeader openInsights={openInsights} />
      <ITTeamsSection />
      <SupplySection />
      <PartnerNetworkSection />
      <PreLaunchFooter openInsights={openInsights} />
    </>
  );
}
