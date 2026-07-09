import { Outlet, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, X } from "lucide-react";
import { Drawer } from "vaul";
import { InsightPage } from "../pages/Insights";

function InsightsDrawer() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const open = params.get("sheet") === "insights";

  function close() {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("sheet");
      return next;
    }, { replace: true });
  }



  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v) => { if (!v) close(); }}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          onClick={close}
        />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-background rounded-t-2xl border-t border-border"
          style={{ height: "calc(100dvh - 3rem)" }}
          aria-label={t("insights.title")}
        >
          {/* Drag handle */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm  text-foreground">{t("insights.title")}</span>
            </div>
            <button
              onClick={close}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1">
            <InsightPage inDrawer />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}


/**
 * Thin shell for the pre-launch experience. Each page (PreLaunch, Contact)
 * owns its own header/footer chrome now, so the layout only provides the
 * shared Insights drawer and the `openInsights` outlet context.
 */
export function PreLaunchLayout() {
  const [, setParams] = useSearchParams();

  function openInsights() {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("sheet", "insights");
      return next;
    }, { replace: false });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet context={{ openInsights }} />
      <InsightsDrawer />
    </div>
  );
}
