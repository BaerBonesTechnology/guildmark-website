import { useState, type ReactNode, type ElementType } from "react";
import { Link, useLocation } from "react-router";
import { ArrowLeft, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
export type WorkspaceItem = { label: string; to: string; icon: ElementType };
export function WorkspaceShell({
  kind,
  name,
  identity,
  role,
  items,
  logout,
  children,
}: {
  kind: "admin" | "partner";
  name: string;
  identity: string;
  role: string;
  items: WorkspaceItem[];
  logout: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigation = (
    <nav
      aria-label={`${name} navigation`}
      className="space-y-1 min-h-0 overflow-y-auto flex-1"
    >
      {items.map(({ label, to, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          aria-current={
            (
              to === "/admin/content"
                ? pathname === to ||
                  pathname.startsWith("/admin/content/posts/")
                : pathname === to || pathname.startsWith(to + "/")
            )
              ? "page"
              : undefined
          }
          className="gm-workspace-nav"
          onClick={() => setOpen(false)}
        >
          <Icon size={18} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
  const brand = (
    <Link to="/" className="gm-wordmark" aria-label="GuildMark home">
      GuildMark<span>.</span>
    </Link>
  );
  return (
    <div className={`gm-workspace gm-${kind}-portal`}>
      <aside className="gm-workspace-sidebar hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col p-5 z-30">
        <div className="px-2 pt-2 pb-8">
          {brand}
          <p className="mt-3 text-sm font-medium">{name}</p>
          <p className="mt-1 text-xs text-slate-500">{role}</p>
        </div>
        {navigation}
        <div className="mt-auto border-t border-slate-200 pt-5 space-y-2">
          <Link to="/marketplace" className="gm-workspace-nav">
            <ArrowLeft size={16} />
            GuildMarket
          </Link>
          <button onClick={logout} className="gm-workspace-nav w-full">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="lg:pl-60">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="lg:hidden rounded-md border border-slate-200 p-2"
                aria-label={`Open ${name} navigation`}
              >
                <Menu size={20} />
              </button>
              <div>
                <p className="font-semibold text-sm">{name}</p>
                <p className="mt-0.5 text-xs text-slate-500 hidden sm:block">
                  {kind === "admin"
                    ? "Manage people, pricing and marketplace operations"
                    : "Review jobs, manage service work and track earnings"}
                </p>
              </div>
            </div>
            <div className="min-w-0 text-right">
              <p
                className="max-w-[160px] truncate text-xs text-slate-600 sm:max-w-[320px]"
                title={identity}
              >
                {identity}
              </p>
              <p className="mt-1 flex items-center justify-end gap-1 text-xs text-blue-700">
                <ShieldCheck size={13} />
                {role}
              </p>
            </div>
          </div>
        </header>
        <main className="gm-workspace-main">{children}</main>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-white text-slate-900 p-5">
          <SheetHeader>
            <SheetTitle>{name}</SheetTitle>
          </SheetHeader>
          <div className="py-5">{brand}</div>
          {navigation}
          <div className="mt-6 border-t pt-4">
            <Link
              className="gm-workspace-nav"
              to="/"
              onClick={() => setOpen(false)}
            >
              <ArrowLeft size={16} />
              GuildMark home
            </Link>
            <button className="gm-workspace-nav w-full" onClick={logout}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
