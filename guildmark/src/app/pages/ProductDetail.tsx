/**
 * Product Detail Page (PDP) — full listing view with on-page buying.
 *
 * Replaces the old detail/offer popups. Loads the listing via useListing(id)
 * and offers two paths:
 *   • Buy at list price  → one-click offer at the asking price
 *   • Make an offer      → price + quantity form (useMakeOffer)
 *
 * A card "Buy Now" checkout (Square) is a separate stage; the offer flow is
 * the working path today.
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft, Building2, Cpu, HardDrive, MemoryStick, Package, Loader2, CheckCircle2, AlertTriangle,
  Laptop, Monitor, Server, Smartphone, Tablet, Network, ShieldCheck, GitCompare,
} from "lucide-react";
import { MarketSignal } from "../components/MarketSignal";
import { useCompare } from "../components/CompareContext";
import { BuyNowDialog } from "../components/BuyNowDialog";
import { useListing, useMakeOffer } from "../lib/apiHooks";
import type { MarketplaceListing } from "../models/marketplace";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const CATEGORY_ICON: Record<string, React.ElementType> = {
  laptop: Laptop, desktop: Monitor, server: Server, phone: Smartphone,
  tablet: Tablet, networking: Network, monitor: Monitor,
};
const GRADE_COLOR: Record<string, string> = { A: "var(--grade-a)", B: "var(--grade-b)", C: "var(--grade-c)" };
const conditionLabel: Record<string, string> = { A: "Grade A", B: "Grade B", C: "Grade C" };

const STORAGE_TYPE_LABEL: Record<string, string> = { ssd: "SSD", nvme: "NVMe", hdd: "HDD", emmc: "eMMC", other: "" };
const FUNCTIONAL_LABEL: Record<string, string> = {
  fully_functional: "Fully functional", functional_with_issues: "Functional — with issues", for_parts: "For parts / not working",
};
const WIPE_LABEL: Record<string, string> = { not_wiped: "Not wiped", wiped: "Data wiped", certified: "NIST 800-88 certified" };
const WARRANTY_LABEL: Record<string, string> = { none: "No warranty", active: "Active warranty", expired: "Warranty expired" };

/** Build the ordered spec list for the detail table, skipping empty fields. */
function buildSpecRows(l: MarketplaceListing): [string, string][] {
  const rows: [string, string][] = [];
  const push = (label: string, v: unknown) => {
    if (v !== null && v !== undefined && v !== "") rows.push([label, String(v)]);
  };
  push("Manufacturer", l.manufacturer);
  push("Model No.", l.model_number);
  push("Year", l.year_of_manufacture);
  push("CPU", l.cpu_model ?? (l.cpu_score != null ? `Score ${l.cpu_score}` : undefined));
  if (l.cpu_cores != null) push("CPU Cores", l.cpu_cores);
  if (l.cpu_speed_ghz != null) push("CPU Speed", `${l.cpu_speed_ghz} GHz`);
  if (l.ram_gb != null) push("RAM", `${l.ram_gb} GB${l.ram_type ? ` ${l.ram_type}` : ""}`);
  if (l.storage_gb != null) push("Storage", `${l.storage_gb} GB${l.storage_type && STORAGE_TYPE_LABEL[l.storage_type] ? ` ${STORAGE_TYPE_LABEL[l.storage_type]}` : ""}`);
  push("GPU", l.gpu_model);
  if (l.screen_size_in != null) push("Screen", `${l.screen_size_in}"${l.screen_resolution ? ` · ${l.screen_resolution}` : ""}`);
  else push("Resolution", l.screen_resolution);
  if (l.touchscreen) push("Touchscreen", "Yes");
  push("Panel", l.panel_type);
  if (l.refresh_rate_hz != null) push("Refresh Rate", `${l.refresh_rate_hz} Hz`);
  push("Form Factor", l.form_factor);
  if (l.power_supply_watts != null) push("PSU", `${l.power_supply_watts} W`);
  if (l.port_count != null) push("Ports", l.port_count);
  push("Throughput", l.throughput);
  if (l.managed != null) push("Managed", l.managed ? "Yes" : "No");
  if (l.carrier_locked != null) push("Carrier", l.carrier_locked ? "Locked" : "Unlocked");
  push("Ports / Notes", l.ports);
  return rows;
}

