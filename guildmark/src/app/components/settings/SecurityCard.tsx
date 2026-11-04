import { validResetEmail } from "../../services/accountSettings.service";
import { LockKeyhole } from "lucide-react";
export function SecurityCard({
  email,
  onReset,
  disabled,
}: {
  email?: string;
  onReset: () => void;
  disabled: boolean;
}) {
  return (
    <section className="gm-settings-card" id="account-security">
      <div className="gm-settings-card-heading">
        <h2>Sign-in & security</h2>
        <LockKeyhole size={20} aria-hidden="true" />
      </div>
      <div className="gm-settings-security-row">
        <div>
          <h3>Password reset</h3>
          <p>
            Request a reset link for your account email. Your password changes
            after you follow the link.
          </p>
        </div>
        <button
          data-account-dialog-trigger
          className="gm-button gm-button-small"
          disabled={disabled}
          onClick={onReset}
        >
          Reset password
        </button>
      </div>
      {!validResetEmail(email) && (
        <p className="gm-settings-help">
          No account email is available for a reset request.
        </p>
      )}
      <div className="gm-settings-security-row">
        <div>
          <h3>Two-factor authentication</h3>
          <p>Status and enrollment are not available in this workspace.</p>
        </div>
        <span className="gm-settings-unavailable">Status unavailable</span>
      </div>
    </section>
  );
}
