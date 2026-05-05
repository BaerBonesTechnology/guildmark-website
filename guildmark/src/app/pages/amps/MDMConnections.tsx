import { useState } from "react";
import { Cloud, CheckCircle2, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

// Mock data
const connections = [
  {
    id: "1",
    type: "Jamf Pro",
    status: "connected",
    lastSync: "2 minutes ago",
    deviceCount: 142,
    server: "company.jamfcloud.com",
  },
  {
    id: "2",
    type: "Microsoft Intune",
    status: "connected",
    lastSync: "5 minutes ago",
    deviceCount: 125,
    server: "graph.microsoft.com",
  },
];

const syncHistory = [
  { timestamp: "2026-05-02 14:32", source: "Jamf Pro", devices: 142, status: "success", duration: "3.2s" },
  { timestamp: "2026-05-02 14:27", source: "Microsoft Intune", devices: 125, status: "success", duration: "2.8s" },
  { timestamp: "2026-05-02 14:02", source: "Jamf Pro", devices: 142, status: "success", duration: "3.1s" },
  { timestamp: "2026-05-02 13:57", source: "Microsoft Intune", devices: 124, status: "success", duration: "2.9s" },
  { timestamp: "2026-05-02 13:32", source: "Jamf Pro", devices: 141, status: "success", duration: "3.0s" },
];

export function MDMConnections() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedMDM, setSelectedMDM] = useState("");
  const [formData, setFormData] = useState({
    serverUrl: "",
    username: "",
    password: "",
    tenantId: "",
    clientId: "",
    clientSecret: "",
  });

  const handleSync = (connectionId: string) => {
    console.log("Syncing connection:", connectionId);
  };

  const handleAddConnection = () => {
    console.log("Adding connection:", selectedMDM, formData);
    setAddDialogOpen(false);
    setSelectedMDM("");
    setFormData({
      serverUrl: "",
      username: "",
      password: "",
      tenantId: "",
      clientId: "",
      clientSecret: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-semibold mb-2">MDM Connections</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Manage device management platform integrations
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-amps-accent hover:bg-amps-accent/90 text-white font-mono"
        >
          <Plus className="h-4 w-4" />
          Add Connection
        </Button>
      </div>

      {/* Connected Sources */}
      <div className="grid grid-cols-2 gap-6">
        {connections.map((connection) => (
          <Card key={connection.id} className="border-amps-accent/30">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-amps-accent/10 flex items-center justify-center">
                    <Cloud className="h-6 w-6 text-amps-accent" />
                  </div>
                  <div>
                    <CardTitle className="font-mono">{connection.type}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      {connection.server}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-success/10 text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="text-xs font-mono font-semibold">Connected</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-1">Device Count</p>
                  <p className="text-2xl font-mono font-semibold">{connection.deviceCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-1">Last Sync</p>
                  <p className="text-sm font-mono">{connection.lastSync}</p>
                </div>
              </div>
              <Button
                onClick={() => handleSync(connection.id)}
                variant="outline"
                className="w-full font-mono"
              >
                <RefreshCw className="h-4 w-4" />
                Sync Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Sync History</CardTitle>
          <p className="text-sm text-muted-foreground font-mono">
            Recent synchronization activity across all connections
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono">Timestamp</TableHead>
                <TableHead className="font-mono">Source</TableHead>
                <TableHead className="font-mono text-right">Devices Synced</TableHead>
                <TableHead className="font-mono">Status</TableHead>
                <TableHead className="font-mono text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncHistory.map((sync, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{sync.timestamp}</TableCell>
                  <TableCell className="font-mono">{sync.source}</TableCell>
                  <TableCell className="font-mono text-right">{sync.devices}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm font-mono text-success">Success</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-right text-muted-foreground text-sm">
                    {sync.duration}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Connection Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-xl font-mono">
          <DialogHeader>
            <DialogTitle>Add MDM Connection</DialogTitle>
            <DialogDescription>
              Connect a new device management platform to sync your asset inventory
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>MDM Platform</Label>
              <Select value={selectedMDM} onValueChange={setSelectedMDM}>
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Select platform..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamf-pro" className="font-mono">Jamf Pro</SelectItem>
                  <SelectItem value="jamf-school" className="font-mono">Jamf School</SelectItem>
                  <SelectItem value="intune" className="font-mono">Microsoft Intune</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedMDM === "jamf-pro" || selectedMDM === "jamf-school" ? (
              <>
                <div className="space-y-2">
                  <Label>Server URL</Label>
                  <Input
                    placeholder="https://yourcompany.jamfcloud.com"
                    value={formData.serverUrl}
                    onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Username</Label>
                  <Input
                    placeholder="api-user"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </>
            ) : selectedMDM === "intune" ? (
              <>
                <div className="space-y-2">
                  <Label>Tenant ID</Label>
                  <Input
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.clientSecret}
                    onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </>
            ) : null}

            {selectedMDM && (
              <div className="rounded-lg bg-info/10 border border-info/20 p-3">
                <div className="flex gap-2">
                  <Cloud className="h-5 w-5 text-info mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-info">Secure Connection</p>
                    <p className="text-muted-foreground">
                      Credentials are encrypted and stored securely. We only request read access to device
                      inventory information.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="font-mono">
              Cancel
            </Button>
            <Button
              onClick={handleAddConnection}
              disabled={!selectedMDM}
              className="bg-amps-accent hover:bg-amps-accent/90 text-white font-mono"
            >
              Connect & Sync
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
