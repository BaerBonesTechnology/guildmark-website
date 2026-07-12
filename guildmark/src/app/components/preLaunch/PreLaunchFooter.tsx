/** Pre-launch page footer — copyright, compliance links, marketplace CTA. */
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { MONO } from "../../constants/typography";

export function PreLaunchFooter() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1800px] mx-auto px-8 md:px-20 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-mono text-muted-foreground" style={{ fontFamily: MONO }}>
            © {new Date().getFullYear()} Baerhous Media Group, LLC — GuildMark™
          </p>
          <div className="flex gap-5 mt-1">
            <Link to="/blog" className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: MONO }}>
              Blog
            </Link>
            <a href="/compliance/privacy-policy" className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: MONO }}>
              Privacy Policy
            </a>
            <a href="/compliance/terms" className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: MONO }}>
              Terms of Service
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/pre/marketplace"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-mono border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            style={{ fontFamily: MONO }}>
            Preview the marketplace
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
