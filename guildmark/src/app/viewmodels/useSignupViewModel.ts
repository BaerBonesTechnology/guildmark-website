/** ViewModel for the Signup page: registration form state + platform fee copy. */
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { usePlatformFees } from "../lib/apiHooks";

export interface SignupForm {
  company: string;
  confirmPassword: string;
  email: string;
  fullName: string;
  password: string;
}

export function useSignupViewModel() {
  const { data: fees } = usePlatformFees();

  // Format a decimal fee rate as a percentage string, falling back while loading.
  const freeFee = fees ? `${parseFloat((fees.seller_fee_free * 100).toFixed(2))}%` : "—";

  const [formData, setFormData] = useState<SignupForm>({
    company: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { signup, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setPasswordError(null);

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        company_name: formData.company,
        company_size: "0",
        industry: "unknown",
      });
      navigate("/dashboard");
    } catch {
      // error message is surfaced via useAuth's error state below
    }
  };

  return { error, formData, freeFee, handleSubmit, passwordError, setFormData };
}
