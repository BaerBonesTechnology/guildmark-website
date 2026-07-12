/** Pre-launch section 3 — partner network application (hands off to LOI flow). */
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
  FIELD_CLASS, FIELD_STYLE, LABEL_CLASS, PARTNER_COVERAGE_OPTIONS, PARTNER_PERKS, PARTNER_SERVICE_OPTIONS,
} from "../../constants/preLaunch.constants";
import { BODY, DISPLAY, MONO } from "../../constants/typography";

export function PartnerNetworkSection() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [services, setServices] = useState("");
  const [coverage, setCoverage] = useState("");
  const [accepted, setAccepted] = useState(false);

  const canApply = name.trim() !== "" && email.trim() !== "" && accepted;

  function onSubmit(evt: React.FormEvent) {
    evt.preventDefault();
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
        <div className="max-w-[1800px] mx-auto px-8 md:px-20 w-full py-28">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end mb-14">

          </div>

          <div className="grid md:grid-cols-[3fr_2fr] gap-16 md:gap-24 items-start">

            <div className="space-y-8">
              <h2 className="leading-[0.93] tracking-tight"
              style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(2.8rem, 6vw, 5rem)" }}>
              GuildMark helps you<br />
              advertise your services<br />
              to buyers who are<br />
              already looking.
            </h2>

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
            </div>

            <div className="p-6">
              <div className="shrink-0 justify-self-end pb-1 max-w-fit mb-2">
              <div className="shrink px-4 py-2 border text-xs font-mono tracking-widest"
                style={{ borderColor: "var(--primary)", color: "var(--primary)", fontFamily: MONO }}>
                PARTNER NETWORK
              </div>
            </div>
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
                    <label className={LABEL_CLASS}>Contact name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Full name" className={FIELD_CLASS} style={FIELD_STYLE} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Work email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@itadcompany.com" className={FIELD_CLASS} style={FIELD_STYLE} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Company name</label>
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                      placeholder="ITAD provider name" className={FIELD_CLASS} style={FIELD_STYLE} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Services offered</label>
                    <select value={services} onChange={(e) => setServices(e.target.value)}
                      className={`${FIELD_CLASS} appearance-none`} style={FIELD_STYLE}>
                      <option value="">Select primary service</option>
                      {PARTNER_SERVICE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Geographic coverage</label>
                    <select value={coverage} onChange={(e) => setCoverage(e.target.value)}
                      className={`${FIELD_CLASS} appearance-none`} style={FIELD_STYLE}>
                      <option value="">Select coverage</option>
                      {PARTNER_COVERAGE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                    <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
                      className="mt-0.5 shrink-0 accent-[var(--primary)]" style={{ width: 15, height: 15 }} />
                    <span className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: BODY }}>
                      I have read  the <Link to='/compliance/terms' target="_blank"> Terms of Service </Link> and agree to review and sign the GuildMark Partner Letter of Intent
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
