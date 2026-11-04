/** Keep sign-in return paths internal and avoid returning to sign-in itself. */
export function loginPathFor(pathname: string): string {
  return pathname.startsWith("/pre/") ? "/pre/login" : "/login";
}

export function loginDestination(loginPathname: string, state: unknown): string {
  const fallback = loginPathname.startsWith("/pre/") ? "/pre/dashboard" : "/dashboard";
  const returnTo = (state as { returnTo?: unknown } | null)?.returnTo;
  if (typeof returnTo !== "string" || !returnTo.startsWith("/") || returnTo.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(returnTo)) return fallback;
  try {
    const target = new URL(returnTo, "https://guildmark.invalid");
    const decodedPath = decodeURIComponent(target.pathname);
    if (target.origin !== "https://guildmark.invalid" || decodedPath.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(decodedPath)) return fallback;
    if (/^\/(?:pre\/)?login\/*$/i.test(decodedPath)) return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}
