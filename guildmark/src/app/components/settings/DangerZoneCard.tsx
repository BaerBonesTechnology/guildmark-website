/** Danger Zone card in Account Settings: sign out, export, delete. */
import { AlertTriangle, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function DangerZoneCard({ onLogout }: { onLogout: () => void }) {
  return (
    <Card className="border-red-500/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <CardTitle className=" text-base text-red-500">
            Danger Zone
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full  text-sm border-border"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
        <Button
          variant="outline"
          className="w-full  text-sm border-muted-foreground/30 text-muted-foreground"
        >
          Export My Data
        </Button>
        <Button
          variant="outline"
          className="w-full  text-sm border-red-500/40 text-red-500 hover:bg-red-500/10"
        >
          Delete Account
        </Button>
      </CardContent>
    </Card>
  );
}
