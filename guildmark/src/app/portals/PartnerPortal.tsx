import { useEffect, useMemo } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClipboardList, Wrench, Wallet } from "lucide-react";
import { AuthProvider, useAuth } from "../../../../partners/src/hooks/useAuth";
import { PortalBaseContext } from "../../../../partners/src/lib/portal";
import { LoginPage } from "../../../../partners/src/pages/LoginPage";
import { WorkboardPage } from "../../../../partners/src/pages/WorkboardPage";
import { ServicesPage } from "../../../../partners/src/pages/ServicesPage";
import { AccountPage } from "../../../../partners/src/pages/AccountPage";
import { WorkspaceShell } from "../components/WorkspaceShell";
function Session() {
  const { partner, isLoading, logout } = useAuth();
  const navigate = useNavigate(),
    location = useLocation();
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: 15000 } },
      }),
    [partner?.id],
  );
  useEffect(() => () => client.clear(), [client]);
  if (isLoading)
    return (
      <p className="p-8" role="status">
        Checking partner access…
      </p>
    );
  const active = partner?.status === "active";
  const items = [
    ...(active
      ? [
          {
            label: "Available jobs",
            to: "/partners/workboard",
            icon: ClipboardList,
          },
          { label: "Active services", to: "/partners/services", icon: Wrench },
        ]
      : []),
    { label: "Account & earnings", to: "/partners/account", icon: Wallet },
  ];
  const shell = (
    <WorkspaceShell
      kind="partner"
      name="Partner hub"
      identity={partner?.company_name ?? ""}
      role={active ? "Approved partner" : "Awaiting approval"}
      items={items}
      logout={() => {
        void logout().finally(() =>
          navigate("/partners/login", { replace: true }),
        );
      }}
    >
      <div className="gm-workspace-page">
        <Outlet />
      </div>
    </WorkspaceShell>
  );
  return (
    <QueryClientProvider client={client}>
      <Routes>
        <Route
          path="login"
          element={
            partner ? (
              <Navigate
                to={active ? "/partners/workboard" : "/partners/account"}
                replace
              />
            ) : (
              <div className="gm-workspace gm-partner-portal">
                <div className="p-5">
                  <Link to="/" className="text-sm underline">
                    Back to GuildMark
                  </Link>
                </div>
                <LoginPage />
              </div>
            )
          }
        />
        <Route
          element={
            !partner ? (
              <Navigate
                to="/partners/login"
                replace
                state={{ returnTo: location.pathname }}
              />
            ) : (
              shell
            )
          }
        >
          <Route
            index
            element={
              <Navigate
                to={active ? "/partners/workboard" : "/partners/account"}
                replace
              />
            }
          />
          <Route
            path="workboard"
            element={
              active ? (
                <WorkboardPage />
              ) : (
                <Navigate to="/partners/account" replace />
              )
            }
          />
          <Route
            path="services"
            element={
              active ? (
                <ServicesPage />
              ) : (
                <Navigate to="/partners/account" replace />
              )
            }
          />
          <Route
            path="account"
            element={
              <>
                {!active && (
                  <p
                    role="status"
                    className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm"
                  >
                    Your partner account is awaiting approval. Service jobs
                    become available after approval.
                  </p>
                )}
                <AccountPage />
              </>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/partners" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}
export default function PartnerPortal() {
  return (
    <PortalBaseContext.Provider value="/partners">
      <AuthProvider>
        <Session />
      </AuthProvider>
    </PortalBaseContext.Provider>
  );
}
