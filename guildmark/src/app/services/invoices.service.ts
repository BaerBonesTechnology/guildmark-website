/** AMPS Invoices service — filtering, stats, and new-invoice construction. */
import type { AmpsInvoice, InvoiceForm, InvoiceType } from "../constants/invoices.constants";

export interface InvoiceStats {
  thisMonth: number;
  totalWriteOffs: number;
}

export function buildInvoice(form: InvoiceForm, existingCount: number, qty: number, total: number): AmpsInvoice {
  const nextNum = (existingCount + 1).toString().padStart(4, "0");
  const year = new Date().getFullYear();
  return {
    id: `INV-${year}-${nextNum}`,
    date: form.date,
    asset: `${form.asset}${qty > 1 ? ` (${qty} units)` : ""}`,
    type: form.type as InvoiceType,
    quantity: qty,
    writeOffAmount: total,
    marketValue: total,
  };
}

export function computeInvoiceStats(invoices: AmpsInvoice[]): InvoiceStats {
  const totalWriteOffs = invoices.reduce((sum, inv) => sum + inv.writeOffAmount, 0);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const thisMonth = invoices.filter((inv) => inv.date >= monthStart).reduce((sum, inv) => sum + inv.writeOffAmount, 0);
  return { thisMonth, totalWriteOffs };
}

export function filterInvoices(invoices: AmpsInvoice[], searchTerm: string): AmpsInvoice[] {
  const term = searchTerm.toLowerCase();
  return invoices.filter((inv) => inv.id.toLowerCase().includes(term) || inv.asset.toLowerCase().includes(term));
}
