import { useState, useEffect, useCallback } from "react";
import { Mail, CheckCircle, Clock, RefreshCw, MessageSquare } from "lucide-react";
import { useApi } from "../hooks/useAuth";

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

export function MailingList() {
  const apiFetch = useApi();
  const [entries, setEntries] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uncontactedOnly, setUncontactedOnly] = useState(false);
  const [offset, setOffset] = useState(0);
  const [notesModal, setNotesModal] = useState<Subscriber | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const LIMIT = 50;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(offset),
        ...(uncontactedOnly ? { uncontacted: "true" } : {}),
      });
      const data = await apiFetch<ListResponse>(`/admin/waitlist?${params}`);
      setEntries(data.entries);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, offset, uncontactedOnly]);

  useEffect(() => { load(); }, [load]);

  async function markContacted(id: string, notes?: string) {
    await apiFetch(`/admin/waitlist/${id}/contact`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
    load();
  }

  async function saveNotes() {
    if (!notesModal) return;
    await apiFetch(`/admin/waitlist/${notesModal.id}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ notes: notesValue }),
    });
    setNotesModal(null);
    load();
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
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 font-mono">
          {error}
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
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-600">Loading…</td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-600">No subscribers found.</td>
              </tr>
            ) : entries.map(e => (
              <tr key={e.id} className="border-t border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-white">{e.email}</td>
                <td className="px-4 py-3 text-slate-400">{e.source}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(e.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {e.contacted_at ? (
                    <span className="flex items-center gap-1.5 text-green-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Contacted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                  {e.notes ?? <span className="text-slate-700">—</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setNotesModal(e); setNotesValue(e.notes ?? ""); }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      title="Edit notes"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    {!e.contacted_at && (
                      <button
                        onClick={() => markContacted(e.id)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/20"
                      >
                        Mark contacted
                      </button>
                    )}
                  </div>
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
            <button
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              disabled={offset === 0}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + LIMIT)}
              disabled={offset + LIMIT >= total}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Notes modal */}
      {notesModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setNotesModal(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-sm font-mono text-white mb-1">Notes</h2>
            <p className="text-xs text-slate-500 font-mono mb-4">{notesModal.email}</p>
            <textarea
              value={notesValue}
              onChange={e => setNotesValue(e.target.value)}
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Add notes about this subscriber..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setNotesModal(null)}
                className="px-4 py-2 text-sm font-mono text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="px-4 py-2 text-sm font-mono text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
