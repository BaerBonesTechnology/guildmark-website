/** ViewModel for the Forgot Password form: email + reset-request submission. */
import { useState } from "react";
import { api, ApiError } from "../lib/api";

export function useForgotPasswordViewModel() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(evt: React.SubmitEvent) {
    evt.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot_password", { email }, { skipAuth: true });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return { email, error, handleSubmit, isLoading, sent, setEmail };
}
