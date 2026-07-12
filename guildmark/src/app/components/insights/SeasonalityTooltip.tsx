/** Recharts tooltip for the purchasing-vs-supply seasonality bar chart. */
export function SeasonalityTooltip({ active, payload, label, view }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-muted border border-border rounded-lg px-3 py-2 text-xs ">
      <p className="text-foreground mb-1">{label}</p>
      <p className={view === "purchasing" ? "text-muted-foreground" : "text-amber-400"}>
        {view === "purchasing" ? "Primary Purchasing" : "Secondary Supply"}: {payload[0].value} (Index)
      </p>
    </div>
  );
}
