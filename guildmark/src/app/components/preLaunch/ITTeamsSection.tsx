/** Pre-launch section 1 — IT Teams waitlist hero + form. */
import { useState } from "react";
import { FormError } from "./FormError";
import { SubmitButton } from "./SubmitButton";
import { SubmitSuccess } from "./SubmitSuccess";
import { FIELD_CLASS, FIELD_STYLE, LABEL_CLASS, REFRESH_SIZE_OPTIONS } from "../../constants/preLaunch.constants";
import { BODY, DISPLAY, MONO } from "../../constants/typography";
import { formatFeeRate, usePlatformFees } from "../../lib/apiHooks";
import { useWaitlistViewModel } from "../../viewmodels/useWaitlistViewModel";

export function ITTeamsSection() {
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [size, setSize] = useState("");
  const { status, error, submit } = useWaitlistViewModel();
  const { data: fees } = usePlatformFees();
  const sellerFee = formatFeeRate(fees?.seller_fee_free);

  function onSubmit(evt: React.FormEvent) {
    evt.preventDefault();
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
      <div className="flex-1 flex justify-items-center">
        <div className="max-w-[1800px] mx-auto px-8 md:px-20 w-full py-24">
          <div className="grid md:grid-cols-[3fr_2fr] gap-16 md:gap-24 items-center">
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
                  `${sellerFee} platform fee. $0 to list.`,
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
                    <label className={LABEL_CLASS}>Work email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com" className={FIELD_CLASS} style={FIELD_STYLE} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Organization</label>
                    <input type="text" value={org} onChange={(e) => setOrg(e.target.value)}
                      placeholder="Company name" className={FIELD_CLASS} style={FIELD_STYLE} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Estimated refresh size</label>
                    <select value={size} onChange={(e) => setSize(e.target.value)}
                      className={`${FIELD_CLASS} appearance-none`} style={FIELD_STYLE}>
                      <option value="">Select range</option>
                      {REFRESH_SIZE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
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
