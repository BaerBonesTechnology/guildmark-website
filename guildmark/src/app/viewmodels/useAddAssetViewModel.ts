/** ViewModel for the Add Asset dialog: form state, validation, submission. */
import { useState } from "react";
import { EMPTY_ASSET_FORM, type AssetForm, type AssetFormErrors } from "../constants/addAsset.constants";
import type { LocalAsset } from "../models/localAsset";
import { buildLocalAsset, depreciationPreview, validateAssetForm } from "../services/addAsset.service";

export function useAddAssetViewModel(onAdd: (asset: LocalAsset) => void, onOpenChange: (open: boolean) => void) {
  const [form, setForm] = useState<AssetForm>(EMPTY_ASSET_FORM);
  const [errors, setErrors] = useState<AssetFormErrors>({});

  function set(field: keyof AssetForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function reset() {
    setForm(EMPTY_ASSET_FORM);
    setErrors({});
  }

  function handleSubmit() {
    const found = validateAssetForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onAdd(buildLocalAsset(form));
    reset();
    onOpenChange(false);
  }

  function handleCancel() {
    reset();
    onOpenChange(false);
  }

  const depPreview = depreciationPreview(form);

  return { depPreview, errors, form, handleCancel, handleSubmit, set };
}
