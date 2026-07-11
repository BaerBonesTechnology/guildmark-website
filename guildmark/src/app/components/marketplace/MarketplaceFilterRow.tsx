/** A single multi-select checkbox row in the marketplace filter sidebar. */
import { BODY } from "../../constants/typography";

interface MarketplaceFilterRowProps {
  checked: boolean;
  label: string;
  onToggle: () => void;
}

export function MarketplaceFilterRow({ checked, label, onToggle }: MarketplaceFilterRowProps) {
  return (
    <button onClick={onToggle} className="flex items-center gap-2 w-full text-left group py-0.5">
      <span className="w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-colors"
        style={{ borderColor: checked ? "var(--primary)" : "var(--border)", background: checked ? "var(--primary)" : "transparent" }}>
        {checked && <span className="w-1.5 h-1.5" style={{ background: "#fff" }} />}
      </span>
      <span className="text-xs group-hover:text-foreground transition-colors" style={{ color: checked ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: BODY }}>{label}</span>
    </button>
  );
}
