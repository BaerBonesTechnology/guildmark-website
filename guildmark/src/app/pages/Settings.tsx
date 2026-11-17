import { AccountStatusCard } from "../components/settings/AccountStatusCard";
import { ActivitySummaryCard } from "../components/settings/ActivitySummaryCard";
import { CompanyCard } from "../components/settings/CompanyCard";
import { DangerZoneCard } from "../components/settings/DangerZoneCard";
import { NotificationsCard } from "../components/settings/NotificationsCard";
import { ProfileCard } from "../components/settings/ProfileCard";
import { SecurityCard } from "../components/settings/SecurityCard";
import { AccountSettingsDialog } from "../components/settings/AccountSettingsDialog";
import { useAccountSettingsViewModel } from "../viewmodels/useAccountSettingsViewModel";
import { ampsEnabled } from "../config";
import { validResetEmail } from "../services/accountSettings.service";
import "../../styles/account-settings.css";

export function AccountSettings() {
  const vm = useAccountSettingsViewModel();
  return (
    <div className="gm-settings gm-container">
      <header className="gm-settings-heading">
        <h1>
          Your account.
          <br />
          In clear view.
        </h1>
        <p>
          Review your identity, company plan, and available account controls.
        </p>
      </header>
      <nav className="gm-settings-section-nav" aria-label="Account sections">
        <a href="#account-profile">Profile</a>
        <a href="#account-company">Organization</a>
        <a href="#account-security">Security</a>
        <a href="#account-notifications">Notifications</a>
      </nav>
      <div className="gm-settings-layout">
        <div className="gm-settings-main">
          <ProfileCard user={vm.user} />
          <CompanyCard user={vm.user} base={vm.base} />
          <SecurityCard
            email={vm.user?.email}
            disabled={vm.signingOut || !validResetEmail(vm.user?.email)}
            onReset={() => vm.openDialog("reset")}
          />
          <NotificationsCard />
        </div>
        <aside
          className="gm-settings-sidebar"
          aria-label="Company plan and account access"
        >
          <AccountStatusCard
            data={vm.subscription.data}
            loading={vm.subscription.isLoading}
            error={vm.subscription.isError}
            fetching={vm.subscription.isFetching}
            onRetry={() => vm.subscription.refetch()}
            base={vm.base}
            ampsEnabled={ampsEnabled}
          />
          <ActivitySummaryCard base={vm.base} />
          <DangerZoneCard
            base={vm.base}
            onExport={() => vm.openDialog("export")}
            onLogout={vm.signOut}
            busy={vm.signingOut}
            error={vm.signOutError}
          />
        </aside>
      </div>
      <AccountSettingsDialog model={vm} />
    </div>
  );
}
