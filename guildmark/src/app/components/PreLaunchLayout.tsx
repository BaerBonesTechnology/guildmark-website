import { Link, Outlet, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Sun, Moon, BookOpen, X } from "lucide-react";
import { Drawer } from "vaul";
import { useTheme } from "../hooks/useTheme";
import { InsightPage } from "../pages/Insights";
import logoLong from "../../logo-long.svg";

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


export function PreLaunchLayout() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
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
      <header className="border-b border-border bg-primary/50 backdrop-blur-sm sticky top-0 z-40 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
              <img src={logoLong} className="w-50"/>
            <p className="text-xs text-muted-foreground mt-0.5 mx-2 font-sans">{t("brand.tagline")}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="pb-16">
        <Outlet context={{ openInsights }} />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-sm border-t border-border px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-sans">
            {t("footer.copyright", { year: new Date().getFullYear() })} {t("footer.trademark")}
          </p>
          <button
            onClick={openInsights}
            className="flex items-center gap-1.5 text-xs  text-muted-foreground hover:text-primary transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            {t("footer.marketResearch")}
          </button>
           <Link
            to="/pre/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Interested in seeing our platform? demo it now.
          </Link>
        </div>
      </footer>

      <InsightsDrawer />
    </div>
  );
}
