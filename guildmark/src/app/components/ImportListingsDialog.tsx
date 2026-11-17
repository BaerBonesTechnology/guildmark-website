/**
 * ImportListingsDialog — bulk-create listings from a CSV file (View).
 * CSV parsing, row validation, and the sequential import loop live in
 * useImportListingsViewModel / csv + importListings services.
 */
import { Upload, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useImportListingsViewModel } from "../viewmodels/useImportListingsViewModel";

interface Props {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ImportListingsDialog({ onOpenChange, open }: Props) {
  const {
    done, errorCount, fileRef, handleClose, handleFile, handleImport, importing,
    parseError, rows, successCount,
  } = useImportListingsViewModel(onOpenChange);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col ">
        <DialogHeader>
          <DialogTitle className="">Import Listings from CSV</DialogTitle>
          <DialogDescription className=" text-xs">
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
                  <th className="text-left p-2  text-muted-foreground uppercase tracking-wide">Model</th>
                  <th className="text-left p-2  text-muted-foreground uppercase tracking-wide">Type</th>
                  <th className="text-left p-2  text-muted-foreground uppercase tracking-wide">Grade</th>
                  <th className="text-right p-2  text-muted-foreground uppercase tracking-wide">Qty</th>
                  <th className="text-right p-2  text-muted-foreground uppercase tracking-wide">Price</th>
                  <th className="text-center p-2  text-muted-foreground uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-2 ">{r.row.model_name}</td>
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
            <Button onClick={() => handleClose(false)} className="">
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleClose(false)} disabled={importing} className="">
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={rows.length === 0 || importing}
                className="bg-primary hover:bg-primary/90 text-white "
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
