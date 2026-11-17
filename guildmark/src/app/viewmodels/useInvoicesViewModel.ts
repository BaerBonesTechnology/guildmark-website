/** ViewModel for AMPS Invoices: list, search, generate-invoice form. */
import { useState } from "react";
import { EMPTY_INVOICE_FORM, type AmpsInvoice, type InvoiceForm } from "../constants/invoices.constants";
import { buildInvoice, computeInvoiceStats, filterInvoices } from "../services/invoices.service";

export function useInvoicesViewModel() {
  const [invoices, setInvoices] = useState<AmpsInvoice[]>([]);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [formData, setFormData] = useState<InvoiceForm>(EMPTY_INVOICE_FORM);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = filterInvoices(invoices, searchTerm);
  const qty = parseInt(formData.quantity || "0");
  const fmv = parseFloat(formData.marketValue || "0");
  const total = qty * fmv;
  const { thisMonth, totalWriteOffs } = computeInvoiceStats(invoices);

  function resetForm() {
    setFormData(EMPTY_INVOICE_FORM);
  }

  function handleGenerate() {
    if (!formData.asset || !formData.type || !qty || !fmv) return;
    setInvoices((prev) => [buildInvoice(formData, prev.length, qty, total), ...prev]);
    setGenerateOpen(false);
    resetForm();
  }

  return {
    filtered, fmv, formData, generateOpen, handleGenerate, invoices, qty, resetForm,
    searchTerm, setFormData, setGenerateOpen, setSearchTerm, thisMonth, total, totalWriteOffs,
  };
}
