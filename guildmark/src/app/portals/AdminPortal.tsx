import { ContentPosts, ContentEditor, MediaLibrary } from "./Content";
import { BusinessReviews } from "../../../../devdash/src/pages/BusinessReviews";
import { PartnerAccounts } from "./PartnerAccounts";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router";
import {
  BarChart2,
  Users,
  Mail,
  Handshake,
  DollarSign,
  UsersRound,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { AuthProvider, useAuth } from "../../../../devdash/src/hooks/useAuth";
import { PortalBaseContext } from "../../../../devdash/src/lib/portal";
import { Analytics } from "../../../../devdash/src/pages/Analytics";
import { Users as UsersPage } from "../../../../devdash/src/pages/Users";
import { MailingList } from "../../../../devdash/src/pages/MailingList";
import { Partners } from "../../../../devdash/src/pages/Partners";
import { Pricing } from "../../../../devdash/src/pages/Pricing";
import { Team } from "../../../../devdash/src/pages/Team";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { apiUrl } from "../config";
const stateKey = "guildmark_admin_signin_state";
function Login() {
  const [error, setError] = useState("");
  function signIn() {
    try {
      const origin = import.meta.env.VITE_ADMIN_AUTH_ORIGIN;
      if (!origin)
        throw new Error("Staff sign-in is not configured for this site.");
      const url = new URL("/login", origin);
      const localDev = import.meta.env.DEV && window.location.hostname === "localhost" && url.hostname === "localhost" && url.protocol === "http:";
      if (url.protocol !== "https:" && !localDev)
        throw new Error("Secure staff sign-in requires HTTPS.");
      const state = Array.from(
        crypto.getRandomValues(new Uint8Array(32)),
        (byte) => byte.toString(16).padStart(2, "0"),
      ).join("");
      sessionStorage.setItem(stateKey, state);
      url.searchParams.set(
        "return_to",
        window.location.origin + "/admin/auth-callback",
      );
      url.searchParams.set("state", state);
      window.location.assign(url.toString());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Staff sign-in is unavailable.",
      );
    }
  }
  return (
    <div className="gm-workspace min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8">
        <Link to="/" className="gm-wordmark">
          GuildMark<span>.</span>
        </Link>
        <ShieldCheck className="mt-8 text-blue-700" size={30} />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          Administration
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-6">
          Use your staff account and passkey to manage GuildMark operations.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          onClick={signIn}
          className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-white text-sm font-medium"
        >
          Continue with staff sign-in
          <ArrowRight size={16} />
        </button>
        <Link
          to="/"
          className="mt-5 block text-center text-sm text-slate-600 underline"
        >
          Back to GuildMark
        </Link>
      </div>
    </div>
  );
}
function Callback() {
  const { completePasskeySetup } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );
    const state = params.get("state"),
      code = params.get("code"),
      expected = sessionStorage.getItem(stateKey);
    sessionStorage.removeItem(stateKey);
    if (!state || state !== expected || !code) {
      setError("Sign-in state did not match. Restart staff sign-in.");
      return;
    }
    (async () => {
      try {
        const response = await fetch(`${apiUrl}/admin/auth-handoff`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "redeem", state, code }),
        });
        if (!response.ok)
          throw new Error(
            "The sign-in link expired or was already used. Restart staff sign-in.",
          );
        const result = (await response.json()) as { access_token: string };
        completePasskeySetup(result.access_token);
        navigate("/admin", { replace: true });
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Staff sign-in could not finish.",
        );
      }
    })();
  }, [completePasskeySetup, navigate]);
  return (
    <div className="gm-workspace p-8">
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <Link to="/admin/login" className="mt-4 inline-block underline">
            Restart staff sign-in
          </Link>
        </div>
      ) : (
        <p role="status">Finishing secure staff sign-in…</p>
      )}
    </div>
  );
}
function Guard() {
  const { token, logout } = useAuth(),
    location = useLocation();
  const [access, setAccess] = useState<{
    employee: { full_name: string; email: string; role: string };
    can_administer: boolean;
    can_review_business: boolean;
    can_edit_content: boolean;
    can_publish_content: boolean;
  } | null>(null);
  const [checking, setChecking] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    if (!token) return;
    let stopped = false;
    setChecking(true);
    setError("");
    fetch(`${apiUrl}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(async (response) => {
        if (response.status === 401) {
          logout();
          return null;
        }
        if (!response.ok)
          throw new Error("Staff permissions could not be confirmed.");
        return response.json();
      })
      .then((result) => {
        if (!stopped) {
          setAccess(result);
          setChecking(false);
        }
      })
      .catch((e) => {
        if (!stopped) {
          setError(e.message);
          setChecking(false);
        }
      });
    return () => {
      stopped = true;
    };
  }, [token, location.pathname, logout]);
  if (!token) return <Navigate to="/admin/login" replace />;
  if (checking)
    return (
      <p role="status" className="p-8">
        Checking staff permissions…
      </p>
    );
  if (error)
    return (
      <div role="alert" className="p-8">
        <p>{error}</p>
        <button
          className="mt-3 underline"
          onClick={() => window.location.reload()}
        >
          Retry access check
        </button>
      </div>
    );
  if (
    !access?.can_administer &&
    !access?.can_review_business &&
    !access?.can_edit_content
  )
    return (
      <div className="gm-workspace p-8">
        <h1 className="text-2xl font-semibold">
          Administrator access required
        </h1>
        <p className="mt-3">Your staff role does not include this workspace.</p>
        <Link to="/" className="mt-5 inline-block underline">
          GuildMark home
        </Link>
        <button className="ml-5 underline" onClick={logout}>
          Sign out
        </button>
      </div>
    );
  if (location.pathname.replace(/\/$/, "") === "/admin")
    return (
      <Navigate
        to={
          access.can_administer
            ? "/admin/analytics"
            : access.can_edit_content
              ? "/admin/content"
              : "/admin/business-reviews"
        }
        replace
      />
    );
  const items = [
    ...(access.can_edit_content
      ? [
          { label: "Blog articles", to: "/admin/content", icon: Mail },
          { label: "Pages", to: "/admin/content/pages", icon: Mail },
          { label: "FAQs", to: "/admin/content/faqs", icon: Mail },
          {
            label: "Banners & ads",
            to: "/admin/content/placements",
            icon: Mail,
          },
          { label: "Help articles", to: "/admin/content/help", icon: Mail },
          { label: "Media library", to: "/admin/media", icon: BarChart2 },
        ]
      : []),
    ...(access.can_administer
      ? [
          { label: "Overview", to: "/admin/analytics", icon: BarChart2 },
          { label: "Customers", to: "/admin/users", icon: Users },
          { label: "Contacts", to: "/admin/mailing-list", icon: Mail },
          {
            label: "Partner access",
            to: "/admin/partner-accounts",
            icon: Handshake,
          },
          {
            label: "Partner applications",
            to: "/admin/partners",
            icon: Handshake,
          },
          { label: "Pricing", to: "/admin/pricing", icon: DollarSign },
          { label: "Staff & access", to: "/admin/team", icon: UsersRound },
        ]
      : []),
    ...(access.can_review_business
      ? [
          {
            label: "Business reviews",
            to: "/admin/business-reviews",
            icon: ShieldCheck,
          },
        ]
      : []),
  ];
  return (
    <WorkspaceShell
      kind="admin"
      name="Administration"
      identity={access.employee.email}
      role={
        access.employee.role === "superadmin"
          ? "Super administrator"
          : access.can_administer
            ? "Administrator"
            : access.can_edit_content
              ? "Content editor"
              : "Compliance"
      }
      items={items}
      logout={logout}
    >
      {access.can_administer ||
      (access.can_review_business &&
        location.pathname.startsWith("/admin/business-reviews")) ||
      (access.can_edit_content &&
        (location.pathname.startsWith("/admin/content") ||
          location.pathname === "/admin/media")) ? (
        <Outlet context={{ can_publish_content: access.can_publish_content }} />
      ) : (
        <div className="p-8">
          <h1 className="text-xl font-semibold">
            This page is not included in your staff access
          </h1>
          <Link
            className="mt-4 inline-block underline"
            to={
              access.can_edit_content
                ? "/admin/content"
                : "/admin/business-reviews"
            }
          >
            Open your workspace
          </Link>
        </div>
      )}
    </WorkspaceShell>
  );
}
export default function AdminPortal() {
  return (
    <PortalBaseContext.Provider value="/admin">
      <AuthProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="auth-callback" element={<Callback />} />
          <Route element={<Guard />}>
            <Route index element={<Navigate to="/admin/analytics" replace />} />
            <Route path="content" element={<ContentPosts />} />
            <Route path="content/posts/:id" element={<ContentEditor />} />
            <Route
              path="content/pages"
              element={<ContentPosts key="pages" kind="page" />}
            />
            <Route
              path="content/pages/:id"
              element={<ContentEditor key="page-editor" kind="page" />}
            />
            <Route
              path="content/faqs"
              element={<ContentPosts key="faqs" kind="faq" />}
            />
            <Route
              path="content/faqs/:id"
              element={<ContentEditor key="faq-editor" kind="faq" />}
            />
            <Route
              path="content/help"
              element={<ContentPosts key="help" kind="help" />}
            />
            <Route
              path="content/help/:id"
              element={<ContentEditor key="help-editor" kind="help" />}
            />
            <Route
              path="content/placements"
              element={<ContentPosts key="placements" kind="promotion" />}
            />
            <Route
              path="content/placements/:id"
              element={
                <ContentEditor key="placement-editor" kind="promotion" />
              }
            />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="mailing-list" element={<MailingList />} />
            <Route path="partners" element={<Partners />} />
            <Route path="partner-accounts" element={<PartnerAccounts />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="team" element={<Team />} />
            <Route path="business-reviews" element={<BusinessReviews />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </PortalBaseContext.Provider>
  );
}
