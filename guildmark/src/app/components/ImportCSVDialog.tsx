/**
 * ImportCSVDialog — bulk-add assets to the AMPS inventory from a CSV (View).
 * Template download, CSV parsing, and validation live in importCsv.service;
 * upload/preview/import flow state lives in useImportCsvViewModel.
 */
import { Upload, AlertCircle, CheckCircle2, Download, X, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import type { LocalAsset } from "../models/localAsset";
import { downloadTemplate } from "../services/importCsv.service";
import { useImportCsvViewModel } from "../viewmodels/useImportCsvViewModel";

interface ImportCSVDialogProps {
  onImport: (assets: LocalAsset[]) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ImportCSVDialog({ onImport, onOpenChange, open }: ImportCSVDialogProps) {
  const {
    dragging, fileName, handleClose, handleImport, importable, inputRef, invalidRows,
    onDrop, onFileChange, reset, rows, setDragging, setSkipErrors, skipErrors, step, validRows,
  } = useImportCsvViewModel(onImport, onOpenChange);

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
