import { Outlet } from "react-router";
import { GMNavbar } from "./widgets/NavigationBar";
import { GMFooter } from "./widgets/Footer";
import { CompareProvider } from "./CompareContext";
import { CompareDrawer } from "./CompareDrawer";

export function Layout() {
  return (
    <CompareProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <GMNavbar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
        <GMFooter />
        <CompareDrawer />
      </div>
    </CompareProvider>
  );
}
