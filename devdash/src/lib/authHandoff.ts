const API = import.meta.env.VITE_API_URL ?? "https://api.guildmark.co";
/** Transfer only a fully authenticated staff session, using a single-use code. */
export async function finishStaffSignIn(token: string | null): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("return_to")) return false;
  const main = import.meta.env.VITE_MAIN_SITE_URL;
  const state = params.get("state") ?? "";
  const target = new URL(params.get("return_to")!);
  if (!main || target.origin !== new URL(main).origin || target.pathname !== "/admin/auth-callback" || target.search || target.hash || !/^[a-f0-9]{64}$/.test(state)) throw new Error("The staff sign-in return address is invalid.");
  if (!token) throw new Error("A verified staff session is required.");
  const response = await fetch(`${API}/admin/auth-handoff`, {method: "POST", headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`}, body: JSON.stringify({action: "issue", state, target_origin: target.origin})});
  if (!response.ok) throw new Error("Staff sign-in could not be transferred. Restart sign-in from GuildMark.");
  const {code} = await response.json() as {code: string};
  target.hash = new URLSearchParams({code, state}).toString();
  window.location.replace(target.toString());
  return true;
}
