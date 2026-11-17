/** Recharts tooltip for the technology-generation-lag bar chart. */
export function TechLagTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const min = payload[0]?.value ?? 0;
  const variance = payload[1]?.value ?? 0;
  return (
    <div className="bg-muted border border-border rounded-lg px-3 py-2 text-xs ">
      <p className="text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">Fleet Age: {min}–{(min + variance).toFixed(1)} yrs</p>
    </div>
  );
}
