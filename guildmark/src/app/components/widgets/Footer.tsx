import { BookOpen, Link } from "lucide-react";

export function GMFooter() {
    return(
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-sm border-t border-border px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Baerhous Media Group, LLC. GuildMark&#8482; is a trademark.
          </p>
          <Link
            to="/insights"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            Market Research &amp; Insights
          </Link>
        </div>
      </footer>
    );
}