/** One connected MDM platform card with sync + disconnect controls. */
import { AlertCircle, CheckCircle2, Cloud, RefreshCw, Unplug } from "lucide-react";
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { DISPLAY, MONO } from "../../constants/typography";
import type { MDMConnection } from "../../constants/mdm.constants";

interface MDMConnectionCardProps {
  connection: MDMConnection;
  onDisconnect: (id: string) => void;
  onSync: (id: string) => void;
}

export function MDMConnectionCard({ connection: c, onDisconnect, onSync }: MDMConnectionCardProps) {
  const ok = c.status === "connected";
  const sc = ok ? "var(--grade-a)" : "var(--chart-4)";
  return (
    <div className="border border-border p-5" style={{ background: "var(--card)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center" style={{ border: `1px solid color-mix(in srgb, ${AMPS_ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${AMPS_ACCENT} 8%, transparent)` }}>
            <Cloud size={18} style={{ color: AMPS_ACCENT }} />
          </div>
          <div>
            <p className="font-medium">{c.type}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{c.server}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] tracking-wider uppercase" style={{ fontFamily: MONO, color: sc, border: `1px solid color-mix(in srgb, ${sc} 35%, transparent)`, background: `color-mix(in srgb, ${sc} 8%, transparent)` }}>
          {ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />} {ok ? "Connected" : "Error"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 py-3 border-t border-border">
        <div>
          <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Device count</p>
          <p className="text-2xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{c.deviceCount}</p>
        </div>
        <div>
          <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Last sync</p>
          <p className="text-sm" style={{ fontFamily: MONO }}>{c.lastSync}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSync(c.id)} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs border border-border hover:border-foreground transition-colors">
          <RefreshCw size={13} /> Sync now
        </button>
        <button onClick={() => onDisconnect(c.id)} className="w-9 flex items-center justify-center border border-border hover:border-foreground transition-colors" style={{ color: "var(--chart-4)" }}>
          <Unplug size={13} />
        </button>
      </div>
    </div>
  );
}
