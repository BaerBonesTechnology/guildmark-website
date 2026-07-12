/** Pre-launch page header — logo, blog link, theme toggle, demo CTA. */
import { ArrowRight, BookOpen, Moon, Sun } from "lucide-react";
import { Link } from "react-router";
import { BODY, MONO } from "../../constants/typography";
import { useTheme } from "../../hooks/useTheme";
import logoLong from "../../../logo-long.svg";

export function PreLaunchHeader() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="border-b border-border sticky top-0 z-50" style={{ background: "var(--background)", backdropFilter: "blur(8px)" }}>
      <div className="px-8 md:px-20 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={logoLong} className="h-6" alt="GuildMark" />
          <span className="text-[9px] font-mono tracking-[0.15em] text-muted-foreground border border-border px-2 py-0.5 hidden sm:block" style={{ fontFamily: MONO }}>
            IT ASSET MARKETPLACE
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/blog"
            className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: BODY }}>
            <BookOpen size={14} />
            Blog
          </Link>
          <div className="w-px h-4 bg-border hidden md:block" />
          <span className="text-[10px] font-mono tracking-widest items-center gap-1.5 hidden sm:flex" style={{ color: "var(--primary)", fontFamily: MONO }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--primary)" }} />
            Early Access
          </span>
          <Link to="/pre/marketplace"
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 hover:opacity-90 transition-opacity"
            style={{ background: "var(--primary)", color: "#fff", fontFamily: BODY }}>
            Demo the platform
            <ArrowRight size={13} />
          </Link>
          <button onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
}
