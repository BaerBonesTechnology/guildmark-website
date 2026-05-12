/**
 * Route guard — redirects to /login when the user is not authenticated.
 * Shows nothing while the silent refresh is in progress.
 */

import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function RequireAuth() {
  const { partner, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--prt-bg)]">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--prt-accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!partner) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
