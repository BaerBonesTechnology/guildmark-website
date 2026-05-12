/**
 * Partner auth context — wraps login / logout / silent-refresh.
 *
 * On mount the provider attempts a silent refresh so partners stay logged in
 * across page reloads (the partner_refresh httpOnly cookie is sent
 * automatically by the browser).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiJson, setAccessToken } from "../lib/api";

export interface PartnerUser {
  id: string;
  email: string;
  company_name: string;
  partner_code: string;
  status: "pending" | "active" | "suspended";
  rating: number;
  total_jobs_completed: number;
  available_balance: number;
  city: string | null;
  state: string | null;
}

interface AuthState {
  partner: PartnerUser | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    partner: null,
    isLoading: true,
  });

  // Silent refresh on mount — uses the partner_refresh httpOnly cookie.
  useEffect(() => {
    (async () => {
      try {
        const data = await apiJson<{ access_token: string; partner: PartnerUser }>(
          "/partner/auth/refresh",
          { method: "POST" }
        );
        setAccessToken(data.access_token);
        setState({ partner: data.partner, isLoading: false });
      } catch {
        // No valid refresh token — user must log in.
        setState({ partner: null, isLoading: false });
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiJson<{ access_token: string; partner: PartnerUser }>(
      "/partner/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    setAccessToken(data.access_token);
    setState({ partner: data.partner, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiJson("/partner/auth/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
      setState({ partner: null, isLoading: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
