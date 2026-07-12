/**
 * AMPSLayout — sidebar shell for the AMPS (GM Pro) suite (View).
 * Nav items live in ampsLayout.constants; the upgrade wall and valuation
 * banner are their own components. Presentation only.
 */
import { Link, Outlet, useLocation } from "react-router";
import { ChevronRight, Package, Sparkles } from "lucide-react";
import { UpgradeWall } from "./amps/UpgradeWall";
import { ValuationBanner } from "./amps/ValuationBanner";
import { AMPS_NAV } from "../constants/ampsLayout.constants";
import { useAuth } from "../hooks/useAuth";

export function AMPSLayout() {
  const location = useLocation();
  const { user } = useAuth();

  // Free-tier users see the upgrade wall — /amps/pro-signup is handled as a
  // sibling route outside this layout so it bypasses this check. Currently
  // pinned to "pro" so the wall never shows; restore the line below to gate.
  const plan: string = /* user?.subscription_plan ?? "free" */ "pro";
  if (plan === "free") return <UpgradeWall plan={plan} />;

  return (
    <div className="min-h-screen font-sans bg-amps-surface ">
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
                  <span className=" text-lg font-semibold">Guild<span className="text-amps-accent">Mark</span></span>
                  <span className="rounded bg-gradient-to-r from-amps-accent to-amps-highlight px-2 py-0.5 text-xs font-semibold text-white">
                    GM Pro
                  </span>
                </div>
                <p className="text-xs text-muted-foreground ">
                  {user?.email || "Premium Dashboard"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {AMPS_NAV.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm  transition-colors
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
              to="/pre/marketplace"
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm  transition-colors hover:bg-accent"
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
          <ValuationBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
