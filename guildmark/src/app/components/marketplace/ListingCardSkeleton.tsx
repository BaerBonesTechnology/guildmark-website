/** Loading placeholder for a marketplace listing card. */
export function ListingCardSkeleton() {
  return (
    <div className="border border-border animate-pulse" style={{ background: "var(--card)" }}>
      <div className="h-32" style={{ background: "var(--secondary)" }} />
      <div className="p-4 space-y-3">
        <div className="h-3 w-2/3" style={{ background: "var(--secondary)" }} />
        <div className="h-2 w-1/2" style={{ background: "var(--secondary)" }} />
        <div className="h-6 w-1/3" style={{ background: "var(--secondary)" }} />
      </div>
    </div>
  );
}
