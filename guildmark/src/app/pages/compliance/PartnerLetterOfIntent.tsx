/**
 * Partner Letter of Intent — pre-launch sign-up flow.
 *
 * Reached via navigate("/compliance/partner-loi", { state: { ... } }) from
 * the PreLaunch partner form. Reads the partner's details from router state,
 * renders the LOI document with their info pre-filled, and calls POST /waitlist
 * with source: "partner" + loi_accepted: true on signature submission.
 *
 * If there is no router state (direct navigation), redirects to "/".
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Check, AlertCircle, FileText, PenLine } from "lucide-react";
import { apiUrl } from "../../config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PartnerLOIState {
  name:        string;
  company:     string;
  partnerType: string;
  email:       string;
  phone:       string;
}

const PARTNER_TYPE_LABELS: Record<string, string> = {
  reseller:    "Reseller / Value-Added Reseller (VAR)",
  msp:         "Managed Service Provider (MSP)",
  refurbisher: "Hardware Refurbisher",
  itservices:  "IT Services / Consultancy",
  other:       "Strategic Partner",
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

async function submitPartnerLOI(data: PartnerLOIState & { title: string }): Promise<void> {
  const res = await fetch(`${apiUrl}/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email:        data.email,
      source:       "partner",
      name:         data.name,
      company:      data.company,
      partner_type: data.partnerType,
      phone:        data.phone,
      loi_accepted: true,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? "Submission failed. Please try again.");
  }
}

// ---------------------------------------------------------------------------
// Document section helpers
// ---------------------------------------------------------------------------

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold font-mono">
        {n}. {title}
      </h2>
      <div className="space-y-2 text-sm text-foreground/80 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function Clause({ letter, children }: { letter: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 pl-4">
      <span className="font-mono text-muted-foreground shrink-0">({letter})</span>
      <p>{children}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Status = "idle" | "loading" | "success" | "error";

export function PartnerLetterOfIntent() {
  const location = useLocation();
  const navigate  = useNavigate();
  const state     = location.state as PartnerLOIState | null;

  const [title,    setTitle]   = useState("");
  const [agreed,   setAgreed]  = useState(false);
  const [signed,   setSigned]  = useState("");
  const [status,   setStatus]  = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Guard: no state means they navigated here directly.
  if (!state) {
    navigate("/", { replace: true });
    return null;
  }

  const today          = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const partnerLabel   = PARTNER_TYPE_LABELS[state.partnerType] ?? "Strategic Partner";
  const signatureMatch = signed.trim().toLowerCase() === state.name.trim().toLowerCase();
  const canSubmit      = agreed && signatureMatch && title.trim().length > 0 && status !== "loading";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await submitPartnerLOI({ ...state, title });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed. Please try again.");
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center py-16 space-y-6">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-mono">Letter of Intent Signed</h1>
          <p className="text-sm text-muted-foreground font-mono max-w-md">
            Thank you, {state.name.split(" ")[0]}. We've received your signed Letter of Intent
            and will be in touch within <strong>2 business days</strong> to discuss next steps
            and finalize your partnership agreement.
          </p>
        </div>
        <div className="bg-muted/50 border rounded-xl px-6 py-4 text-sm font-mono text-left max-w-md w-full space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Submission summary</p>
          <p><span className="text-muted-foreground">Name:</span> {state.name}</p>
          <p><span className="text-muted-foreground">Company:</span> {state.company}</p>
          <p><span className="text-muted-foreground">Type:</span> {partnerLabel}</p>
          <p><span className="text-muted-foreground">Email:</span> {state.email}</p>
          <p><span className="text-muted-foreground">LOI signed:</span> {today}</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-sm font-mono text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Return to home
        </button>
      </div>
    );
  }

  // ── Document ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10">

      {/* ── Document header ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-widest">
          <FileText className="w-3.5 h-3.5" />
          Non-Binding Letter of Intent
        </div>
        <h1 className="text-3xl font-bold font-mono leading-tight">
          GuildMark Partner<br />Letter of Intent
        </h1>
        <div className="text-sm font-mono text-muted-foreground space-y-0.5">
          <p>Date: {today}</p>
          <p>Reference: LOI-PARTNER-{state.email.split("@")[0].toUpperCase().replace(/[^A-Z0-9]/g, "")}-{new Date().getFullYear()}</p>
        </div>

        <div className="border rounded-xl p-5 bg-muted/30 grid grid-cols-2 gap-6 text-sm font-mono">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Party A — Platform Operator</p>
            <p className="font-semibold">Baerhous Media Group, LLC</p>
            <p className="text-muted-foreground">Operating as GuildMark™</p>
            <p className="text-muted-foreground">Orlando, Florida, USA</p>
            <p className="text-muted-foreground">legal@guildmark.co</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Party B — Prospective Partner</p>
            <p className="font-semibold">{state.company}</p>
            <p className="text-muted-foreground">{partnerLabel}</p>
            <p className="text-muted-foreground">{state.name}</p>
            <p className="text-muted-foreground">{state.email}</p>
          </div>
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <hr className="border-border" />

      {/* ── Document body ───────────────────────────────────────────────── */}
      <div className="space-y-8">

        <div className="text-sm leading-relaxed text-foreground/80 space-y-3">
          <p>
            This Letter of Intent ("<strong>LOI</strong>") is entered into as of {today} by and between
            Baerhous Media Group, LLC, operating as GuildMark™ ("<strong>GuildMark</strong>"), and {state.company}
            ("<strong>Partner</strong>"), a {partnerLabel}. This LOI sets forth the parties' mutual
            non-binding intent to explore and establish a commercial partnership in connection with the
            GuildMark platform, a B2B IT asset management and hardware marketplace.
          </p>
          <p>
            This LOI does not constitute a binding legal agreement. The parties intend to negotiate and
            execute a formal Partner Agreement following the conclusion of GuildMark's private beta period.
          </p>
        </div>

        <Section n={1} title="Background">
          <Para>
            GuildMark is developing a B2B platform that enables IT teams to manage hardware asset portfolios,
            track real-time depreciation, and buy or sell certified hardware through a secure escrow-backed
            marketplace. GuildMark also offers optional NIST 800-88 certified data destruction services
            through its Orlando, Florida facility.
          </Para>
          <Para>
            Partner has identified an opportunity to participate in the GuildMark ecosystem in the capacity
            of <strong>{partnerLabel}</strong> and has expressed interest in establishing a commercial
            relationship to that effect.
          </Para>
        </Section>

        <Section n={2} title="Proposed Partnership Structure">
          <Para>Subject to the negotiation and execution of a definitive Partner Agreement, the parties
            intend to explore the following collaboration:</Para>
          <Clause letter="a">
            <strong>Platform Access.</strong> GuildMark will provide Partner with access to the GuildMark
            marketplace, asset management tools, and applicable APIs under commercially reasonable terms
            to be defined in the Partner Agreement.
          </Clause>
          <Clause letter="b">
            <strong>Revenue Participation.</strong> The parties will negotiate in good faith the terms of
            any applicable revenue sharing, referral fees, volume discounts, or co-marketing arrangements.
            No financial commitments are made by this LOI.
          </Clause>
          <Clause letter="c">
            <strong>Data Wipe Services.</strong> Where applicable to Partner's business model, GuildMark
            will offer Partner access to its certified data destruction services at rates to be separately
            negotiated and memorialized in a service schedule attached to the Partner Agreement.
          </Clause>
          <Clause letter="d">
            <strong>Co-Marketing.</strong> The parties may explore joint marketing opportunities,
            co-branded materials, and referral programs, subject to mutual written agreement.
          </Clause>
        </Section>

        <Section n={3} title="Exclusivity and Priority Access">
          <Para>
            Partners who execute this LOI during GuildMark's private beta period will receive priority
            onboarding, dedicated partnership support, and early access to new platform features. GuildMark
            does not grant exclusive territory or market rights by virtue of this LOI alone.
          </Para>
          <Para>
            Any exclusivity provisions, if agreed upon, will be specifically addressed in the definitive
            Partner Agreement and will be subject to geographic scope, performance minimums, and duration
            limitations.
          </Para>
        </Section>

        <Section n={4} title="Confidentiality">
          <Para>
            In connection with the exploration of this partnership, the parties may share confidential
            information including but not limited to pricing models, customer data practices, technical
            architectures, and business strategies ("<strong>Confidential Information</strong>").
          </Para>
          <Clause letter="a">
            Each party agrees to hold the other's Confidential Information in strict confidence and not
            to disclose it to any third party without prior written consent.
          </Clause>
          <Clause letter="b">
            Confidential Information shall not include information that (i) is or becomes publicly
            available through no fault of the receiving party, (ii) was rightfully known prior to
            disclosure, or (iii) is independently developed without use of the Confidential Information.
          </Clause>
          <Clause letter="c">
            This confidentiality obligation shall survive the expiration or termination of this LOI for
            a period of two (2) years.
          </Clause>
        </Section>

        <Section n={5} title="Next Steps and Timeline">
          <Para>Following execution of this LOI, the parties intend to:</Para>
          <Clause letter="a">
            Schedule an introductory call within five (5) business days to discuss the proposed
            partnership in detail.
          </Clause>
          <Clause letter="b">
            Exchange any additional information required to evaluate the business opportunity.
          </Clause>
          <Clause letter="c">
            Negotiate and execute a definitive Partner Agreement within sixty (60) days of the
            GuildMark platform's general availability launch, subject to mutual agreement.
          </Clause>
        </Section>

        <Section n={6} title="Non-Binding Nature">
          <Para>
            This LOI is intended solely as an expression of the parties' mutual intent and does not
            create any legally binding obligation on either party to enter into the contemplated
            partnership or any other agreement, except with respect to the confidentiality provisions
            in Section 4, which shall be binding.
          </Para>
          <Para>
            Either party may withdraw from negotiations at any time and for any reason without liability
            to the other party, provided reasonable written notice is given.
          </Para>
        </Section>

        <Section n={7} title="Governing Law">
          <Para>
            This LOI shall be governed by and construed in accordance with the laws of the State of
            Florida, without regard to its conflict of law provisions. Any disputes arising from this
            LOI shall be resolved in the courts of Orange County, Florida.
          </Para>
        </Section>

      </div>

      {/* ── Signing section ─────────────────────────────────────────────── */}
      <div className="border-t border-border pt-10 space-y-6">
        <div className="flex items-center gap-2">
          <PenLine className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold font-mono">Sign this Letter of Intent</h2>
        </div>
        <p className="text-sm text-muted-foreground font-mono">
          By signing below, you confirm that you have read and understood this Letter of Intent and
          have authority to execute it on behalf of {state.company}.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Pre-filled fields (read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Company</label>
              <input
                readOnly
                value={state.company}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-foreground cursor-default"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Email</label>
              <input
                readOnly
                value={state.email}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-foreground cursor-default"
              />
            </div>
          </div>

          {/* Title — required, not pre-filled */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              Your Title / Role <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Chief Operating Officer, Director of IT"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={status === "loading"}
              className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Agreement checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                disabled={status === "loading"}
                className="sr-only"
              />
              <div
                onClick={() => setAgreed(!agreed)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                  agreed
                    ? "bg-primary border-primary"
                    : "border-border bg-input-background hover:border-primary"
                }`}
              >
                {agreed && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
            </div>
            <span className="text-sm font-mono text-foreground/80 leading-relaxed">
              I have read and understood this Letter of Intent and I am authorized to execute
              it on behalf of <strong>{state.company}</strong>.
            </span>
          </label>

          {/* Signature field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              Type your full name to sign <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder={state.name}
              value={signed}
              onChange={e => setSigned(e.target.value)}
              required
              disabled={status === "loading"}
              className={`w-full bg-input-background border rounded-lg px-3 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none transition-colors disabled:opacity-50 ${
                signed && !signatureMatch
                  ? "border-red-400 text-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/30"
                  : signed && signatureMatch
                  ? "border-emerald-500 text-foreground focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                  : "border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30"
              }`}
            />
            {signed && !signatureMatch && (
              <p className="text-xs font-mono text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                Must match the name you provided: {state.name}
              </p>
            )}
            {signed && signatureMatch && (
              <p className="text-xs font-mono text-emerald-500 flex items-center gap-1.5">
                <Check className="w-3 h-3" />
                Signature matches
              </p>
            )}
          </div>

          {status === "error" && (
            <p className="flex items-center gap-1.5 text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-mono rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <PenLine className="w-4 h-4" />
                Sign &amp; Submit Letter of Intent
              </>
            )}
          </button>

          <p className="text-xs text-muted-foreground font-mono text-center">
            By submitting, you agree that your typed name constitutes your electronic signature
            under applicable e-signature laws.
          </p>
        </form>
      </div>

    </div>
  );
}
