/** ViewModel for the Import Listings dialog: file parse + sequential import. */
import { useRef, useState } from "react";
import { useCreateListing } from "../lib/apiHooks";
import { parseCsv } from "../services/csv.service";
import { validateRow, type RowState } from "../services/importListings.service";

export function useImportListingsViewModel(onOpenChange: (open: boolean) => void) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<RowState[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const createListing = useCreateListing();

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

  function handleFile(evt: React.ChangeEvent<HTMLInputElement>) {
    const file = evt.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setDone(false);

    const reader = new FileReader();
    reader.onload = (loaded) => {
      const text = loaded.target?.result as string;
      const rawRows = parseCsv(text);
      if (rawRows.length === 0) { setParseError("CSV appears empty or has no data rows."); return; }

      const parsed: RowState[] = [];
      for (let ndx = 0; ndx < rawRows.length; ndx++) {
        const result = validateRow(rawRows[ndx], ndx);
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

    for (let ndx = 0; ndx < updated.length; ndx++) {
      if (updated[ndx].status === "done") continue;
      updated[ndx] = { ...updated[ndx], status: "importing" };
      setRows([...updated]);

      try {
        await createListing.mutateAsync(updated[ndx].row);
        updated[ndx] = { ...updated[ndx], status: "done" };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        updated[ndx] = { ...updated[ndx], status: "error", error: msg };
      }
      setRows([...updated]);
    }

    setImporting(false);
    setDone(true);
  }

  const successCount = rows.filter((r) => r.status === "done").length;
  const errorCount = rows.filter((r) => r.status === "error").length;

  return {
    done, errorCount, fileRef, handleClose, handleFile, handleImport, importing,
    parseError, rows, successCount,
  };
}
