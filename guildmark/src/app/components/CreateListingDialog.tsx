import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateListingDialog({ open, onOpenChange }: CreateListingDialogProps) {
  const [formData, setFormData] = useState({
    item: "",
    brand: "",
    model: "",
    cpu: "",
    ram: "",
    storage: "",
    condition: "",
    quantity: "",
    pricePerUnit: "",
    description: "",
    includeDataWipe: false,
  });

  const handleSubmit = () => {
    // Handle form submission
    console.log("Creating listing:", formData);
    onOpenChange(false);
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
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Item Category</Label>
            <Select value={formData.item} onValueChange={(value) => setFormData({ ...formData, item: value })}>
              <SelectTrigger className="font-mono">
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
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Model</Label>
            <Input
              placeholder='e.g., MacBook Pro 14"'
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="font-mono"
            />
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
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Condition</Label>
            <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
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
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Quantity</Label>
            <Input
              type="number"
              min="1"
              placeholder="Number of units"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="font-mono"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Price Per Unit ($)</Label>
            <Input
              type="number"
              min="0"
              step="50"
              placeholder="Enter price per unit"
              value={formData.pricePerUnit}
              onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
              className="font-mono"
            />
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
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">Include Data Wipe Service</p>
                  <span className="text-sm text-[#3B82F6]">+$8/asset</span>
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
                ${(parseInt(formData.quantity || "0") * parseFloat(formData.pricePerUnit || "0")).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee (8%)</span>
              <span className="font-mono text-red-500">
                -${((parseInt(formData.quantity || "0") * parseFloat(formData.pricePerUnit || "0")) * 0.08).toFixed(2)}
              </span>
            </div>
            {formData.includeDataWipe && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data Wipe Service ({formData.quantity} × $8)</span>
                <span className="font-mono text-red-500">
                  -${(parseInt(formData.quantity || "0") * 8).toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t flex justify-between">
              <span className="font-semibold">You Receive on Arrival</span>
              <span className="text-2xl font-mono text-[#3B82F6]">
                ${(
                  (parseInt(formData.quantity || "0") * parseFloat(formData.pricePerUnit || "0")) * 0.92 -
                  (formData.includeDataWipe ? parseInt(formData.quantity || "0") * 8 : 0)
                ).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              *Shipping to {formData.includeDataWipe ? "Orlando facility" : "buyer"} calculated at checkout
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-mono">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-mono">
            Create Listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
