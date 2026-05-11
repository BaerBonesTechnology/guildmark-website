import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router";
import "./index.css";
import { Login } from "./pages/Login";
import { RegisterPasskey } from "./pages/RegisterPasskey";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { Users } from "./pages/Users";
import { MailingList } from "./pages/MailingList";
import { Partners } from "./pages/Partners";
import { Pricing } from "./pages/Pricing";
import { Team } from "./pages/Team";
import { AuthProvider, useAuth } from "./hooks/useAuth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const router = createBrowserRouter([
  { path: "/login",            element: <Login /> },
  { path: "/register-passkey", element: <RegisterPasskey /> },
  {
    path: "/",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    children: [
      { index: true,          element: <Navigate to="/analytics" replace /> },
      { path: "analytics",    element: <Analytics /> },
      { path: "users",        element: <Users /> },
      { path: "mailing-list", element: <MailingList /> },
      { path: "partners",    element: <Partners /> },
      { path: "pricing",     element: <Pricing /> },
      { path: "team",        element: <Team /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
