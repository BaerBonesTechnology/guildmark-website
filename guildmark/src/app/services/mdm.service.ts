/** AMPS MDM service — connection + sync-event construction helpers. */
import { MDM_LABELS, type MdmForm, type MDMConnection, type SyncEvent } from "../constants/mdm.constants";

export function buildConnection(selectedMDM: string, form: MdmForm): MDMConnection {
  const serverMap: Record<string, string> = {
    "jamf-pro": form.serverUrl || "jamfcloud.com",
    "jamf-school": form.serverUrl || "jamfcloud.com",
    intune: "graph.microsoft.com",
  };
  return {
    id: crypto.randomUUID(),
    type: MDM_LABELS[selectedMDM] ?? selectedMDM,
    status: "connected",
    lastSync: "Just now",
    deviceCount: 0,
    server: serverMap[selectedMDM] ?? "",
  };
}

export function buildSyncEvent(conn: MDMConnection): SyncEvent {
  return {
    timestamp: new Date().toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }),
    source: conn.type,
    devices: conn.deviceCount,
    status: "success",
    duration: `${(Math.random() * 2 + 1.5).toFixed(1)}s`,
  };
}

export function isJamf(selectedMDM: string): boolean {
  return selectedMDM === "jamf-pro" || selectedMDM === "jamf-school";
}
