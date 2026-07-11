import { Outlet } from "react-router";

/**
 * Thin shell for the pre-launch experience. Each page (PreLaunch, Blog,
 * Contact) owns its own header/footer chrome, so the layout is just a
 * background wrapper around the routed page. Market research now lives at
 * its own /blog route rather than a bottom-sheet drawer.
 */
export function PreLaunchLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
}
