/**
 * AccountSettings — profile / company / security / notifications hub (View).
 * All form state lives in useAccountSettingsViewModel; each section is its
 * own card component. Presentation only.
 */
import { AccountStatusCard } from "../components/settings/AccountStatusCard";
import { ActivitySummaryCard } from "../components/settings/ActivitySummaryCard";
import { CompanyCard } from "../components/settings/CompanyCard";
import { DangerZoneCard } from "../components/settings/DangerZoneCard";
import { NotificationsCard } from "../components/settings/NotificationsCard";
import { ProfileCard } from "../components/settings/ProfileCard";
import { SecurityCard } from "../components/settings/SecurityCard";
import { useAccountSettingsViewModel } from "../viewmodels/useAccountSettingsViewModel";

export function AccountSettings() {
  const {
    company, logout, notifs, passwords, profile, setCompany, setNotif, setPasswords,
    setProfile, setShowCurrent, setShowNew, setTwoFaEnabled, showCurrent, showNew,
    twoFaEnabled, user,
  } = useAccountSettingsViewModel();

  return (
    <div className="space-y-6 pb-20">
      {/* Page header */}
      <div>
        <h1 className="text-2xl  font-semibold text-foreground">
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground  mt-1">
          Manage your profile, security, and notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Left column (2/3) ───────────────────────────────────────────── */}
        <div className="col-span-2 space-y-6">
          <ProfileCard profile={profile} setProfile={setProfile} />
          <CompanyCard company={company} setCompany={setCompany} />
          <SecurityCard
            passwords={passwords}
            setPasswords={setPasswords}
            setShowCurrent={setShowCurrent}
            setShowNew={setShowNew}
            setTwoFaEnabled={setTwoFaEnabled}
            showCurrent={showCurrent}
            showNew={showNew}
            twoFaEnabled={twoFaEnabled}
          />
          <NotificationsCard notifs={notifs} setNotif={setNotif} />
        </div>

        {/* ── Right column (1/3) ──────────────────────────────────────────── */}
        <div className="space-y-6">
          <AccountStatusCard user={user} />
          <ActivitySummaryCard />
          <DangerZoneCard onLogout={logout} />
        </div>
      </div>
    </div>
  );
}
