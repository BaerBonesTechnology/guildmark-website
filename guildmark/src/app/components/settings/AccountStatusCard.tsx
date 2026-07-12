/** Account Status summary card in Account Settings. */
import { ShieldCheck } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { AuthUser } from "../../hooks/useAuth";

export function AccountStatusCard({ user }: { user: AuthUser | null }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <CardTitle className=" text-base">
            Account Status
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground ">
            Plan
          </span>
          <Badge className="bg-primary/10 text-primary border-primary/30 ">
            {user ? "Active" : "—"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground ">
            Account
          </span>
          <span className="text-sm  text-foreground">
            {user?.role ?? "—"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground ">
            Company
          </span>
          <span className="text-sm  text-foreground truncate max-w-[120px]">
            {user?.company ?? "—"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
