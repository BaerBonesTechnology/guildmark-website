const VERSION = "v1";
const dismissed = new Set<string>();
export function assistantTourKey(ownerKey: string | null) {
  return ownerKey ? `guildmark:amps-assistant-tour:${VERSION}:${encodeURIComponent(ownerKey)}` : null;
}
export function shouldShowAssistantTour(ownerKey: string | null, storage: Pick<Storage, "getItem"> | null) {
  const key = assistantTourKey(ownerKey);
  if (!key || dismissed.has(key)) return false;
  try { return storage?.getItem(key) !== "dismissed"; } catch { return true; }
}
export function dismissAssistantTour(ownerKey: string | null, storage: Pick<Storage, "setItem"> | null) {
  const key = assistantTourKey(ownerKey);
  if (!key) return;
  dismissed.add(key);
  try { storage?.setItem(key, "dismissed"); } catch { /* Storage may be unavailable; the workspace remains usable. */ }
}
