import { useState, useEffect, useCallback, useRef } from "react";
import { Users as UsersIcon, RefreshCw, Search, X, Trash2, UserCog, Save, AlertCircle } from "lucide-react";
import { useApi } from "../hooks/useAuth";
import { RecordModal } from "../components/RecordModal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  company_id: string;
  company_name: string;
  size_band: string | null;
  industry: string | null;
  plan: string;
  subscription_status: string;
}

interface UsersResponse {
  total: number;
  limit: number;
  offset: number;
  users: User[];
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const PLAN_STYLES: Record<string, string> = {
  free:    "bg-slate-700/60 text-slate-300 border-slate-600",
  starter: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  growth:  "bg-violet-500/15 text-violet-400 border-violet-500/30",
  pro:     "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const ROLE_STYLES: Record<string, string> = {
  admin:  "bg-red-500/15 text-red-400 border-red-500/30",
  member: "bg-slate-700/60 text-slate-400 border-slate-600",
  viewer: "bg-slate-700/40 text-slate-500 border-slate-700",
};

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled: "bg-slate-700/60 text-slate-500 border-slate-600",
  past_due:  "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

function Badge({ label, styles }: { label: string; styles: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${styles}`}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// User detail modal
// ---------------------------------------------------------------------------

function UserModal({
  user,
  onClose,
  onUpdated,
  onDeleted,
}: {
  user: User;
  onClose: () => void;
  onUpdated: (u: User) => void;
  onDeleted: (id: string) => void;
}) {
  const apiFetch = useApi();
  const [role, setRole]           = useState(user.role);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError]         = useState("");

  const dirty = role !== user.role;

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const updated = await apiFetch<User>(`/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await apiFetch(`/admin/users/${user.id}`, { method: "DELETE" });
      onDeleted(user.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
      setConfirmDel(false);
    }
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <RecordModal
      icon={UserCog}
      iconColor="text-blue-400"
      title={user.full_name}
      subtitle={user.email}
      badge={
        <Badge
          label={user.plan}
          styles={PLAN_STYLES[user.plan] ?? PLAN_STYLES.free}
        />
      }
      infoFields={[
        { label: "Email",       value: user.email },
        { label: "Company",     value: user.company_name },
        { label: "Size",        value: user.size_band ? `${user.size_band} employees` : null },
        { label: "Industry",    value: user.industry },
        { label: "Plan",        value: (
          <Badge label={user.plan} styles={PLAN_STYLES[user.plan] ?? PLAN_STYLES.free} />
        )},
        { label: "Status",      value: (
          <Badge
            label={user.subscription_status.replace("_", " ")}
            styles={STATUS_STYLES[user.subscription_status] ?? ""}
          />
        )},
        { label: "Joined",      value: fmt(user.created_at) },
        { label: "User ID",     value: <span className="text-slate-600 text-xs">{user.id}</span> },
      ]}
      onClose={onClose}
      footerLeft={
        confirmDel ? (
          <span className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Delete this account?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
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
            Delete
          </button>
        )
      }
      footerRight={
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving…" : "Save changes"}
        </button>
      }
    >
      {/* Role editor */}
      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
          Role
        </label>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-blue-500 w-48"
        >
          <option value="viewer">Viewer</option>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        {dirty && (
          <p className="text-xs text-amber-400 font-mono mt-2">
            Unsaved — role will change from <strong>{user.role}</strong> to <strong>{role}</strong>.
          </p>
        )}
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
const PLANS = ["free", "starter", "growth", "pro"];
const MAX_RETRIES = 3;

export function Users() {
  const apiFetch = useApi();
  const apiFetchRef = useRef(apiFetch);
  apiFetchRef.current = apiFetch;

  const [users, setUsers]     = useState<User[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [offset, setOffset]   = useState(0);
  const [search, setSearch]   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [selected, setSelected] = useState<User | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setOffset(0); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      limit: String(LIMIT), offset: String(offset),
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
      ...(planFilter       ? { plan: planFilter }   : {}),
    });
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const data = await apiFetchRef.current<UsersResponse>(`/admin/users?${params}`);
        setUsers(data.users);
        setTotal(data.total);
        setLoading(false);
        return;
      } catch (err) {
        if (attempt === MAX_RETRIES) { setError(err instanceof Error ? err.message : "Failed to load"); setLoading(false); return; }
        await new Promise(r => setTimeout(r, attempt * 600));
      }
    }
  }, [offset, debouncedSearch, planFilter]);

  useEffect(() => { load(); }, [load]);

  function handleUpdated(updated: User) {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setSelected(updated);
  }

  function handleDeleted(id: string) {
    setUsers(prev => prev.filter(u => u.id !== id));
    setTotal(t => t - 1);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-mono text-white flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-blue-500" />
            Users
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-0.5">
            {total.toLocaleString()} registered user{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search email, name, company…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-8 py-1.5 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
          />
          {search && (
            <button onClick={() => { setSearch(""); setOffset(0); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={planFilter}
          onChange={e => { setPlanFilter(e.target.value); setOffset(0); }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All plans</option>
          {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
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
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Industry</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600">{debouncedSearch || planFilter ? "No users match your filters." : "No users yet."}</td></tr>
            ) : users.map(u => (
              <tr
                key={u.id}
                onClick={() => setSelected(u)}
                className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <p className="text-white">{u.full_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-300">{u.company_name}</p>
                  {u.size_band && <p className="text-xs text-slate-600 mt-0.5">{u.size_band} employees</p>}
                </td>
                <td className="px-4 py-3 text-slate-500">{u.industry ?? <span className="text-slate-700">—</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 items-start">
                    <Badge label={u.plan} styles={PLAN_STYLES[u.plan] ?? PLAN_STYLES.free} />
                    {u.subscription_status !== "active" && (
                      <Badge label={u.subscription_status.replace("_", " ")} styles={STATUS_STYLES[u.subscription_status] ?? ""} />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge label={u.role} styles={ROLE_STYLES[u.role] ?? ROLE_STYLES.member} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between mt-4 text-sm font-mono text-slate-500">
          <span>Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total.toLocaleString()}</span>
          <div className="flex gap-2">
            <button onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">Previous</button>
            <button onClick={() => setOffset(offset + LIMIT)} disabled={offset + LIMIT >= total} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <UserModal
          user={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
