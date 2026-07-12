/** Lifetime activity summary card in Account Settings. */
import { Activity } from "lucide-react";
import { StatRow } from "./StatRow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function ActivitySummaryCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className=" text-base">
            Activity Summary
          </CardTitle>
        </div>
        <CardDescription className=" text-xs">
          Lifetime account statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StatRow label="Total Orders" value="—" />
        <StatRow label="Active Listings" value="—" />
        <StatRow label="Total Volume" value="—" />
        <StatRow label="Member Since" value="—" />
      </CardContent>
    </Card>
  );
}
