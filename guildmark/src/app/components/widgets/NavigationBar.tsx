import { Calculator, ChevronDown, Home, Inbox, LogOut, Menu, Moon, PackageX, Receipt, Settings, ShoppingCart, Sparkles, Sun, Tags, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import logoLong from "../../../logo-long.svg";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const DemoBanner = ({ message }: { message: string }) => (
  <div className={`text-white items-center p-1 text-sm rounded-md mb-4`}>
    {message}
  </div>
);

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white transition-all duration-150 ${
    isActive
      ? "bg-primary/10 underline font-medium"
      : "text-foreground hover:text-foreground hover:bg-muted/70 font-normal"
  }`;

// Sidebar variant — slightly more padding for touch
const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
    isActive
      ? "bg-primary/10 text-primary font-medium"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
  }`;

// Small dot separator for desktop nav
const Dot = () => (
  <span className="w-1 h-1 rounded-full bg-border mx-1 shrink-0" />
);

// Section label for sidebar
const SidebarSection = ({ label }: { label: string }) => (
  <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-white/60">
    {label}
  </p>
);

export function GMNavbar() {
     const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleNav = () => setSidebarOpen(false);
  const isAmpsActive = location.pathname.startsWith("/pre/amps");
  const isInMarketplace = location.pathname.startsWith("/pre/marketplace");

  const AuthedLinks = ({ sidebar = false, onClick }: { sidebar?: boolean; onClick?: () => void }) => {
    const cls = sidebar ? sidebarLinkClass : navLinkClass;
    const iconCls = sidebar ? "w-4 h-4 shrink-0" : "w-3.5 h-3.5 shrink-0";

    return sidebar ? (
      <>
        <SidebarSection label="Fleet" />
        <NavLink to="/pre/dashboard" className={cls} onClick={onClick}>
          <TrendingUp className={iconCls} /><span>Fleet Dashboard</span>
        </NavLink>
        <NavLink to="/pre/calculator" className={cls} onClick={onClick}>
          <Calculator className={iconCls} /><span>Market Pulse</span>
        </NavLink>
        <NavLink to="/pre/offload" className={cls} onClick={onClick}>
          <PackageX className={iconCls} /><span>Offload</span>
        </NavLink>

        <SidebarSection label="Market" />
        <NavLink to="/pre/marketplace" className={cls} onClick={onClick}>
          <ShoppingCart className={iconCls} /><span>GuildMarket</span>
        </NavLink>
        <NavLink to="/pre/my-listings" className={cls} onClick={onClick}>
          <Tags className={iconCls} /><span>My Listings</span>
        </NavLink>
        <NavLink to="/pre/orders" className={cls} onClick={onClick}>
          <Receipt className={iconCls} /><span>Orders</span>
        </NavLink>
        <NavLink to="/pre/offers" className={cls} onClick={onClick}>
          <Inbox className={iconCls} /><span>My Offers</span>
        </NavLink>

        <SidebarSection label="Account" />
        <NavLink to="/pre/settings" className={cls} onClick={onClick}>
          <Settings className={iconCls} /><span>Settings</span>
        </NavLink>
        <NavLink
          to="/pre/amps"
          className={() =>
            `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
              isAmpsActive
                ? "bg-gradient-to-r from-amps-accent/15 to-amps-highlight/15 text-amps-accent font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            }`
          }
          onClick={onClick}
        >
          <Sparkles className={iconCls} /><span>GM Pro</span>
        </NavLink>

        <div className="mt-auto pt-4 border-t border-border mx-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-primary">
                  {user?.company?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate">{user?.company}</span>
            </div>
            <button
              onClick={() => { onClick?.(); logout(); }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </>
    ) : (
      <>
        <NavLink to="/pre/dashboard" className={cls} onClick={onClick}>
          <TrendingUp className={iconCls} /><span>Fleet Dashboard</span>
        </NavLink>
        <NavLink to="/pre/calculator" className={cls} onClick={onClick}>
          <Calculator className={iconCls} /><span>Market Pulse</span>
        </NavLink>
        <NavLink to="/pre/offload" className={cls} onClick={onClick}>
          <PackageX className={iconCls} /><span>Offload</span>
        </NavLink>

        <Dot />

        <NavLink to="/pre/marketplace" className={cls} onClick={onClick}>
          <ShoppingCart className={iconCls} /><span>GuildMarket</span>
        </NavLink>

        <Dot />

        <NavLink
          to="/pre/amps"
          className={() =>
            `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
              isAmpsActive
                ? "bg-gradient-to-r from-amps-accent to-amps-highlight text-white shadow-sm"
                : "text-amps-accent hover:bg-amps-accent/10 border border-amps-accent/20 hover:border-amps-accent/40"
            }`
          }
          onClick={onClick}
        >
          <Sparkles className={iconCls} /><span>GM Pro</span>
        </NavLink>

        <Dot />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/60 border border-border/60 hover:bg-muted hover:border-border transition-colors outline-none">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-primary leading-none">
                  {user?.company?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground max-w-[80px] truncate">{user?.company}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground/60 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 font-sans">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pb-1">
              {user?.company}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/pre/my-listings" className="flex items-center gap-2 cursor-pointer">
                <Tags className="w-3.5 h-3.5" />
                My Listings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pre/orders" className="flex items-center gap-2 cursor-pointer">
                <Receipt className="w-3.5 h-3.5" />
                Orders
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pre/offers" className="flex items-center gap-2 cursor-pointer">
                <Inbox className="w-3.5 h-3.5" />
                My Offers
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/pre/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => { onClick?.(); logout(); }}
              className="flex items-center gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  };

  const GuestLinks = ({ sidebar = false, onClick }: { sidebar?: boolean; onClick?: () => void }) => {
    const cls = sidebar ? sidebarLinkClass : navLinkClass;
    const iconCls = sidebar ? "w-4 h-4 shrink-0" : "w-3.5 h-3.5 shrink-0";
    return (
      <>
        <NavLink to="/pre/" end className={cls} onClick={onClick}>
          <Home className={iconCls} /><span>Home</span>
        </NavLink>
        <NavLink to="/pre/marketplace" className={cls} onClick={onClick}>
          <ShoppingCart className={iconCls} /><span>Marketplace</span>
        </NavLink>
        {!sidebar && <Dot />}
        <Button asChild variant="outline" size="sm" className="text-sm h-8">
          <Link to="/pre/login" onClick={onClick}>Sign In</Link>
        </Button>
        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white text-sm h-8">
          <Link to="/pre/signup" onClick={onClick}>Sign Up Free</Link>
        </Button>
      </>
    );
  };

  const CategoryLinks = ({ sidebar = false, onClick} : {sidebar? : boolean; onClick?: () =>void}) => {
    const sideBarCatLinkClass = "";
      const navlinkCatClass = "";
      const cls = sidebar ? sideBarCatLinkClass : navlinkCatClass;
      return (
      <>
        <NavLink to="" end className={cls} onClick = {onClick}></NavLink>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="border-b border-border/80 bg-sky-950 backdrop-blur-md sticky top-0 z-50 pt-6">
        <div className="max-w-7xl mx-auto px-8 pb-6"> 
          <DemoBanner message="Currently in Demo Mode, current product showings are for demonstration purposes only." />
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link to={isAuthenticated ? "/pre/dashboard" : "/pre/"} className="flex items-center gap-2.5 shrink-0">
              <div>
                <img src={logoLong} className="w-60"></img>
              </div>
            </Link>

            {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-0.5">
              {isAuthenticated ? <AuthedLinks /> : <GuestLinks />}
              <Dot />
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-md hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </nav>

            {/* Mobile controls */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col bg-background">
          <SheetHeader className="px-5 py-4 border-b border-border">
            <SheetTitle asChild>
              <div className="flex items-center gap-2.5">
                <span className="text-base font-semibold tracking-tight">
                  <img src={logoLong} alt="GuildMark Logo" className="h-6" />
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-0.5 px-2 py-2 overflow-y-auto flex-1">
            {isAuthenticated
              ? <AuthedLinks sidebar onClick={handleNav} />
              : <GuestLinks sidebar onClick={handleNav} />
            }
            <div>
              <CategoryLinks sidebar onClick={handleNav} />
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      </>
  );
}