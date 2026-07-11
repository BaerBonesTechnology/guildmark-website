import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import {
  TrendingUp, BookOpen, Zap, ShoppingCart, Sparkles, Home,
  Tags, Receipt, Inbox, Settings, LogOut, ChevronDown, Menu, Sun, Moon,
} from "lucide-react";
import logoLong from "../../../logo-long.svg";
import { ampsEnabled } from "../../config";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "../ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

interface NavItem { label: string; icon: React.ElementType; to: string; sep?: boolean }

const AUTHED_NAV: NavItem[] = [
  { label: "Fleet Dashboard", icon: TrendingUp,  to: "/pre/dashboard" },
  { label: "Market Pulse",    icon: BookOpen,     to: "/pre/calculator" },
  { label: "Offload",         icon: Zap,          to: "/pre/offload",     sep: true },
  { label: "GuildMarket",     icon: ShoppingCart, to: "/pre/marketplace", sep: true },
];

const USER_MENU: NavItem[] = [
  { label: "My Listings", icon: Tags,     to: "/pre/my-listings" },
  { label: "Orders",      icon: Receipt,  to: "/pre/orders" },
  { label: "My Offers",   icon: Inbox,    to: "/pre/offers" },
  { label: "Settings",    icon: Settings, to: "/pre/settings" },
];

const Sep = () => (
  <span className="text-muted-foreground mx-1 select-none opacity-40" aria-hidden>·</span>
);

/** Desktop nav link with the active-underline treatment. */
function TopNavLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors"
      style={({ isActive }) => ({
        fontFamily: BODY,
        color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
        fontWeight: isActive ? 500 : 400,
      })}
    >
      {({ isActive }) => (
        <>
          <Icon size={12} />
          {item.label}
          {isActive && <span className="absolute -bottom-[13px] left-0 right-0 h-px" style={{ background: "var(--primary)" }} />}
        </>
      )}
    </NavLink>
  );
}

