/** A label/value row inside an OrderDetail panel. */
import { MONO } from "../../constants/typography";

interface OrderDetailRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

export function OrderDetailRow({ icon: Icon, label, value }: OrderDetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
        <Icon size={13} className="shrink-0" />
        <span className="text-xs" style={{ fontFamily: MONO }}>{label}</span>
      </div>
      <span className="text-xs text-right max-w-[220px] truncate" style={{ fontFamily: MONO }}>{value}</span>
    </div>
  );
}
