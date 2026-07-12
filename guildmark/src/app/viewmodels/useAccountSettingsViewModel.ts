/** ViewModel for Account Settings: profile/company/security/notification state. */
import { useState } from "react";
import type { NotificationKey } from "../constants/settings.constants";
import { useAuth } from "../hooks/useAuth";

export interface CompanyForm {
  address: string;
  industry: string;
  name: string;
  size: string;
}

export interface PasswordForm {
  current: string;
  next: string;
}

export interface ProfileForm {
  email: string;
  fullName: string;
  phone: string;
  role: string;
}

export type NotificationState = Record<NotificationKey, boolean>;

export function useAccountSettingsViewModel() {
  const { user, logout } = useAuth();

  // Profile form — seeded from auth context, editable locally
  const [profile, setProfile] = useState<ProfileForm>({
    fullName: user?.full_name ?? "",
    email: user?.email ?? "",
    phone: "",
    role: user?.role ?? "",
  });

  // Company form
  const [company, setCompany] = useState<CompanyForm>({
    name: user?.company ?? "",
    address: "",
    industry: "",
    size: "",
  });

  // Security
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwords, setPasswords] = useState<PasswordForm>({ current: "", next: "" });
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState<NotificationState>({
    orderUpdates: true,
    offerActivity: true,
    priceAlerts: false,
    securityAlerts: true,
    marketDigest: false,
  });

  const setNotif = (key: NotificationKey) => (value: boolean) =>
    setNotifs((prev) => ({ ...prev, [key]: value }));

  return {
    company, logout, notifs, passwords, profile, setCompany, setNotif, setPasswords,
    setProfile, setShowCurrent, setShowNew, setTwoFaEnabled, showCurrent, showNew,
    twoFaEnabled, user,
  };
}
