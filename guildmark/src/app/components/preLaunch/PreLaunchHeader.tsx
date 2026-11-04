import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link } from "react-router";
export function PreLaunchHeader() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  return <header className="gm-header">
    <a href="#main-content" className="gm-skip-link">Skip to content</a>
    <div className="gm-container gm-header-inner">
      <Link to="/" className="gm-wordmark" aria-label="GuildMark home">GuildMark<span>.</span></Link>
      <nav className="gm-desktop-nav" aria-label="Main navigation"><Link to="/#amps-workflow">AMPS</Link><Link to="/pre/marketplace">GuildMarket</Link><Link to="/#partner-network">Partners</Link><Link to="/#amps-plans">Pricing</Link><Link to="/workspaces">Workspaces</Link></nav>
      <div className="gm-header-actions"><Link to="/pre/login" className="gm-signin">Sign in</Link><Link to="/#early-access" className="gm-button gm-button-small">Get early access <ArrowUpRight size={15} /></Link><button ref={menuButton} className="gm-menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="gm-mobile-nav" onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div>
    {open && <nav id="gm-mobile-nav" className="gm-mobile-nav" aria-label="Mobile navigation" onClick={() => setOpen(false)}><Link to="/#amps-workflow">AMPS workflow</Link><Link to="/pre/marketplace">GuildMarket</Link><Link to="/#partner-network">Partner network</Link><Link to="/#amps-plans">AMPS pricing</Link><Link to="/blog">Perspectives</Link><Link to="/workspaces">Workspaces</Link><Link to="/pre/login">Sign in</Link></nav>}
  </header>;
}
