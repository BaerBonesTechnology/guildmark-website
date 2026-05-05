// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export type AssetType =
  | "laptop" | "desktop" | "server" | "phone"
  | "tablet" | "networking" | "monitor" | "software" | "license" | "other";

export type ConditionGrade = "A" | "B" | "C";

export type MdmSource = "manual" | "jamf_pro" | "jamf_school" | "intune";

export interface Asset {
  id:                      string;
  company_id:              string;
  mdm_source:              MdmSource;
  serial_number:           string | null;
  model_name:              string;
  asset_type:              AssetType;
  condition_grade:         ConditionGrade;
  quantity:                number;
  reason_for_offload:      string | null;
  purchase_date:           string | null;
  original_purchase_price: number | null;
  os_version:              string | null;
  battery_health_pct:      number | null;
  battery_cycles:          number | null;
  compliance_state:        string | null;
  assigned_user:           string | null;
  department:              string | null;
  cost_center:             string | null;
  last_mdm_sync:           string | null;
  // Spec metadata (sourced from MDM where available; manual otherwise)
  cpu_score:               number | null;
  ram_gb:                  number | null;
  storage_gb:              number | null;
  created_at:              string;
  updated_at:              string;
}
