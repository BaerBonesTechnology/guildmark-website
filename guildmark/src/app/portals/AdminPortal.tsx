import { Login } from "../../../../devdash/src/pages/Login";
import { RegisterPasskey } from "../../../../devdash/src/pages/RegisterPasskey";
import { ContentPosts, ContentEditor, MediaLibrary } from "./Content";
import { BusinessReviews } from "../../../../devdash/src/pages/BusinessReviews";
import { PartnerAccounts } from "./PartnerAccounts";
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
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
          <Route
            path="login"
            element={
              <div className="gm-workspace">
                <Login />
              </div>
            }
          />
          <Route
            path="register-passkey"
            element={
              <div className="gm-workspace">
                <RegisterPasskey />
              </div>
            }
          />
          <Route
            path="auth-callback"
            element={<Navigate to="/admin/login" replace />}
          />
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
