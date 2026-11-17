/** Notification toggle row in Account Settings preferences. */
interface NotifRowProps {
  checked: boolean;
  description: string;
  label: string;
  onChange: (value: boolean) => void;
}

export function NotifRow({ checked, description, label, onChange }: NotifRowProps) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-accent transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-border accent-primary"
      />
      <div>
        <p className=" font-semibold text-sm text-foreground">
          {label}
        </p>
        <p className="text-xs text-muted-foreground  mt-0.5">
          {description}
        </p>
      </div>
    </label>
  );
}
