import { useState } from "react";
import { Cloud, CheckCircle2, AlertCircle, RefreshCw, Plus, Unplug } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const ACCENT = "var(--amps-accent)";

interface MDMConnection { id: string; type: string; status: "connected" | "error"; lastSync: string; deviceCount: number; server: string; }
interface SyncEvent { timestamp: string; source: string; devices: number; status: "success" | "error"; duration: string; }

const emptyForm = { serverUrl: "", username: "", password: "", tenantId: "", clientId: "", clientSecret: "" };

export function MDMConnections() {
  const [connections, setConnections] = useState<MDMConnection[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncEvent[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMDM, setSelectedMDM] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [connecting, setConnecting] = useState(false);

  function handleSync(connectionId: string) {
    const conn = connections.find((c) => c.id === connectionId);
    if (!conn) return;
    setSyncHistory((prev) => [{
      timestamp: new Date().toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }),
      source: conn.type, devices: conn.deviceCount, status: "success", duration: `${(Math.random() * 2 + 1.5).toFixed(1)}s`,
    }, ...prev]);
    setConnections((prev) => prev.map((c) => c.id === connectionId ? { ...c, lastSync: "Just now" } : c));
  }

  function handleAddConnection() {
    if (!selectedMDM) return;
    setConnecting(true);
    setTimeout(() => {
      const labelMap: Record<string, string> = { "jamf-pro": "Jamf Pro", "jamf-school": "Jamf School", intune: "Microsoft Intune" };
      const serverMap: Record<string, string> = { "jamf-pro": formData.serverUrl || "jamfcloud.com", "jamf-school": formData.serverUrl || "jamfcloud.com", intune: "graph.microsoft.com" };
      setConnections((prev) => [...prev, {
        id: crypto.randomUUID(), type: labelMap[selectedMDM] ?? selectedMDM, status: "connected",
        lastSync: "Just now", deviceCount: 0, server: serverMap[selectedMDM] ?? "",
      }]);
      setConnecting(false);
      setAddOpen(false);
      setSelectedMDM("");
      setFormData(emptyForm);
    }, 1200);
  }

  const isJamf = selectedMDM === "jamf-pro" || selectedMDM === "jamf-school";

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto pb-20" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>MDM Connections</h1>
          <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Manage device-management platform integrations</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity shrink-0" style={{ background: ACCENT, color: "#fff" }}>
          <Plus size={13} /> Add connection
        </button>
      </div>

      {/* Connections */}
      {connections.length === 0 ? (
        <div className="border border-border py-16 flex flex-col items-center gap-3 mb-6" style={{ background: "var(--card)" }}>
          <Cloud size={28} className="opacity-30" style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No MDM platforms connected yet</p>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border hover:border-foreground transition-colors">Connect your first MDM</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {connections.map((c) => {
            const ok = c.status === "connected";
            const sc = ok ? "var(--grade-a)" : "var(--chart-4)";
            return (
              <div key={c.id} className="border border-border p-5" style={{ background: "var(--card)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center" style={{ border: `1px solid color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}>
                      <Cloud size={18} style={{ color: ACCENT }} />
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
                  <button onClick={() => handleSync(c.id)} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs border border-border hover:border-foreground transition-colors">
                    <RefreshCw size={13} /> Sync now
                  </button>
                  <button onClick={() => setConnections((p) => p.filter((x) => x.id !== c.id))} className="w-9 flex items-center justify-center border border-border hover:border-foreground transition-colors" style={{ color: "var(--chart-4)" }}>
                    <Unplug size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sync history */}
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
                  {["Timestamp", "Source", "Devices", "Status", "Duration"].map((h) => (
                    <th key={h} className={`py-2.5 px-4 text-[10px] tracking-wider uppercase font-normal ${["Devices", "Duration"].includes(h) ? "text-right" : "text-left"}`} style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {syncHistory.map((s, i) => {
                  const ok = s.status === "success";
                  const sc = ok ? "var(--grade-a)" : "var(--chart-4)";
                  return (
                    <tr key={i} className="border-b border-border last:border-0" style={{ background: i % 2 ? "var(--secondary)" : "transparent" }}>
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

      {/* Add connection dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add MDM connection</DialogTitle>
            <DialogDescription>Connect a device-management platform to sync your asset inventory.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">MDM platform</Label>
              <Select value={selectedMDM} onValueChange={setSelectedMDM}>
                <SelectTrigger><SelectValue placeholder="Select platform…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamf-pro">Jamf Pro</SelectItem>
                  <SelectItem value="jamf-school">Jamf School</SelectItem>
                  <SelectItem value="intune">Microsoft Intune</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isJamf && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Server URL</Label>
                  <Input placeholder="https://yourcompany.jamfcloud.com" value={formData.serverUrl} onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">API username</Label>
                  <Input placeholder="api-user" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">API password</Label>
                  <Input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
              </>
            )}
            {selectedMDM === "intune" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tenant ID</Label>
                  <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={formData.tenantId} onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Client ID</Label>
                  <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Client secret</Label>
                  <Input type="password" placeholder="••••••••" value={formData.clientSecret} onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })} />
                </div>
              </>
            )}
            {selectedMDM && (
              <div className="border p-3" style={{ background: "color-mix(in srgb, var(--primary) 6%, transparent)", borderColor: "color-mix(in srgb, var(--primary) 20%, transparent)" }}>
                <div className="flex gap-2">
                  <Cloud size={18} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                  <div className="text-sm space-y-1">
                    <p className="font-medium" style={{ color: "var(--primary)" }}>Secure connection</p>
                    <p className="text-muted-foreground">Credentials are encrypted at rest. We request read-only access to device inventory — no write permissions are required.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setSelectedMDM(""); setFormData(emptyForm); }} disabled={connecting}>Cancel</Button>
            <Button onClick={handleAddConnection} disabled={!selectedMDM || connecting} className="text-white" style={{ background: ACCENT }}>
              {connecting ? <><RefreshCw className="h-4 w-4 animate-spin" /> Connecting…</> : "Connect & sync"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
