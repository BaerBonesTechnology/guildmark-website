/**
 * Market Pulse (valuation calculator) constants.
 *
 * Form value → API contract translation tables. Kept in one place so the
 * mapping from human-friendly options to the ML feature space is reviewable.
 * If we ever move beyond laptops, expand asset_type accordingly.
 */
import type { ConditionGrade } from "../models/asset";

export const BRAND_LABELS: Record<string, string> = {
  apple: "Apple", dell: "Dell", hp: "HP", lenovo: "Lenovo", microsoft: "Microsoft",
};

export const CONDITION_TO_GRADE: Record<string, ConditionGrade> = { excellent: "A", good: "B", fair: "C" };

export const CPU_SCORES: Record<string, number> = {
  "m2": 220, "m2-pro": 280, "m2-max": 350, "intel-i5": 130, "intel-i7": 180, "intel-i9": 230,
};

export const MODEL_LABELS: Record<string, string> = {
  "macbook-pro": "MacBook Pro 14\"", "macbook-air": "MacBook Air",
  "surface": "Surface Laptop", "thinkpad": "ThinkPad X1",
};

export const RAM_GB: Record<string, number> = { "8gb": 8, "16gb": 16, "32gb": 32, "64gb": 64 };

// Add-on service pricing — platform rules, not market data. The platform fee
// comes from the API (usePlatformFees), with a labeled default estimate while unavailable.
export const DATA_WIPE_PER_UNIT = 8;
export const SHIPPING_PER_UNIT = 15;

// Dropdown option lists (value + label), so the View maps instead of hardcoding.
export interface SelectOption {
  label: string;
  value: string;
}

export const BRAND_OPTIONS: SelectOption[] = [
  { value: "apple", label: "Apple" },
  { value: "dell", label: "Dell" },
  { value: "hp", label: "HP" },
  { value: "lenovo", label: "Lenovo" },
  { value: "microsoft", label: "Microsoft" },
];

export const CONDITION_OPTIONS: SelectOption[] = [
  { value: "excellent", label: "Excellent (Grade A)" },
  { value: "good", label: "Good (Grade B)" },
  { value: "fair", label: "Fair (Grade C)" },
];

export const CPU_OPTIONS: SelectOption[] = [
  { value: "m2", label: "Apple M2" },
  { value: "m2-pro", label: "Apple M2 Pro" },
  { value: "m2-max", label: "Apple M2 Max" },
  { value: "intel-i5", label: "Intel i5" },
  { value: "intel-i7", label: "Intel i7" },
  { value: "intel-i9", label: "Intel i9" },
];

export const MODEL_OPTIONS: SelectOption[] = [
  { value: "macbook-pro", label: "MacBook Pro 14\"" },
  { value: "macbook-air", label: "MacBook Air" },
  { value: "surface", label: "Surface Laptop" },
  { value: "thinkpad", label: "ThinkPad X1" },
];

export const RAM_OPTIONS: SelectOption[] = [
  { value: "8gb", label: "8 GB" },
  { value: "16gb", label: "16 GB" },
  { value: "32gb", label: "32 GB" },
  { value: "64gb", label: "64 GB" },
];
