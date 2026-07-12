/** Primary submit button for pre-launch waitlist forms. */
import { ArrowRight } from "lucide-react";
import { BODY } from "../../constants/typography";
import type { WaitlistStatus } from "../../viewmodels/useWaitlistViewModel";

interface SubmitButtonProps {
  filled?: boolean;
  label: string;
  status: WaitlistStatus;
}

export function SubmitButton({ filled = true, label, status }: SubmitButtonProps) {
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
