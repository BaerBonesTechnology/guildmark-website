/** Accented callout card in the seasonality section. */
interface InsightCardProps {
  accent: "green" | "slate";
  children: React.ReactNode;
  title: string;
}

export function InsightCard({ accent, children, title }: InsightCardProps) {
  return (
    <div
      className={`bg-muted/50 p-5 rounded-xl border border-border border-l-4 ${accent === "green" ? "border-l-primary" : "border-l-slate-500"
        }`}
    >
      <h4 className="font-semibold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
