import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { api, ApiError } from "../lib/api";

export function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [isLoading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot_password", { email }, { skipAuth: true });
      setSent(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-mono font-semibold text-foreground">
            Guild<span className="text-[#3B82F6]">Mark</span>
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Reset your password
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="font-mono font-semibold text-foreground">Check your email</p>
            <p className="text-sm font-mono text-muted-foreground">
              If <strong>{email}</strong> is registered, you'll receive a reset link shortly.
              The link expires in 1 hour.
            </p>
            <Button asChild variant="outline" className="w-full font-mono mt-2">
              <Link to="/login">Back to Sign In</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-sm">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 font-mono"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-mono">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-mono"
              disabled={isLoading}
            >
              {isLoading ? "Sending…" : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
