/** Small badge marking a manual/CSV-sourced asset row (MDM rows show nothing). */
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { MONO } from "../../constants/typography";

export function SourceBadge({ source }: { source?: string }) {
  if (!source || source === "mdm") return null;
  const color = source === "csv" ? AMPS_ACCENT : "var(--grade-b)";
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] tracking-wide uppercase ml-1.5"
      style={{ fontFamily: MONO, color, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}>{source}</span>
  );
}
