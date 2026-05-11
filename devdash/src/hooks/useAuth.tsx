import { createContext, useContext, useState, useCallback } from "react";

const API = import.meta.env.VITE_API_URL ?? "https://api.guildmark.co";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Employee {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface PendingChallenge {
  challengeId: string;
  challenge: string;
  allowCredentials: { id: string; type: string }[];
}

export type LoginResult =
  | { type: "authenticated" }
  | { type: "passkey_required" }
  | { type: "setup_required"; setupToken: string; employee: Employee };

interface AuthCtx {
  token: string | null;
  pendingChallenge: PendingChallenge | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  completePasskeyAuth: (credential: PublicKeyCredential) => Promise<void>;
  logout: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem("devdash_token")
  );
  const [pendingChallenge, setPendingChallenge] = useState<PendingChallenge | null>(null);

  // Step 1 — password check
  const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    const res = await fetch(`${API}/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? "Login failed");
    }
    const data = await res.json() as Record<string, unknown>;

    // Path A — passkey assertion required
    if (data.requires_passkey) {
      setPendingChallenge({
        challengeId:      data.challenge_id as string,
        challenge:        data.challenge    as string,
        allowCredentials: data.allow_credentials as { id: string; type: string }[],
      });
      return { type: "passkey_required" };
    }

    // Path B — no passkeys registered yet, setup needed
    if (data.requires_passkey_setup) {
      const setupToken = data.setup_token as string;
      sessionStorage.setItem("devdash_setup_token",    setupToken);
      sessionStorage.setItem("devdash_setup_employee", JSON.stringify(data.employee));
      return { type: "setup_required", setupToken, employee: data.employee as Employee };
    }

    // Path C — full token (no 2FA, or env-var bypass)
    const accessToken = data.access_token as string;
    sessionStorage.setItem("devdash_token", accessToken);
    setToken(accessToken);
    return { type: "authenticated" };
  }, []);

  // Step 2 — complete WebAuthn assertion (called after navigator.credentials.get())
  const completePasskeyAuth = useCallback(async (credential: PublicKeyCredential) => {
    if (!pendingChallenge) throw new Error("No pending passkey challenge");

    const resp = credential.response as AuthenticatorAssertionResponse;
    const body = {
      challenge_id:       pendingChallenge.challengeId,
      credential_id:      bufferToBase64url(credential.rawId),
      authenticator_data: bufferToBase64url(resp.authenticatorData),
      client_data_json:   bufferToBase64url(resp.clientDataJSON),
      signature:          bufferToBase64url(resp.signature),
    };

    const res = await fetch(`${API}/admin/passkey/auth/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error ?? "Passkey verification failed");
    }
    const data = await res.json() as { access_token: string };
    sessionStorage.setItem("devdash_token", data.access_token);
    setToken(data.access_token);
    setPendingChallenge(null);
  }, [pendingChallenge]);

  const logout = useCallback(() => {
    sessionStorage.removeItem("devdash_token");
    sessionStorage.removeItem("devdash_setup_token");
    sessionStorage.removeItem("devdash_setup_employee");
    setToken(null);
    setPendingChallenge(null);
  }, []);

  return (
    <Ctx.Provider value={{ token, pendingChallenge, login, completePasskeyAuth, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}

export function useApi() {
  const { token, logout } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL ?? "https://api.guildmark.co";

  return async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
      credentials: "include",
    });
    if (res.status === 401) { logout(); throw new Error("Session expired"); }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? `Request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
  };
}

// ---------------------------------------------------------------------------
// WebAuthn buffer helpers
// ---------------------------------------------------------------------------

export function base64urlToBuffer(b64: string): ArrayBuffer {
  const padded = b64.padEnd(b64.length + (4 - b64.length % 4) % 4, "=");
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return buffer.buffer;
}

export function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