function daysAgo(iso: string) { return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000); }
function demandSignal(l: MarketplaceListing): 1 | 2 | 3 | 4 | 5 {
  const newBoost = daysAgo(l.created_at) <= 3 ? 1 : 0;
  const base: Record<string, number> = { distressed: 4, standard: 3, insufficient_data: 2, seller_overpriced: 1 };
  return Math.min(5, Math.max(1, (base[l.valuation_flag] ?? 2) + newBoost)) as 1 | 2 | 3 | 4 | 5;
}

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

function BackLink() {
  return (
    <Link to="/pre/marketplace" className="inline-flex items-center gap-1.5 text-xs mb-5 hover:text-foreground transition-colors" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
      <ArrowLeft size={13} /> Back to GuildMarket
    </Link>
  );
}

export function ProductDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: listing, isPending, isError, error } = useListing(id);

  const makeOffer = useMakeOffer();
  const { toggle, isCompared, atMax } = useCompare();
  const [offerPrice, setOfferPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (listing) { setOfferPrice(String(listing.listed_price ?? "")); setQuantity("1"); setFormError(null); setSubmitted(false); setPurchased(false); setImgIdx(0); }
  }, [listing]);

  if (isPending) {
    return (
      <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
        <BackLink />
        <div className="border border-border py-24 flex flex-col items-center gap-3" style={{ background: "var(--card)" }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Loading listing…</p>
        </div>
      </div>
    );
  }
  if (isError || !listing) {
    return (
      <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
        <BackLink />
        <div className="border border-border p-8 flex items-start gap-4" style={{ background: "var(--card)", borderLeft: "3px solid var(--chart-4)" }}>
          <AlertTriangle className="w-6 h-6 mt-0.5 shrink-0" style={{ color: "var(--chart-4)" }} />
          <div>
            <p className="font-medium mb-1">Listing unavailable</p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {error instanceof Error ? error.message : "This listing could not be found or is no longer active."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const price = listing.listed_price ?? listing.buyer_ask_price ?? 0;
  const available = listing.quantity ?? 1;
  const Icon = CATEGORY_ICON[listing.asset_type ?? ""] ?? Package;
  const grade = listing.condition_grade;
  const images = listing.product_images ?? [];
  const compared = isCompared(listing.id);
  const disabledCompare = atMax(listing);
  const specRows = buildSpecRows(listing);

  function submitOffer(atList = false) {
    const p = atList ? price : parseFloat(offerPrice);
    const q = parseInt(quantity, 10);
    if (isNaN(p) || p <= 0) { setFormError("Enter a valid offer price"); return; }
    if (isNaN(q) || q <= 0) { setFormError("Enter a valid quantity"); return; }
    setFormError(null);
    makeOffer.mutate({ listing_id: listing!.id, offer_price: p, quantity: q }, { onSuccess: () => setSubmitted(true) });
  }

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
      <BackLink />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left — media gallery + specs */}
        <div className="space-y-4">
          <div className="border border-border h-[360px] relative flex items-center justify-center overflow-hidden" style={{ background: "var(--secondary)" }}>
            {images.length > 0
              ? <img src={images[Math.min(imgIdx, images.length - 1)]} alt={listing.model_name ?? "Listing"} className="w-full h-full object-cover" />
              : <Icon size={64} className="opacity-25" style={{ color: "var(--muted-foreground)" }} />}
            <div className="absolute top-3 left-3 flex gap-1.5">
              {grade && (
                <span className="text-[10px] px-2 py-0.5" style={{ color: GRADE_COLOR[grade], border: `1px solid color-mix(in srgb, ${GRADE_COLOR[grade]} 30%, transparent)`, background: "rgba(0,0,0,0.4)", fontFamily: MONO }}>
                  {conditionLabel[grade]}
                </span>
              )}
              <span className="text-[10px] px-2 py-0.5 flex items-center gap-1" style={{ color: "#fff", border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)", background: "var(--primary)", fontFamily: MONO }}>
                <ShieldCheck size={10} /> CERTIFIED
              </span>
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className="w-16 h-16 border overflow-hidden transition-colors"
                  style={{ borderColor: i === imgIdx ? "var(--primary)" : "var(--border)" }}>
                  <img src={src} alt={`${listing.model_name ?? "Listing"} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px border border-border" style={{ background: "var(--border)" }}>
            {(listing.cpu_model || listing.cpu_score != null) && (
              <SpecTile icon={Cpu} label="CPU" value={listing.cpu_model ?? `Score ${listing.cpu_score}`} />
            )}
            {listing.ram_gb != null && <SpecTile icon={MemoryStick} label="RAM" value={`${listing.ram_gb} GB${listing.ram_type ? ` ${listing.ram_type}` : ""}`} />}
            {listing.storage_gb != null && <SpecTile icon={HardDrive} label="Storage" value={`${listing.storage_gb} GB${listing.storage_type && STORAGE_TYPE_LABEL[listing.storage_type] ? ` ${STORAGE_TYPE_LABEL[listing.storage_type]}` : ""}`} />}
            {listing.condition_grade && <SpecTile icon={ShieldCheck} label="Condition" value={conditionLabel[listing.condition_grade]} />}
            {listing.asset_type && <SpecTile icon={Icon} label="Type" value={listing.asset_type} />}
            <SpecTile icon={Package} label="Available" value={`${available} unit${available === 1 ? "" : "s"}`} />
          </div>

          {/* Full specifications table */}
          {specRows.length > 0 && (
            <div className="border border-border" style={{ background: "var(--card)" }}>
              <div className="px-4 py-3 border-b border-border">
                <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Specifications</span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {specRows.map(([label, value], i) => (
                    <tr key={label} style={{ background: i % 2 === 0 ? "transparent" : "var(--secondary)" }}>
                      <td className="py-2 px-4 w-2/5 align-top text-[11px] tracking-wide uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{label}</td>
                      <td className="py-2 px-4">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Condition & logistics */}
          <div className="border border-border p-5 space-y-4" style={{ background: "var(--card)" }}>
            <span className="text-[10px] tracking-widest uppercase block" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Condition &amp; Logistics</span>
            <div className="flex flex-wrap gap-2">
              {listing.functional_status && (
                <span className="text-[10px] px-2 py-1 flex items-center gap-1.5" style={{ fontFamily: MONO, border: "1px solid var(--border)", color: "var(--foreground)" }}>
                  {FUNCTIONAL_LABEL[listing.functional_status] ?? listing.functional_status}
                </span>
              )}
              {listing.data_wipe_status && (
                <span className="text-[10px] px-2 py-1 flex items-center gap-1.5"
                  style={{ fontFamily: MONO, border: `1px solid color-mix(in srgb, var(--primary) ${listing.data_wipe_status === "certified" ? 40 : 20}%, transparent)`, color: listing.data_wipe_status === "certified" ? "var(--primary)" : "var(--muted-foreground)" }}>
                  <ShieldCheck size={10} /> {WIPE_LABEL[listing.data_wipe_status] ?? listing.data_wipe_status}
                </span>
              )}
              {listing.warranty_status && listing.warranty_status !== "none" && (
                <span className="text-[10px] px-2 py-1" style={{ fontFamily: MONO, border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                  {WARRANTY_LABEL[listing.warranty_status] ?? listing.warranty_status}
                  {listing.warranty_expiration ? ` · ${new Date(listing.warranty_expiration).toLocaleDateString()}` : ""}
                </span>
              )}
            </div>
            {listing.known_defects && (
              <div>
                <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Known defects</p>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{listing.known_defects}</p>
              </div>
            )}
            {listing.included_accessories && (
              <div>
                <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Included accessories</p>
                <p className="text-sm">{listing.included_accessories}</p>
              </div>
            )}
            {listing.ships_from_location && (
              <div>
                <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Ships from</p>
                <p className="text-sm">{listing.ships_from_location}</p>
              </div>
            )}
            {!listing.functional_status && !listing.data_wipe_status && !listing.known_defects &&
              !listing.included_accessories && !listing.ships_from_location &&
              (listing.warranty_status === "none" || !listing.warranty_status) && (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No additional condition details provided.</p>
              )}
          </div>
        </div>

        {/* Right — title, price, buy/offer */}
        <div className="space-y-4">
          <div className="border border-border p-6" style={{ background: "var(--card)" }}>
            <div className="flex items-start justify-between gap-3 mb-1">
              <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", lineHeight: 1 }}>
                {listing.model_name ?? "Listing"}
              </h1>
              <MarketSignal strength={demandSignal(listing)} />
            </div>
            <button onClick={() => { if (!disabledCompare) toggle(listing); }} disabled={disabledCompare}
              title={disabledCompare ? "Max 4 per category" : undefined}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-wider mb-3 transition-colors disabled:opacity-40"
              style={{ fontFamily: MONO, border: `1px solid ${compared ? "var(--primary)" : "var(--border)"}`, color: compared ? "#fff" : "var(--muted-foreground)", background: compared ? "var(--primary)" : "transparent" }}>
              <GitCompare size={11} /> {compared ? "ADDED TO COMPARE" : "ADD TO COMPARE"}
            </button>
            <p className="text-xs flex items-center gap-1.5 mb-5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
              <Building2 size={11} />
              {listing.seller_name ?? "B2B Seller"}
              {listing.seller_industry ? ` · ${listing.seller_industry}` : ""}
              {listing.seller_size_band ? ` · ${listing.seller_size_band}` : ""}
            </p>

            <div className="flex items-end gap-2 mb-1">
              <span className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Listed / unit</span>
            </div>
            <p className="text-5xl leading-none mb-6" style={{ fontFamily: DISPLAY, fontWeight: 700, color: "var(--primary)" }}>
              {price > 0 ? `$${price.toLocaleString()}` : "—"}
            </p>

            {purchased ? (
              <div className="border border-border p-5 flex items-start gap-3" style={{ background: "var(--secondary)" }}>
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                <div>
                  <p className="text-sm font-medium mb-1">Order placed</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Payment received and funds are held in escrow. Track it under My Orders.</p>
                </div>
              </div>
            ) : submitted ? (
              <div className="border border-border p-5 flex items-start gap-3" style={{ background: "var(--secondary)" }}>
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                <div>
                  <p className="text-sm font-medium mb-1">Offer submitted</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>The seller will be notified and can accept, counter, or decline. Track it under My Offers.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => setBuyOpen(true)} disabled={price <= 0}
                  className="w-full py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "var(--primary)", color: "#fff", fontFamily: BODY }}>
                  {price > 0 ? `Buy Now · $${price.toLocaleString()}` : "Unavailable"}
                </button>

                <div className="border-t border-border pt-4">
                  <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Or make an offer</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Price / unit</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--muted-foreground)" }}>$</span>
                        <input type="number" min="0.01" step="0.01" value={offerPrice} onChange={(e) => { setOfferPrice(e.target.value); setFormError(null); }}
                          className="w-full pl-6 pr-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary"
                          style={{ fontFamily: BODY, background: "var(--input-background)" }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Quantity</label>
                      <input type="number" min="1" step="1" value={quantity} onChange={(e) => { setQuantity(e.target.value); setFormError(null); }}
                        className="w-full px-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary"
                        style={{ fontFamily: BODY, background: "var(--input-background)" }} />
                    </div>
                  </div>
                  {formError && <p className="text-xs mb-3" style={{ color: "var(--chart-4)" }}>{formError}</p>}
                  <button onClick={() => submitOffer(false)} disabled={makeOffer.isPending}
                    className="w-full py-3 text-sm border border-border hover:border-foreground transition-colors disabled:opacity-50" style={{ fontFamily: BODY }}>
                    {makeOffer.isPending ? "Submitting…" : "Submit offer"}
                  </button>
                  <p className="text-[10px] mt-2" style={{ color: "var(--muted-foreground)" }}>{available} unit{available === 1 ? "" : "s"} available · escrow-secured payment on acceptance</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BuyNowDialog
        open={buyOpen}
        onOpenChange={setBuyOpen}
        listing={listing}
        quantity={Math.max(1, parseInt(quantity, 10) || 1)}
        onSuccess={() => setPurchased(true)}
      />
    </div>
  );
}
