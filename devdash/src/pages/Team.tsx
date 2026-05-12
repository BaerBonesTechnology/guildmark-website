import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, UserCheck, UserX, Shield, ChevronDown, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL ?? "https://api.guildmark.co";

type EmployeeRole = "superadmin" | "engineer" | "support" | "marketing";

interface Employee {
  id:            string;
  email:         string;
  full_name:     string;
  role:          EmployeeRole;
  is_active:     boolean;
  last_login_at: string | null;
  created_at:    string;
}

const ROLE_COLORS: Record<EmployeeRole, string> = {
  superadmin: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  engineer:   "text-blue-400 bg-blue-400/10 border-blue-400/20",
  support:    "text-green-400 bg-green-400/10 border-green-400/20",
  marketing:  "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

const ALL_ROLES: EmployeeRole[] = ["superadmin", "engineer", "support", "marketing"];

type Status = "idle" | "loading" | "success" | "error";

export function Team() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadStatus, setLoadStatus] = useState<Status>("loading");
  const [toast, setToast]           = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // New employee form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ email: "", full_name: "", password: "", role: "support" as EmployeeRole });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEmployees = useCallback(async () => {
    setLoadStatus("loading");
    try {
      const res = await fetch(`${API}/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEmployees(await res.json());
      setLoadStatus("success");
    } catch {
      setLoadStatus("error");
    }
  }, [token]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleCreate = async () => {
    setFormError("");
    if (!form.email || !form.full_name || !form.password) {
      setFormError("All fields are required.");
      return;
    }
    if (form.password.length < 10) {
      setFormError("Password must be at least 10 characters.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API}/admin/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `HTTP ${res.status}`);
      }
      const created: Employee = await res.json();
      setEmployees((e) => [...e, created]);
      setForm({ email: "", full_name: "", password: "", role: "support" });
      setShowForm(false);
      showToast("success", `${created.full_name} added`);
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (id: string, role: EmployeeRole) => {
    try {
      const res = await fetch(`${API}/admin/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated: Employee = await res.json();
      setEmployees((e) => e.map((emp) => emp.id === id ? { ...emp, role: updated.role } : emp));
      showToast("success", "Role updated");
    } catch {
      showToast("error", "Failed to update role");
    }
  };

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    try {
      const res = await fetch(`${API}/admin/employees/${id}`, {
        method: currentlyActive ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: currentlyActive ? undefined : JSON.stringify({ is_active: true }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEmployees((e) => e.map((emp) => emp.id === id ? { ...emp, is_active: !currentlyActive } : emp));
      showToast("success", currentlyActive ? "Employee deactivated" : "Employee reactivated");
    } catch {
      showToast("error", "Failed to update employee");
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-mono text-white mb-1">Team</h1>
          <p className="text-sm text-slate-500 font-mono">
            Manage GuildMark employee accounts and DevDash access.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-mono rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* New employee form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 mb-6 space-y-4">
          <p className="text-sm font-mono text-slate-200">New Employee</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-mono mb-1 block">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="Jamie Williams"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-mono mb-1 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="jamie@guildmark.co"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-mono mb-1 block">Temporary Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="min. 10 characters"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-mono mb-1 block">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as EmployeeRole }))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r} className="capitalize">{r}</option>
                ))}
              </select>
            </div>
          </div>
          {formError && (
            <p className="text-xs text-red-400 font-mono">{formError}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-mono rounded transition-colors"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              onClick={() => { setShowForm(false); setFormError(""); }}
              className="px-3 py-1.5 text-slate-400 text-sm font-mono hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Employee list */}
      {loadStatus === "loading" ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
        </div>
      ) : loadStatus === "error" ? (
        <p className="text-sm text-red-400 font-mono">Failed to load employees.</p>
      ) : (
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-widest">
                <th className="text-left px-4 py-3">Employee</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Last Login</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <p className="text-slate-200">{emp.full_name}</p>
                    <p className="text-xs text-slate-500">{emp.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={emp.role}
                        onChange={(e) => handleRoleChange(emp.id, e.target.value as EmployeeRole)}
                        className={`appearance-none pr-6 pl-2 py-0.5 rounded border text-xs font-mono cursor-pointer bg-transparent ${ROLE_COLORS[emp.role]}`}
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r} className="bg-slate-900 text-slate-100 capitalize">{r}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {emp.last_login_at
                      ? new Date(emp.last_login_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    {emp.is_active ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <UserCheck className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <UserX className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleActive(emp.id, emp.is_active)}
                      title={emp.is_active ? "Deactivate" : "Reactivate"}
                      className={`p-1.5 rounded transition-colors ${
                        emp.is_active
                          ? "text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                          : "text-slate-500 hover:text-green-400 hover:bg-green-400/10"
                      }`}
                    >
                      {emp.is_active ? <Trash2 className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500 text-sm">
                    No employees yet. Add the first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-mono ${
          toast.type === "success" ? "bg-green-900/90 text-green-300 border border-green-700" : "bg-red-900/90 text-red-300 border border-red-700"
        }`}>
          {toast.type === "success"
            ? <CheckCircle className="w-4 h-4" />
            : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
