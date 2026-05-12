/**
 * RegisterPasskey — shown when an employee logs in for the first time and has
 * no passkey registered yet.
 *
 * Flow:
 *   1. Read setup_token + employee from sessionStorage (put there by /admin/auth)
 *   2. POST /admin/passkey/register/begin   → get challenge + RP options
 *   3. navigator.credentials.create()       → authenticator creates a key pair
 *   4. POST /admin/passkey/register/complete → verify + store → receive full JWT
 *   5. Store full JWT, redirect to /
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import { base64urlToBuffer, bufferToBase64url } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL ?? "https://api.guildmark.co";

interface RegisterOptions {
  challenge_id:         string;
  challenge:            string;
  rp:                   { id: string; name: string };
  user:                 { id: string; name: string; display_name: string };
  pub_key_cred_params:  { type: string; alg: number }[];
  authenticator_selection?: {
    resident_key?:          string;
    user_verification?:     string;
    authenticator_attachment?: string;
  };
  timeout?:    number;
  attestation?: string;
}

export function RegisterPasskey() {
  const navigate    = useNavigate();
  const [status, setStatus]   = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [friendlyName, setFriendlyName] = useState("Work device");

  const setupToken   = sessionStorage.getItem("devdash_setup_token");
  const employeeJson = sessionStorage.getItem("devdash_setup_employee");
  const employee     = employeeJson ? JSON.parse(employeeJson) as { full_name: string; email: string } : null;

  // Redirect if there's no setup token — shouldn't land here otherwise
  if (!setupToken) {
    navigate("/login", { replace: true });
    return null;
  }

  async function handleRegister() {
    setStatus("busy");
    setMessage("");
    try {
      // ── Step 1: begin ──────────────────────────────────────────────────
      const beginRes = await fetch(`${API}/admin/passkey/register/begin`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${setupToken}`,
        },
      });
      if (!beginRes.ok) {
        const err = await beginRes.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to start registration");
      }
      const opts = await beginRes.json() as RegisterOptions;

      // ── Step 2: create credential ──────────────────────────────────────
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge:              base64urlToBuffer(opts.challenge),
          rp:                     opts.rp,
          user: {
            id:          base64urlToBuffer(opts.user.id),
            name:        opts.user.name,
            displayName: opts.user.display_name,
          },
          pubKeyCredParams: opts.pub_key_cred_params.map(p => ({
            type: "public-key" as const,
            alg:  p.alg,
          })),
          authenticatorSelection: {
            residentKey:             opts.authenticator_selection?.resident_key   as ResidentKeyRequirement ?? "preferred",
            userVerification:        opts.authenticator_selection?.user_verification as UserVerificationRequirement ?? "preferred",
            authenticatorAttachment: opts.authenticator_selection?.authenticator_attachment as AuthenticatorAttachment ?? "platform",
          },
          timeout:     opts.timeout     ?? 60000,
          attestation: (opts.attestation ?? "none") as AttestationConveyancePreference,
        },
      }) as PublicKeyCredential | null;

      if (!credential) throw new Error("Passkey creation was cancelled");

      const resp = credential.response as AuthenticatorAttestationResponse;

      // ── Step 3: complete ───────────────────────────────────────────────
      const completeRes = await fetch(`${API}/admin/passkey/register/complete`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${setupToken}`,
        },
        body: JSON.stringify({
          challenge_id:       opts.challenge_id,
          credential_id:      bufferToBase64url(credential.rawId),
          attestation_object: bufferToBase64url(resp.attestationObject),
          client_data_json:   bufferToBase64url(resp.clientDataJSON),
          friendly_name:      friendlyName.trim() || "Passkey",
        }),
      });
      if (!completeRes.ok) {
        const err = await completeRes.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to complete registration");
      }
      const data = await completeRes.json() as { access_token: string };

      // ── Step 4: store full token, clean up setup artifacts ─────────────
      sessionStorage.setItem("devdash_token", data.access_token);
      sessionStorage.removeItem("devdash_setup_token");
      sessionStorage.removeItem("devdash_setup_employee");

      setStatus("done");
      setTimeout(() => navigate("/", { replace: true }), 800);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Registration failed");
    }
  }

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
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <p className="text-sm font-mono text-white">Set up your passkey</p>
            {employee && (
              <p className="text-xs text-slate-400 font-mono">{employee.full_name} · {employee.email}</p>
            )}
            <p className="text-xs text-slate-500 font-mono leading-relaxed">
              Passkeys replace IP allowlisting as your second factor.
              Your device will prompt you to use Face ID, Touch ID, or your security key.
            </p>
          </div>

          {/* Error */}
          {status === "error" && message && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 font-mono">
              {message}
            </div>
          )}

          {/* Success */}
          {status === "done" && (
            <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 font-mono text-center">
              Passkey registered! Signing you in…
            </div>
          )}

          {/* Friendly name input */}
          {status !== "done" && (
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-mono uppercase tracking-wide">
                Device name <span className="text-slate-600 normal-case">(optional)</span>
              </label>
              <input
                type="text"
                value={friendlyName}
                onChange={e => setFriendlyName(e.target.value)}
                disabled={status === "busy"}
                maxLength={64}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                placeholder="Work MacBook"
              />
            </div>
          )}

          {/* Register button */}
          {status !== "done" && (
            <button
              onClick={handleRegister}
              disabled={status === "busy"}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-sm py-2.5 rounded-lg transition-colors"
            >
              {status === "busy" ? "Creating passkey…" : "Create Passkey"}
            </button>
          )}

          {/* Retry after error */}
          {status === "error" && (
            <button
              onClick={() => { setStatus("idle"); setMessage(""); }}
              className="w-full text-xs text-slate-500 hover:text-slate-300 font-mono py-1 transition-colors"
            >
              Try again
            </button>
          )}

          <p className="text-center text-xs text-slate-600 font-mono">
            You can manage passkeys later from Team settings.
          </p>
        </div>
      </div>
    </div>
  );
}
