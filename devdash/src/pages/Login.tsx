import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth, base64urlToBuffer } from "../hooks/useAuth";

type Step = "credentials" | "passkey";

export function Login() {
  const { login, completePasskeyAuth, pendingChallenge } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState<Step>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-trigger passkey prompt when we enter the passkey step
  useEffect(() => {
    if (step === "passkey" && pendingChallenge) {
      void triggerPasskey();
    }
  }, [step, pendingChallenge]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.type === "authenticated") {
        navigate("/");
      } else if (result.type === "passkey_required") {
        setStep("passkey");
      } else if (result.type === "setup_required") {
        navigate("/register-passkey");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function triggerPasskey() {
    if (!pendingChallenge) return;
    setError("");
    setLoading(true);
    try {
      const allowCredentials = pendingChallenge.allowCredentials.map((c) => ({
        type:       "public-key" as const,
        id:         base64urlToBuffer(c.id),
        transports: ["internal", "hybrid"] as AuthenticatorTransport[],
      }));

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge:        base64urlToBuffer(pendingChallenge.challenge),
          rpId:             window.location.hostname,
          allowCredentials,
          userVerification: "preferred",
          timeout:          60000,
        },
      }) as PublicKeyCredential | null;

      if (!assertion) throw new Error("Passkey prompt was dismissed");
      await completePasskeyAuth(assertion);
      navigate("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Passkey verification failed";
      // NotAllowedError fires when the user cancels — keep them on the prompt
      setError(msg);
      setLoading(false);
    }
  }

  // ── Passkey prompt screen ────────────────────────────────────────────────
  if (step === "passkey") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <p className="text-xl font-mono text-white">
              Guild<span className="text-blue-500">Mark</span>
            </p>
            <p className="text-xs text-slate-500 font-mono mt-1">DevDash · Admin Terminal</p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                {/* Passkey / fingerprint icon */}
                <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
                </svg>
              </div>
              <p className="text-sm font-mono text-white">Verify your identity</p>
              <p className="text-xs text-slate-400 font-mono">
                Use your passkey to complete sign-in
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 font-mono">
                {error}
              </div>
            )}

            <button
              onClick={triggerPasskey}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-sm py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Waiting for passkey…" : "Use Passkey"}
            </button>

            <button
              onClick={() => { setStep("credentials"); setError(""); }}
              disabled={loading}
              className="w-full text-xs text-slate-500 hover:text-slate-300 font-mono py-1 transition-colors disabled:opacity-50"
            >
              ← Back to password
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Password form (step 1) ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xl font-mono text-white">
            Guild<span className="text-blue-500">Mark</span>
          </p>
          <p className="text-xs text-slate-500 font-mono mt-1">DevDash · Admin Terminal</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 bg-slate-900 border border-slate-700 rounded-xl p-6">
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 font-mono">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono uppercase tracking-wide">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              placeholder="admin"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-sm py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
