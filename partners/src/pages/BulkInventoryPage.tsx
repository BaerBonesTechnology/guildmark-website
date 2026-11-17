import { useEffect, useRef, useState } from "react";
import { apiJson } from "../lib/api";
import { PageHeader, Card, Button } from "../components/ui";
export function parseBulkCsv(text: string): Record<string, string>[] {
  const records: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((v) => v.trim())) records.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (quoted) throw new Error("The CSV has an unclosed quoted field.");
  if (field || row.length) {
    row.push(field);
    records.push(row);
  }
  const header =
    records.shift()?.map((h) => h.replace(/^\uFEFF/, "").trim()) ?? [];
  if (new Set(header).size !== header.length)
    throw new Error("CSV headers must be unique.");
  return records
    .filter((r) => r.some((v) => v.trim()))
    .map((r, i) => {
      if (r.length !== header.length)
        throw new Error(`Row ${i + 2} has a different number of columns.`);
      return Object.fromEntries(header.map((h, j) => [h, r[j].trim()]));
    });
}
type Batch = {
  id: string;
  status: string;
  ownership: string;
  owner_email: string;
  listing_count?: number;
  rows: {
    model_name: string;
    quantity: number;
    data_wipe_status: string;
    service_requirement: string;
  }[];
};
export function BulkInventoryPage() {
  const submissionId = useRef(crypto.randomUUID());
  const [ownership, setOwnership] = useState("own"),
    [email, setEmail] = useState(""),
    [rows, setRows] = useState<Record<string, string>[]>([]),
    [imports, setImports] = useState<Batch[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  async function load() {
    try {
      const d = await apiJson<{ imports: Batch[] }>("/partner/inventory");
      setImports(d.imports);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Imports unavailable");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function file(f: File | undefined) {
    if (!f) return;
    setError("");
    setNotice("");
    try {
      if (f.size > 1024 * 1024)
        throw new Error(
          "Choose a CSV up to 1 MiB, with up to 100 product rows.",
        );
      const parsed = parseBulkCsv(await f.text());
      if (!parsed.length || parsed.length > 100)
        throw new Error("Include 1–100 product rows.");
      for (const key of [
        "model_name",
        "asset_type",
        "condition_grade",
        "quantity",
        "listed_price",
        "data_wipe_status",
        "wipe_reference",
        "reimage_required",
      ])
        if (!(key in parsed[0])) throw new Error(`Missing CSV column: ${key}`);
      setRows(parsed);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : "CSV unavailable");
    }
  }
  function template() {
    const text =
      "model_name,asset_type,condition_grade,quantity,listed_price,data_wipe_status,wipe_reference,reimage_required,manufacturer,cpu_model,ram_gb,storage_gb,functional_status,known_defects\nThinkPad T14 Gen 3,laptop,A,20,350.00,wiped,Wipe batch 2026-11-10,true,Lenovo,Intel Core i5,16,512,fully_functional,\n";
    const u = URL.createObjectURL(new Blob([text], { type: "text/csv" })),
      a = document.createElement("a");
    a.href = u;
    a.download = "guildmark-itad-inventory.csv";
    a.click();
    URL.revokeObjectURL(u);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const batch = await apiJson<Batch>("/partner/inventory", {
        method: "POST",
        body: JSON.stringify({
          id: submissionId.current,
          ownership,
          owner_email: email,
          rows,
        }),
      });
      setNotice(
        batch.status === "applied"
          ? `${batch.listing_count} draft listings prepared under the seller’s existing delegation.`
          : "Import sent to the seller’s My Listings for approval. Nothing is public yet.",
      );
      setRows([]);
      submissionId.current = crypto.randomUUID();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <PageHeader
        title="Bulk inventory"
        subtitle="Prepare your own stock or a consigned seller’s stock in one import."
      />
      {error && (
        <p role="alert" className="mb-4 text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 text-green-700">
          {notice}
        </p>
      )}
      <Card className="p-5">
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="space-y-5">
            <div className="gm-rate-fields">
              <label>
                Stock ownership
                <select aria-label="Stock ownership"
                  value={ownership}
                  onChange={(e) => setOwnership(e.target.value)}
                >
                  <option value="own">Our own seller business</option>
                  <option value="consigned">
                    Consigned — another seller’s stock
                  </option>
                </select>
              </label>
              <label>
                Seller account email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@business.com"
                />
              </label>
            </div>
            <p className="text-sm text-slate-500">
              {ownership === "own"
                ? "Your seller administrator approves the first import and can authorize future drafts. Partner approval does not replace seller business verification."
                : "The owning seller reviews this batch in My Listings. You can prepare stock, but cannot publish or take ownership of their listings."}
            </p>
            <div className="gm-service-upload">
              <label>
                Inventory CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => void file(e.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                className="text-sm underline mt-3"
                onClick={template}
              >
                Download CSV template
              </button>
            </div>
            <p className="text-sm text-slate-500">
              For already-wiped stock, use <strong>wiped</strong> and provide a
              wipe reference. Set <strong>reimage_required=true</strong> to
              request imaging only. We retain the partner’s attestation; it does
              not imply GuildMark-certified erasure.
            </p>
            {rows.length > 0 && (
              <div className="gm-bulk-preview">
                <h2>{rows.length} product rows · Review before sending</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Units</th>
                      <th>Wipe status</th>
                      <th>Imaging</th>
                      <th>USD / unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.model_name}</td>
                        <td>{r.quantity}</td>
                        <td>{r.data_wipe_status}</td>
                        <td>
                          {r.reimage_required === "true"
                            ? r.data_wipe_status === "wiped"
                              ? "Imaging only — no wipe"
                              : "Wipe + imaging"
                            : "No imaging"}
                        </td>
                        <td>{r.listed_price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Button type="submit" disabled={!rows.length}>
              {busy ? "Submitting…" : "Send for seller approval"}
            </Button>
          </fieldset>
        </form>
      </Card>
      <h2 className="mt-8 mb-4 font-medium">Recent imports</h2>
      <div className="space-y-3">
        {imports.map((b) => (
          <Card key={b.id} className="p-4">
            <h3>
              {b.rows.length} product rows ·{" "}
              {b.ownership === "own" ? "Own stock" : "Consigned stock"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {b.owner_email} ·{" "}
              {b.status === "applied"
                ? "Draft listings created"
                : b.status === "rejected"
                  ? "Declined by seller"
                  : "Awaiting seller approval"}
            </p>
          </Card>
        ))}
        {!imports.length && (
          <p className="text-sm text-slate-500">No imports yet.</p>
        )}
      </div>
    </div>
  );
}
