/** One numbered step card in a How-It-Works workflow. */
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { WorkflowStep } from "../../constants/howItWorks.constants";

interface WorkflowStepCardProps {
  badgeClass: string;
  step: WorkflowStep;
}

export function WorkflowStepCard({ badgeClass, step }: WorkflowStepCardProps) {
  return (
    <Card className={step.highlighted ? "font-sans border-primary/30 bg-primary/5" : "font-sans"}>
      <CardHeader>
        <div className={`w-10 h-10 rounded-full ${badgeClass} flex items-center justify-center text-xl font-bold mb-2`}>
          {step.num}
        </div>
        <CardTitle className="text-base">{step.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {step.items.map(({ icon: Icon, iconClass, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className={iconClass} />
            <span>{label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
