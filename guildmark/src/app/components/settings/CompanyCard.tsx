import { Building2 } from "lucide-react";
import type { AuthUser } from "../../hooks/useAuth";
import { accountLabel } from "../../services/accountSettings.service";
export function CompanyCard({
  user,
  base,
}: {
  user: AuthUser | null;
  base: string;
}) {
  return (
    <section className="gm-settings-card" id="account-company">
      <div className="gm-settings-card-heading">
        <h2>Your organization</h2>
        <Building2 size={20} aria-hidden="true" />
      </div>
      <p>The business workspace associated with this account.</p>
      <dl className="gm-settings-records">
        <div>
          <dt>Company name</dt>
          <dd>{accountLabel(user?.company)}</dd>
        </div>
        <div>
          <dt>Workspace ID</dt>
          <dd>{accountLabel(user?.company_id)}</dd>
        </div>
      </dl>
      <p className="gm-settings-help">
        Company details can’t be edited here yet. For an account correction,{" "}
        <a href={`${base}/contact`}>contact GuildMark</a>.
      </p>
    </section>
  );
}
