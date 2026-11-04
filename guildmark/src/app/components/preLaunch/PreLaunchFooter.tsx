import { Link } from "react-router";
export function PreLaunchFooter() {
  return <footer className="gm-footer"><div className="gm-container">
    <div className="gm-footer-top"><div><Link to="/" className="gm-wordmark">GuildMark<span>.</span></Link><p>AMPS for asset owners.<br />GuildMarket for the next owner.</p></div><nav aria-label="Footer navigation"><Link to="/#amps-workflow">Explore AMPS</Link><Link to="/pre/marketplace">GuildMarket</Link><Link to="/#partner-network">Partner network</Link><Link to="/blog">Perspectives</Link><Link to="/contact">Contact</Link></nav></div>
    <div className="gm-footer-bottom"><span>© {new Date().getFullYear()} Baerhous Media Group, LLC · GuildMark™</span><div><Link to="/compliance/privacy-policy">Privacy</Link><Link to="/compliance/terms">Terms</Link></div></div>
  </div></footer>;
}
