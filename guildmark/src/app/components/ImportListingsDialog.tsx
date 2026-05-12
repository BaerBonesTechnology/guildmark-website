import { useRef, useState } from "react";
import { Upload, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useCreateListing } from "../lib/apiHooks";

// ── CSV parser ────────────────────────────────────────────────────────────────
// Handles quoted fields and comma-in-value without a library dependency.
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitLine(line);
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] ?? "").trim()]));
  });
}

function splitLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ParsedRow {
  model_name:   string;
  asset_type:   string;
  condition:    string;
  quantity:     number;
  listed_price: number;
  ram_gb?:      number;
  storage_gb?:  number;
  cpu_score?:   number;
  serial_number?: string;
  reason?:      string;
}

type RowStatus = "pending" | "importing" | "done" | "error";

interface RowState {
  row:    ParsedRow;
  status: RowStatus;
  error?: string;
}

const REQUIRED = ["model_name", "asset_type", "condition", "quantity", "listed_price"] as const;

function validateRow(raw: Record<string, string>, index: number): ParsedRow | string {
  for (const field of REQUIRED) {
    if (!raw[field]) return `Row ${index + 1}: missing "${field}"`;
  }
  const quantity    = parseInt(raw.quantity,    10);
  const listed_price = parseFloat(raw.listed_price);
  if (isNaN(quantity)     || quantity <= 0)    return `Row ${index + 1}: invalid quantity`;
  if (isNaN(listed_price) || listed_price <= 0) return `Row ${index + 1}: invalid listed_price`;

  return {
    model_name:    raw.model_name,
    asset_type:    raw.asset_type,
    condition:     raw.condition,
    quantity,
    listed_price,
    ram_gb:        raw.ram_gb      ? parseFloat(raw.ram_gb)      : undefined,
    storage_gb:    raw.storage_gb  ? parseFloat(raw.storage_gb)  : undefined,
    cpu_score:     raw.cpu_score   ? parseInt(raw.cpu_score, 10) : undefined,
    serial_number: raw.serial_number || undefined,
    reason:        raw.reason       || undefined,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportListingsDialog({ open, onOpenChange }: Props) {
  const fileRef                  = useRef<HTMLInputElement>(null);
  const [rows, setRows]          = useState<RowState[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone]          = useState(false);
  const createListing            = useCreateListing();

  function reset() {
    setRows([]);
    setParseError(null);
    setImporting(false);
    setDone(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleClose(next: boolean) {
    if (!importing) { reset(); onOpenChange(next); }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setDone(false);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const rawRows = parseCsv(text);
      if (rawRows.length === 0) { setParseError("CSV appears empty or has no data rows."); return; }

      const parsed: RowState[] = [];
      for (let i = 0; i < rawRows.length; i++) {
        const result = validateRow(rawRows[i], i);
        if (typeof result === "string") { setParseError(result); setRows([]); return; }
        parsed.push({ row: result, status: "pending" });
      }
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setImporting(true);
    const updated = [...rows];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === "done") continue;
      updated[i] = { ...updated[i], status: "importing" };
      setRows([...updated]);

      try {
        await createListing.mutateAsync(updated[i].row);
        updated[i] = { ...updated[i], status: "done" };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        updated[i] = { ...updated[i], status: "error", error: msg };
      }
      setRows([...updated]);
    }

    setImporting(false);
    setDone(true);
  }

  const successCount = rows.filter((r) => r.status === "done").length;
  const errorCount   = rows.filter((r) => r.status === "error").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col font-mono">
        <DialogHeader>
          <DialogTitle className="font-mono">Import Listings from CSV</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Required columns: <span className="text-foreground">model_name, asset_type, condition, quantity, listed_price</span>
            <br />
            Optional: ram_gb, storage_gb, cpu_score, serial_number, reason
          </DialogDescription>
        </DialogHeader>

        {/* File picker */}
        {!done && (
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {rows.length > 0
                ? `${rows.length} rows loaded — click to replace`
                : "Click to select a CSV file"}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFile}
              disabled={importing}
            />
          </div>
        )}

        {/* Parse error */}
        {parseError && (
          <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 rounded p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {parseError}
          </div>
        )}

        {/* Done summary */}
        {done && (
          <div className="flex items-center gap-2 text-xs bg-primary/10 rounded p-3">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>
              Import complete — <span className="text-primary font-semibold">{successCount} succeeded</span>
              {errorCount > 0 && <span className="text-red-500">, {errorCount} failed</span>}
            </span>
          </div>
        )}

        {/* Row preview / status list */}
        {rows.length > 0 && (
          <div className="flex-1 overflow-y-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-2 font-mono text-muted-foreground uppercase tracking-wide">Model</th>
                  <th className="text-left p-2 font-mono text-muted-foreground uppercase tracking-wide">Type</th>
                  <th className="text-left p-2 font-mono text-muted-foreground uppercase tracking-wide">Grade</th>
                  <th className="text-right p-2 font-mono text-muted-foreground uppercase tracking-wide">Qty</th>
                  <th className="text-right p-2 font-mono text-muted-foreground uppercase tracking-wide">Price</th>
                  <th className="text-center p-2 font-mono text-muted-foreground uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-2 font-mono">{r.row.model_name}</td>
                    <td className="p-2 text-muted-foreground">{r.row.asset_type}</td>
                    <td className="p-2 text-muted-foreground">{r.row.condition}</td>
                    <td className="p-2 text-right">{r.row.quantity}</td>
                    <td className="p-2 text-right text-primary">${r.row.listed_price.toLocaleString()}</td>
                    <td className="p-2 text-center">
                      {r.status === "pending"   && <span className="text-muted-foreground">—</span>}
                      {r.status === "importing" && <Loader2 className="w-3 h-3 animate-spin mx-auto text-primary" />}
                      {r.status === "done"      && <CheckCircle2 className="w-3 h-3 mx-auto text-primary" />}
                      {r.status === "error"     && (
                        <span title={r.error} className="text-red-500 cursor-help">
                          <X className="w-3 h-3 mx-auto" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          {done ? (
            <Button onClick={() => handleClose(false)} className="font-mono">
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleClose(false)} disabled={importing} className="font-mono">
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={rows.length === 0 || importing}
                className="bg-primary hover:bg-primary/90 text-white font-mono"
              >
                {importing
                  ? <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Importing…</>
                  : <><Upload className="w-3 h-3 mr-2" /> Import {rows.length} listings</>
                }
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
