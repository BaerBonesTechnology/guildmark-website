import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useWaitlistViewModel } from "../../viewmodels/useWaitlistViewModel";
import { earlyAccessPayload, partnerLoiDetails } from "../../services/earlyAccess.service";
import { REFRESH_SIZE_OPTIONS, SUPPLY_ROLE_OPTIONS, SUPPLY_VOLUME_OPTIONS, PARTNER_SERVICE_OPTIONS, PARTNER_COVERAGE_OPTIONS } from "../../constants/preLaunch.constants";

type Audience = "team" | "supply" | "partner";
const audiences: { id: Audience; label: string; copy: string }[] = [
  { id: "team", label: "Asset owners", copy: "Planning an IT refresh? Tell us about your device inventory and join the AMPS early-access list." },
  { id: "supply", label: "Resellers", copy: "Bring your inventory to GuildMark. Register your interest as a reseller, broker, or ITAD provider." },
  { id: "partner", label: "Service partners", copy: "Help equipment reach its next owner. Apply to the partner network for logistics, refurbishment, and asset disposition." },
];

export function EarlyAccess() {
  const [audience, setAudience] = useState<Audience>("team");
  return <section id="early-access" className="gm-access"><div className="gm-container gm-access-grid">
    <div><p className="gm-eyebrow"><span className="gm-status-dot" /> Early access</p><h2>Bring your next<br />IT refresh into view.</h2><p>Tell us what you own, what you supply or which services you provide. We’re preparing early access with each role in mind.</p><div className="gm-audience-tabs" role="group" aria-label="Choose your audience">{audiences.map(item => <button key={item.id} type="button" aria-pressed={audience === item.id} onClick={() => setAudience(item.id)}>{item.label}<ArrowRight size={16} /></button>)}</div><p className="gm-access-caption">Joining the list does not start a paid subscription.</p></div>
    <AccessForm key={audience} audience={audience} />
  </div></section>;
}

function AccessForm({ audience }: { audience: Audience }) {
  const navigate = useNavigate();
  const { status, error, submit } = useWaitlistViewModel();
  const [accepted, setAccepted] = useState(false);
  const current = audiences.find(item => item.id === audience)!;
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    const data = new FormData(event.currentTarget);
    if (audience === "partner") {
      if (!accepted) return;
      navigate("/compliance/partner-loi", { state: partnerLoiDetails(data) });
      return;
    }
    void submit(earlyAccessPayload(data, audience));
  }
  const select = (name: string, label: string, options: string[], required = false) => <label className="gm-field">{label}<select name={name} defaultValue="" required={required}><option value="">Select an option</option>{options.map(option => <option key={option}>{option}</option>)}</select></label>;
  return <div className="gm-access-form"><p className="gm-form-kicker">For {current.label.toLowerCase()}</p><h3>{audience === "partner" ? "Apply to the network." : "Let’s stay in touch."}</h3><p>{current.copy}</p>
    {status === "success" ? <div className="gm-form-success" role="status"><Check size={24} /><h4>You’re on the list.</h4><p>Thanks for your interest. We’ll be in touch about early access.</p></div> : <form onSubmit={onSubmit}>
      {audience === "partner" && <label className="gm-field">Contact name<input name="name" autoComplete="name" required placeholder="Your full name" /></label>}
      <label className="gm-field">Work email<input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
      <label className="gm-field">Organization <span>(optional)</span><input name="company" autoComplete="organization" placeholder="Company name" /></label>
      {audience === "team" && select("size", "Estimated refresh size", REFRESH_SIZE_OPTIONS)}
      {audience === "supply" && <>{select("role", "Your role", SUPPLY_ROLE_OPTIONS, true)}{select("volume", "Average monthly supply volume", SUPPLY_VOLUME_OPTIONS)}</>}
      {audience === "partner" && <>{select("service", "Primary service", PARTNER_SERVICE_OPTIONS)}{select("coverage", "Geographic coverage", PARTNER_COVERAGE_OPTIONS)}<label className="gm-consent"><input type="checkbox" required checked={accepted} onChange={event => setAccepted(event.target.checked)} /><span>I have read the <Link to="/compliance/terms" target="_blank">Terms of Service</Link> and agree to review and sign the GuildMark Partner Letter of Intent before proceeding.</span></label></>}
      {status === "error" && <p className="gm-form-error" role="alert">{error}</p>}
      <button className="gm-button gm-button-primary" type="submit" disabled={status === "loading" || (audience === "partner" && !accepted)}>{status === "loading" ? "Submitting…" : audience === "partner" ? "Continue to Letter of Intent" : "Request early access"}<ArrowRight size={17} /></button>
      <p className="gm-form-note">{audience === "partner" ? "Your application is reviewed before approval." : "Updates about GuildMark. No noise. No obligation."}</p>
    </form>}
  </div>;
}
