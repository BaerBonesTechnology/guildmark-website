import { Outlet, NavLink, Link } from "react-router";
import { TrendingUp, Calculator, PackageX, ShoppingCart, Tags, Sun, Moon, LogOut, Home, Sparkles, BookOpen, Receipt, Settings, Inbox } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-neutral-700/50 bg-white/95 dark:bg-[#2B2B2B]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-mono tracking-tight text-slate-900 dark:text-white">Guild<span className="text-[#3B82F6]">Mark</span></h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono">Certified Hardware Exchange</p>
            </div>

            {/* Navigation */}
            <nav className="flex gap-2 items-center">
              {!isAuthenticated ? (
                <>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#3B82F6] text-white"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700/50"
                      }`
                    }
                  >
                    <Home className="w-4 h-4" />
                    <span className="text-sm font-mono">Home</span>
                  </NavLink>

                  <NavLink
                    to="/marketplace"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#3B82F6] text-white"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700/50"
                      }`
                    }
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm font-mono">Marketplace</span>
                  </NavLink>

                  <div className="h-6 w-px bg-slate-200 dark:bg-neutral-600 mx-2" />

                  <Button asChild variant="outline" className="font-mono">
                    <Link to="/login">Sign In</Link>
                  </Button>

                  <Button asChild className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-mono">
                    <Link to="/signup">Sign Up Free</Link>
                  </Button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#3B82F6] text-white"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700/50"
                      }`
                    }
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-mono">Fleet Dashboard</span>
                  </NavLink>

              <NavLink
                to="/calculator"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#3B82F6] text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700/50"
                  }`
                }
              >
                <Calculator className="w-4 h-4" />
                <span className="text-sm font-mono">Market Pulse</span>
              </NavLink>

              <NavLink
                to="/offload"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#3B82F6] text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700/50"
                  }`
                }
              >
                <PackageX className="w-4 h-4" />
                <span className="text-sm font-mono">Offload</span>
              </NavLink>

              <div className="h-6 w-px bg-slate-200 dark:bg-neutral-600 mx-2" />

              <NavLink
                to="/marketplace"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#3B82F6] text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700/50"
                  }`
                }
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-mono">Marketplace</span>
              </NavLink>

              <NavLink
                to="/my-listings"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#3B82F6] text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700/50"
                  }`
                }
              >
                <Tags className="w-4 h-4" />
                <span className="text-sm font-mono">My Listings</span>
              </NavLink>

              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#3B82F6] text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700/50"
                  }`
                }
              >
                <Receipt className="w-4 h-4" />
                <span className="text-sm font-mono">Orders</span>
              </NavLink>

              <NavLink
                to="/offers"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#3B82F6] text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700/50"
                  }`
                }
              >
                <Inbox className="w-4 h-4" />
                <span className="text-sm font-mono">My Offers</span>
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#3B82F6] text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700/50"
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-mono">Settings</span>
              </NavLink>

              <div className="h-6 w-px bg-slate-200 dark:bg-neutral-600 mx-2" />

              <NavLink
                to="/amps"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive || window.location.pathname.startsWith('/amps')
                      ? "bg-gradient-to-r from-amps-accent to-amps-highlight text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700/50"
                  }`
                }
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-mono">GM Pro</span>
              </NavLink>

              <div className="h-6 w-px bg-slate-200 dark:bg-neutral-600 mx-2" />

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono">{user?.company}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="font-mono text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>

              <div className="h-6 w-px bg-slate-200 dark:bg-neutral-600 mx-2" />
                </>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700/50 text-slate-600 dark:text-slate-300 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content — pb-16 clears the fixed footer */}
      <main className="max-w-7xl mx-auto px-6 pt-6 pb-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-50/90 dark:bg-neutral-900/90 backdrop-blur-sm border-t border-slate-200 dark:border-neutral-700/50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-mono">
            &copy; {new Date().getFullYear()} Baerhous Media Group, LLC. GuildMark&#8482; is a trademark of Baerhous Media Group, LLC.
          </p>
          <Link
            to="/insights"
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-[#3B82F6] transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            Market Research &amp; Insights
          </Link>
        </div>
      </footer>
    </div>
  );
}
