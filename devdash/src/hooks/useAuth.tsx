import { createContext, useContext, useState, useCallback } from "react";

const API = import.meta.env.VITE_API_URL ?? "https://api.guildmark.co";

interface AuthCtx {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem("devdash_token")
  );

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? "Login failed");
    }
    const data = await res.json() as { access_token: string; user: { role: string } };
    if (data.user.role !== "admin") throw new Error("Admin access required");
    sessionStorage.setItem("devdash_token", data.access_token);
    setToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("devdash_token");
    setToken(null);
  }, []);

  return <Ctx.Provider value={{ token, login, logout }}>{children}</Ctx.Provider>;
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
