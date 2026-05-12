/**
 * Thin fetch wrapper for the GuildMark API.
 *
 * - Attaches `Authorization: Bearer <token>` when a token is stored.
 * - On 401, attempts a silent token refresh via the partner_refresh cookie,
 *   then retries the original request once.
 * - Throws `ApiError` on non-2xx responses so callers can discriminate.
 */

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// In-memory token store — avoids localStorage (not needed: short-lived token,
// page refresh will hit /partner/auth/refresh via the httpOnly cookie).
let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    return new ApiError(
      res.status,
      body.code ?? "UNKNOWN",
      body.message ?? res.statusText
    );
  } catch {
    return new ApiError(res.status, "UNKNOWN", res.statusText);
  }
}

async function refreshToken(): Promise<string | null> {
  const res = await fetch(`${API_URL}/partner/auth/refresh`, {
    method: "POST",
    credentials: "include", // sends partner_refresh cookie
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token as string;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  if (_accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  // Attempt a silent refresh on 401 and retry once.
  if (res.status === 401 && _accessToken !== null) {
    const newToken = await refreshToken();
    if (newToken) {
      setAccessToken(newToken);
      headers["Authorization"] = `Bearer ${newToken}`;
      return fetch(`${API_URL}${path}`, {
        ...init,
        credentials: "include",
        headers,
      });
    }
    // Refresh failed — clear token so the app redirects to login.
    setAccessToken(null);
  }

  return res;
}

/** Convenience: parse JSON or throw ApiError. */
export async function apiJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}
