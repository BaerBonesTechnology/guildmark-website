import { Bell } from "lucide-react";
export function NotificationsCard() {
  return (
    <section className="gm-settings-card" id="account-notifications">
      <div className="gm-settings-card-heading">
        <h2>Notifications</h2>
        <Bell size={20} aria-hidden="true" />
      </div>
      <p>
        Notification preferences can’t be reviewed or changed here yet. The
        account record does not include your current alert settings.
      </p>
      <p className="gm-settings-help">
        Email delivery for offers and orders follows the corresponding
        transaction workflow.
      </p>
    </section>
  );
}
