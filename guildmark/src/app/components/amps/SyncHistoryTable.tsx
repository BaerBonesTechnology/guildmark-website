/** MDM sync-history table (empty state until the first sync). */
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { SYNC_HISTORY_HEADERS, type SyncEvent } from "../../constants/mdm.constants";
import { MONO } from "../../constants/typography";

export function SyncHistoryTable({ syncHistory }: { syncHistory: SyncEvent[] }) {
  return (
    <div className="border border-border" style={{ background: "var(--card)" }}>
      <div className="px-5 py-3.5 border-b border-border">
        <span className="text-[10px] tracking-widest uppercase block" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Sync History</span>
      </div>
      {syncHistory.length === 0 ? (
        <div className="py-12 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Sync history will appear here after your first sync.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 640 }}>
            <thead>
              <tr className="border-b border-border">
                {SYNC_HISTORY_HEADERS.map((h) => (
                  <th key={h} className={`py-2.5 px-4 text-[10px] tracking-wider uppercase font-normal ${["Devices", "Duration"].includes(h) ? "text-right" : "text-left"}`} style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {syncHistory.map((s, ndx) => {
                const ok = s.status === "success";
                const sc = ok ? "var(--grade-a)" : "var(--chart-4)";
                return (
                  <tr key={ndx} className="border-b border-border last:border-0" style={{ background: ndx % 2 ? "var(--secondary)" : "transparent" }}>
                    <td className="py-2.5 px-4 text-sm" style={{ fontFamily: MONO }}>{s.timestamp}</td>
                    <td className="py-2.5 px-4">{s.source}</td>
                    <td className="py-2.5 px-4 text-right" style={{ fontFamily: MONO }}>{s.devices}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: sc }}>
                        {ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {ok ? "Success" : "Failed"}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right" style={{ fontFamily: MONO, color: "var(--muted-foreground)" }}>{s.duration}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
