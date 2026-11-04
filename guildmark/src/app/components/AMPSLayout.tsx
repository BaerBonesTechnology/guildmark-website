/**
 * AMPSLayout — sidebar shell for the AMPS (GM Pro) suite (View).
 * Nav items live in ampsLayout.constants; the upgrade wall and valuation
 * banner are their own components. Presentation only.
 */
import { Link, Outlet, useLocation } from "react-router";
import { ChevronRight, Package } from "lucide-react";
import { UpgradeWall } from "./amps/UpgradeWall";
import { ValuationBanner } from "./amps/ValuationBanner";
import { AMPS_NAV } from "../constants/ampsLayout.constants";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../lib/apiHooks";
import { PLAN_CATALOG, type PlanKey } from "../constants/planCatalog";

export function AMPSLayout() {
  const location = useLocation();
  const isPreview = location.pathname.startsWith("/pre/");
  const { user } = useAuth();

  const subscription = useSubscription();
  const plan = (subscription.data?.plan ?? user?.subscription_plan ?? "free") as PlanKey;
  if (subscription.isPending) return <p role="status" className="p-8">Loading your AMPS access…</p>;
  if (subscription.isError) return <div role="alert" className="p-8"><p>Your AMPS access could not be confirmed.</p><button className="mt-3 underline" onClick={() => subscription.refetch()}>Retry</button></div>;
  if (!subscription.data?.eligibility?.can_view_assets && !location.pathname.endsWith("/settings")) return <UpgradeWall plan={plan} />;

  return (
    <div className="min-h-screen font-sans bg-amps-surface ">
      {/* Sidebar */}
      <aside className="border-b border-border bg-card lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-border px-6 py-5">
            <div className="flex flex-col items-start gap-2">
              <span className="text-lg font-semibold">Guild<span className="text-amps-accent">Mark</span> AMPS</span>
              <span className="rounded bg-amps-accent px-2 py-0.5 text-xs font-semibold text-amps-accent-foreground">
                {PLAN_CATALOG[plan]?.label ?? plan}
              </span>
              <p className="text-xs text-muted-foreground">{user?.email || "Asset-owner workspace"}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="AMPS navigation" className="flex flex-wrap gap-1 px-3 py-4 lg:block lg:flex-1 lg:space-y-1">
            {AMPS_NAV.map((item) => {
              const href = isPreview ? item.href : item.href.replace(/^\/pre/, "");
              const isActive = location.pathname === href;
              return (
                <Link
                  key={item.name}
                  to={href}
                  aria-current={isActive ? "page" : undefined}
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
              to={isPreview ? "/pre/marketplace" : "/marketplace"}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm  transition-colors hover:bg-accent"
            >
              <Package className="h-4 w-4" />
              <span>View GuildMarket</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
          <ValuationBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
