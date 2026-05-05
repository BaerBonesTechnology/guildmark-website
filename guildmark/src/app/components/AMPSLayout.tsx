import { Link, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  Cloud,
  FileText,
  Settings,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navigation = [
  { name: "Portfolio", href: "/amps", icon: LayoutDashboard },
  { name: "Assets", href: "/amps/assets", icon: Package },
  { name: "MDM Connections", href: "/amps/mdm", icon: Cloud },
  { name: "Invoices", href: "/amps/invoices", icon: FileText },
  { name: "Settings", href: "/amps/settings", icon: Settings },
];

export function AMPSLayout() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-amps-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amps-accent to-amps-highlight">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-semibold">Guild<span className="text-[#3B82F6]">Mark</span></span>
                  <span className="rounded bg-gradient-to-r from-amps-accent to-amps-highlight px-2 py-0.5 text-xs font-semibold text-white">
                    GM Pro
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {user?.email || "Premium Dashboard"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-mono transition-colors
                    ${
                      isActive
                        ? "bg-amps-accent text-amps-accent-foreground"
                        : "text-muted-foreground hover:bg-amps-surface hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <Link
              to="/marketplace"
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono transition-colors hover:bg-accent"
            >
              <Package className="h-4 w-4" />
              <span>View GuildMarket</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
