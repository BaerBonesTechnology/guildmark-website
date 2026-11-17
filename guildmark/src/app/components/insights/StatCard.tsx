/** Headline stat card in the SMB demand-gap section. */
import { Cite } from "./Cite";

interface StatCardProps {
  cite?: number;
  icon: string;
  label: string;
  tag: string;
  tagClass: string;
  value: string;
}

export function StatCard({ cite, icon, label, tag, tagClass, value }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 text-center">
      <span className="block text-4xl mb-3">{icon}</span>
      <span className="block text-3xl font-bold  text-foreground mb-1">
        {value}{cite && <Cite n={cite} />}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs  ${tagClass}`}>
        {tag}
      </div>
    </div>
  );
}
