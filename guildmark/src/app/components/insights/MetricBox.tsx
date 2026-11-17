/** Labelled metric box used in the idle-asset cost calculator. */
interface MetricBoxProps {
  label: string;
  sub: string;
  value: string;
  valueClass: string;
}

export function MetricBox({ label, sub, value, valueClass }: MetricBoxProps) {
  return (
    <div className="bg-muted/50 p-4 rounded-xl border border-border">
      <span className="block text-xs uppercase tracking-wider text-muted-foreground  mb-1">
        {label}
      </span>
      <span className={`text-2xl font-bold  ${valueClass}`}>{value}</span>
      <span className="block text-xs text-muted-foreground mt-1">{sub}</span>
    </div>
  );
}
