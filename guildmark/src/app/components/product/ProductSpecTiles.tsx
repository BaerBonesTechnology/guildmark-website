/** PDP quick-spec tile grid (CPU, RAM, storage, condition, type, available). */
import { Cpu, HardDrive, MemoryStick, Package, ShieldCheck } from "lucide-react";
import { CONDITION_LABEL } from "../../constants/marketplace.constants";
import { STORAGE_TYPE_LABEL } from "../../constants/product.constants";
import { MONO } from "../../constants/typography";
import { categoryIcon } from "../../services/marketplace.service";
import type { MarketplaceListing } from "../../models/marketplace";

function SpecTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="p-4 flex items-center gap-3" style={{ background: "var(--card)" }}>
      <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ border: "1px solid var(--border)", background: "var(--secondary)" }}>
        <Icon size={13} style={{ color: "var(--muted-foreground)" }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{label}</p>
        <p className="text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

export function ProductSpecTiles({ available, listing }: { available: number; listing: MarketplaceListing }) {
  const Icon = categoryIcon(listing.asset_type);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-px border border-border" style={{ background: "var(--border)" }}>
      {(listing.cpu_model || listing.cpu_score != null) && (
        <SpecTile icon={Cpu} label="CPU" value={listing.cpu_model ?? `Score ${listing.cpu_score}`} />
      )}
      {listing.ram_gb != null && <SpecTile icon={MemoryStick} label="RAM" value={`${listing.ram_gb} GB${listing.ram_type ? ` ${listing.ram_type}` : ""}`} />}
      {listing.storage_gb != null && <SpecTile icon={HardDrive} label="Storage" value={`${listing.storage_gb} GB${listing.storage_type && STORAGE_TYPE_LABEL[listing.storage_type] ? ` ${STORAGE_TYPE_LABEL[listing.storage_type]}` : ""}`} />}
      {listing.condition_grade && <SpecTile icon={ShieldCheck} label="Condition" value={CONDITION_LABEL[listing.condition_grade]} />}
      {listing.asset_type && <SpecTile icon={Icon} label="Type" value={listing.asset_type} />}
      <SpecTile icon={Package} label="Available" value={`${available} unit${available === 1 ? "" : "s"}`} />
    </div>
  );
}
