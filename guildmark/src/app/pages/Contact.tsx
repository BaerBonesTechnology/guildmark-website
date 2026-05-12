/**
 * Contact page — reached via "Get in touch" on the pre-launch hero.
 * Submits a message to POST /contact, which stores it in the mailing_list
 * table with source = 'contact'.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, Check, AlertCircle, Mail } from "lucide-react";
import { apiUrl } from "../config";

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

async function submitContact(fields: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const res = await fetch(`${apiUrl}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
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

export function Contact() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({ name: "", email: "", message: "" });

  // Scroll to top immediately — navigating from a scrolled PreLaunch page
  // would otherwise leave the user staring at mid-page form inputs.
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  const [status,   setStatus]   = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await submitContact(fields);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const inputClass =
    "w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-50";

  return (
    <div className="min-h-[calc(100vh-57px-48px)] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg space-y-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-sans">Get in touch</h1>
          <p className="text-sm text-muted-foreground font-sans">
            Have a question or want to learn more about GuildMark? Send us a message
            and we'll get back to you within one business day.
          </p>
        </div>

        {/* Success state */}
        {status === "success" ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-primary/10 border border-primary/30 rounded-xl px-5 py-5">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground font-sans">Message sent.</p>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  We'll be in touch at <span className="text-foreground">{fields.email}</span> within one business day.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-sm font-sans text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              Back to home
            </button>
          </div>
        ) : (

          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Absorbs browser auto-focus so no input blinks on arrival */}
            <span tabIndex={0} className="sr-only" aria-hidden />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-sans text-muted-foreground uppercase tracking-wide">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={fields.name}
                  onChange={set("name")}
                  disabled={status === "loading"}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-sans text-muted-foreground uppercase tracking-wide">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={fields.email}
                  onChange={set("email")}
                  required
                  disabled={status === "loading"}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-sans text-muted-foreground uppercase tracking-wide">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                placeholder="Tell us what you're looking to do, or ask us anything about the platform…"
                value={fields.message}
                onChange={set("message")}
                required
                rows={5}
                disabled={status === "loading"}
                className={`${inputClass} resize-none`}
              />
            </div>

            {status === "error" && (
              <p className="flex items-center gap-1.5 text-red-400 text-sm font-sans bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-sans rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send message
                </>
              )}
            </button>

            <p className="text-xs text-center text-muted-foreground font-sans">
              Or email us directly at{" "}
              <a href="mailto:hello@guildmark.co" className="text-primary hover:underline">
                hello@guildmark.co
              </a>
            </p>

          </form>
        )}

      </div>
    </div>
  );
}
