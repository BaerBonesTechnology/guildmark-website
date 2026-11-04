import { Link, useLocation } from "react-router";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import "./registration.css";

export function VerificationPrompt() {
  const { user } = useAuth();
  const prefix = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  const { t } = useTranslation("registration");
  return <aside className="verification-prompt">
    <ShieldCheck size={24} aria-hidden="true"/>
    <div><strong>{t(user?.business_verification_status === "approved" ? "badge" : "badgePrompt")}</strong><p>{t(user?.business_verification_status === "approved" ? "badgeMeaning" : "badgePromptBody")}</p></div>
    <Link to={`${prefix}/business-verification`}>{t(user?.business_verification_status && user.business_verification_status !== "unsubmitted" ? "badgeStatus" : "badgeApply")}<ArrowRight size={16}/></Link>
  </aside>;
}
