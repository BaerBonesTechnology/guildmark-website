// ---------------------------------------------------------------------------
// MDM
// ---------------------------------------------------------------------------

export type MdmType = "jamf_pro" | "jamf_school" | "intune";

export interface MdmConnection {
  id:               string;
  company_id:       string;
  mdm_type:         MdmType;
  sync_enabled:     boolean;
  last_sync_at:     string | null;
  last_sync_status: "success" | "partial" | "failed" | null;
  device_count:     number | null;
  created_at:       string;
}

export interface MdmConnectRequest {
  mdm_type:              MdmType;
  jamf_instance_url?:    string;
  jamf_client_id?:       string;
  jamf_client_secret?:   string;
  jamf_school_url?:      string;
  jamf_school_api_key?:  string;
  azure_tenant_id?:      string;
  azure_client_id?:      string;
  azure_client_secret?:  string;
}
