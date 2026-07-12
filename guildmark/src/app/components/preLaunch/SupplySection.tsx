/** Pre-launch section 2 — supply-side (resellers/ITAD) early access. */
import { useState } from "react";
import { FormError } from "./FormError";
import { SubmitButton } from "./SubmitButton";
import { SubmitSuccess } from "./SubmitSuccess";
import {
  FIELD_CLASS, FIELD_STYLE, LABEL_CLASS, SUPPLY_BENEFITS, SUPPLY_ROLE_OPTIONS, SUPPLY_VOLUME_OPTIONS,
} from "../../constants/preLaunch.constants";
import { BODY, DISPLAY, MONO } from "../../constants/typography";
import { formatFeeRate, usePlatformFees } from "../../lib/apiHooks";
import { useWaitlistViewModel } from "../../viewmodels/useWaitlistViewModel";

export function SupplySection() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [volume, setVolume] = useState("");
  const { status, error, submit } = useWaitlistViewModel();
  const { data: fees } = usePlatformFees();

  function onSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    if (!email.trim() || status === "loading") return;
    void submit({
      email: email.trim(),
      source: "supply",
      partner_type: [role, volume && `Volume: ${volume}`].filter(Boolean).join(" · ") || undefined,
    });
  }

  return (
    <section className="flex items-center border-t border-border" style={{ background: "var(--section-2)" }}>
      <div className="max-w-[1800px] mx-auto px-8 md:px-20 w-full py-28">
        <div className="grid md:grid-cols-[2fr_3fr] gap-16 md:gap-24 items-start">
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
                    <label className={LABEL_CLASS}>Work email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com" className={FIELD_CLASS} style={FIELD_STYLE} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Your role</label>
                    <select required value={role} onChange={(e) => setRole(e.target.value)}
                      className={`${FIELD_CLASS} appearance-none`} style={FIELD_STYLE}>
                      <option value="">Select your role</option>
                      {SUPPLY_ROLE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Avg. monthly supply volume</label>
                    <select value={volume} onChange={(e) => setVolume(e.target.value)}
                      className={`${FIELD_CLASS} appearance-none`} style={FIELD_STYLE}>
                      <option value="">Select range</option>
                      {SUPPLY_VOLUME_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  {status === "error" && <FormError msg={error} />}
                  <SubmitButton status={status} label="Apply for early access" />
                </form>
              )}
            </div>
          </div>

          <div className="space-y-0 divide-y divide-border border-t border-border">
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
              <div className="grid grid-cols-4 gap-8 ">
                {[{ val: "$0", label: "To list" },
                { val: formatFeeRate(fees?.seller_fee_free), label: "On sale only" },
                { val: "NIST 800-08", label: "Data sanitization mid-transit*" },
                { val: "Audit Compliant", label: "Certified grading & disclosure*" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-3xl mb-1" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{s.val}</div>
                    <div className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase" style={{ fontFamily: MONO }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="justify-end flex mt-4">
              <small className="text-[10px] font-mono">* When using Guildmark Network Services during sale or purchase</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
