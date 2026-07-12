/** Security card in Account Settings: password change + 2FA toggle. */
import { Eye, EyeOff, Lock, Smartphone } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { PasswordForm } from "../../viewmodels/useAccountSettingsViewModel";

interface SecurityCardProps {
  passwords: PasswordForm;
  setPasswords: (passwords: PasswordForm) => void;
  setShowCurrent: (fn: (v: boolean) => boolean) => void;
  setShowNew: (fn: (v: boolean) => boolean) => void;
  setTwoFaEnabled: (fn: (v: boolean) => boolean) => void;
  showCurrent: boolean;
  showNew: boolean;
  twoFaEnabled: boolean;
}

export function SecurityCard({
  passwords, setPasswords, setShowCurrent, setShowNew, setTwoFaEnabled, showCurrent, showNew, twoFaEnabled,
}: SecurityCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="">Security</CardTitle>
            <CardDescription className="">
              Password and two-factor authentication
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password change */}
        <div className="space-y-4">
          <p className="text-sm  font-semibold text-foreground">
            Change Password
          </p>
          <div className="space-y-2">
            <Label className="">Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className=" pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="">New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={passwords.next}
                onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                className=" pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            variant="outline"
            className=""
            disabled={!passwords.current || !passwords.next}
          >
            Update Password
          </Button>
        </div>

        <div className="border-t border-border" />

        {/* 2FA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm  font-semibold text-foreground">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-muted-foreground ">
                Add an extra layer of security to your account.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={
                twoFaEnabled
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 "
                  : "bg-muted text-muted-foreground border-border "
              }
            >
              {twoFaEnabled ? "Enabled" : "Disabled"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className=""
              onClick={() => setTwoFaEnabled((v) => !v)}
            >
              {twoFaEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
