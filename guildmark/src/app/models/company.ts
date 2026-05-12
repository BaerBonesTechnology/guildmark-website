// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------

import type { MdmType } from "./mdm";

/**
 * Lightweight user stub embedded in Company responses.
 */
export interface CompanyUser {
  id:        string;
  email:     string;
  full_name: string;
  role:      "admin" | "member" | "viewer";
}

/**
 * Full company record as returned by the API.
 *
 * Jamf credentials are stored per-company in the database so each
 * organization can connect its own Jamf instance independently.
 * Secret fields are write-only — the API returns null for them after save.
 */
export interface Company {
  id:               string;
  name:             string;
  logo_url?:        string;
  personnel?:       CompanyUser[];

  // ── Per-company Jamf Pro credentials ──────────────────────────────
  jamf_instance_url?:   string;
  jamf_client_id?:      string;
  /** Write-only — API returns null after save. */
  jamf_client_secret?:  string | null;

  // ── Per-company Jamf School credentials ───────────────────────────
  jamf_school_url?:     string;
  /** Write-only — API returns null after save. */
  jamf_school_api_key?: string | null;

  // ── Per-company Intune / Azure AD credentials ──────────────────────
  azure_tenant_id?:     string;
  azure_client_id?:     string;
  /** Write-only — API returns null after save. */
  azure_client_secret?: string | null;

  // ── Active MDM connection IDs (mdm_type → connection_id) ──────────
  mdm_connections?:     Record<string, string>;

  custom_fields?:       Record<string, string>;
}

/**
 * Payload for PATCH /companies/:id/jamf-credentials
 */
/**
 * Payload for PATCH /companies/:id/mdm-credentials
 * Send only the fields relevant to the mdm_type being configured.
 */
export interface UpdateMdmCredentialsRequest {
  mdm_type:             MdmType;
  // Jamf Pro
  jamf_instance_url?:   string;
  jamf_client_id?:      string;
  jamf_client_secret?:  string;
  // Jamf School
  jamf_school_url?:     string;
  jamf_school_api_key?: string;
  // Intune / Azure AD
  azure_tenant_id?:     string;
  azure_client_id?:     string;
  azure_client_secret?: string;
}

/**
 * Payload for POST /companies
 */
export interface CreateCompanyRequest {
  name:          string;
  logo_url?:     string;
  industry?:     string;
  company_size?: string;
}
