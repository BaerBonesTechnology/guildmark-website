/** Success confirmation shown after a waitlist form is submitted. */
import { CheckCircle2 } from "lucide-react";
import { BODY } from "../../constants/typography";

export function SubmitSuccess({ audience }: { audience: string }) {
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
