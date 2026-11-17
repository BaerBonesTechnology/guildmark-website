/** AMPS MDM Connections constants — types, form seed, label/server maps. */

export interface MDMConnection {
  deviceCount: number;
  id: string;
  lastSync: string;
  server: string;
  status: "connected" | "error";
  type: string;
}

export interface MdmForm {
  clientId: string;
  clientSecret: string;
  password: string;
  serverUrl: string;
  tenantId: string;
  username: string;
}

export interface SyncEvent {
  devices: number;
  duration: string;
  source: string;
  status: "error" | "success";
  timestamp: string;
}

export const EMPTY_MDM_FORM: MdmForm = {
  serverUrl: "", username: "", password: "", tenantId: "", clientId: "", clientSecret: "",
};

export const MDM_LABELS: Record<string, string> = {
  "jamf-pro": "Jamf Pro", "jamf-school": "Jamf School", intune: "Microsoft Intune",
};

export const SYNC_HISTORY_HEADERS = ["Timestamp", "Source", "Devices", "Status", "Duration"];