export function GMNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const handleNav = () => setSidebarOpen(false);

  const ampsActive = location.pathname.startsWith("/pre/amps");
  const initial = user?.company?.charAt(0)?.toUpperCase() ?? "?";

  // ── GM Pro pill (purple accent, sharp) ──────────────────────────────────
  const GmProLink = ({ sidebar = false, onClick }: { sidebar?: boolean; onClick?: () => void }) => (
    <NavLink
      to="/pre/amps"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 ${sidebar ? "py-2.5" : "py-1.5"} text-xs transition-colors`}
      style={{
        fontFamily: BODY,
        border: "1px solid color-mix(in srgb, var(--amps-accent) 35%, transparent)",
        color: ampsActive ? "#fff" : "var(--amps-accent)",
        background: ampsActive ? "var(--amps-accent)" : "color-mix(in srgb, var(--amps-accent) 8%, transparent)",
        fontWeight: 500,
      }}
    >
      <Sparkles size={12} />
      GM Pro
    </NavLink>
  );

  // ── User dropdown (desktop) ─────────────────────────────────────────────
  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2 py-1 border border-border text-xs transition-colors hover:border-foreground outline-none"
          style={{ fontFamily: BODY, color: "var(--muted-foreground)" }}
        >
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px]" style={{ background: "var(--primary)", color: "#fff" }}>
            {initial}
          </span>
          <span className="max-w-[90px] truncate">{user?.company}</span>
          <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-none" style={{ fontFamily: BODY }}>
        <DropdownMenuLabel className="text-[10px] font-normal text-muted-foreground" style={{ fontFamily: MONO }}>
          {user?.company}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {USER_MENU.map(({ label, icon: Icon, to }) => (
          <DropdownMenuItem key={to} asChild>
            <Link to={to} className="flex items-center gap-2 cursor-pointer text-xs">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="flex items-center gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={13} /> : <Sun size={13} />}
    </button>
  );

  return (
    <div className="sticky top-0 z-50" style={{ background: "var(--background)" }}>
      {/* Demo mode banner */}
      <div
        className="text-center text-[11px] py-1.5 border-b border-border"
        style={{ fontFamily: BODY, color: "var(--muted-foreground)", background: "var(--card)" }}
      >
        Currently in Demo Mode, current product showings are for demonstration purposes only.
      </div>

      {/* Main header */}
      <header className="border-b border-border" style={{ background: "var(--background)" }}>
        <div className="px-6 h-12 flex items-center gap-6">
          <Link to={isAuthenticated ? "/pre/marketplace" : "/"} className="shrink-0">
            <img src={logoLong} className="h-6" alt="GuildMark" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {isAuthenticated ? (
              AUTHED_NAV.map((item) => (
                <div key={item.to} className="flex items-center gap-1">
                  {item.sep && <Sep />}
                  <TopNavLink item={item} />
                </div>
              ))
            ) : (
              <>
                {/* <TopNavLink item={{ label: "Home", icon: Home, to: "/pre/" }} /> */}
                <TopNavLink item={{ label: "Marketplace", icon: ShoppingCart, to: "/pre/marketplace" }} />
              </>
            )}
          </nav>

          {/* Right controls (desktop) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0 ml-auto">
            {isAuthenticated ? (
              <>
                {ampsEnabled && <><GmProLink /><Sep /></>}
                <UserMenu />
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="h-7 rounded-none text-xs">
                  <Link to="/pre/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="h-7 rounded-none text-xs bg-primary text-white hover:bg-primary/90">
                  <Link to="/pre/signup">Sign Up Free</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-1 lg:hidden ml-auto">
            <ThemeToggle />
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground"
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col bg-background">
          <SheetHeader className="px-5 py-4 border-b border-border">
            <SheetTitle asChild>
              <img src={logoLong} alt="GuildMark" className="h-6" />
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-0.5 px-2 py-3 overflow-y-auto flex-1" style={{ fontFamily: BODY }}>
            {isAuthenticated ? (
              <>
                {AUTHED_NAV.map(({ label, icon: Icon, to }) => (
                  <NavLink key={to} to={to} onClick={handleNav}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    style={({ isActive }) => isActive ? { color: "var(--foreground)", fontWeight: 500 } : undefined}>
                    <Icon className="w-4 h-4 shrink-0" /><span>{label}</span>
                  </NavLink>
                ))}
                {ampsEnabled && <div className="px-1 py-2"><GmProLink sidebar onClick={handleNav} /></div>}
                <div className="border-t border-border my-1" />
                {USER_MENU.map(({ label, icon: Icon, to }) => (
                  <NavLink key={to} to={to} onClick={handleNav}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    style={({ isActive }) => isActive ? { color: "var(--foreground)", fontWeight: 500 } : undefined}>
                    <Icon className="w-4 h-4 shrink-0" /><span>{label}</span>
                  </NavLink>
                ))}
                <button onClick={() => { handleNav(); logout(); }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left">
                  <LogOut className="w-4 h-4 shrink-0" /><span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* <NavLink to="/pre/" end onClick={handleNav}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60">
                  <Home className="w-4 h-4 shrink-0" /><span>Home</span>
                </NavLink> */}
                <NavLink to="/pre/marketplace" onClick={handleNav}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60">
                  <ShoppingCart className="w-4 h-4 shrink-0" /><span>Marketplace</span>
                </NavLink>
                <div className="flex flex-col gap-2 px-3 pt-3">
                  <Button asChild variant="outline" size="sm" className="rounded-none">
                    <Link to="/pre/login" onClick={handleNav}>Sign In</Link>
                  </Button>
                  <Button asChild size="sm" className="rounded-none bg-primary text-white hover:bg-primary/90">
                    <Link to="/pre/signup" onClick={handleNav}>Sign Up Free</Link>
                  </Button>
                </div>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
