/** ViewModel for the Reset Password form: token, new-password state + submit. */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { api, ApiError } from "../lib/api";

export function useResetPasswordViewModel() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(evt: React.SubmitEvent) {
    evt.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset_password", { token, new_password: password }, { skipAuth: true });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err instanceof ApiError
        ? err.message
        : "Reset failed. The link may have expired — request a new one.");
    } finally {
      setLoading(false);
    }
  }

  return {
    confirm, done, error, handleSubmit, isLoading, password,
    setConfirm, setPassword, setShowPw, showPw, token,
  };
}
