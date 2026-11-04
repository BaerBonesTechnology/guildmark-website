import { BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBusinessBadgeViewModel } from "../../viewmodels/useBusinessBadgeViewModel";
import "./registration.css";

export function BusinessBadge({ companyId }: { companyId: string }) {
  const verified = useBusinessBadgeViewModel(companyId);
  const { t } = useTranslation("registration");
  if (!verified) return null;
  return <span className="business-badge" title={t("badgeMeaning")}><BadgeCheck size={17} aria-hidden="true"/>{t("badge")}<span className="sr-only">. {t("badgeMeaning")}</span></span>;
}
