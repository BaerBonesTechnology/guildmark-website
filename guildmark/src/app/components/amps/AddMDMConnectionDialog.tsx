/** AMPS "Add MDM connection" dialog — platform picker + credential fields. */
import { Cloud, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AMPS_ACCENT } from "../../constants/amps.constants";
import type { MdmForm } from "../../constants/mdm.constants";
import { isJamf } from "../../services/mdm.service";

interface AddMDMConnectionDialogProps {
  connecting: boolean;
  formData: MdmForm;
  onConnect: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  resetForm: () => void;
  selectedMDM: string;
  setFormData: (form: MdmForm) => void;
  setSelectedMDM: (value: string) => void;
}

export function AddMDMConnectionDialog({
  connecting, formData, onConnect, onOpenChange, open, resetForm, selectedMDM, setFormData, setSelectedMDM,
}: AddMDMConnectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          {isJamf(selectedMDM) && (
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
          <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }} disabled={connecting}>Cancel</Button>
          <Button onClick={onConnect} disabled={!selectedMDM || connecting} className="text-amps-accent-foreground" style={{ background: AMPS_ACCENT }}>
            {connecting ? <><RefreshCw className="h-4 w-4 animate-spin" /> Connecting…</> : "Connect & sync"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
