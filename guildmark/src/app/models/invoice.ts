// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export type InvoiceType = "disposal" | "loss" | "sale" | "donation";

export interface TaxInvoice {
  id:                          string;
  invoice_number:              string;
  invoice_type:                InvoiceType;
  invoice_date:                string;
  asset_description:           string;
  serial_number:               string | null;
  original_cost:               number | null;
  book_value_at_disposal:      number | null;
  market_value_at_disposal:    number;
  write_off_amount:            number;
  market_anchor_ebay:          number | null;
  pdf_storage_path:            string | null;
  generated_at:                string;
  // Joined
  model_name?:                 string;
}
