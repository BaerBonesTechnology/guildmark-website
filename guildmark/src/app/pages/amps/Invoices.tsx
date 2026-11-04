/**
 * AMPS Invoices — write-off documentation for accounting (View).
 * List/search/form state lives in useInvoicesViewModel; stats and invoice
 * construction are in invoices.service. Presentation only.
 */
import { Download, Plus, Receipt, Search } from "lucide-react";
import { GenerateInvoiceDialog } from "../../components/amps/GenerateInvoiceDialog";
import { StatCell } from "../../components/amps/StatCell";
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { INVOICE_TABLE_HEADERS, INVOICE_TYPE_COLOR } from "../../constants/invoices.constants";
import { BODY, DISPLAY, MONO } from "../../constants/typography";
import { useInvoicesViewModel } from "../../viewmodels/useInvoicesViewModel";

export function Invoices() {
  const {
    filtered, fmv, formData, generateOpen, handleGenerate, invoices, qty, resetForm,
    searchTerm, setFormData, setGenerateOpen, setSearchTerm, thisMonth, total, totalWriteOffs,
  } = useInvoicesViewModel();

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto pb-20" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>Invoices</h1>
          <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Local draft prototype. Drafts on this page are not saved to your company account. PDF export and accounting compliance are not available.</p>
        </div>
        <button onClick={() => setGenerateOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity shrink-0" style={{ background: AMPS_ACCENT, color: "var(--amps-accent-foreground)" }}>
          <Plus size={13} /> Prepare draft
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-border mb-6" style={{ background: "var(--border)" }}>
        <StatCell label="Total Invoices" value={String(invoices.length)} />
        <StatCell label="Total Write-offs" value={`$${totalWriteOffs.toLocaleString()}`} />
        <StatCell label="This Month" value={`$${thisMonth.toLocaleString()}`} />
      </div>

      {/* Search */}
      <div className="border border-border p-4 mb-4" style={{ background: "var(--card)" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input placeholder="Search by invoice number or asset…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border focus:outline-none focus:border-primary" style={{ background: "var(--input-background)", fontFamily: BODY }} />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border" style={{ background: "var(--card)" }}>
        <div className="px-5 py-3.5 border-b border-border">
          <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Invoice History</span>
        </div>
        {invoices.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Receipt size={28} className="opacity-30" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No invoices yet</p>
            <button onClick={() => setGenerateOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border hover:border-foreground transition-colors">Generate your first invoice</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 720 }}>
              <thead>
                <tr className="border-b border-border">
                  {INVOICE_TABLE_HEADERS.map((h, i) => (
                    <th key={i} className={`py-2.5 px-4 text-[10px] tracking-wider uppercase font-normal ${["Write-off", "Market Value"].includes(h) ? "text-right" : "text-left"}`} style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <tr key={inv.id} className="border-b border-border last:border-0" style={{ background: i % 2 ? "var(--secondary)" : "transparent" }}>
                    <td className="py-2.5 px-4 font-semibold" style={{ fontFamily: MONO }}>{inv.id}</td>
                    <td className="py-2.5 px-4 text-sm" style={{ fontFamily: MONO }}>{inv.date}</td>
                    <td className="py-2.5 px-4">{inv.asset}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider uppercase" style={{ fontFamily: MONO, color: INVOICE_TYPE_COLOR[inv.type], border: `1px solid color-mix(in srgb, ${INVOICE_TYPE_COLOR[inv.type]} 30%, transparent)` }}>{inv.type}</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold" style={{ fontFamily: MONO }}>${inv.writeOffAmount.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right" style={{ fontFamily: MONO, color: "var(--muted-foreground)" }}>${inv.marketValue.toLocaleString()}</td>
                    <td className="py-2.5 px-4"><button disabled aria-label="PDF export unavailable" title="PDF export is not implemented" className="w-7 h-7 flex items-center justify-center opacity-50" style={{ color: "var(--muted-foreground)" }}><Download size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate dialog */}
      <GenerateInvoiceDialog
        fmv={fmv}
        formData={formData}
        onGenerate={handleGenerate}
        onOpenChange={setGenerateOpen}
        open={generateOpen}
        qty={qty}
        resetForm={resetForm}
        setFormData={setFormData}
        total={total}
      />
    </div>
  );
}
