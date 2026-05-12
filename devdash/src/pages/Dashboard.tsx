import { Outlet, NavLink } from "react-router";
import { Mail, LogOut, Users, BarChart2, Handshake, DollarSign, UsersRound } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-mono transition-colors ${
    isActive
      ? "bg-blue-600/20 text-blue-400"
      : "text-slate-400 hover:text-white hover:bg-slate-800"
  }`;

export function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Sidebar */}
      <aside className="w-56 border-r border-slate-800 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-slate-800">
          <p className="text-sm font-mono text-white">
            Guild<span className="text-blue-500">Mark</span>
          </p>
          <p className="text-xs text-slate-600 font-mono mt-0.5">DevDash</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink to="/analytics" className={navLink}>
            <BarChart2 className="w-4 h-4" />
            Analytics
          </NavLink>
          <NavLink to="/users" className={navLink}>
            <Users className="w-4 h-4" />
            Users
          </NavLink>
          <NavLink to="/mailing-list" className={navLink}>
            <Mail className="w-4 h-4" />
            Mailing List
          </NavLink>
          <NavLink to="/partners" className={navLink}>
            <Handshake className="w-4 h-4" />
            Partners
          </NavLink>
          <NavLink to="/pricing" className={navLink}>
            <DollarSign className="w-4 h-4" />
            Pricing
          </NavLink>
          <NavLink to="/team" className={navLink}>
            <UsersRound className="w-4 h-4" />
            Team
          </NavLink>
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-mono text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
