/**
 * HowItWorks — marketing page explaining the two sell workflows (View).
 * Content is data-driven from howItWorks.constants; each workflow renders
 * through WorkflowSection. Presentation only.
 */
import { WorkflowSection } from "../components/howItWorks/WorkflowSection";
import { WORKFLOW_SECTIONS } from "../constants/howItWorks.constants";

export function HowItWorks() {
  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-sans">Two Ways to Sell</h1>
        <p className="text-muted-foreground font-sans max-w-2xl mx-auto">
          Choose the workflow that works best for your business
        </p>
      </div>

      {WORKFLOW_SECTIONS.map((config) => <WorkflowSection key={config.title} config={config} />)}
    </div>
  );
}
