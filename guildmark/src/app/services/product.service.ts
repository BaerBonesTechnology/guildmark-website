/** Product Detail business logic — pure functions (Service). */
import { STORAGE_TYPE_LABEL } from "../constants/product.constants";
import type { MarketplaceListing } from "../models/marketplace";

/** Build the ordered [label, value] spec rows for the detail table,
 *  skipping empty fields. */
export function buildSpecRows(listing: MarketplaceListing): [string, string][] {
  const rows: [string, string][] = [];
  const push = (label: string, value: unknown) => {
    if (value !== null && value !== undefined && value !== "") rows.push([label, String(value)]);
  };
  push("Manufacturer", listing.manufacturer);
  push("Model No.", listing.model_number);
  push("Year", listing.year_of_manufacture);
  push("CPU", listing.cpu_model ?? (listing.cpu_score != null ? `Score ${listing.cpu_score}` : undefined));
  if (listing.cpu_cores != null) push("CPU Cores", listing.cpu_cores);
  if (listing.cpu_speed_ghz != null) push("CPU Speed", `${listing.cpu_speed_ghz} GHz`);
  if (listing.ram_gb != null) push("RAM", `${listing.ram_gb} GB${listing.ram_type ? ` ${listing.ram_type}` : ""}`);
  if (listing.storage_gb != null) push("Storage", `${listing.storage_gb} GB${listing.storage_type && STORAGE_TYPE_LABEL[listing.storage_type] ? ` ${STORAGE_TYPE_LABEL[listing.storage_type]}` : ""}`);
  push("GPU", listing.gpu_model);
  if (listing.screen_size_in != null) push("Screen", `${listing.screen_size_in}"${listing.screen_resolution ? ` · ${listing.screen_resolution}` : ""}`);
  else push("Resolution", listing.screen_resolution);
  if (listing.touchscreen) push("Touchscreen", "Yes");
  push("Panel", listing.panel_type);
  if (listing.refresh_rate_hz != null) push("Refresh Rate", `${listing.refresh_rate_hz} Hz`);
  push("Form Factor", listing.form_factor);
  if (listing.power_supply_watts != null) push("PSU", `${listing.power_supply_watts} W`);
  if (listing.port_count != null) push("Ports", listing.port_count);
  push("Throughput", listing.throughput);
  if (listing.managed != null) push("Managed", listing.managed ? "Yes" : "No");
  if (listing.carrier_locked != null) push("Carrier", listing.carrier_locked ? "Locked" : "Unlocked");
  push("Ports / Notes", listing.ports);
  return rows;
}
