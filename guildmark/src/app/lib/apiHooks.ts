/**
 * GuildMark API Hooks
 *
 * React Query hooks for every endpoint. All data fetching in the app
 * goes through these — no raw fetch calls in page components.
 *
 * Requires: @tanstack/react-query — add to package.json:
 *   "dependencies": { "@tanstack/react-query": "^5.0.0" }
 *
 * Wrap your app root with:
 *   <QueryClientProvider client={queryClient}>
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "./api";
import type { Asset } from "../models/asset";
import type { Listing } from "../models/listing";
import type { MarketplaceListing, BuyerOffer } from "../models/marketplace";
import type { MdmConnection, MdmConnectRequest } from "../models/mdm";
import type { TaxInvoice, InvoiceType } from "../models/invoice";
import type { PortfolioSummary } from "../models/portfolio";
import type { PaginatedResponse } from "../models/pagination";
import type { ValuationEstimateRequest, ValuationEstimateResponse } from "../models/valuation";
import type { AssetValuationsResponse } from "../models/asset_valuation";

// ---------------------------------------------------------------------------
// Query key factory — centralizes cache key naming
// ---------------------------------------------------------------------------

export const queryKeys = {
  // Marketplace
  marketplace:       (filters?: object)  => ["marketplace", filters] as const,
  listing:           (id: string)        => ["listing", id] as const,
  myListings:        ()                  => ["my-listings"] as const,
  myOffers:          ()                  => ["my-offers"] as const,

  // Assets
  assets:            (filters?: object)  => ["assets", filters] as const,
  asset:             (id: string)        => ["asset", id] as const,

  // AMPS
  portfolio:         ()                  => ["amps", "portfolio"] as const,
  ampsAssets:        (filters?: object)  => ["amps", "assets", filters] as const,
  mdmConnections:    ()                  => ["amps", "mdm"] as const,
  invoices:          ()                  => ["amps", "invoices"] as const,

  // Dashboard
  dashboard:         ()                  => ["dashboard"] as const,

  // Valuation history
  assetValuations:   (id: string)        => ["asset-valuations", id] as const,
} as const;

// ---------------------------------------------------------------------------
// Marketplace hooks
// ---------------------------------------------------------------------------

export interface MarketplaceFilters {
  asset_type?:      string;
  condition_grade?: string;
  max_price?:       number;
  search?:          string;
  page?:            number;
  page_size?:       number;
}

export function useMarketplaceListings(filters: MarketplaceFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v));
  });

  return useQuery({
    queryKey: queryKeys.marketplace(filters),
    queryFn:  () =>
      api.get<PaginatedResponse<MarketplaceListing>>(
        `/marketplace/listings?${params.toString()}`
      ),
    staleTime: 2 * 60 * 1000,   // 2 minutes — market prices shift
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: queryKeys.listing(id),
    queryFn:  () => api.get<MarketplaceListing>(`/marketplace/listings/${id}`),
    enabled:  !!id,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: queryKeys.myListings(),
    queryFn:  () => api.get<Listing[]>("/seller/listings"),
  });
}

export function useMyOffers() {
  return useQuery({
    queryKey: queryKeys.myOffers(),
    queryFn:  () => api.get<BuyerOffer[]>("/buyer/offers"),
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      asset_id?:    string;
      model_name:   string;
      asset_type:   string;
      condition:    string;
      quantity:     number;
      listed_price: number;
      reason?:      string;
    }) => api.post<Listing>("/seller/listings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myListings() });
      qc.invalidateQueries({ queryKey: queryKeys.marketplace() });
    },
  });
}

export function useWithdrawListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) =>
      api.patch<Listing>(`/seller/listings/${listingId}/withdraw`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myListings() });
    },
  });
}

export function useMakeOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      listing_id:  string;
      offer_price: number;
      quantity:    number;
    }) => api.post<BuyerOffer>("/buyer/offers", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myOffers() });
    },
  });
}

export function useRespondToOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      offerId,
      action,
      counter_price,
    }: {
      offerId:        string;
      action:         "accept" | "reject" | "counter";
      counter_price?: number;
    }) =>
      api.patch<BuyerOffer>(
        `/seller/offers/${offerId}/${action}`,
        counter_price != null ? { counter_price } : {},
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myListings() });
    },
  });
}

// ---------------------------------------------------------------------------
// Asset hooks (non-AMPS — manual listing flow)
// ---------------------------------------------------------------------------

export function useAssets(filters?: object) {
  return useQuery({
    queryKey: queryKeys.assets(filters),
    queryFn:  () => api.get<Asset[]>("/assets"),
  });
}

// ---------------------------------------------------------------------------
// AMPS Portfolio hooks
// ---------------------------------------------------------------------------

export function usePortfolioSummary() {
  return useQuery({
    queryKey: queryKeys.portfolio(),
    queryFn:  () => api.get<PortfolioSummary>("/amps/portfolio"),
    staleTime: 5 * 60 * 1000,   // 5 minutes — updated nightly, no point polling hard
  });
}

export function useAmpsAssets(filters: {
  asset_type?:      string;
  condition_grade?: string;
  search?:          string;
  filter?:          string;   // e.g. "aging" for > 36 months
  page?:            number;
} = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v));
  });

  return useQuery({
    queryKey: queryKeys.ampsAssets(filters),
    queryFn:  () =>
      api.get<PaginatedResponse<Asset>>(`/amps/assets?${params.toString()}`),
  });
}

export function useQuickListAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) =>
      api.post<{ listing_id: string; buyer_ask_price: number | null }>(
        `/amps/assets/${assetId}/list`, {}
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ampsAssets() });
      qc.invalidateQueries({ queryKey: queryKeys.myListings() });
      qc.invalidateQueries({ queryKey: queryKeys.marketplace() });
    },
  });
}

// ---------------------------------------------------------------------------
// MDM connection hooks
// ---------------------------------------------------------------------------

export function useMdmConnections() {
  return useQuery({
    queryKey: queryKeys.mdmConnections(),
    queryFn:  () => api.get<MdmConnection[]>("/amps/mdm/connections"),
  });
}

export function useConnectMdm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MdmConnectRequest) =>
      api.post<MdmConnection>("/amps/mdm/connect", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mdmConnections() });
    },
  });
}

export function useDisconnectMdm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) =>
      api.delete<void>(`/amps/mdm/connections/${connectionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mdmConnections() });
    },
  });
}

export function useTriggerMdmSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) =>
      api.post<{ run_id: string }>(`/amps/mdm/connections/${connectionId}/sync`, {}),
    onSuccess: () => {
      // Sync is async — invalidate after a short delay to catch status update
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: queryKeys.mdmConnections() });
        qc.invalidateQueries({ queryKey: queryKeys.ampsAssets() });
        qc.invalidateQueries({ queryKey: queryKeys.portfolio() });
      }, 3000);
    },
  });
}

// ---------------------------------------------------------------------------
// Invoice hooks
// ---------------------------------------------------------------------------

export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices(),
    queryFn:  () => api.get<TaxInvoice[]>("/amps/invoices"),
  });
}

export function useGenerateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      asset_id:     string;
      invoice_type: InvoiceType;
      invoice_date: string;
    }) =>
      api.post<{
        invoice_id:       string;
        invoice_number:   string;
        write_off_amount: number;
        market_value:     number;
        pdf_path:         string | null;
      }>("/amps/invoices/generate", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.invoices() });
    },
  });
}

// ---------------------------------------------------------------------------
// Dashboard hooks
// ---------------------------------------------------------------------------

export interface DashboardData {
  total_fleet_value:     number;
  projected_loss_6mo:    number;
  recovery_opportunity:  number;
  idle_units:            number;
  fleet_efficiency_pct:  number;
  high_demand_assets:    Array<{
    asset_id:     string;
    model_name:   string;
    specs:        string;
    demand_score: number;
    peak_date:    string;
    status:       "ready" | "hold";
  }>;
  value_trend: Array<{
    month:   string;
    current: number;
    upgrade: number;
  }>;
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn:  () => api.get<DashboardData>("/dashboard"),
    staleTime: 60 * 1000,   // 1 minute
  });
}

// ---------------------------------------------------------------------------
// Valuation estimate hook (ML inference pass-through)
// ---------------------------------------------------------------------------

/**
 * Fires a valuation estimate request whenever `req` is defined.
 * Pass `undefined` to disable the query (e.g. while the form is incomplete).
 *
 * Backed by POST /valuation/estimate — requires auth.
 */
export function useValuationEstimate(req: ValuationEstimateRequest | undefined) {
  return useQuery({
    queryKey: ["valuation-estimate", req] as const,
    queryFn:  () =>
      api.post<ValuationEstimateResponse>("/valuation/estimate", req!),
    enabled:   !!req,
    staleTime: 5 * 60 * 1000,   // 5 minutes — same input → same model output
    retry:     1,               // ML service may be cold-starting; retry once
  });
}

// ---------------------------------------------------------------------------
// Asset valuation history
// ---------------------------------------------------------------------------

/**
 * Full per-asset valuation history — all ML valuations ever recorded for this
 * asset, newest first. Includes listing prices and price-to-FMV ratios where
 * the valuation was triggered by a listing creation.
 *
 * Pass `null` to disable (e.g. before a row is selected).
 */
export function useAssetValuations(assetId: string | null) {
  return useQuery({
    queryKey: queryKeys.assetValuations(assetId ?? ""),
    queryFn:  () =>
      api.get<AssetValuationsResponse>(`/assets/${assetId}/valuations?limit=100`),
    enabled:   !!assetId,
    staleTime: 30 * 1000,
  });
}
