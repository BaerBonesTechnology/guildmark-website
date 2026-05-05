/**
 * GuildMark API Client
 *
 * Typed fetch wrapper that:
 *   - Injects Authorization header from stored access token
 *   - Automatically retries once with a refreshed token on 401
 *   - Throws typed ApiError on non-2xx responses
 *   - Handles JSON serialization/deserialization
 */

import { apiUrl } from "../config";
const API_BASE = apiUrl;

// ---------------------------------------------------------------------------
// Token storage
// Access token in memory (most secure — not readable by XSS after page load)
// Refresh token lives in httpOnly cookie managed by the server
// ---------------------------------------------------------------------------

let accessToken: string | null = null;

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ---------------------------------------------------------------------------
// Typed API error
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public status:  number,
    public code:    string,
    message:        string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };

  if (!skipAuth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",   // Required for httpOnly refresh token cookie
  });

  // Token expired — attempt silent refresh then retry once
  if (response.status === 401 && !skipAuth) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      const retry = await fetch(`${API_BASE}${path}`, {
        ...fetchOptions,
        headers,
        credentials: "include",
      });
      if (retry.ok) {
        return retry.json() as Promise<T>;
      }
    }
    // Refresh failed — clear token, caller handles redirect
    clearAccessToken();
    throw new ApiError(401, "TOKEN_EXPIRED", "Session expired");
  }

  if (!response.ok) {
    let errorBody: { error?: string; code?: string } = {};
    try {
      errorBody = await response.json();
    } catch { /* non-JSON error body */ }
    throw new ApiError(
      response.status,
      errorBody.code ?? "API_ERROR",
      errorBody.error ?? `Request failed: ${response.status}`
    );
  }

  // 204 No Content
  if (response.status === 204) return undefined as unknown as T;

  return response.json() as Promise<T>;
}

async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const resp = await fetch(`${API_BASE}/auth/refresh`, {
      method:      "POST",
      credentials: "include",   // Sends the httpOnly refresh token cookie
    });
    if (!resp.ok) return false;
    const data = await resp.json() as { access_token: string };
    setAccessToken(data.access_token);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

export const api = {
  get:    <T>(path: string, opts?: RequestOptions) =>
    apiFetch<T>(path, { method: "GET", ...opts }),

  post:   <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body), ...opts }),

  put:    <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body), ...opts }),

  patch:  <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body), ...opts }),

  delete: <T>(path: string, opts?: RequestOptions) =>
    apiFetch<T>(path, { method: "DELETE", ...opts }),
};
