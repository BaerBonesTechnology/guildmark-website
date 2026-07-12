/** ViewModel for the Login form: credentials state + auth submission. */
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function useLoginViewModel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (evt: React.SubmitEvent) => {
    evt.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/pre/dashboard");
    } catch {
      // error is set in useAuth
    } finally {
      setSubmitting(false);
    }
  };

  return { email, error, handleSubmit, password, setEmail, setPassword, submitting };
}
