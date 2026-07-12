/** Notification Preferences card in Account Settings. */
import { Bell } from "lucide-react";
import { NotifRow } from "./NotifRow";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { NOTIFICATION_ROWS, type NotificationKey } from "../../constants/settings.constants";
import type { NotificationState } from "../../viewmodels/useAccountSettingsViewModel";

interface NotificationsCardProps {
  notifs: NotificationState;
  setNotif: (key: NotificationKey) => (value: boolean) => void;
}

export function NotificationsCard({ notifs, setNotif }: NotificationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="">
              Notification Preferences
            </CardTitle>
            <CardDescription className="">
              Choose which events trigger email alerts
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {NOTIFICATION_ROWS.map((row) => (
          <NotifRow
            key={row.key}
            label={row.label}
            description={row.description}
            checked={notifs[row.key]}
            onChange={setNotif(row.key)}
          />
        ))}
        <div className="pt-2">
          <Button className="bg-primary hover:bg-primary/90 text-white ">
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
