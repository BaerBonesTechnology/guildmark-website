import { ShieldCheck, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PlatformStory({ stage = "account" }: { stage?: "account" | "business" | "review" }) {
 const { t } = useTranslation("registration");
 return <aside className="registration-story">
  <ShieldCheck className="registration-mark" size={36} strokeWidth={1.4} aria-hidden="true"/>
  <h2>{t("storyTitle")}</h2><p className="registration-story-intro">{t("storyIntro")}</p>
  <ol className="registration-steps" aria-label={t("progress")}>
   <li aria-current={stage === "account" ? "step" : undefined}><span>{stage !== "account" ? <Check size={16}/> : "1"}</span><div><strong>{t("stepAccount")}</strong><p>{t("stepAccountBody")}</p></div></li>
   <li aria-current={stage === "business" ? "step" : undefined}><span>{stage === "review" ? <Check size={16}/> : "2"}</span><div><strong>{t("stepBusiness")}</strong><p>{t("stepBusinessBody")}</p></div></li>
   <li aria-current={stage === "review" ? "step" : undefined}><span>3</span><div><strong>{t("stepReview")}</strong><p>{t("stepReviewBody")}</p></div></li>
  </ol><p className="registration-story-note">{t("storyNote")}</p>
 </aside>;
}
