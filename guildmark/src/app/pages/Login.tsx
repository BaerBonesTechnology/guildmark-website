import { Link, useLocation } from "react-router";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useLoginViewModel } from "../viewmodels/useLoginViewModel";

export function Login() {
  const { email, error, handleSubmit, password, setEmail, setPassword, submitting } = useLoginViewModel();
  const prefix = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  return (
    <div className="gm-container gm-auth">
      <section className="gm-auth-story" aria-labelledby="auth-intro">
        <p className="gm-eyebrow">Your next chapter starts here</p>
        <h2 id="auth-intro">Good hardware.<br /><span>Great possibilities.</span></h2>
        <p>Find your next upgrade, give surplus equipment a new home, and keep every order in view.</p>
        <img src="/img/hardware-studio.png" alt="Illustrative arrangement of business laptops and a monitor" width="1536" height="1024" />
        <Link to={prefix + "/marketplace"} className="gm-text-link"><ArrowLeft size={16} /> Explore the marketplace</Link>
      </section>
      <section className="gm-auth-panel" aria-labelledby="login-title">
        <p className="gm-eyebrow">Your GuildMark account</p>
        <h1 id="login-title">Welcome back.</h1>
        <p>Sign in to manage your equipment, offers, and orders.</p>
        <form onSubmit={handleSubmit} className="gm-customer-form" aria-busy={submitting}>
          {error && <div className="gm-feedback gm-feedback-error" role="alert">{error}</div>}
          <label className="gm-field" htmlFor="login-email">Work email
            <input id="login-email" type="email" autoComplete="username" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={submitting} />
          </label>
          <div>
            <div className="gm-label-row"><label htmlFor="login-password">Password</label><Link to={prefix + "/forgot-password"}>Forgot password?</Link></div>
            <input className="gm-input" id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required disabled={submitting} />
          </div>
          <button className="gm-button gm-button-primary" type="submit" disabled={submitting}>
            {submitting ? <><Loader2 size={17} className="animate-spin" /> Signing in…</> : <>Sign in <ArrowRight size={17} /></>}
          </button>
        </form>
        <p className="gm-auth-signup">New to GuildMark? <Link to={prefix + "/signup"}>Create an account <ArrowRight size={14} /></Link></p>
      </section>
    </div>
  );
}
