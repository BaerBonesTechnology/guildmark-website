import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useLocation } from "react-router";

export interface BusinessApplication {
  id: string;
  status: "unsubmitted" | "pending" | "needs_information" | "approved" | "rejected";
  email_verified: boolean;
  legal_name?: string;
  registration_country?: string;
  registration_number?: string;
  website?: string;
  representative_role?: string;
  reason?: string;
}
export const BUSINESS_FIELDS = ["legal_name", "registration_country", "registration_number", "website", "representative_role"] as const;

export function useBusinessVerificationViewModel() {
  const { t } = useTranslation("registration");
  const { user, refreshUser, logout } = useAuth();
  const prefix = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  const [application, setApplication] = useState<BusinessApplication | null>(null);
  const [fields, setFields] = useState({ legal_name: user?.company ?? "", registration_country: "", registration_number: "", website: "", representative_role: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let active = true;
    api.get<BusinessApplication>("/business-verification").then(data => {
      if (!active) return;
      setApplication(data);
      setFields({ legal_name: data.legal_name ?? user.company, registration_country: data.registration_country ?? "", registration_number: data.registration_number ?? "", website: data.website ?? "", representative_role: data.representative_role ?? "" });
    }).catch(() => { if (active) setError(t("loadFailed")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, t]);

  async function action(name: string) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const data = name === "refresh"
        ? await api.get<BusinessApplication>("/business-verification")
        : await api.post<BusinessApplication>("/business-verification", { action: name, ...(name === "submit" ? fields : {}), ...(name === "confirm_code" ? {code} : {}) });
      setApplication(data);
      if (name === "send_code") setCodeSent(true);
      if (data.status === "approved") await refreshUser();
    } catch (failure) { setError(failure instanceof Error ? failure.message : t("requestFailed")); }
    finally { setBusy(false); }
  }
  const editable = application?.status === "unsubmitted" || application?.status === "needs_information";
  return { user, application, fields, setFields, loading, busy, error, code, setCode, codeSent, editable, action, logout, dashboardPath: `${prefix}/dashboard`, loginPath: `${prefix}/login` };
}
