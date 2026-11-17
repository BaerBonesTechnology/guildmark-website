import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { loadSquareSdk, type SquareCardForm } from "../../services/square.service";
import { squareApplicationId, squareLocationId } from "../../config";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { SettingsPanel } from "./SettingsPanel";

type Card = {brand: string; last4: string; exp_month: number; exp_year: number; enabled: boolean};
type Invoice = {id: string; status: string; amount_due_cents: number; due_date: string; can_pay: boolean};
type Snapshot = {available: boolean; card: Card | null; invoices: Invoice[]; can_update: boolean; cancel_at_period_end: boolean; pending_update: {key: string; state: string} | null};
type Update = {status: "updated" | "pending"; card?: Card};
const cardLabel = (card: Card) => `${card.brand.replaceAll("_", " ")} ending ${card.last4}`;

function UpdateCardDialog({open, onOpenChange, company, pendingKey, onUpdated}: {open: boolean; onOpenChange: (open: boolean) => void; company: string; pendingKey?: string; onUpdated: () => void}) {
  const scope = `guildmark-card-update:${company}`;
  const [attempt] = useState(() => {
    let saved: {key?: string; submitted?: boolean} = {};
    try { saved = JSON.parse(sessionStorage.getItem(scope) ?? "{}"); } catch { /* Server recovery remains available. */ }
    return {key: pendingKey ?? (saved.submitted && /^[a-zA-Z0-9_-]{16,64}$/.test(saved.key ?? "") ? saved.key! : crypto.randomUUID()), submitted: !!pendingKey || saved.submitted === true};
  });
  const [pending, setPending] = useState(attempt.submitted);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [initKey, setInitKey] = useState(0);
  const card = useRef<SquareCardForm | null>(null);
  useEffect(() => {
    if (!open || pending) return;
    let stopped = false;
    (async () => {try {
      await loadSquareSdk();
      if (!window.Square) throw new Error("Square card form is unavailable.");
      const form = await (await window.Square.payments(squareApplicationId, squareLocationId)).card({style: {input: {fontSize: "14px", color: "#101828", backgroundColor: "#ffffff"}, "input::placeholder": {color: "#667085"}, ".input-container": {borderRadius: "6px", borderColor: "#cbd5e1"}}});
      if (stopped) { await form.destroy(); return; }
      card.current = form;
      await form.attach("#gm-update-card");
      if (!stopped) setReady(true);
    } catch (e) {if (!stopped) setError(e instanceof Error ? e.message : "Card form could not load.");}})();
    return () => { stopped = true; setReady(false); card.current?.destroy().catch(() => {}); card.current = null; };
  }, [open, pending, initKey]);
  async function submit(check: boolean) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      let source: string | undefined;
      if (!check) {
        if (!consent || !card.current) throw new Error("Authorize saving your card and wait for the form to load.");
        const result = await card.current.tokenize();
        if (result.status !== "OK" || !result.token) throw new Error(result.errors?.[0]?.message ?? "Card could not be tokenized.");
        source = result.token;
        sessionStorage.setItem(scope, JSON.stringify({key: attempt.key, submitted: true}));
        attempt.submitted = true;
      }
      const result = await api.post<Update>("/subscriptions/payment-method", {idempotency_key: attempt.key, ...(source ? {source_id: source, recurring_consent: consent} : {})});
      if (result.status === "updated") {sessionStorage.removeItem(scope); onUpdated(); onOpenChange(false);}
      else setPending(true);
    } catch (e) {
      const code = (e as {code?: string}).code;
      setError(e instanceof Error ? e.message : "The card update could not be confirmed.");
      if (["CARD_UPDATE_FAILED", "CARD_UPDATE_CONFLICT"].includes(code ?? "")) {
        sessionStorage.removeItem(scope); attempt.key = crypto.randomUUID(); attempt.submitted = false; setPending(false); setConsent(false); setInitKey(k => k + 1);
      } else if (attempt.submitted) setPending(true);
    } finally { setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto" style={{width: "calc(100vw - 32px)"}}><DialogHeader><DialogTitle>{pending ? "Confirm card update" : "Update subscription card"}</DialogTitle><DialogDescription>Update the card for future subscription billing. This does not pay an outstanding invoice, restart a cancelled plan, or charge your card here.</DialogDescription></DialogHeader>
    {pending ? <p className="text-sm text-muted-foreground">The previous update is retained. Check it before entering another card; checking does not create a charge.</p> : <><div><p className="mb-2 text-xs font-medium">Card number, expiry, CVV and ZIP</p><div id="gm-update-card" className="min-h-12" /></div><label className="flex gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} disabled={busy} className="mt-1" /><span>I authorize Square to save this card for future monthly subscription payments under my existing agreement.</span></label></>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex flex-wrap gap-2"><Button disabled={busy || (!pending && (!ready || !consent))} onClick={() => submit(pending)}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}{busy ? "Checking…" : pending ? "Check existing card update" : "Save subscription card"}</Button><Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Close</Button></div>
  </DialogContent></Dialog>;
}

