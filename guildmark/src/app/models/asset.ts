// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export type AssetType =
  | "laptop" | "desktop" | "server" | "phone"
  | "tablet" | "networking" | "monitor" | "software" | "license" | "other";

export type ConditionGrade = "A" | "B" | "C";

export type MdmSource = "manual" | "jamf_pro" | "jamf_school" | "intune";

export type FunctionalStatus =
  | "fully_functional" | "functional_with_issues" | "for_parts";
export type DataWipeStatus = "not_wiped" | "wiped" | "certified";
export type WarrantyStatus = "none" | "active" | "expired";
export type StorageType = "ssd" | "nvme" | "hdd" | "emmc" | "other";

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
  // Marketplace device-spec detail (manual entry / listing form)
  manufacturer?:           string;
  model_number?:           string;
  year_of_manufacture?:    number | null;
  functional_status?:      FunctionalStatus;
  known_defects?:          string;
  data_wipe_status?:       DataWipeStatus;
  warranty_status?:        WarrantyStatus;
  warranty_expiration?:    string | null;
  included_accessories?:   string;
  ships_from_location?:    string;
  cpu_model?:              string;
  cpu_cores?:              number | null;
  cpu_speed_ghz?:          number | null;
  ram_type?:               string;
  storage_type?:           StorageType;
  gpu_model?:              string;
  screen_size_in?:         number | null;
  screen_resolution?:      string;
  touchscreen?:            boolean;
  form_factor?:            string;
  power_supply_watts?:     number | null;
  panel_type?:             string;
  refresh_rate_hz?:        number | null;
  ports?:                  string;
  port_count?:             number | null;
  throughput?:             string;
  managed?:                boolean;
  carrier_locked?:         boolean;
  created_at:              string;
  updated_at:              string;
}
