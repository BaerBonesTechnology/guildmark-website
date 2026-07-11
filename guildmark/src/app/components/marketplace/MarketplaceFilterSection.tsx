/** A titled group of filter rows in the marketplace sidebar. */
import { MONO } from "../../constants/typography";

interface MarketplaceFilterSectionProps {
  children: React.ReactNode;
  title: string;
}

export function MarketplaceFilterSection({ children, title }: MarketplaceFilterSectionProps) {
  return (
    <div className="border-b border-border py-4">
      <p className="text-[10px] tracking-[0.15em] uppercase mb-3" style={{ color: "var(--foreground)", fontFamily: MONO }}>{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
