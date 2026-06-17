import { BookOpen, Calculator, ChevronDown, Home, Inbox, LogOut, Menu, Moon, PackageX, Receipt, Settings, ShoppingCart, Sparkles, Sun, Tags, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { GMNavbar } from "./widgets/NavigationBar";
import { GMFooter } from "./widgets/Footer";
import {isLaunch, isDebug} from "../config.ts";



// Active: soft primary pill. Inactive: muted text, subtle hover.
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-150 ${
    isActive
      ? "bg-primary/10 text-background font-medium"
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
  <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
    {label}
  </p>
);

export function Layout() {

  const isHeroPage = useLocation().pathname === "/pre/";
  
 return( 
        <div className="min-h-screen bg-background text-foreground">
          
    <GMNavbar />
      {/* Main Content */}
      <main className={`max-w-screen mx-auto overflow-hidden font-sans ${isHeroPage ? "" : "p-4"}`}>
        <Outlet />
      </main>
      <GMFooter/>
    </div>
  );
}
