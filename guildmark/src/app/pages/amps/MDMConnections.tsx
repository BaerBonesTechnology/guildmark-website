import { useState } from "react";
import { Cloud, CheckCircle2, AlertCircle, RefreshCw, Plus, Unplug } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

interface MDMConnection {
  id:          string;
  type:        string;
  status:      "connected" | "error";
  lastSync:    string;
  deviceCount: number;
  server:      string;
}

interface SyncEvent {
  timestamp:  string;
  source:     string;
  devices:    number;
  status:     "success" | "error";
  duration:   string;
}

const emptyForm = {
  serverUrl:    "",
  username:     "",
  password:     "",
  tenantId:     "",
  clientId:     "",
  clientSecret: "",
};

export function MDMConnections() {
  const [connections,   setConnections]   = useState<MDMConnection[]>([]);
  const [syncHistory,   setSyncHistory]   = useState<SyncEvent[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedMDM,   setSelectedMDM]   = useState("");
  const [formData,      setFormData]      = useState(emptyForm);
  const [connecting,    setConnecting]    = useState(false);

  function handleSync(connectionId: string) {
    const conn = connections.find((c) => c.id === connectionId);
    if (!conn) return;
    const event: SyncEvent = {
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
      }),
      source:   conn.type,
      devices:  conn.deviceCount,
      status:   "success",
      duration: `${(Math.random() * 2 + 1.5).toFixed(1)}s`,
    };
    setSyncHistory((prev) => [event, ...prev]);
    setConnections((prev) =>
      prev.map((c) => c.id === connectionId ? { ...c, lastSync: "Just now" } : c)
    );
  }

  function handleAddConnection() {
    if (!selectedMDM) return;
    setConnecting(true);
    // Simulate async connect
    setTimeout(() => {
      const labelMap: Record<string, string> = {
        "jamf-pro":    "Jamf Pro",
        "jamf-school": "Jamf School",
        "intune":      "Microsoft Intune",
      };
      const serverMap: Record<string, string> = {
        "jamf-pro":    formData.serverUrl || "jamfcloud.com",
        "jamf-school": formData.serverUrl || "jamfcloud.com",
        "intune":      "graph.microsoft.com",
      };
      const newConn: MDMConnection = {
        id:          crypto.randomUUID(),
        type:        labelMap[selectedMDM] ?? selectedMDM,
        status:      "connected",
        lastSync:    "Just now",
        deviceCount: 0,
        server:      serverMap[selectedMDM] ?? "",
      };
      setConnections((prev) => [...prev, newConn]);
      setConnecting(false);
      setAddDialogOpen(false);
      setSelectedMDM("");
      setFormData(emptyForm);
    }, 1200);
  }

  function handleDisconnect(id: string) {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  }

  function handleClose() {
    setAddDialogOpen(false);
    setSelectedMDM("");
    setFormData(emptyForm);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-semibold mb-2">MDM Connections</h1>
          <p className="text-muted-foreground text-sm">
            Manage device management platform integrations
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-amps-accent hover:bg-amps-accent/90 text-white"
        >
          <Plus className="h-4 w-4" />
          Add connection
        </Button>
      </div>

      {/* Connections */}
      {connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <Cloud className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No MDM platforms connected yet.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddDialogOpen(true)}
            >
              Connect your first MDM
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amps-accent/10 flex items-center justify-center">
                      <Cloud className="h-5 w-5 text-amps-accent" />
                    </div>
                    <div>
                      <CardTitle>{connection.type}</CardTitle>
                      <p className="text-sm text-muted-foreground font-mono mt-0.5">
                        {connection.server}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold ${
                    connection.status === "connected"
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}>
                    {connection.status === "connected"
                      ? <CheckCircle2 className="h-3.5 w-3.5" />
                      : <AlertCircle className="h-3.5 w-3.5" />
                    }
                    {connection.status === "connected" ? "Connected" : "Error"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono mb-1">Device count</p>
                    <p className="text-2xl font-mono font-semibold">{connection.deviceCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono mb-1">Last sync</p>
                    <p className="text-sm font-mono">{connection.lastSync}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSync(connection.id)}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync now
                  </Button>
                  <Button
                    onClick={() => handleDisconnect(connection.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Unplug className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Sync history</CardTitle>
          <p className="text-sm text-muted-foreground">
            Recent synchronization activity across all connections
          </p>
        </CardHeader>
        <CardContent>
          {syncHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <p className="text-sm text-muted-foreground">
                Sync history will appear here after your first sync.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono">Timestamp</TableHead>
                  <TableHead className="font-mono">Source</TableHead>
                  <TableHead className="font-mono text-right">Devices synced</TableHead>
                  <TableHead className="font-mono">Status</TableHead>
                  <TableHead className="font-mono text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncHistory.map((sync, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-sm">{sync.timestamp}</TableCell>
                    <TableCell className="font-mono">{sync.source}</TableCell>
                    <TableCell className="font-mono text-right">{sync.devices}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {sync.status === "success"
                          ? <CheckCircle2 className="h-4 w-4 text-success" />
                          : <AlertCircle className="h-4 w-4 text-danger" />
                        }
                        <span className={`text-sm font-mono ${
                          sync.status === "success" ? "text-success" : "text-danger"
                        }`}>
                          {sync.status === "success" ? "Success" : "Failed"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground text-sm">
                      {sync.duration}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Connection Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add MDM connection</DialogTitle>
            <DialogDescription>
              Connect a device management platform to sync your asset inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">MDM platform</Label>
              <Select value={selectedMDM} onValueChange={setSelectedMDM}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamf-pro">Jamf Pro</SelectItem>
                  <SelectItem value="jamf-school">Jamf School</SelectItem>
                  <SelectItem value="intune">Microsoft Intune</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(selectedMDM === "jamf-pro" || selectedMDM === "jamf-school") && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Server URL</Label>
                  <Input
                    placeholder="https://yourcompany.jamfcloud.com"
                    value={formData.serverUrl}
                    onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">API username</Label>
                  <Input
                    placeholder="api-user"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">API password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </>
            )}

            {selectedMDM === "intune" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tenant ID</Label>
                  <Input
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Client ID</Label>
                  <Input
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Client secret</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.clientSecret}
                    onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </>
            )}

            {selectedMDM && (
              <div className="rounded-lg bg-info/10 border border-info/20 p-3">
                <div className="flex gap-2">
                  <Cloud className="h-5 w-5 text-info mt-0.5 shrink-0" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-info">Secure connection</p>
                    <p className="text-muted-foreground">
                      Credentials are encrypted at rest. We request read-only access
                      to device inventory — no write permissions are required.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={connecting}>Cancel</Button>
            <Button
              onClick={handleAddConnection}
              disabled={!selectedMDM || connecting}
              className="bg-amps-accent hover:bg-amps-accent/90 text-white"
            >
              {connecting ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Connecting…</>
              ) : (
                "Connect & sync"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
