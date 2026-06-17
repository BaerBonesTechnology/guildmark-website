import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { LocalAsset } from "../pages/amps/AssetInventory";

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (asset: LocalAsset) => void;
}

const ASSET_TYPES = [
  "Laptop", "Desktop", "Server", "Phone",
  "Tablet", "Monitor", "Networking", "Other",
] as const;

const empty = {
  model: "",
  type: "",
  condition: "" as "A" | "B" | "C" | "",
  quantity: "1",
  age: "",
  fairMarketValue: "",
  bookValue: "",
  serialNumber: "",
  department: "",
};

export function AddAssetDialog({ open, onOpenChange, onAdd }: AddAssetDialogProps) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof empty, string>>>({});

  function set(field: keyof typeof empty, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.model.trim())        e.model        = "Required";
    if (!form.type)                e.type         = "Required";
    if (!form.condition)           e.condition    = "Required";
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 0)
                                   e.age          = "Enter a valid age in months";
    if (!form.fairMarketValue || isNaN(Number(form.fairMarketValue)))
                                   e.fairMarketValue = "Enter a valid value";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const fmv  = parseFloat(form.fairMarketValue);
    const book = form.bookValue ? parseFloat(form.bookValue) : fmv;
    const dep  = book > 0 ? parseFloat((((book - fmv) / book) * 100).toFixed(1)) : 0;
    onAdd({
      id:              crypto.randomUUID(),
      model:           form.model.trim(),
      type:            form.type,
      condition:       form.condition as "A" | "B" | "C",
      quantity:        parseInt(form.quantity) || 1,
      age:             parseInt(form.age),
      fairMarketValue: fmv,
      bookValue:       book,
      depreciation:    dep,
      serialNumber:    form.serialNumber.trim() || null,
      department:      form.department.trim() || null,
      status:          dep >= 30 ? "At Risk" : "Active",
      lastSync:        "Just now",
      source:          "manual",
    });
    setForm(empty);
    setErrors({});
    onOpenChange(false);
  }

  function handleCancel() {
    setForm(empty);
    setErrors({});
    onOpenChange(false);
  }

  const depPreview =
    form.fairMarketValue && form.bookValue
      ? (((parseFloat(form.bookValue) - parseFloat(form.fairMarketValue)) / parseFloat(form.bookValue)) * 100)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add asset manually</DialogTitle>
          <DialogDescription>
            Enter the asset details below. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 py-2">

          {/* Model */}
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Model name *
            </Label>
            <Input
              placeholder='e.g., MacBook Pro 14" M3'
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              className={errors.model ? "border-destructive" : ""}
            />
            {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Asset type *
            </Label>
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
          </div>

          {/* Condition */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Condition grade *
            </Label>
            <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
              <SelectTrigger className={errors.condition ? "border-destructive" : ""}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Grade A — Excellent</SelectItem>
                <SelectItem value="B">Grade B — Good</SelectItem>
                <SelectItem value="C">Grade C — Fair</SelectItem>
              </SelectContent>
            </Select>
            {errors.condition && <p className="text-xs text-destructive">{errors.condition}</p>}
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Age (months) *
            </Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g., 18"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              className={errors.age ? "border-destructive" : ""}
            />
            {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Quantity
            </Label>
            <Input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
            />
          </div>

          {/* FMV */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Fair market value ($) *
            </Label>
            <Input
              type="number"
              min="0"
              step="50"
              placeholder="e.g., 1200"
              value={form.fairMarketValue}
              onChange={(e) => set("fairMarketValue", e.target.value)}
              className={errors.fairMarketValue ? "border-destructive" : ""}
            />
            {errors.fairMarketValue && (
              <p className="text-xs text-destructive">{errors.fairMarketValue}</p>
            )}
          </div>

          {/* Book value */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Book value ($)
            </Label>
            <Input
              type="number"
              min="0"
              step="50"
              placeholder="e.g., 1500 (original cost)"
              value={form.bookValue}
              onChange={(e) => set("bookValue", e.target.value)}
            />
          </div>

          {/* Depreciation preview */}
          {depPreview !== null && !isNaN(depPreview) && (
            <div className="col-span-2 flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm">
              <span className="text-muted-foreground">Calculated depreciation:</span>
              <span className={` font-medium ${
                depPreview < 20 ? "text-success" :
                depPreview < 30 ? "text-warning" : "text-danger"
              }`}>
                {depPreview.toFixed(1)}%
              </span>
            </div>
          )}

          {/* Serial number */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Serial number
            </Label>
            <Input
              placeholder="e.g., C02XK1ZNJGH5"
              value={form.serialNumber}
              onChange={(e) => set("serialNumber", e.target.value)}
            />
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Department
            </Label>
            <Input
              placeholder="e.g., Engineering"
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
            />
          </div>

        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-white">
            Add asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
