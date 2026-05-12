import { useState, useMemo } from "react";
import { Loader2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useCreateListing, usePlatformFees } from "../lib/apiHooks";
import { useAuth } from "../hooks/useAuth";
import type { Listing } from "../models/listing";

// Condition label → grade mapping
const CONDITION_GRADE: Record<string, string> = {
  excellent: "A",
  good:      "B",
  fair:      "C",
};

// RAM label → numeric GB
const RAM_GB: Record<string, number> = {
  "8gb": 8, "16gb": 16, "32gb": 32, "64gb": 64,
};

// Storage label → numeric GB
const STORAGE_GB: Record<string, number> = {
  "256gb": 256, "512gb": 512, "1tb": 1024, "2tb": 2048,
};

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (listing: Listing) => void;
}

const REQUIRED = ["item", "model", "condition", "quantity", "pricePerUnit"] as const;

const EMPTY_FORM = {
  item: "", brand: "", model: "", cpu: "",
  ram: "", storage: "", condition: "",
  quantity: "", pricePerUnit: "", description: "",
  includeDataWipe: false,
};

export function CreateListingDialog({ open, onOpenChange, onSuccess }: CreateListingDialogProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const createListing = useCreateListing();
  const { data: fees } = usePlatformFees();
  const { user } = useAuth();

  // Pick the seller fee rate that applies to this user's subscription plan.
  const sellerFeeRate = useMemo(() => {
    if (!fees) return null;
    const plan = (user as any)?.subscription_plan ?? "free";
    const map: Record<string, number> = {
      starter: fees.seller_fee_starter,
      growth:  fees.seller_fee_growth,
      pro:     fees.seller_fee_pro,
    };
    return map[plan] ?? fees.seller_fee_free;
  }, [fees, user]);

  const priceNum   = parseFloat(formData.pricePerUnit) || 0;
  const quantityNum = parseInt(formData.quantity) || 0;
  const sellerFee   = sellerFeeRate != null ? priceNum * sellerFeeRate : null;
  const netPerUnit  = sellerFee != null ? priceNum - sellerFee : null;
  const totalNet    = netPerUnit != null ? netPerUnit * Math.max(quantityNum, 1) : null;

  const validate = () => {
    const next: Record<string, string> = {};
    for (const key of REQUIRED) {
      if (!formData[key as keyof typeof formData]) next[key] = "Required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    createListing.mutate(
      {
        model_name:   `${formData.brand ? formData.brand + " " : ""}${formData.model}`.trim(),
        asset_type:   formData.item,
        condition:    CONDITION_GRADE[formData.condition] ?? formData.condition,
        quantity:     parseInt(formData.quantity),
        listed_price: parseFloat(formData.pricePerUnit),
        reason:       formData.description || undefined,
        ram_gb:       RAM_GB[formData.ram] ?? undefined,
        storage_gb:   STORAGE_GB[formData.storage] ?? undefined,
      },
      {
        onSuccess: (listing) => {
          onSuccess?.(listing);
          onOpenChange(false);
          setFormData(EMPTY_FORM);
          setErrors({});
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl font-mono max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
          <DialogDescription>
            List your assets on GuildMarket for other businesses to purchase
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Item Category <span className="text-red-500">*</span></Label>
            <Select value={formData.item} onValueChange={(value) => { setFormData({ ...formData, item: value }); setErrors((e) => ({ ...e, item: undefined })); }}>
              <SelectTrigger className={`font-mono ${errors.item ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="laptop" className="font-mono">Laptop</SelectItem>
                <SelectItem value="desktop" className="font-mono">Desktop</SelectItem>
                <SelectItem value="server" className="font-mono">Server</SelectItem>
                <SelectItem value="monitor" className="font-mono">Monitor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Brand</Label>
            <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple" className="font-mono">Apple</SelectItem>
                <SelectItem value="dell" className="font-mono">Dell</SelectItem>
                <SelectItem value="hp" className="font-mono">HP</SelectItem>
                <SelectItem value="lenovo" className="font-mono">Lenovo</SelectItem>
                <SelectItem value="microsoft" className="font-mono">Microsoft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Model <span className="text-red-500">*</span></Label>
            <Input
              placeholder='e.g., MacBook Pro 14"'
              value={formData.model}
              onChange={(e) => { setFormData({ ...formData, model: e.target.value }); setErrors((er) => ({ ...er, model: undefined })); }}
              className={`font-mono ${errors.model ? "border-red-500" : ""}`}
            />
            {errors.model && <p className="text-xs text-red-500">{errors.model}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">CPU</Label>
            <Input
              placeholder="e.g., M2 Pro"
              value={formData.cpu}
              onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">RAM</Label>
            <Select value={formData.ram} onValueChange={(value) => setFormData({ ...formData, ram: value })}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8gb" className="font-mono">8 GB</SelectItem>
                <SelectItem value="16gb" className="font-mono">16 GB</SelectItem>
                <SelectItem value="32gb" className="font-mono">32 GB</SelectItem>
                <SelectItem value="64gb" className="font-mono">64 GB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Storage</Label>
            <Select value={formData.storage} onValueChange={(value) => setFormData({ ...formData, storage: value })}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="256gb" className="font-mono">256 GB</SelectItem>
                <SelectItem value="512gb" className="font-mono">512 GB</SelectItem>
                <SelectItem value="1tb" className="font-mono">1 TB</SelectItem>
                <SelectItem value="2tb" className="font-mono">2 TB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Condition <span className="text-red-500">*</span></Label>
            <Select value={formData.condition} onValueChange={(value) => { setFormData({ ...formData, condition: value }); setErrors((e) => ({ ...e, condition: undefined })); }}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent" className="font-mono">Excellent</SelectItem>
                <SelectItem value="good" className="font-mono">Good</SelectItem>
                <SelectItem value="fair" className="font-mono">Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Quantity <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              min="1"
              placeholder="Number of units"
              value={formData.quantity}
              onChange={(e) => { setFormData({ ...formData, quantity: e.target.value }); setErrors((er) => ({ ...er, quantity: undefined })); }}
              className={`font-mono ${errors.quantity ? "border-red-500" : ""}`}
            />
            {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
          </div>

          <div className="space-y-2 col-span-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Price Per Unit ($) <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              min="0"
              step="50"
              placeholder="Enter price per unit"
              value={formData.pricePerUnit}
              onChange={(e) => { setFormData({ ...formData, pricePerUnit: e.target.value }); setErrors((er) => ({ ...er, pricePerUnit: undefined })); }}
              className={`font-mono ${errors.pricePerUnit ? "border-red-500" : ""}`}
            />
            {errors.pricePerUnit && <p className="text-xs text-red-500">{errors.pricePerUnit}</p>}
          </div>

          <div className="space-y-2 col-span-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Description (Optional)</Label>
            <textarea
              placeholder="Add any additional details about the assets..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
            />
          </div>

          <div className="col-span-2">
            <label className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted/70 transition-colors">
              <input
                type="checkbox"
                checked={formData.includeDataWipe}
                onChange={(e) => setFormData({ ...formData, includeDataWipe: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">Include Data Wipe Service</p>
                  <span className="text-sm text-primary">+${fees?.data_wipe_price ?? 8}/asset</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ship to our Orlando facility → You get paid on arrival → We handle NIST 800-88 certified data wipe & delivery to buyer.
                  You're paid immediately, we take delivery liability.
                </p>
              </div>
            </label>
          </div>
        </div>

        {formData.quantity && formData.pricePerUnit && (
          <div className="bg-muted/50 rounded-lg p-4 border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Value</span>
              <span className="font-mono">
                ${(quantityNum * priceNum).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                Platform Fee
                {sellerFeeRate != null && (
                  <span className="text-xs text-muted-foreground/60">
                    ({(sellerFeeRate * 100).toFixed(1)}%)
                  </span>
                )}
              </span>
              <span className="font-mono text-red-500">
                {sellerFee != null
                  ? `-$${(sellerFee * quantityNum).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                  : "—"}
              </span>
            </div>
            {formData.includeDataWipe && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Data Wipe Service ({quantityNum} × ${fees?.data_wipe_price ?? 8})
                </span>
                <span className="font-mono text-red-500">
                  -${(quantityNum * (fees?.data_wipe_price ?? 8)).toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t flex justify-between">
              <span className="font-semibold">You Receive on Arrival</span>
              <span className="text-2xl font-mono text-primary">
                ${(
                  (totalNet ?? quantityNum * priceNum) -
                  (formData.includeDataWipe ? quantityNum * (fees?.data_wipe_price ?? 8) : 0)
                ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              *Shipping to {formData.includeDataWipe ? "Orlando facility" : "buyer"} calculated at checkout
            </p>
          </div>
        )}

        {createListing.isError && (
          <p className="text-sm text-red-500 text-center">
            {(createListing.error as Error)?.message ?? "Failed to create listing. Please try again."}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-mono" disabled={createListing.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-white font-mono" disabled={createListing.isPending}>
            {createListing.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…</>
            ) : (
              "Create Listing"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
