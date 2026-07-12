/** Import Assets (CSV) dialog constants — template + validation vocab. */

export const TEMPLATE_HEADERS = [
  "model_name",
  "asset_type",
  "condition_grade",
  "quantity",
  "age_months",
  "fair_market_value",
  "book_value",
  "serial_number",
  "department",
];

export const TEMPLATE_EXAMPLE = [
  "MacBook Pro 14\" M3",
  "Laptop",
  "A",
  "1",
  "18",
  "1200",
  "1500",
  "C02XK1ZNJGH5",
  "Engineering",
];

export const VALID_ASSET_TYPES = ["laptop", "desktop", "server", "phone", "tablet", "networking", "monitor", "other"];
export const VALID_GRADES = ["A", "B", "C"];
