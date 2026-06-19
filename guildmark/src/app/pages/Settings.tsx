import { useState } from "react";
import {
  User,
  Building2,
  Lock,
  Bell,
  ShieldCheck,
  Activity,
  AlertTriangle,
  LogOut,
  Eye,
  EyeOff,
  Smartphone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../hooks/useAuth";

// ── Notification toggle row ─────────────────────────────────────────────────
function NotifRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-accent transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-border accent-primary"
      />
      <div>
        <p className=" font-semibold text-sm text-foreground">
          {label}
        </p>
        <p className="text-xs text-muted-foreground  mt-0.5">
          {description}
        </p>
      </div>
    </label>
  );
}

// ── Stat row for activity summary ────────────────────────────────────────────
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground ">{label}</span>
      <span className="text-sm  font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function AccountSettings() {
  const { user, logout } = useAuth();

  // Profile form — seeded from auth context, editable locally
  const [profile, setProfile] = useState({
    fullName:  user?.full_name  ?? "",
    email:     user?.email      ?? "",
    phone:     "",
    role:      user?.role       ?? "",
  });

  // Company form
  const [company, setCompany] = useState({
    name:     user?.company ?? "",
    address:  "",
    industry: "",
    size:     "",
  });

  // Security
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    orderUpdates:     true,
    offerActivity:    true,
    priceAlerts:      false,
    securityAlerts:   true,
    marketDigest:     false,
  });

  const setNotif = (key: keyof typeof notifs) => (v: boolean) =>
    setNotifs((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-6 pb-20">
      {/* Page header */}
      <div>
        <h1 className="text-2xl  font-semibold text-foreground">
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground  mt-1">
          Manage your profile, security, and notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Left column (2/3) ───────────────────────────────────────────── */}
        <div className="col-span-2 space-y-6">

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="">Profile Information</CardTitle>
                  <CardDescription className="">
                    Your personal account details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="">Full Name</Label>
                  <Input
                    value={profile.fullName}
                    onChange={(e) =>
                      setProfile({ ...profile, fullName: e.target.value })
                    }
                    className=""
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="">Email Address</Label>
                  <Input
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className=""
                    type="email"
                    placeholder="you@company.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="">Phone Number</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className=""
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="">Role</Label>
                  <Input
                    value={profile.role}
                    readOnly
                    className=" bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="pt-2">
                <Button className="bg-primary hover:bg-primary/90 text-white ">
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="">Company Information</CardTitle>
                  <CardDescription className="">
                    Details about your organization
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="">Company Name</Label>
                <Input
                  value={company.name}
                  onChange={(e) =>
                    setCompany({ ...company, name: e.target.value })
                  }
                  className=""
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label className="">Business Address</Label>
                <Input
                  value={company.address}
                  onChange={(e) =>
                    setCompany({ ...company, address: e.target.value })
                  }
                  className=""
                  placeholder="123 Main St, San Francisco, CA 94102"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="">Industry</Label>
                  <Input
                    value={company.industry}
                    onChange={(e) =>
                      setCompany({ ...company, industry: e.target.value })
                    }
                    className=""
                    placeholder="Technology"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="">Company Size</Label>
                  <Input
                    value={company.size}
                    onChange={(e) =>
                      setCompany({ ...company, size: e.target.value })
                    }
                    className=""
                    placeholder="100–500 employees"
                  />
                </div>
              </div>
              <div className="pt-2">
                <Button className="bg-primary hover:bg-primary/90 text-white ">
                  Save Company Info
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
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
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      className=" pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrent ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      value={passwords.next}
                      onChange={(e) =>
                        setPasswords({ ...passwords, next: e.target.value })
                      }
                      className=" pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
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

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="">
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="">
                    Choose which events trigger email alerts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <NotifRow
                label="Order Updates"
                description="Status changes for your active purchases and sales."
                checked={notifs.orderUpdates}
                onChange={setNotif("orderUpdates")}
              />
              <NotifRow
                label="Offer Activity"
                description="New offers received or accepted on your listings."
                checked={notifs.offerActivity}
                onChange={setNotif("offerActivity")}
              />
              <NotifRow
                label="Price Alerts"
                description="Notify me when market prices shift by 10%+ for my assets."
                checked={notifs.priceAlerts}
                onChange={setNotif("priceAlerts")}
              />
              <NotifRow
                label="Security Alerts"
                description="Login from a new device or suspicious activity detected."
                checked={notifs.securityAlerts}
                onChange={setNotif("securityAlerts")}
              />
              <NotifRow
                label="Weekly Market Digest"
                description="A weekly summary of GuildMark marketplace trends."
                checked={notifs.marketDigest}
                onChange={setNotif("marketDigest")}
              />
              <div className="pt-2">
                <Button className="bg-primary hover:bg-primary/90 text-white ">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right column (1/3) ──────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Account Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <CardTitle className=" text-base">
                  Account Status
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground ">
                  Plan
                </span>
                <Badge className="bg-primary/10 text-primary border-primary/30 ">
                  {user ? "Active" : "—"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground ">
                  Account
                </span>
                <span className="text-sm  text-foreground">
                  {user?.role ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground ">
                  Company
                </span>
                <span className="text-sm  text-foreground truncate max-w-[120px]">
                  {user?.company ?? "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className=" text-base">
                  Activity Summary
                </CardTitle>
              </div>
              <CardDescription className=" text-xs">
                Lifetime account statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatRow label="Total Orders"    value="—" />
              <StatRow label="Active Listings" value="—" />
              <StatRow label="Total Volume"    value="—" />
              <StatRow label="Member Since"    value="—" />
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <CardTitle className=" text-base text-red-500">
                  Danger Zone
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full  text-sm border-border"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button
                variant="outline"
                className="w-full  text-sm border-muted-foreground/30 text-muted-foreground"
              >
                Export My Data
              </Button>
              <Button
                variant="outline"
                className="w-full  text-sm border-red-500/40 text-red-500 hover:bg-red-500/10"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
