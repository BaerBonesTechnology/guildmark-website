import { UserRound } from "lucide-react";
import type { AuthUser } from "../../hooks/useAuth";
import { accountLabel } from "../../services/accountSettings.service";
export function ProfileCard({ user }: { user: AuthUser | null }) {
  return (
    <section className="gm-settings-card" id="account-profile">
      <div className="gm-settings-card-heading">
        <h2>Your profile</h2>
        <UserRound size={20} aria-hidden="true" />
      </div>
      <p>Identity details from your current sign-in record.</p>
      <dl className="gm-settings-records">
        <div>
          <dt>Full name</dt>
          <dd>{accountLabel(user?.full_name)}</dd>
        </div>
        <div>
          <dt>Email address</dt>
          <dd>{accountLabel(user?.email)}</dd>
        </div>
        <div>
          <dt>Workspace role</dt>
          <dd className="gm-settings-capitalize">{accountLabel(user?.role)}</dd>
        </div>
      </dl>
      <p className="gm-settings-help">
        Profile editing is not available here yet. Workspace roles are managed
        by your organization.
      </p>
    </section>
  );
}
