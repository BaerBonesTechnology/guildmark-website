/** Add Asset dialog constants — form shape, seed, and asset-type options. */

export interface AssetForm {
  age: string;
  bookValue: string;
  condition: "" | "A" | "B" | "C";
  department: string;
  fairMarketValue: string;
  model: string;
  quantity: string;
  serialNumber: string;
  type: string;
}

export type AssetFormErrors = Partial<Record<keyof AssetForm, string>>;

export const ADD_ASSET_TYPES = [
  "Laptop", "Desktop", "Server", "Phone",
  "Tablet", "Monitor", "Networking", "Other",
];

export const EMPTY_ASSET_FORM: AssetForm = {
  model: "",
  type: "",
  condition: "",
  quantity: "1",
  age: "",
  fairMarketValue: "",
  bookValue: "",
  serialNumber: "",
  department: "",
};
