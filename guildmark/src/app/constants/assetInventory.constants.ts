/** AMPS Asset Inventory constants — grade palette, filters, table headers. */

export const ASSET_GRADE_COLOR: Record<string, string> = {
  A: "var(--grade-a)", B: "var(--grade-b)", C: "var(--grade-c)",
};

export const ASSET_TYPE_OPTIONS = ["Laptop", "Desktop", "Tablet", "Server", "Phone", "Monitor", "Networking", "Other"];

export const ASSET_TABLE_HEADERS = [
  "Model", "Type", "Grade", "Age (mo)", "Fair Market Value", "Book Value", "Depreciation", "Status", "Last Sync", "",
];
