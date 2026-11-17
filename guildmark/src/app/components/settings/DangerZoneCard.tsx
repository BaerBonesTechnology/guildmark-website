import { Link } from "react-router";
import { Download, LogOut } from "lucide-react";
interface Props {
  base: string;
  onExport: () => void;
  onLogout: () => void;
  busy: boolean;
  error: string | null;
}
export function DangerZoneCard({
  base,
  onExport,
  onLogout,
  busy,
  error,
}: Props) {
  return (
    <section className="gm-settings-card">
      <h2>Account data & access</h2>
      <p>
        Download a summary of the account details shown here, or sign out of
        this browser.
      </p>
      <div className="gm-settings-access-actions">
        <button
          className="gm-settings-secondary"
          disabled={busy}
          data-account-dialog-trigger
          onClick={onExport}
        >
          <Download size={15} aria-hidden="true" />
          Download account summary
        </button>
        <button
          className="gm-settings-secondary"
          disabled={busy}
          onClick={onLogout}
        >
          <LogOut size={15} aria-hidden="true" />
          {busy ? "Signing out…" : "Sign out of this browser"}
        </button>
      </div>
      {error && (
        <p className="gm-settings-field-error" role="alert">
          {error}
        </p>
      )}
      <p className="gm-settings-help">
        Account deletion is not available here.{" "}
        <Link to={`${base}/contact`}>Contact GuildMark</Link> for an account
        closure request.
      </p>
    </section>
  );
}
