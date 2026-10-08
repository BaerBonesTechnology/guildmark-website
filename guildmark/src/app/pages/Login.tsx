import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ROUTE } from "../constants/routes.constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await login(email, password);
      const destination = location.state?.from;
      navigate(typeof destination === "string" && destination.startsWith("/pre/")
        ? destination : ROUTE.dashboard, { replace: true });
    } catch {
      // error is set in useAuth
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md ">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Welcome to GuildMark</CardTitle>
          <CardDescription>Sign in to access your IT asset dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                autoComplete="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className=""
                required
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <Link to={ROUTE.forgotPassword} className="text-xs text-primary hover:underline ">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                autoComplete="current-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className=""
                required
                disabled={submitting}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white "
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p className="">
                Don't have an account?{" "}
                <Link to={ROUTE.signup} className="text-primary hover:underline">
                  Sign up free
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
