import { useState, useId } from "react";
import { Info, X } from "lucide-react";
export function MarketplaceFilterRow({
  checked,
  label,
  onToggle,
  description,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="gm-filter-row">
      <button role="checkbox" aria-checked={checked} onClick={onToggle}>
        <span className={checked ? "is-checked" : ""} aria-hidden="true">
          {checked && <X size={10} strokeWidth={2.5} />}
        </span>
        {label}
      </button>
      {description && (
        <div
          className="gm-grade-help"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label={`About ${label}`}
            aria-expanded={open}
            aria-describedby={open ? id : undefined}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            <Info size={15} />
          </button>
          {open && (
            <span role="tooltip" id={id}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
