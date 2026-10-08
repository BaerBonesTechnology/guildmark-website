interface MarketplaceFilterRowProps {
  checked: boolean;
  label: string;
  onToggle: () => void;
}

export function MarketplaceFilterRow({ checked, label, onToggle }: MarketplaceFilterRowProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground">
      <input type="checkbox" checked={checked} onChange={onToggle}
        className="size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" />
      <span>{label}</span>
    </label>
  );
}