export function BillingRecovery({recurring}: {recurring: boolean}) {
  const {user, refreshUser} = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [link, setLink] = useState<{invoice: string; url: string} | null>(null);
  const snapshot = useQuery({queryKey: ["billing-payment-method", user?.company_id], queryFn: () => api.get<Snapshot>("/subscriptions/payment-method"), enabled: recurring, retry: false, staleTime: 0});
  const recovery = useMutation({mutationFn: (id: string) => api.post<{status: string; payment_url: string | null}>("/subscriptions/recovery", {invoice_id: id}), onSuccess: (result, id) => {setLink(result.payment_url ? {invoice: id, url: result.payment_url} : null); if (!result.payment_url) setNotice(result.status === "paid" ? "Square reports this invoice paid. Check payment status to refresh access." : "This invoice is not currently payable. Check payment status before taking further action.");}});
  const refresh = useMutation({mutationFn: () => api.post("/subscriptions/reconcile", {}), onSuccess: async () => {setLink(null); await Promise.all([snapshot.refetch(), qc.invalidateQueries({queryKey: ["subscription"]}), refreshUser()]); setNotice("Billing was checked against Square. Access changes only after a verified paid invoice.");}});
  if (!recurring) return null;
  const data = snapshot.data;
  const updated = () => { setNotice("Subscription card updated. Existing invoice balances and cancellation settings are unchanged."); snapshot.refetch(); };
  return <SettingsPanel icon={CreditCard} title="Payment method & recovery" subtitle="Manage your subscription card and unpaid invoices">
    {snapshot.isLoading ? <p role="status" className="text-sm">Loading provider billing details…</p> : snapshot.isError ? <div role="alert"><p className="text-sm">Payment details could not be confirmed. Existing billing settings are unchanged.</p><Button variant="outline" onClick={() => snapshot.refetch()}>Retry payment details</Button></div> : <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium text-sm">{data?.card ? cardLabel(data.card) : "No subscription card on file"}</p>{data?.card && <p className="text-xs text-muted-foreground">Expires {String(data.card.exp_month).padStart(2, "0")}/{data.card.exp_year}{!data.card.enabled && " · Card disabled"}</p>}</div>{data?.can_update && <Button variant="outline" onClick={() => setOpen(true)}>{data.pending_update ? "Check pending card update" : "Update payment method"}</Button>}</div>
      {data?.cancel_at_period_end && <p className="text-xs text-muted-foreground">Renewal remains cancelled. Updating a card does not restart this agreement.</p>}
      {!!data?.invoices.length && <div role="status" className="border border-amber-300 bg-amber-50/40 p-4 space-y-3"><p className="font-semibold text-sm">Payment needs attention</p><p className="text-sm text-muted-foreground">Saving a new card does not settle an existing invoice. Pay the existing invoice on Square, then check payment status here. Do not start another subscription.</p>{data.invoices.map(inv => <div key={inv.id} className="border-t border-border pt-3 space-y-2"><p className="text-sm">${(inv.amount_due_cents / 100).toFixed(2)} USD outstanding · {inv.status.replaceAll("_", " ").toLowerCase()} · Due {inv.due_date} (UTC)</p>{inv.can_pay && <Button variant="outline" disabled={recovery.isPending} onClick={() => {setLink(null); recovery.mutate(inv.id);}}>Get secure invoice link</Button>}{link?.invoice === inv.id && <a className="block text-sm underline underline-offset-4" href={link.url} target="_blank" rel="noopener noreferrer">Pay existing invoice on Square ↗</a>}</div>)}</div>}
      <Button variant="outline" disabled={refresh.isPending} onClick={() => refresh.mutate()}>{refresh.isPending ? "Checking payment…" : "Check payment status"}</Button>
    </div>}
    {(recovery.isError || refresh.isError) && <p role="alert" className="mt-3 text-sm text-destructive">Provider confirmation is unavailable. No new payment or subscription was started. Refresh before trying again.</p>}
    {notice && <p role="status" className="mt-3 text-sm text-muted-foreground">{notice}</p>}
    {open && <UpdateCardDialog open={open} onOpenChange={setOpen} company={user?.company_id ?? ""} pendingKey={data?.pending_update?.key} onUpdated={updated} />}
  </SettingsPanel>;
}
