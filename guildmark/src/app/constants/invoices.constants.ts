/** AMPS Invoices constants — record/form types, palette, options, headers. */

export type InvoiceType = "Disposal" | "Donation" | "Loss" | "Sale";

export interface AmpsInvoice {
  asset: string;
  date: string;
  id: string;
  marketValue: number;
  quantity: number;
  type: InvoiceType;
  writeOffAmount: number;
}

export interface InvoiceForm {
  asset: string;
  date: string;
  marketValue: string;
  quantity: string;
  type: InvoiceType | "";
}

export const EMPTY_INVOICE_FORM: InvoiceForm = {
  asset: "",
  type: "",
  date: new Date().toISOString().split("T")[0],
  quantity: "",
  marketValue: "",
};

export const INVOICE_TABLE_HEADERS = ["Invoice #", "Date", "Asset", "Type", "Write-off", "Market Value", ""];

export const INVOICE_TYPE_COLOR: Record<string, string> = {
  Sale: "var(--grade-a)", Disposal: "var(--grade-b)", Donation: "var(--primary)", Loss: "var(--chart-4)",
};

export const INVOICE_TYPE_OPTIONS: InvoiceType[] = ["Sale", "Disposal", "Loss", "Donation"];
