/**
 * React Query hooks for the Partner Portal.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { apiJson } from "./api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AssignmentStatus =
  | "available"
  | "claimed"
  | "wipe_in_progress"
  | "wipe_complete"
  | "reimage_in_progress"
  | "reimage_complete"
  | "awaiting_cert"
  | "cert_uploaded"
  | "shipped"
  | "complete"
  | "cancelled";

export interface WorkboardItem {
  id: string;
  order_ref: string;
  buyer_name: string;
  buyer_city: string;
  service_type: "wipe_only" | "wipe_and_reimage";
  item_count: number;
  wipe_payout_cents: number;
  reimage_payout_cents: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  order_ref: string;
  buyer_name: string;
  buyer_city: string;
  service_type: "wipe_only" | "wipe_and_reimage";
  item_count: number;
  wipe_payout_cents: number;
  reimage_payout_cents: number;
  wipe_method: string | null;
  reimage_os: string | null;
  cert_url: string | null;
  tracking_number: string | null;
  carrier: string | null;
  status: AssignmentStatus;
  claimed_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface Payout {
  id: string;
  payout_ref: string;
  amount_cents: number;
  method: string;
  status: "pending" | "paid" | "failed";
  paid_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const queryKeys = {
  workboard: ()   => ["partner", "workboard"]   as const,
  services:  ()   => ["partner", "services"]    as const,
  account:   ()   => ["partner", "account"]     as const,
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useWorkboard() {
  return useQuery({
    queryKey: queryKeys.workboard(),
    queryFn: async () => {
      const data = await apiJson<{ items: WorkboardItem[] }>("/partner/workboard");
      return data.items;
    },
  });
}

export function useClaimOrder(): UseMutationResult<
  Assignment,
  Error,
  string  // assignment id
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await apiJson<{ assignment: Assignment }>(
        `/partner/workboard/${id}/claim`,
        { method: "POST" }
      );
      return data.assignment;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workboard() });
      qc.invalidateQueries({ queryKey: queryKeys.services() });
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: queryKeys.services(),
    queryFn: async () => {
      const data = await apiJson<{ items: Assignment[] }>("/partner/services");
      return data.items;
    },
  });
}

export interface UpdateAssignmentBody {
  status: AssignmentStatus;
  wipe_method?: string;
  reimage_os?: string;
  cert_url?: string;
  tracking_number?: string;
  carrier?: string;
}

export function useUpdateAssignment(): UseMutationResult<
  Assignment,
  Error,
  { id: string } & UpdateAssignmentBody
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) => {
      const data = await apiJson<{ assignment: Assignment }>(
        `/partner/services/${id}`,
        { method: "PUT", body: JSON.stringify(body) }
      );
      return data.assignment;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.services() });
    },
  });
}

export function useAccount() {
  return useQuery({
    queryKey: queryKeys.account(),
    queryFn: async () =>
      apiJson<{ partner: object; payouts: Payout[] }>("/partner/account"),
  });
}

export function useWithdraw(): UseMutationResult<{ payout: Payout }, Error, void> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      apiJson<{ payout: Payout }>("/partner/account/withdraw", {
        method: "POST",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.account() });
    },
  });
}
