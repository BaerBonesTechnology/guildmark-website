/** ViewModel for the Import Assets (CSV) dialog: upload → preview → import. */
import { useCallback, useRef, useState } from "react";
import type { LocalAsset } from "../models/localAsset";
import { parseAssetCsv, type ParsedRow } from "../services/importCsv.service";

type Step = "preview" | "upload";

export function useImportCsvViewModel(onImport: (assets: LocalAsset[]) => void, onOpenChange: (open: boolean) => void) {
  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [skipErrors, setSkipErrors] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);
  const importable = skipErrors ? validRows : (invalidRows.length === 0 ? rows : []);

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
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setRows(parseAssetCsv(text));
      setStep("preview");
    };
    reader.readAsText(file);
  }, []);

  function onDrop(evt: React.DragEvent) {
    evt.preventDefault();
    setDragging(false);
    const file = evt.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function onFileChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const file = evt.target.files?.[0];
    if (file) processFile(file);
    evt.target.value = "";
  }

  function handleImport() {
    const assets = importable.map((r) => r.asset as LocalAsset);
    onImport(assets);
    reset();
    onOpenChange(false);
  }

  return {
    dragging, fileName, handleClose, handleImport, importable, inputRef, invalidRows,
    onDrop, onFileChange, reset, rows, setDragging, setSkipErrors, skipErrors, step, validRows,
  };
}
