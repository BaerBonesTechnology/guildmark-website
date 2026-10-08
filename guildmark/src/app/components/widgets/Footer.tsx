import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export function GMFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-background/90 px-6 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {t("footer.copyright", { year: new Date().getFullYear() })}{" "}
          {t("footer.trademark")}
        </p>
        <Link
          to="/blog"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <BookOpen className="h-3 w-3" aria-hidden="true" />
          {t("footer.marketResearch")}
        </Link>
      </div>
    </footer>
  );
}
