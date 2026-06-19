import { useState, useRef, useCallback } from "react";
import { Upload, AlertCircle, CheckCircle2, Download, X, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import type { LocalAsset } from "../pages/amps/AssetInventory";

// ---------------------------------------------------------------------------
// CSV template
// ---------------------------------------------------------------------------

const TEMPLATE_HEADERS = [
  "model_name",
  "asset_type",
  "condition_grade",
  "quantity",
  "age_months",
  "fair_market_value",
  "book_value",
  "serial_number",
  "department",
];

const TEMPLATE_EXAMPLE = [
  "MacBook Pro 14\" M3",
  "Laptop",
  "A",
  "1",
  "18",
  "1200",
  "1500",
  "C02XK1ZNJGH5",
  "Engineering",
];

function downloadTemplate() {
  const rows = [
    TEMPLATE_HEADERS.join(","),
    TEMPLATE_EXAMPLE.map((v) => `"${v}"`).join(","),
  ].join("\n");
  const blob = new Blob([rows], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "guildmark-asset-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// CSV parser
// ---------------------------------------------------------------------------

type ParsedRow = {
  raw:    Record<string, string>;
  asset:  Partial<LocalAsset>;
  errors: string[];
  rowNum: number;
};

const VALID_TYPES  = ["laptop","desktop","server","phone","tablet","networking","monitor","other"];
const VALID_GRADES = ["A","B","C"];

function parseCSV(text: string): ParsedRow[] {
  const lines  = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  // Parse a single CSV line respecting quoted fields
  function parseLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQ = !inQ; }
      } else if (ch === "," && !inQ) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));

  return lines.slice(1).map((line, i) => {
    const values = parseLine(line);
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => { raw[h] = values[idx] ?? ""; });

    const errors: string[] = [];
    const model   = (raw.model_name || raw.model || "").trim();
    const type    = (raw.asset_type || raw.type || "").toLowerCase().trim();
    const grade   = (raw.condition_grade || raw.condition || "").toUpperCase().trim();
    const fmvStr  = raw.fair_market_value || raw.fmv || raw.value || "";
    const bookStr = raw.book_value || raw.book || "";
    const ageStr  = raw.age_months || raw.age || "";

    if (!model)                    errors.push("model_name is required");
    if (!VALID_TYPES.includes(type)) errors.push(`asset_type must be one of: ${VALID_TYPES.join(", ")}`);
    if (!VALID_GRADES.includes(grade)) errors.push("condition_grade must be A, B, or C");
    const fmv  = parseFloat(fmvStr);
    const book = parseFloat(bookStr) || fmv;
    const age  = parseInt(ageStr);
    if (isNaN(fmv) || fmv < 0)  errors.push("fair_market_value must be a positive number");
    if (isNaN(age) || age < 0)   errors.push("age_months must be a non-negative integer");

    const qty = parseInt(raw.quantity || "1") || 1;
    const dep = book > 0 ? parseFloat((((book - fmv) / book) * 100).toFixed(1)) : 0;

    const typePretty =
      type.charAt(0).toUpperCase() + type.slice(1);

    const asset: Partial<LocalAsset> = errors.length === 0
      ? {
          id:              crypto.randomUUID(),
          model:           model,
          type:            typePretty,
          condition:       grade as "A" | "B" | "C",
          quantity:        qty,
          age:             age,
          fairMarketValue: fmv,
          bookValue:       book,
          depreciation:    dep,
          serialNumber:    (raw.serial_number || raw.serial || "").trim() || null,
          department:      (raw.department || "").trim() || null,
          status:          dep >= 30 ? "At Risk" : "Active",
          lastSync:        "Just now",
          source:          "csv",
        }
      : {};

    return { raw, asset, errors, rowNum: i + 2 };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ImportCSVDialogProps {
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
  onImport:      (assets: LocalAsset[]) => void;
}

type Step = "upload" | "preview";

export function ImportCSVDialog({ open, onOpenChange, onImport }: ImportCSVDialogProps) {
  const [step,       setStep]       = useState<Step>("upload");
  const [dragging,   setDragging]   = useState(false);
  const [fileName,   setFileName]   = useState("");
  const [rows,       setRows]       = useState<ParsedRow[]>([]);
  const [skipErrors, setSkipErrors] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validRows   = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);
  const importable  = skipErrors ? validRows : (invalidRows.length === 0 ? rows : []);

  function reset() {
    setStep("upload");
    setDragging(false);
    setFileName("");
    setRows([]);
    setSkipErrors(false);
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      alert("Please upload a .csv file.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text   = e.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setStep("preview");
    };
    reader.readAsText(file);
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleImport() {
    const assets = importable.map((r) => r.asset as LocalAsset);
    onImport(assets);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import assets from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-add assets to your inventory.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-2">
            {/* Download template */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Need a template? Download the pre-formatted CSV starter file.</span>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="shrink-0 gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Template
              </Button>
            </div>

            {/* Required columns info */}
            <div className="text-xs text-muted-foreground space-y-1 px-1">
              <p className="font-medium text-foreground">Required columns</p>
              <p>
                <span className=" bg-muted px-1 rounded">model_name</span>
                {" · "}
                <span className=" bg-muted px-1 rounded">asset_type</span>
                {" · "}
                <span className=" bg-muted px-1 rounded">condition_grade</span>
                {" · "}
                <span className=" bg-muted px-1 rounded">age_months</span>
                {" · "}
                <span className=" bg-muted px-1 rounded">fair_market_value</span>
              </p>
              <p className="text-muted-foreground">
                Optional: <span className="">quantity · book_value · serial_number · department</span>
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors py-12 ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <Upload className={`w-8 h-8 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-center">
                <p className="text-sm font-medium">
                  {dragging ? "Drop to upload" : "Drop your CSV here"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">or click to browse</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4 py-2">
            {/* Summary bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground ">{fileName}</span>
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {validRows.length} valid
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {invalidRows.length} with errors
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-xs">
                <X className="w-3.5 h-3.5" />
                Change file
              </Button>
            </div>

            {/* Skip-errors toggle */}
            {invalidRows.length > 0 && (
              <label className="flex items-center gap-2.5 p-3 bg-destructive/5 border border-destructive/20 rounded-lg cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={skipErrors}
                  onChange={(e) => setSkipErrors(e.target.checked)}
                  className="rounded border-border"
                />
                <span>
                  Skip the {invalidRows.length} row{invalidRows.length !== 1 ? "s" : ""} with
                  errors and import {validRows.length} valid asset{validRows.length !== 1 ? "s" : ""}
                </span>
              </label>
            )}

            {/* Preview table */}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10  text-xs">#</TableHead>
                    <TableHead className=" text-xs">Model</TableHead>
                    <TableHead className=" text-xs">Type</TableHead>
                    <TableHead className=" text-xs text-center">Grade</TableHead>
                    <TableHead className=" text-xs text-right">Age</TableHead>
                    <TableHead className=" text-xs text-right">FMV</TableHead>
                    <TableHead className=" text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const hasError = row.errors.length > 0;
                    return (
                      <TableRow
                        key={row.rowNum}
                        className={hasError ? "bg-destructive/5" : undefined}
                      >
                        <TableCell className=" text-xs text-muted-foreground">
                          {row.rowNum}
                        </TableCell>
                        <TableCell className=" text-xs">
                          {row.raw.model_name || row.raw.model || (
                            <span className="text-destructive italic">missing</span>
                          )}
                        </TableCell>
                        <TableCell className=" text-xs text-muted-foreground">
                          {row.raw.asset_type || row.raw.type || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.raw.condition_grade || row.raw.condition
                            ? (
                              <span className={`inline-flex items-center justify-center w-7 h-5 rounded  text-xs font-medium ${
                                (row.raw.condition_grade || row.raw.condition)?.toUpperCase() === "A"
                                  ? "bg-grade-a-subtle text-grade-a-text"
                                  : (row.raw.condition_grade || row.raw.condition)?.toUpperCase() === "B"
                                  ? "bg-grade-b-subtle text-grade-b-text"
                                  : "bg-grade-c-subtle text-grade-c-text"
                              }`}>
                                {(row.raw.condition_grade || row.raw.condition)?.toUpperCase()}
                              </span>
                            )
                            : <span className="text-destructive text-xs italic">—</span>
                          }
                        </TableCell>
                        <TableCell className=" text-xs text-right text-muted-foreground">
                          {row.raw.age_months || row.raw.age || "—"}
                        </TableCell>
                        <TableCell className=" text-xs text-right">
                          {row.raw.fair_market_value || row.raw.fmv || row.raw.value
                            ? `$${parseFloat(row.raw.fair_market_value || row.raw.fmv || row.raw.value || "0").toLocaleString()}`
                            : <span className="text-destructive italic">—</span>
                          }
                        </TableCell>
                        <TableCell>
                          {hasError ? (
                            <div className="flex items-start gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                              <span className="text-xs text-destructive leading-tight">
                                {row.errors[0]}
                                {row.errors.length > 1 && ` +${row.errors.length - 1} more`}
                              </span>
                            </div>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-success">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Ready
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          {step === "preview" && (
            <Button
              onClick={handleImport}
              disabled={importable.length === 0}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Import {importable.length} asset{importable.length !== 1 ? "s" : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
