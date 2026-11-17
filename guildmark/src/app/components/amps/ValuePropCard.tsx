/** GM Pro value-proposition card (fee-savings copy resolved from live fees). */
import { AMPS_ACCENT } from "../../constants/amps.constants";
import type { ValueProp } from "../../constants/proSignup.constants";
import type { PlatformFees } from "../../lib/apiHooks";
import { resolveValuePropBody } from "../../services/proSignup.service";

export function ValuePropCard({ fees, prop }: { fees: PlatformFees | undefined; prop: ValueProp }) {
  const { icon: Icon, title, body } = prop;
  return (
    <div className="border border-border p-5 space-y-2" style={{ background: "var(--card)" }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ border: `1px solid color-mix(in srgb, ${AMPS_ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${AMPS_ACCENT} 8%, transparent)` }}>
          <Icon size={15} style={{ color: AMPS_ACCENT }} />
        </div>
        <p className="font-semibold text-sm">{title}</p>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{resolveValuePropBody(body, fees)}</p>
    </div>
  );
}
