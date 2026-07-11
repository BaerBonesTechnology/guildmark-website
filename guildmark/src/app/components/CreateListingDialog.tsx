import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
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

// Which spec sections apply to which category.
const COMPUTE = new Set(["laptop", "desktop", "server"]);
const HAS_DISPLAY = new Set(["laptop", "monitor", "phone", "tablet"]);
const DESKTOP_SERVER = new Set(["desktop", "server"]);
const PHONE_TABLET = new Set(["phone", "tablet"]);

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (listing: Listing) => void;
}

const REQUIRED = ["item", "model", "condition", "quantity", "pricePerUnit"] as const;

const EMPTY_FORM = {
  // Identity
  item: "", manufacturer: "", model: "", modelNumber: "", year: "",
  // Condition
  condition: "", functionalStatus: "fully_functional", knownDefects: "",
  // Compute
  cpuModel: "", cpuCores: "", cpuSpeedGhz: "",
  ram: "", ramType: "", storage: "", storageType: "", gpu: "", os: "",
  // Display
  screenSize: "", screenResolution: "", touchscreen: false,
  // Desktop / server
  formFactor: "", psuWatts: "",
  // Monitor
  panelType: "", refreshRate: "", ports: "",
  // Networking
  portCount: "", throughput: "", managed: false,
  // Phone / tablet
  carrierLocked: false,
  // Marketplace / logistics
  dataWipeStatus: "not_wiped", warrantyStatus: "none", warrantyExpiration: "",
  includedAccessories: "", shipsFrom: "", productImages: "", description: "",
  // Quantity / price
  quantity: "", pricePerUnit: "",
  // Managed offload service
  includeDataWipe: false,
};

type FormKey = keyof typeof EMPTY_FORM;
const LABEL_CLS = "text-xs uppercase tracking-wide text-muted-foreground";

