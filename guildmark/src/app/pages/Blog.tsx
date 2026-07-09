/**
 * Blog / Market Research — dedicated full page.
 *
 * Replaces the old bottom-sheet drawer: the market-research content now lives
 * at its own route (/blog) with the same header/footer chrome as the
 * pre-launch hero. Content is the existing InsightPage report.
 */

import { Link } from "react-router";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { InsightPage } from "./Insights";
import logoLong from "../../logo-long.svg";

const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Barlow Condensed', sans-serif";

export function Blog() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <header className="border-b border-border sticky top-0 z-50" style={{ background: "var(--background)", backdropFilter: "blur(8px)" }}>
        <div className="px-8 md:px-20 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link to="/"><img src={logoLong} className="h-6" alt="GuildMark" /></Link>
            <span className="text-[9px] font-mono tracking-[0.15em] text-muted-foreground border border-border px-2 py-0.5 hidden sm:block" style={{ fontFamily: MONO }}>
              MARKET RESEARCH
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: BODY }}>
              <ArrowLeft size={14} />
              Back to home
            </Link>
            <button onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-10">
          <h1 className="tracking-tight mb-8" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(2.2rem, 4vw, 3rem)" }}>
            Market Research
          </h1>
          <InsightPage inDrawer />
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-[1600px] mx-auto px-8 md:px-20 py-8 flex items-center justify-between gap-6">
          <p className="text-[11px] font-mono text-muted-foreground" style={{ fontFamily: MONO }}>
            © {new Date().getFullYear()} Baerhous Media Group, LLC — GuildMark™
          </p>
          <div className="flex gap-5">
            <a href="/compliance/privacy-policy" className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: MONO }}>Privacy Policy</a>
            <a href="/compliance/terms" className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: MONO }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
