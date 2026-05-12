import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Shield,
  ClipboardList,
  Wrench,
  Wallet,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const NAV = [
  { label: "Workboard",       href: "/workboard", icon: ClipboardList },
  { label: "Active Services", href: "/services",  icon: Wrench },
  { label: "Account",         href: "/account",   icon: Wallet },
];

export function PartnerLayout() {
  const { partner, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--prt-bg)" }}
    >
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r"
        style={{
          background: "var(--prt-surface)",
          borderColor: "var(--prt-border)",
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-5 py-5 border-b"
          style={{ borderColor: "var(--prt-border)" }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
            style={{ background: "var(--prt-accent)" }}
          >
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <p
              className="text-sm font-semibold leading-tight"
              style={{ fontFamily: "var(--prt-font-mono)", color: "var(--prt-text)" }}
            >
              Guild<span style={{ color: "var(--prt-accent-light)" }}>Mark</span>
            </p>
            <p className="text-xs" style={{ color: "var(--prt-muted)" }}>
              Partner Portal
            </p>
          </div>
        </div>

        {/* Partner code badge */}
        {partner && (
          <div className="px-5 py-3">
            <span
              className="inline-block rounded px-2 py-0.5 text-xs font-mono font-medium"
              style={{
                background: "rgba(37,99,235,0.12)",
                color: "var(--prt-accent-light)",
                border: "1px solid rgba(37,99,235,0.25)",
              }}
            >
              {partner.partner_code}
            </span>
            <p
              className="mt-0.5 text-xs truncate"
              style={{ color: "var(--prt-muted)" }}
            >
              {partner.company_name}
            </p>
            {partner.status === "pending" && (
              <span
                className="mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium"
                style={{
                  background: "rgba(245,158,11,0.12)",
                  color: "var(--prt-warning)",
                  border: "1px solid rgba(245,158,11,0.25)",
                }}
              >
                Pending approval
              </span>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = location.pathname === href;
            return (
              <Link
                key={href}
                to={href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                style={{
                  background: active ? "var(--prt-accent)" : "transparent",
                  color: active ? "white" : "var(--prt-muted)",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "var(--prt-card)";
                    e.currentTarget.style.color      = "var(--prt-text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color      = "var(--prt-muted)";
                  }
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          className="border-t p-3"
          style={{ borderColor: "var(--prt-border)" }}
        >
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
            style={{ color: "var(--prt-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--prt-card)";
              e.currentTarget.style.color      = "var(--prt-danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color      = "var(--prt-muted)";
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 pl-60">
        <main className="min-h-screen p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
