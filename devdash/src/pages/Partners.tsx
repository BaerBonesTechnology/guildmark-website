import { useState, useEffect, useCallback, useRef } from "react";
import {
  Handshake, CheckCircle, Clock, RefreshCw,
  Trash2, AlertCircle, Save, FileText, Building2, Tag, Phone,
} from "lucide-react";
import { useApi } from "../hooks/useAuth";
import { RecordModal } from "../components/RecordModal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PartnerEntry {
  id: string;
  email: string;
  source: string;
  notes: string | null;
  contacted_at: string | null;
  created_at: string;
}

interface ListResponse {
  total: number;
  entries: PartnerEntry[];
}

interface ParsedPartner {
  name: string;
  company: string;
  type: string;
  phone: string;
  loiDate: string;
}

// ---------------------------------------------------------------------------
// Notes parser  "Name: X | Company: Y | Type: Z | Phone: X | LOI: accepted YYYY-MM-DD"
// ---------------------------------------------------------------------------

function parseNotes(notes: string | null): ParsedPartner {
  const out: ParsedPartner = { name: "", company: "", type: "", phone: "", loiDate: "" };
  if (!notes) return out;
  for (const part of notes.split(" | ")) {
    const idx = part.indexOf(": ");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim().toLowerCase();
    const val = part.slice(idx + 2).trim();
    if (key === "name")    out.name    = val;
    if (key === "company") out.company = val;
    if (key === "type")    out.type    = val;
    if (key === "phone")   out.phone   = val;
    if (key === "loi") {
      const m = val.match(/accepted\s+(\S+)/);
      if (m) out.loiDate = m[1];
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// LOI PDF generator
// ---------------------------------------------------------------------------

function generateLoiPdf(entry: PartnerEntry, parsed: ParsedPartner) {
  const year  = entry.created_at ? new Date(entry.created_at).getFullYear() : new Date().getFullYear();
  const ref   = `LOI-PARTNER-${entry.email.split("@")[0].toUpperCase()}-${year}`;
  const today = parsed.loiDate || new Date().toISOString().slice(0, 10);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>${ref}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Georgia,serif;font-size:11pt;color:#1a1a1a;padding:60px;max-width:760px;margin:0 auto}
h1{font-size:18pt;text-align:center;letter-spacing:.04em;margin-bottom:4px}
.subtitle{font-size:10pt;text-align:center;color:#555;margin-bottom:32px}
.ref{font-size:9pt;text-align:right;color:#777;margin-bottom:24px}
h2{font-size:11pt;text-transform:uppercase;letter-spacing:.06em;margin:28px 0 10px;border-bottom:1px solid #ddd;padding-bottom:4px}
p{line-height:1.7;margin-bottom:10px}
table{width:100%;border-collapse:collapse;margin-bottom:16px}
th,td{border:1px solid #ccc;padding:7px 12px;font-size:10pt}
th{background:#f5f5f5;text-align:left;font-weight:bold}
.sig-block{margin-top:48px;display:grid;grid-template-columns:1fr 1fr;gap:40px}
.sig-line{border-top:1px solid #555;padding-top:6px;font-size:9.5pt;color:#333;margin-top:40px}
.footer{margin-top:48px;font-size:8.5pt;color:#999;text-align:center;border-top:1px solid #eee;padding-top:12px}
@media print{body{padding:40px}}
</style></head><body>
<h1>GuildMark</h1>
<p class="subtitle">LETTER OF INTENT — PARTNER PROGRAM</p>
<p class="ref">Reference: ${ref} &nbsp;|&nbsp; Date: ${today}</p>
<h2>Parties</h2>
<table>
<tr><th>GuildMark (Baerhous Media Group, LLC)</th><th>Partner Applicant</th></tr>
<tr><td>hello@guildmark.co<br>guildmark.co</td>
<td>${parsed.name ? `<strong>${parsed.name}</strong><br>` : ""}${parsed.company ? `${parsed.company}<br>` : ""}${entry.email}${parsed.phone ? `<br>${parsed.phone}` : ""}</td></tr>
</table>
<h2>Proposed Partnership Type</h2>
<table>
<tr><th>Category</th><td>${parsed.type || "Not specified"}</td></tr>
<tr><th>Applicant Email</th><td>${entry.email}</td></tr>
<tr><th>Company / Organisation</th><td>${parsed.company || "—"}</td></tr>
${parsed.phone ? `<tr><th>Phone</th><td>${parsed.phone}</td></tr>` : ""}
</table>
<h2>Purpose</h2>
<p>This Letter of Intent sets out the preliminary, non-binding terms under which GuildMark and the Partner Applicant intend to negotiate a formal Partner Agreement.</p>
<h2>Confidentiality (Binding)</h2>
<p>Each Party agrees to keep the existence and terms of this LOI confidential and not to disclose them to third parties without prior written consent, except as required by law.</p>
<h2>No Binding Contract (Binding)</h2>
<p>Except for the confidentiality provision above, this LOI does not create any legally binding obligations. Either party may withdraw from negotiations at any time without liability.</p>
<h2>Governing Law</h2>
<p>This LOI shall be governed by the laws of the State of Florida, without regard to conflict-of-law principles.</p>
<div class="sig-block">
<div><p><strong>GuildMark (Baerhous Media Group, LLC)</strong></p>
<div class="sig-line">Authorised Signatory</div>
<div class="sig-line" style="margin-top:20px">Date</div></div>
<div><p><strong>${parsed.company || "Partner Applicant"}</strong></p>
<p style="font-size:9.5pt;color:#555;margin-top:4px">Electronically signed by ${parsed.name || entry.email} on ${today}</p>
<div class="sig-line">${parsed.name || "Applicant Name"}</div>
<div class="sig-line" style="margin-top:20px">${today}</div></div>
</div>
<div class="footer">GuildMark &nbsp;·&nbsp; hello@guildmark.co &nbsp;·&nbsp; guildmark.co &nbsp;·&nbsp; ${ref}</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) { alert("Pop-up blocked — allow pop-ups and try again."); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

// ---------------------------------------------------------------------------
// Partner detail modal
// ---------------------------------------------------------------------------

function PartnerModal({
  entry,
  onClose,
  onUpdated,
  onDeleted,
}: {
  entry: PartnerEntry;
  onClose: () => void;
  onUpdated: (e: PartnerEntry) => void;
  onDeleted: (id: string) => void;
}) {
  const apiFetch = useApi();
  const parsed = parseNotes(entry.notes);

  const [notes, setNotes]           = useState(entry.notes ?? "");
  const [saving, setSaving]         = useState(false);
  const [contacting, setContacting] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError]           = useState("");

  const dirty = notes !== (entry.notes ?? "");

  async function handleSaveNotes() {
    setSaving(true);
    setError("");
    try {
      const updated = await apiFetch<PartnerEntry>(`/admin/waitlist/${entry.id}/notes`, {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      });
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkContacted() {
    setContacting(true);
    setError("");
    try {
      const updated = await apiFetch<PartnerEntry>(`/admin/waitlist/${entry.id}/contact`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setContacting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await apiFetch(`/admin/waitlist/${entry.id}`, { method: "DELETE" });
      onDeleted(entry.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
      setConfirmDel(false);
    }
  }

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

  return (
    <RecordModal
      icon={Handshake}
      iconColor="text-purple-400"
      title={parsed.name || entry.email}
      subtitle={parsed.name ? entry.email : undefined}
      badge={
        parsed.type ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border bg-purple-500/10 text-purple-300 border-purple-500/20">
            {parsed.type}
          </span>
        ) : undefined
      }
      infoFields={[
        { label: "Email",       value: entry.email },
        { label: "Company",     value: parsed.company || null },
        { label: "Phone",       value: parsed.phone
          ? <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500" />{parsed.phone}</span>
          : null
        },
        { label: "Partner type", value: parsed.type || null },
        { label: "LOI signed",  value: parsed.loiDate
          ? <span className="flex items-center gap-1.5 text-green-400"><CheckCircle className="w-3.5 h-3.5" />{parsed.loiDate}</span>
          : <span className="text-slate-600 text-xs">Not signed</span>
        },
        { label: "Applied",     value: fmt(entry.created_at) },
        { label: "Status",      value: entry.contacted_at
          ? <span className="flex items-center gap-1.5 text-green-400"><CheckCircle className="w-3.5 h-3.5" />Contacted {fmt(entry.contacted_at)}</span>
          : <span className="flex items-center gap-1.5 text-amber-400"><Clock className="w-3.5 h-3.5" />Pending outreach</span>
        },
      ]}
      onClose={onClose}
      footerLeft={
        confirmDel ? (
          <span className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Remove applicant?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors disabled:opacity-50"
            >
              {deleting ? "Removing…" : "Yes, remove"}
            </button>
            <button
              onClick={() => setConfirmDel(false)}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmDel(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        )
      }
      footerRight={
        <div className="flex items-center gap-2">
          <button
            onClick={() => generateLoiPdf(entry, parsed)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Download LOI
          </button>
          {!entry.contacted_at && (
            <button
              onClick={handleMarkContacted}
              disabled={contacting}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors disabled:opacity-50"
            >
              {contacting ? "Marking…" : "Mark contacted"}
            </button>
          )}
          <button
            onClick={handleSaveNotes}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving…" : "Save notes"}
          </button>
        </div>
      }
    >
      {/* Raw notes editor */}
      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
          Notes <span className="text-slate-700 normal-case tracking-normal">(raw — parsed into fields above on save)</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </RecordModal>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const LIMIT = 50;
const MAX_RETRIES = 3;

export function Partners() {
  const apiFetch    = useApi();
  const apiFetchRef = useRef(apiFetch);
  apiFetchRef.current = apiFetch;

  const [entries, setEntries]   = useState<PartnerEntry[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [offset, setOffset]     = useState(0);
  const [uncontactedOnly, setUncontactedOnly] = useState(false);
  const [selected, setSelected] = useState<PartnerEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      source: "partner", limit: String(LIMIT), offset: String(offset),
      ...(uncontactedOnly ? { uncontacted: "true" } : {}),
    });
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const data = await apiFetchRef.current<ListResponse>(`/admin/waitlist?${params}`);
        setEntries(data.entries);
        setTotal(data.total);
        setLoading(false);
        return;
      } catch (err) {
        if (attempt === MAX_RETRIES) { setError(err instanceof Error ? err.message : "Failed to load"); setLoading(false); return; }
        await new Promise(r => setTimeout(r, attempt * 600));
      }
    }
  }, [offset, uncontactedOnly]);

  useEffect(() => { load(); }, [load]);

  function handleUpdated(updated: PartnerEntry) {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
    setSelected(updated);
  }

  function handleDeleted(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id));
    setTotal(t => t - 1);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-mono text-white flex items-center gap-2">
            <Handshake className="w-5 h-5 text-purple-400" />
            Partners
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-0.5">
            {total.toLocaleString()} applicant{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-mono text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uncontactedOnly}
              onChange={e => { setUncontactedOnly(e.target.checked); setOffset(0); }}
              className="rounded"
            />
            Not yet contacted
          </label>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="ml-4 text-xs text-red-400 hover:text-white underline underline-offset-2 shrink-0">Try again</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">
                <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Name / Company</span>
              </th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Phone</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Type</span>
              </th>
              <th className="px-4 py-3 text-left">LOI Signed</th>
              <th className="px-4 py-3 text-left">Applied</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && entries.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-600">Loading…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-600">No partner applications yet.</td></tr>
            ) : entries.map(e => {
              const p = parseNotes(e.notes);
              return (
                <tr
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    {p.name    ? <span className="block text-white">{p.name}</span>    : null}
                    {p.company ? <span className="block text-slate-400 text-xs mt-0.5">{p.company}</span> : null}
                    {!p.name && !p.company ? <span className="text-slate-700">—</span> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{e.email}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {p.phone || <span className="text-slate-700">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {p.type ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20">{p.type}</span>
                    ) : <span className="text-slate-700">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {p.loiDate
                      ? <span className="flex items-center gap-1.5 text-green-400"><CheckCircle className="w-3.5 h-3.5 shrink-0" />{p.loiDate}</span>
                      : <span className="text-slate-600 text-xs">Not signed</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(e.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {e.contacted_at
                      ? <span className="flex items-center gap-1.5 text-green-400"><CheckCircle className="w-3.5 h-3.5" />Contacted</span>
                      : <span className="flex items-center gap-1.5 text-amber-400"><Clock className="w-3.5 h-3.5" />Pending</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between mt-4 text-sm font-mono text-slate-500">
          <span>Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">Previous</button>
            <button onClick={() => setOffset(offset + LIMIT)} disabled={offset + LIMIT >= total} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <PartnerModal
          entry={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
