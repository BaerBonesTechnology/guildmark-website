/** ViewModel for the Login form: credentials state + auth submission. */
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { loginDestination } from "../services/loginRedirect.service";

export function useLoginViewModel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (evt: React.SubmitEvent) => {
    evt.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(loginDestination(location.pathname, location.state), { replace: true });
    } catch {
      // error is set in useAuth
    } finally {
      setSubmitting(false);
    }
  };

  return { email, error, handleSubmit, password, setEmail, setPassword, submitting };
}
