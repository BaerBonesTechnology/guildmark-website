import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api, setAccessToken, clearAccessToken, ApiError } from "../lib/api";
import type { LoginResponse, SignupRequest } from "../models/auth";

export interface AuthUser {
  id:                  string;
  email:               string;
  full_name:           string;
  role:                "admin" | "member" | "viewer";
  company_id:          string;
  company:             string;
  subscription_plan:   "free" | "starter" | "growth" | "pro";
  subscription_status: "active" | "cancelled" | "past_due";
}

interface AuthContextType {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;
  login:           (email: string, password: string) => Promise<void>;
  signup:          (data: SignupRequest) => Promise<void>;
  logout:          () => Promise<void>;
  clearError:      () => void;
  /** Re-fetch the access token and update the in-memory user (e.g. after plan change). */
  refreshUser:     () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Restore session from httpOnly refresh token cookie on mount
  useEffect(() => {
    let cancelled = false;
    async function restoreSession() {
      try {
        const data = await api.post<LoginResponse>("/auth/refresh", {}, { skipAuth: true });
        if (!cancelled) {
          setAccessToken(data.access_token);
          setUser(data.user);
        }
      } catch {
        if (!cancelled) clearAccessToken();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await api.post<LoginResponse>("/auth/login", { email, password }, { skipAuth: true });
      setAccessToken(data.access_token);
      setUser(data.user);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed. Please check your credentials.";
      setError(message);
      throw err;
    }
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    setError(null);
    try {
      const response = await api.post<LoginResponse>("/auth/signup", data, { skipAuth: true });
      setAccessToken(response.access_token);
      setUser(response.user);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Signup failed. Please try again.";
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {});
    } catch { /* best-effort */ } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.post<LoginResponse>("/auth/refresh", {}, { skipAuth: true });
      setAccessToken(data.access_token);
      setUser(data.user);
    } catch { /* silently ignore — user stays as-is */ }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, error, login, signup, logout, clearError, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
