interface ValueBadgeProps {
  value: number;
  label?: string;
}

export function ValueBadge({ value, label }: ValueBadgeProps) {
  const isPositive = value >= 0;
  const color = isPositive ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs  ${color}`}>
      {isPositive ? "+" : ""}{value}%{label && ` ${label}`}
    </span>
  );
}
