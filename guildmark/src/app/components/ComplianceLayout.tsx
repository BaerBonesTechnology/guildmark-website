import { Outlet, useNavigate, useLocation } from "react-router";
import { ArrowLeft, Shield } from "lucide-react";

export function ComplianceLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <img src="/img/logo-long.svg" className="h-5" alt="GuildMark" />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary" />
            Legal
          </div>
        </div>
      </header>

      {/* ── Document body ────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-4 mt-12">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-sans">
            © {new Date().getFullYear()} Baerhous Media Group, LLC. GuildMark™ is a trademark of Baerhous Media Group, LLC.
          </p>
          <a
            href="mailto:legal@guildmark.co"
            className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
          >
            legal@guildmark.co
          </a>
        </div>
      </footer>

    </div>
  );
}
