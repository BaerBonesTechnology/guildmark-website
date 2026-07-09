import { Outlet } from "react-router";
import { GMNavbar } from "./widgets/NavigationBar";
import { GMFooter } from "./widgets/Footer";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <GMNavbar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <GMFooter />
    </div>
  );
}
