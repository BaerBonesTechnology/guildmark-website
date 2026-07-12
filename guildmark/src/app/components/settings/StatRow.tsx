/** Stat row for the Account Settings activity summary. */
export function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground ">{label}</span>
      <span className="text-sm  font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}
