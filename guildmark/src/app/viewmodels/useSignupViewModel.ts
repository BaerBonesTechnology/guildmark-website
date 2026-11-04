/** ViewModel for the Signup page: registration form state + platform fee copy. */
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

export interface SignupForm {
  company: string;
  confirmPassword: string;
  email: string;
  fullName: string;
  password: string;
}

export function useSignupViewModel() {
  const { t } = useTranslation("registration");
  const [submitting, setSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [formData, setFormData] = useState<SignupForm>({
    company: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { signup, error, clearError } = useAuth();
  const navigate = useNavigate();
  const prefix = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (submitting) return;
    clearError();
    setPasswordError(null);

    if (formData.password !== formData.confirmPassword) {
      setPasswordError(t("passwordMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        company_name: formData.company,
        company_size: "0",
        industry: "unknown",
      });
      navigate(`${prefix}/dashboard`);
    } catch {
      // error message is surfaced via useAuth's error state below
    } finally { setSubmitting(false); }
  };

  return { error, formData, handleSubmit, passwordError, setFormData, submitting, showPasswords, loginPath: `${prefix}/login`, togglePasswords: () => setShowPasswords(value => !value) };
}
