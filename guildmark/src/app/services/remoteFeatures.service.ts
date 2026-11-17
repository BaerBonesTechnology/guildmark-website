export interface PublicFeatures {
  launch_enabled: boolean;
  amps_enabled: boolean;
}
export function parsePublicFeatures(body: unknown): PublicFeatures {
  const flags =
    body && typeof body === "object" && "flags" in body ? body.flags : null;
  return {
    launch_enabled:
      !!flags &&
      typeof flags === "object" &&
      "launch_enabled" in flags &&
      flags.launch_enabled === true,
    amps_enabled:
      !!flags &&
      typeof flags === "object" &&
      "amps_enabled" in flags &&
      flags.amps_enabled === true,
  };
}
export async function fetchPublicFeatures(
  apiUrl: string,
  request: typeof fetch = fetch,
): Promise<PublicFeatures> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await request(
      `${apiUrl.replace(/\/$/, "")}/config/features`,
      { signal: controller.signal, credentials: "omit", cache: "no-store" },
    );
    return response.ok
      ? parsePublicFeatures(await response.json())
      : parsePublicFeatures(null);
  } catch {
    return parsePublicFeatures(null);
  } finally {
    clearTimeout(timer);
  }
}