export function CreateListingDialog({ open, onOpenChange, onSuccess }: CreateListingDialogProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const createListing = useCreateListing();
  const { data: fees } = usePlatformFees();
  const { user } = useAuth();

  const set = (patch: Partial<typeof EMPTY_FORM>, clearErr?: string) => {
    setFormData((f) => ({ ...f, ...patch }));
    if (clearErr) setErrors((e) => ({ ...e, [clearErr]: undefined }));
  };

  const category = formData.item;
  const isCompute = COMPUTE.has(category);
  const hasDisplay = HAS_DISPLAY.has(category);
  const isDesktopServer = DESKTOP_SERVER.has(category);
  const isMonitor = category === "monitor";
  const isNetworking = category === "networking";
  const isPhoneTablet = PHONE_TABLET.has(category);

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
      if (!formData[key as FormKey]) next[key] = "Required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const num = (s: string) => (s.trim() === "" ? undefined : Number(s));

  const handleSubmit = () => {
    if (!validate()) return;

    const images = formData.productImages
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    createListing.mutate(
      {
        model_name:   `${formData.manufacturer ? formData.manufacturer + " " : ""}${formData.model}`.trim(),
        asset_type:   formData.item,
        condition:    CONDITION_GRADE[formData.condition] ?? formData.condition,
        quantity:     parseInt(formData.quantity),
        listed_price: parseFloat(formData.pricePerUnit),
        reason:       formData.description || undefined,
        // Identity
        manufacturer:        formData.manufacturer || undefined,
        model_number:        formData.modelNumber || undefined,
        year_of_manufacture: num(formData.year),
        // Condition
        functional_status:   formData.functionalStatus || undefined,
        known_defects:       formData.knownDefects || undefined,
        // Compute
        cpu_model:     isCompute ? formData.cpuModel || undefined : undefined,
        cpu_cores:     isCompute ? num(formData.cpuCores) : undefined,
        cpu_speed_ghz: isCompute ? num(formData.cpuSpeedGhz) : undefined,
        ram_gb:        isCompute ? num(formData.ram) : undefined,
        ram_type:      isCompute ? formData.ramType || undefined : undefined,
        storage_gb:    (isCompute || isPhoneTablet) ? num(formData.storage) : undefined,
        storage_type:  isCompute ? formData.storageType || undefined : undefined,
        gpu_model:     isCompute ? formData.gpu || undefined : undefined,
        // Display
        screen_size_in:    hasDisplay ? num(formData.screenSize) : undefined,
        screen_resolution: hasDisplay ? formData.screenResolution || undefined : undefined,
        touchscreen:       hasDisplay && formData.touchscreen ? true : undefined,
        // Desktop / server
        form_factor:        isDesktopServer ? formData.formFactor || undefined : undefined,
        power_supply_watts: isDesktopServer ? num(formData.psuWatts) : undefined,
        // Monitor
        panel_type:      isMonitor ? formData.panelType || undefined : undefined,
        refresh_rate_hz: isMonitor ? num(formData.refreshRate) : undefined,
        ports:           (isMonitor || isNetworking) ? formData.ports || undefined : undefined,
        // Networking
        port_count:  isNetworking ? num(formData.portCount) : undefined,
        throughput:  isNetworking ? formData.throughput || undefined : undefined,
        managed:     isNetworking && formData.managed ? true : undefined,
        // Phone / tablet
        carrier_locked: isPhoneTablet && formData.carrierLocked ? true : undefined,
        // Marketplace / logistics
        data_wipe_status:     formData.dataWipeStatus || undefined,
        warranty_status:      formData.warrantyStatus || undefined,
        warranty_expiration:  formData.warrantyExpiration || undefined,
        included_accessories: formData.includedAccessories || undefined,
        ships_from_location:  formData.shipsFrom || undefined,
        product_images:       images.length ? images : undefined,
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

  // --- field helpers (invoked as functions, not JSX, so inputs keep focus) --
  const textField = ({ k, label, placeholder, type = "text", req = false, span = 1 }: {
    k: FormKey; label: string; placeholder?: string; type?: string; req?: boolean; span?: number;
  }) => (
    <div key={k} className={`space-y-2 ${span === 2 ? "col-span-2" : ""}`}>
      <Label className={LABEL_CLS}>{label}{req && <span className="text-red-500"> *</span>}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={formData[k] as string}
        onChange={(e) => set({ [k]: e.target.value } as Partial<typeof EMPTY_FORM>, errors[k] ? k : undefined)}
        className={errors[k] ? "border-red-500" : ""}
      />
      {errors[k] && <p className="text-xs text-red-500">{errors[k]}</p>}
    </div>
  );

  const selectField = ({ k, label, options, placeholder = "Select…", req = false }: {
    k: FormKey; label: string; options: [string, string][]; placeholder?: string; req?: boolean;
  }) => (
    <div key={k} className="space-y-2">
      <Label className={LABEL_CLS}>{label}{req && <span className="text-red-500"> *</span>}</Label>
      <Select value={formData[k] as string} onValueChange={(v) => set({ [k]: v } as Partial<typeof EMPTY_FORM>, k)}>
        <SelectTrigger className={errors[k] ? "border-red-500" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(([value, optLabel]) => <SelectItem key={value} value={value}>{optLabel}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  const checkField = ({ k, label }: { k: FormKey; label: string }) => (
    <label key={k} className="flex items-center gap-2 cursor-pointer col-span-2 sm:col-span-1 py-1">
      <input type="checkbox" checked={formData[k] as boolean}
        onChange={(e) => set({ [k]: e.target.checked } as Partial<typeof EMPTY_FORM>)}
        className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
      <span className="text-sm">{label}</span>
    </label>
  );

  const sectionHead = (title: string) => (
    <div key={`head-${title}`} className="col-span-2 mt-2 mb-1 pt-3 border-t first:border-t-0 first:pt-0 first:mt-0">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
          <DialogDescription>
            List your assets on GuildMarket for other businesses to purchase
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* ── Identity ─────────────────────────────────────────────── */}
          {selectField({ k: "item", label: "Category", req: true, options: [
            ["laptop", "Laptop"], ["desktop", "Desktop"], ["server", "Server"],
            ["monitor", "Monitor"], ["networking", "Networking"],
            ["phone", "Phone"], ["tablet", "Tablet"], ["other", "Other"],
          ] })}
          {textField({ k: "manufacturer", label: "Manufacturer", placeholder: "e.g., Dell, Apple, HP" })}
          {textField({ k: "model", label: "Model", placeholder: 'e.g., MacBook Pro 14"', req: true })}
          {textField({ k: "modelNumber", label: "Model / Part No.", placeholder: "e.g., A2779" })}
          {textField({ k: "year", label: "Year", type: "number", placeholder: "e.g., 2022" })}
          {selectField({ k: "condition", label: "Condition", req: true, options: [
            ["excellent", "Excellent (Grade A)"], ["good", "Good (Grade B)"], ["fair", "Fair (Grade C)"],
          ] })}
          {selectField({ k: "functionalStatus", label: "Functional Status", options: [
            ["fully_functional", "Fully functional"],
            ["functional_with_issues", "Functional w/ issues"],
            ["for_parts", "For parts / not working"],
          ] })}

          {/* ── Compute ──────────────────────────────────────────────── */}
          {isCompute && <>
            {sectionHead("Compute")}
            {textField({ k: "cpuModel", label: "CPU Model", placeholder: "e.g., Intel Core i7-12700 / M2 Pro", span: 2 })}
            {textField({ k: "cpuCores", label: "CPU Cores", type: "number", placeholder: "e.g., 8" })}
            {textField({ k: "cpuSpeedGhz", label: "CPU Speed (GHz)", type: "number", placeholder: "e.g., 3.6" })}
            {selectField({ k: "ram", label: "RAM", options: [
              ["4", "4 GB"], ["8", "8 GB"], ["16", "16 GB"], ["32", "32 GB"], ["64", "64 GB"], ["128", "128 GB"], ["256", "256 GB"],
            ] })}
            {selectField({ k: "ramType", label: "RAM Type", options: [
              ["DDR3", "DDR3"], ["DDR4", "DDR4"], ["DDR5", "DDR5"], ["LPDDR4", "LPDDR4"], ["LPDDR5", "LPDDR5"],
            ] })}
            {selectField({ k: "storage", label: "Storage", options: [
              ["128", "128 GB"], ["256", "256 GB"], ["512", "512 GB"], ["1024", "1 TB"], ["2048", "2 TB"], ["4096", "4 TB"],
            ] })}
            {selectField({ k: "storageType", label: "Storage Type", options: [
              ["ssd", "SSD (SATA)"], ["nvme", "NVMe"], ["hdd", "HDD"], ["emmc", "eMMC"], ["other", "Other"],
            ] })}
            {textField({ k: "gpu", label: "GPU", placeholder: "e.g., RTX 3060 / integrated" })}
            {textField({ k: "os", label: "Operating System", placeholder: "e.g., Windows 11 Pro" })}
          </>}

          {/* ── Display ──────────────────────────────────────────────── */}
          {hasDisplay && <>
            {sectionHead("Display")}
            {textField({ k: "screenSize", label: "Screen Size (in)", type: "number", placeholder: "e.g., 14" })}
            {textField({ k: "screenResolution", label: "Resolution", placeholder: "e.g., 1920×1080" })}
            {checkField({ k: "touchscreen", label: "Touchscreen" })}
          </>}

          {/* ── Desktop / Server ─────────────────────────────────────── */}
          {isDesktopServer && <>
            {sectionHead("Form Factor")}
            {selectField({ k: "formFactor", label: "Form Factor", options: [
              ["SFF", "Small Form Factor"], ["Tower", "Tower"], ["Mini", "Mini / USFF"],
              ["1U", "1U Rack"], ["2U", "2U Rack"], ["4U", "4U Rack"], ["Blade", "Blade"],
            ] })}
            {textField({ k: "psuWatts", label: "PSU (Watts)", type: "number", placeholder: "e.g., 750" })}
          </>}

          {/* ── Monitor ──────────────────────────────────────────────── */}
          {isMonitor && <>
            {sectionHead("Monitor")}
            {selectField({ k: "panelType", label: "Panel Type", options: [
              ["IPS", "IPS"], ["VA", "VA"], ["TN", "TN"], ["OLED", "OLED"],
            ] })}
            {textField({ k: "refreshRate", label: "Refresh Rate (Hz)", type: "number", placeholder: "e.g., 144" })}
            {textField({ k: "ports", label: "Ports", placeholder: "e.g., 2× HDMI, 1× DP", span: 2 })}
          </>}

          {/* ── Networking ───────────────────────────────────────────── */}
          {isNetworking && <>
            {sectionHead("Networking")}
            {textField({ k: "portCount", label: "Port Count", type: "number", placeholder: "e.g., 48" })}
            {selectField({ k: "throughput", label: "Throughput", options: [
              ["1G", "1 Gbps"], ["2.5G", "2.5 Gbps"], ["10G", "10 Gbps"], ["25G", "25 Gbps"], ["40G", "40 Gbps"], ["100G", "100 Gbps"],
            ] })}
            {checkField({ k: "managed", label: "Managed switch" })}
            {textField({ k: "ports", label: "Uplinks / Notes", placeholder: "e.g., 4× SFP+", span: 2 })}
          </>}

          {/* ── Phone / Tablet ───────────────────────────────────────── */}
          {isPhoneTablet && <>
            {sectionHead("Device")}
            {selectField({ k: "storage", label: "Storage", options: [
              ["64", "64 GB"], ["128", "128 GB"], ["256", "256 GB"], ["512", "512 GB"], ["1024", "1 TB"],
            ] })}
            {checkField({ k: "carrierLocked", label: "Carrier-locked" })}
          </>}

          {/* ── Compliance & logistics ───────────────────────────────── */}
          {sectionHead("Compliance & Logistics")}
          {selectField({ k: "dataWipeStatus", label: "Data Sanitization", options: [
            ["not_wiped", "Not wiped"], ["wiped", "Wiped"], ["certified", "NIST 800-88 certified"],
          ] })}
          {selectField({ k: "warrantyStatus", label: "Warranty", options: [
            ["none", "None"], ["active", "Active"], ["expired", "Expired"],
          ] })}
          {formData.warrantyStatus === "active" &&
            textField({ k: "warrantyExpiration", label: "Warranty Expires", type: "date" })}
          {textField({ k: "shipsFrom", label: "Ships From", placeholder: "e.g., Orlando, FL" })}
          {textField({ k: "includedAccessories", label: "Included Accessories", placeholder: "e.g., charger, dock, cables", span: 2 })}

          {/* ── Quantity & price ─────────────────────────────────────── */}
          {sectionHead("Quantity & Price")}
          {textField({ k: "quantity", label: "Quantity", type: "number", placeholder: "Number of units", req: true })}
          {textField({ k: "pricePerUnit", label: "Price Per Unit ($)", type: "number", placeholder: "Enter price per unit", req: true })}

          {/* ── Detail & media ───────────────────────────────────────── */}
          {sectionHead("Detail & Media")}
          <div className="space-y-2 col-span-2">
            <Label className={LABEL_CLS}>Known Defects (Optional)</Label>
            <textarea
              placeholder="Cosmetic wear, dead pixels, missing keys, etc."
              value={formData.knownDefects}
              onChange={(e) => set({ knownDefects: e.target.value })}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              rows={2}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label className={LABEL_CLS}>Description (Optional)</Label>
            <textarea
              placeholder="Add any additional details about the assets…"
              value={formData.description}
              onChange={(e) => set({ description: e.target.value })}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              rows={2}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label className={LABEL_CLS}>Photo URLs (Optional)</Label>
            <textarea
              placeholder="One image URL per line (first is the cover image)"
              value={formData.productImages}
              onChange={(e) => set({ productImages: e.target.value })}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono text-xs"
              rows={2}
            />
          </div>

          {/* ── Managed offload service ──────────────────────────────── */}
          <div className="col-span-2">
            <label className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted/70 transition-colors">
              <input
                type="checkbox"
                checked={formData.includeDataWipe}
                onChange={(e) => set({ includeDataWipe: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-input text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">Include Data Wipe Service</p>
                  <span className="text-sm text-primary">+${fees?.data_wipe_price ?? 8}/asset</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ship to our Orlando facility → You get paid on arrival → We handle NIST 800-88 certified data wipe &amp; delivery to buyer.
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
              <span>${(quantityNum * priceNum).toLocaleString()}</span>
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
              <span className="text-red-500">
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
                <span className="text-red-500">
                  -${(quantityNum * (fees?.data_wipe_price ?? 8)).toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t flex justify-between">
              <span className="font-semibold">You Receive on Arrival</span>
              <span className="text-2xl text-primary">
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createListing.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-white" disabled={createListing.isPending}>
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
