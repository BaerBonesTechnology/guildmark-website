import { useState, useEffect, useCallback, useRef } from "react";
import {
  Mail, CheckCircle, Clock, RefreshCw,
  Trash2, AlertCircle, Save,
} from "lucide-react";
import { useApi } from "../hooks/useAuth";
import { RecordModal } from "../components/RecordModal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Subscriber {
  id: string;
  email: string;
  source: string;
  notes: string | null;
  contacted_at: string | null;
  created_at: string;
}

interface ListResponse {
  total: number;
  entries: Subscriber[];
}

// ---------------------------------------------------------------------------
// Subscriber detail modal
// ---------------------------------------------------------------------------

function SubscriberModal({
  entry,
  onClose,
  onUpdated,
  onDeleted,
}: {
  entry: Subscriber;
  onClose: () => void;
  onUpdated: (e: Subscriber) => void;
  onDeleted: (id: string) => void;
}) {
  const apiFetch = useApi();
  const [notes, setNotes]         = useState(entry.notes ?? "");
  const [saving, setSaving]       = useState(false);
  const [contacting, setContacting] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError]         = useState("");

  const dirty = notes !== (entry.notes ?? "");

  async function handleSaveNotes() {
    setSaving(true);
    setError("");
    try {
      const updated = await apiFetch<Subscriber>(`/admin/waitlist/${entry.id}/notes`, {
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
      const updated = await apiFetch<Subscriber>(`/admin/waitlist/${entry.id}/contact`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark contacted");
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

  const SOURCE_STYLES: Record<string, string> = {
    waitlist: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    partner:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
    contact:  "bg-slate-700/60 text-slate-400 border-slate-600",
  };

  return (
    <RecordModal
      icon={Mail}
      iconColor="text-blue-400"
      title={entry.email}
      subtitle={`Added ${fmt(entry.created_at)}`}
      badge={
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${SOURCE_STYLES[entry.source] ?? SOURCE_STYLES.contact}`}>
          {entry.source}
        </span>
      }
      infoFields={[
        { label: "Email",        value: entry.email },
        { label: "Source",       value: entry.source },
        { label: "Signed up",    value: fmt(entry.created_at) },
        { label: "Contacted",    value: entry.contacted_at
          ? <span className="flex items-center gap-1.5 text-green-400"><CheckCircle className="w-3.5 h-3.5" />{fmt(entry.contacted_at)}</span>
          : <span className="flex items-center gap-1.5 text-amber-400"><Clock className="w-3.5 h-3.5" />Not yet contacted</span>
        },
      ]}
      onClose={onClose}
      footerLeft={
        confirmDel ? (
          <span className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Remove subscriber?</span>
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
      {/* Notes editor */}
      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          placeholder="Add internal notes about this subscriber…"
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

export function MailingList() {
  const apiFetch    = useApi();
  const apiFetchRef = useRef(apiFetch);
  apiFetchRef.current = apiFetch;

  const [entries, setEntries]       = useState<Subscriber[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [uncontactedOnly, setUncontactedOnly] = useState(false);
  const [offset, setOffset]         = useState(0);
  const [selected, setSelected]     = useState<Subscriber | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      limit: String(LIMIT), offset: String(offset),
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

  function handleUpdated(updated: Subscriber) {
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
            <Mail className="w-5 h-5 text-blue-500" />
            Mailing List
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-0.5">
            {total.toLocaleString()} subscriber{total !== 1 ? "s" : ""}
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
            Uncontacted only
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Signed up</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading && entries.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-600">Loading…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-600">No subscribers found.</td></tr>
            ) : entries.map(e => (
              <tr
                key={e.id}
                onClick={() => setSelected(e)}
                className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-white">{e.email}</td>
                <td className="px-4 py-3 text-slate-400">{e.source}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(e.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {e.contacted_at ? (
                    <span className="flex items-center gap-1.5 text-green-400">
                      <CheckCircle className="w-3.5 h-3.5" />Contacted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Clock className="w-3.5 h-3.5" />Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                  {e.notes ?? <span className="text-slate-700">—</span>}
                </td>
              </tr>
            ))}
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
        <SubscriberModal
          entry={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
