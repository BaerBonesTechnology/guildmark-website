import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/workboard", { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--prt-bg)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "var(--prt-accent)" }}
          >
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--prt-font-mono)", color: "var(--prt-text)" }}
          >
            Guild<span style={{ color: "var(--prt-accent-light)" }}>Mark</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--prt-muted)" }}>
            Partner Portal
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background: "var(--prt-surface)",
            borderColor: "var(--prt-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-6"
            style={{ color: "var(--prt-text)" }}
          >
            Sign in to your account
          </h2>

          {error && (
            <div
              className="flex items-start gap-3 rounded-lg p-3 mb-4 text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "var(--prt-danger)",
              }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--prt-muted)" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: "var(--prt-card)",
                  border: "1px solid var(--prt-border)",
                  color: "var(--prt-text)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--prt-accent-light)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--prt-border)")
                }
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--prt-muted)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm outline-none transition-colors"
                  style={{
                    background: "var(--prt-card)",
                    border: "1px solid var(--prt-border)",
                    color: "var(--prt-text)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--prt-accent-light)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--prt-border)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--prt-muted)" }}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity"
              style={{
                background: loading
                  ? "var(--prt-border)"
                  : "var(--prt-accent)",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--prt-muted)" }}>
          Need access?{" "}
          <a
            href="mailto:partners@guildmark.co"
            style={{ color: "var(--prt-accent-light)" }}
          >
            Contact GuildMark
          </a>
        </p>
      </div>
    </div>
  );
}
