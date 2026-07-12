/** Client-side AMPS asset row (inventory table + add/import dialogs). */
export interface LocalAsset {
  age: number;
  bookValue: number;
  condition: "A" | "B" | "C";
  department?: string | null;
  depreciation: number;
  fairMarketValue: number;
  id: string;
  lastSync: string;
  model: string;
  quantity?: number;
  serialNumber?: string | null;
  source?: "csv" | "manual" | "mdm";
  status: "Active" | "At Risk";
  type: string;
}
