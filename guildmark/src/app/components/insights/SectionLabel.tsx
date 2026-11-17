/** Small uppercase section eyebrow label in Market Insights. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs  uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  );
}
