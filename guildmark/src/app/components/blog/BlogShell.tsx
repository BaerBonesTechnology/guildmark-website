/** Shared chrome (header + footer) for the blog list and article views. */
import { Link } from "react-router";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import logoLong from "../../../logo-long.svg";
import { useTheme } from "../../hooks/useTheme";

interface BlogShellProps {
  backLabel?: string;
  backTo?: string;
  children: React.ReactNode;
}

export function BlogShell({ backLabel = "Back to home", backTo = "/", children }: BlogShellProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur">
        <div className="px-8 md:px-20 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link to="/"><img src={logoLong} className="h-6" alt="GuildMark" /></Link>
            <span className="text-xs font-mono tracking-widest text-muted-foreground border border-border px-2 py-0.5 hidden sm:block">
              BLOG
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to={backTo} className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={14} />
              {backLabel}
            </Link>
            <button onClick={toggleTheme} aria-label="Toggle theme"
              className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-8 md:px-20 py-8 flex items-center justify-between gap-6">
          <p className="text-xs font-mono text-muted-foreground">
            © {new Date().getFullYear()} Baerhous Media Group, LLC — GuildMark™
          </p>
          <div className="flex gap-5">
            <a href="/compliance/privacy-policy" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/compliance/terms" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
