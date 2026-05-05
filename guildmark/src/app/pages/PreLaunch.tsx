/**
 * Pre-launch hero page — shown for all routes when didLaunch === false.
 *
 * Captures email addresses for the waitlist.
 * TODO: wire submitToWaitlist() to a real API endpoint (POST /api/waitlist)
 *       once the backend supports it.
 */

import { useState } from "react";
import { useOutletContext } from "react-router";
import { useTranslation, Trans } from "react-i18next";
import { ArrowRight, Mail, Check, AlertCircle } from "lucide-react";
import { apiUrl } from "../config";

interface PreLaunchContext {
  openInsights: () => void;
}

// ---------------------------------------------------------------------------
// Waitlist submission
// ---------------------------------------------------------------------------

async function submitToWaitlist(email: string): Promise<void> {
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Status = "idle" | "loading" | "success" | "error";

export function PreLaunch() {
  const { t }                           = useTranslation();
  const { openInsights }               = useOutletContext<PreLaunchContext>();
  const [email,        setEmail]        = useState("");
  const [status,       setStatus]       = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    setStatus("loading");
    setErrorMessage("");
    try {
      await submitToWaitlist(email.trim());
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  return (
    // Centers vertically between the sticky header (~57px) and fixed footer (~48px)
    <div className="min-h-[calc(100vh-57px-48px)] flex flex-col items-center justify-center px-6 py-20">

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
        <span className="text-xs font-mono uppercase tracking-widest text-[#3B82F6]">
          {t("prelaunch.badge")}
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-6xl font-bold text-foreground text-center max-w-3xl leading-tight mb-6">
        <Trans
          i18nKey="prelaunch.headline"
          components={{ accent: <span className="text-[#3B82F6]" /> }}
        />
      </h1>

      {/* Description */}
      <p className="text-lg text-muted-foreground text-center max-w-xl leading-relaxed mb-12 font-mono">
        {t("prelaunch.description")}
      </p>

      {/* Email capture / success state */}
      {status !== "success" ? (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("prelaunch.emailPlaceholder")}
                required
                disabled={status === "loading"}
                className="w-full bg-input-background border border-border rounded-lg pl-9 pr-4 py-3 text-sm font-mono text-[#2b2b2b] placeholder:text-muted-foreground focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-5 py-3 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 text-white text-sm font-mono rounded-lg transition-colors flex items-center gap-2 shrink-0"
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
            <p className="flex items-center gap-1.5 text-red-400 text-xs font-mono mt-2.5 ml-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errorMessage}
            </p>
          )}

          <p className="text-xs text-muted-foreground font-mono mt-3 ml-1">
            {t("prelaunch.noSpam")}
          </p>
        </form>
      ) : (
        <div className="flex items-center gap-3 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-xl px-6 py-4 w-full max-w-md">
          <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground font-mono">{t("prelaunch.successTitle")}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {t("prelaunch.successBody")}
            </p>
          </div>
        </div>
      )}

      {/* Secondary links */}
      <div className="flex items-center gap-8 mt-10">
        <button
          onClick={openInsights}
          className="text-sm font-mono text-muted-foreground hover:text-[#3B82F6] transition-colors flex items-center gap-1.5"
        >
          {t("prelaunch.readResearch")}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <a
          href="mailto:hello@guildmark.co"
          className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("prelaunch.getInTouch")}
        </a>
      </div>
    </div>
  );
}
