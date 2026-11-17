import { Navigate, Link } from "react-router";
import { ShieldCheck, Clock3, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { PlatformStory } from "../components/signup/PlatformStory";
import { BUSINESS_FIELDS, useBusinessVerificationViewModel } from "../viewmodels/useBusinessVerificationViewModel";
import "../components/signup/registration.css";

export function BusinessVerification() {
  const { t } = useTranslation("registration");
  const { isLoading } = useAuth();
  const model = useBusinessVerificationViewModel();
  if (!isLoading && !model.user) return <Navigate to={model.loginPath} replace />;
  if (isLoading || model.loading) return <div className="registration-page" role="status">{t("loading")}</div>;
  return <div className="registration-page"><div className="registration-layout">
    <PlatformStory stage={model.editable ? "business" : "review"}/>
    <section className="registration-form" aria-labelledby="business-title">
      {model.error && <p className="registration-error" role="alert">{model.error}</p>}
      {!model.application ? <button className="registration-primary" disabled={model.busy} onClick={() => void model.action("refresh")}>{t("refresh")}</button> : model.editable ? <>
        <header><h1 id="business-title">{t(model.application.status === "needs_information" ? "needs_informationTitle" : "businessTitle")}</h1><p>{t(model.application.status === "needs_information" ? "needs_informationIntro" : "businessIntro")}</p></header>
        {model.application.reason && <div className="registration-reason"><strong>{t("reviewReason")}</strong><p>{model.application.reason}</p></div>}
        <div className="registration-email">
          <p><strong>{t(model.application.email_verified ? "emailVerified" : "emailUnverified")}</strong><br/>{model.user?.email}</p>
          {!model.application.email_verified && <>
            <button type="button" className="registration-secondary" disabled={model.busy} onClick={() => void model.action("send_code")}>{t(model.codeSent ? "resendCode" : "sendCode")}</button>
            {model.codeSent && <p role="status" className="registration-hint">{t("codeSent")}</p>}
            <form className="registration-email-actions" onSubmit={event => {event.preventDefault(); void model.action("confirm_code");}}>
              <label className="registration-field" htmlFor="business-email-code">{t("code")}<input id="business-email-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" required maxLength={8} value={model.code} onChange={event => model.setCode(event.target.value)}/></label>
              <button className="registration-secondary" disabled={model.busy} type="submit">{t("confirmCode")}</button>
            </form>
          </>}
        </div>
        <form onSubmit={event => {event.preventDefault(); void model.action("submit");}}><fieldset disabled={model.busy}><legend className="sr-only">{t("businessTitle")}</legend>
          {BUSINESS_FIELDS.map(field => <label key={field} className="registration-field" htmlFor={`business-${field}`}>{t(field)}<input id={`business-${field}`} required type={field === "website" ? "url" : "text"} placeholder={field === "website" ? "https://" : undefined} maxLength={field === "website" ? 500 : 100} autoComplete={field === "legal_name" ? "organization" : "off"} value={model.fields[field]} onChange={event => model.setFields({...model.fields, [field]: event.target.value})}/>{field === "registration_number" && <span className="registration-hint">{t("registrationHelp")} <Link to="/contact">{t("contact")}</Link></span>}</label>)}
          <button className="registration-primary" type="submit" disabled={!model.application.email_verified}>{t(model.busy ? "working" : "submitReview")}<ShieldCheck size={18}/></button>
        </fieldset><p className="registration-fineprint">{t("verificationNotice")}</p></form>
      </> : <>
        {model.application.status === "approved" ? <CheckCircle2 className="registration-status-icon" size={40}/> : <Clock3 className="registration-status-icon" size={40}/>}
        <header><h1 id="business-title">{t(`${model.application.status}Title`)}</h1><p>{t(`${model.application.status}Intro`)}</p></header>
        <dl className="registration-summary"><div><dt>{t("legal_name")}</dt><dd>{model.application.legal_name}</dd></div><div><dt>{t("registration_country")}</dt><dd>{model.application.registration_country}</dd></div><div><dt>{t("email")}</dt><dd>{model.user?.email}</dd></div></dl>
        {model.application.reason && <div className="registration-reason"><strong>{t("reviewReason")}</strong><p>{model.application.reason}</p></div>}
        {model.application.status === "approved" ? <Link className="registration-primary" to={model.dashboardPath}>{t("continueWorkspace")}</Link> : <button className="registration-primary" disabled={model.busy} onClick={() => void model.action("refresh")}>{t(model.busy ? "working" : "refresh")}</button>}
        <p className="registration-fineprint"><Link to="/contact">{t("contact")}</Link></p>
      </>}
      <p className="registration-signin"><Link to={model.dashboardPath}>{t("backWorkspace")}</Link> · <button type="button" className="registration-secondary" onClick={() => void model.logout()}>{t("signOut")}</button></p>
    </section>
  </div></div>;
}
