import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { useSignupViewModel } from "../../viewmodels/useSignupViewModel";

export function SignupForm({ error, formData, handleSubmit, passwordError, setFormData, submitting, showPasswords, togglePasswords, loginPath }: ReturnType<typeof useSignupViewModel>) {
 const { t } = useTranslation("registration");
 return <section className="registration-form" aria-labelledby="account-title">
  <header><h1 id="account-title">{t("accountTitle")}</h1><p>{t("accountIntro")}</p></header>
  <form onSubmit={handleSubmit}><fieldset disabled={submitting}>
   <legend className="sr-only">{t("accountTitle")}</legend>
   <div className="registration-pair">
    <label className="registration-field" htmlFor="signup-name">{t("fullName")}<input id="signup-name" autoComplete="name" required maxLength={200} value={formData.fullName} onChange={event => setFormData({...formData, fullName:event.target.value})}/></label>
    <label className="registration-field" htmlFor="signup-company">{t("company")}<input id="signup-company" autoComplete="organization" required maxLength={200} value={formData.company} onChange={event => setFormData({...formData, company:event.target.value})}/></label>
   </div>
   <label className="registration-field" htmlFor="signup-email">{t("email")}<input id="signup-email" type="email" autoComplete="email" required maxLength={254} placeholder={t("emailPlaceholder")} value={formData.email} onChange={event => setFormData({...formData, email:event.target.value})}/><span className="registration-hint">{t("emailHint")}</span></label>
   <div className="registration-password-heading"><span>{t("secureAccount")}</span><button type="button" onClick={togglePasswords} aria-pressed={showPasswords}>{showPasswords ? <EyeOff size={16}/> : <Eye size={16}/>} {t(showPasswords ? "hidePasswords" : "showPasswords")}</button></div>
   <div className="registration-pair">
    <label className="registration-field" htmlFor="signup-password">{t("password")}<input id="signup-password" type={showPasswords ? "text" : "password"} autoComplete="new-password" required minLength={8} aria-describedby="password-hint" value={formData.password} onChange={event => setFormData({...formData,password:event.target.value})}/></label>
    <label className="registration-field" htmlFor="signup-confirm">{t("confirmPassword")}<input id="signup-confirm" type={showPasswords ? "text" : "password"} autoComplete="new-password" required minLength={8} aria-invalid={!!passwordError} aria-describedby={passwordError ? "signup-error" : undefined} value={formData.confirmPassword} onChange={event => setFormData({...formData,confirmPassword:event.target.value})}/></label>
   </div>
   <p id="password-hint" className="registration-hint">{t("passwordHint")}</p>
   {(passwordError || error) && <p id="signup-error" className="registration-error" role="alert">{passwordError ?? error}</p>}
   <button className="registration-primary" type="submit">{t(submitting ? "creating" : "continueBusiness")}{submitting ? <LoaderCircle className="animate-spin" size={18}/> : <ArrowRight size={18}/>}</button>
  </fieldset><p className="registration-fineprint">{t("accountNotice")}</p></form>
  <p className="registration-signin">{t("alreadyAccount")} <Link to={loginPath}>{t("signIn")}</Link></p>
 </section>;
}
