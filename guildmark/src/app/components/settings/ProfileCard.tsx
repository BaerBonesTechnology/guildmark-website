/** Profile Information card in Account Settings. */
import { User } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { ProfileForm } from "../../viewmodels/useAccountSettingsViewModel";

interface ProfileCardProps {
  profile: ProfileForm;
  setProfile: (profile: ProfileForm) => void;
}

export function ProfileCard({ profile, setProfile }: ProfileCardProps) {
  return (
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
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className=""
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label className="">Email Address</Label>
            <Input
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
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
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
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
  );
}
