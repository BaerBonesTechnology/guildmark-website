/** A full sell-workflow section: header, step grid, and "best for" callout. */
import { CheckCircle2 } from "lucide-react";
import { WorkflowStepCard } from "./WorkflowStepCard";
import { Card, CardContent } from "../ui/card";
import type { WorkflowSectionConfig } from "../../constants/howItWorks.constants";

export function WorkflowSection({ config }: { config: WorkflowSectionConfig }) {
  const { badgeClass, calloutBody, calloutIconClass, calloutTitle, circleClass, gridCols, headerIcon: HeaderIcon, steps, subtitle, title } = config;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full ${circleClass} text-white flex items-center justify-center`}>
          <HeaderIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-sans">{title}</h2>
          <p className="text-sm text-muted-foreground font-sans">{subtitle}</p>
        </div>
      </div>

      <div className={`grid ${gridCols} gap-4`}>
        {steps.map((step) => <WorkflowStepCard key={step.num} badgeClass={badgeClass} step={step} />)}
      </div>

      <Card className="bg-muted/50 font-sans">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 ${calloutIconClass} mt-0.5`} />
            <div>
              <p className="font-semibold mb-1">{calloutTitle}</p>
              <p className="text-sm text-muted-foreground">{calloutBody}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
