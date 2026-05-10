import { Link, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  Cloud,
  FileText,
  Settings,
  ChevronRight,
  Sparkles,
  Lock,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";

const navigation = [
  { name: "Portfolio", href: "/amps", icon: LayoutDashboard },
  { name: "Assets", href: "/amps/assets", icon: Package },
  { name: "MDM Connections", href: "/amps/mdm", icon: Cloud },
  { name: "Invoices", href: "/amps/invoices", icon: FileText },
  { name: "Settings", href: "/amps/settings", icon: Settings },
];

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["Full asset inventory", "MDM integrations (Jamf + Intune)", "Market Pulse valuations", "Tax invoices"],
  growth:  ["Everything in Starter", "Bulk quick-list to GuildMarket", "Portfolio trend analytics", "Priority support"],
  pro:     ["Everything in Growth", "Dedicated account manager", "Custom reporting", "Lowest seller fees (3%)"],
};

function UpgradeWall({ plan }: { plan: string }) {
  return (
    <div className="min-h-screen bg-amps-surface flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amps-accent to-amps-highlight flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-mono font-semibold mb-2">
            GM Pro Required
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            You're on the <span className="font-semibold capitalize">{plan}</span> plan.
            Upgrade to unlock fleet intelligence, MDM integrations, and AI-powered valuations.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {(["starter", "growth", "pro"] as const).map((tier) => (
            <div key={tier} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <p className="text-sm font-mono font-semibold capitalize">{tier}</p>
              <ul className="space-y-1.5">
                {PLAN_FEATURES[tier].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-amps-accent shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild className="bg-amps-accent hover:bg-amps-accent/90 text-white font-mono gap-2 px-8">
            <Link to="/amps/pro-signup">
              <Sparkles className="w-4 h-4" />
              View Plans &amp; Upgrade
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            No contracts · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

export function AMPSLayout() {
  const location = useLocation();
  const { user } = useAuth();

  // Free-tier users see the upgrade wall — /amps/pro-signup is handled
  // as a sibling route outside this layout so it bypasses this check.
  const plan = user?.subscription_plan ?? "free";
  if (plan === "free") return <UpgradeWall plan={plan} />;

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
                  <span className="font-mono text-lg font-semibold">Guild<span className="text-amps-accent">Mark</span></span>
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
