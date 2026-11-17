/** Add Asset service — validation, depreciation, and LocalAsset construction. */
import type { AssetForm, AssetFormErrors } from "../constants/addAsset.constants";
import type { LocalAsset } from "../models/localAsset";

export function buildLocalAsset(form: AssetForm): LocalAsset {
  const fmv = parseFloat(form.fairMarketValue);
  const book = form.bookValue ? parseFloat(form.bookValue) : fmv;
  const dep = book > 0 ? parseFloat((((book - fmv) / book) * 100).toFixed(1)) : 0;
  return {
    id: crypto.randomUUID(),
    model: form.model.trim(),
    type: form.type,
    condition: form.condition as "A" | "B" | "C",
    quantity: parseInt(form.quantity) || 1,
    age: parseInt(form.age),
    fairMarketValue: fmv,
    bookValue: book,
    depreciation: dep,
    serialNumber: form.serialNumber.trim() || null,
    department: form.department.trim() || null,
    status: dep >= 30 ? "At Risk" : "Active",
    lastSync: "Just now",
    source: "manual",
  };
}

/** Live depreciation percent for the preview line, or null if not computable. */
export function depreciationPreview(form: AssetForm): number | null {
  if (!form.fairMarketValue || !form.bookValue) return null;
  return ((parseFloat(form.bookValue) - parseFloat(form.fairMarketValue)) / parseFloat(form.bookValue)) * 100;
}

export function validateAssetForm(form: AssetForm): AssetFormErrors {
  const errors: AssetFormErrors = {};
  if (!form.model.trim()) errors.model = "Required";
  if (!form.type) errors.type = "Required";
  if (!form.condition) errors.condition = "Required";
  if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 0) errors.age = "Enter a valid age in months";
  if (!form.fairMarketValue || isNaN(Number(form.fairMarketValue))) errors.fairMarketValue = "Enter a valid value";
  return errors;
}
