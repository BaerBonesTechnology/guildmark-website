import { useState } from "react";
import { Building2, CreditCard, Users, Bell, Sparkles, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../hooks/useAuth";

const tiers = [
  { name: "Starter", price: 49, devices: "Up to 100", users: "2 team members" },
  { name: "Growth", price: 149, devices: "Up to 500", users: "5 team members" },
  { name: "Business", price: 349, devices: "Up to 2,000", users: "15 team members", current: true },
  { name: "Scale", price: 749, devices: "Up to 10,000", users: "Unlimited" },
  { name: "Enterprise", price: "Custom", devices: "Unlimited", users: "Unlimited" },
];

const teamMembers: { name: string; email: string; role: string }[] = [];

export function Settings() {
  const { user } = useAuth();
  const [companyData, setCompanyData] = useState({
    name: "Acme Corporation",
    industry: "Technology",
    size: "500-1000",
  });
  const [notifications, setNotifications] = useState({
    syncFailures: true,
    valuationAlerts: true,
    offerActivity: false,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-mono font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground font-mono text-sm">
          Manage your GM Pro account, subscription, and preferences
        </p>
      </div>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amps-accent/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-amps-accent" />
            </div>
            <div>
              <CardTitle className="font-mono">Company Profile</CardTitle>
              <CardDescription className="font-mono">
                Your organization details and account information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input
                value={companyData.industry}
                onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Company Size</Label>
            <Input
              value={companyData.size}
              onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
              className="font-mono"
            />
          </div>
          <div className="pt-2">
            <Button className="font-mono">Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amps-accent to-amps-highlight flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="font-mono">Subscription & Usage</CardTitle>
              <CardDescription className="font-mono">
                Your current GM Pro tier and billing details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative ${
                  tier.current
                    ? "border-amps-accent border-2 bg-amps-accent/5"
                    : "border-border"
                }`}
              >
                {tier.current && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amps-accent to-amps-highlight text-white text-xs font-semibold">
                      <Check className="h-3 w-3" />
                      Current
                    </span>
                  </div>
                )}
                <CardContent className="pt-6 pb-4 space-y-3 text-center">
                  <h4 className="font-mono font-semibold">{tier.name}</h4>
                  <div className="text-2xl font-mono font-bold">
                    {typeof tier.price === "number" ? `$${tier.price}` : tier.price}
                    {typeof tier.price === "number" && <span className="text-sm text-muted-foreground">/mo</span>}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono space-y-1">
                    <p>{tier.devices}</p>
                    <p>{tier.users}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-1">
              <p className="text-sm font-mono font-semibold">Current Usage</p>
              <p className="text-xs text-muted-foreground font-mono">
                267 devices • 3 team members
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="font-mono">Change Plan</Button>
              <Button variant="outline" className="font-mono">View Billing History</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amps-accent/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-amps-accent" />
              </div>
              <div>
                <CardTitle className="font-mono">Team Members</CardTitle>
                <CardDescription className="font-mono">
                  Manage who has access to your GM Pro dashboard
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" className="font-mono">Invite Member</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-mono font-semibold">{member.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">{member.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground">{member.role}</span>
                  <Button variant="ghost" size="sm" className="font-mono">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amps-accent/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-amps-accent" />
            </div>
            <div>
              <CardTitle className="font-mono">Notification Preferences</CardTitle>
              <CardDescription className="font-mono">
                Choose what alerts you want to receive
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors">
            <input
              type="checkbox"
              checked={notifications.syncFailures}
              onChange={(e) =>
                setNotifications({ ...notifications, syncFailures: e.target.checked })
              }
              className="mt-0.5 rounded border-border"
            />
            <div>
              <p className="font-mono font-semibold text-sm">MDM Sync Failures</p>
              <p className="text-xs text-muted-foreground font-mono">
                Get notified when device synchronization encounters errors
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors">
            <input
              type="checkbox"
              checked={notifications.valuationAlerts}
              onChange={(e) =>
                setNotifications({ ...notifications, valuationAlerts: e.target.checked })
              }
              className="mt-0.5 rounded border-border"
            />
            <div>
              <p className="font-mono font-semibold text-sm">Valuation Alerts</p>
              <p className="text-xs text-muted-foreground font-mono">
                Alerts when assets approach value cliffs or market changes detected
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors">
            <input
              type="checkbox"
              checked={notifications.offerActivity}
              onChange={(e) =>
                setNotifications({ ...notifications, offerActivity: e.target.checked })
              }
              className="mt-0.5 rounded border-border"
            />
            <div>
              <p className="font-mono font-semibold text-sm">Marketplace Offer Activity</p>
              <p className="text-xs text-muted-foreground font-mono">
                Updates when buyers make offers on your listed assets
              </p>
            </div>
          </label>
          <div className="pt-2">
            <Button className="font-mono">Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
