import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router";
import "./index.css";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { MailingList } from "./pages/MailingList";
import { Users } from "./pages/Users";
import { AuthProvider, useAuth } from "./hooks/useAuth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/users" replace /> },
      { path: "users",        element: <Users /> },
      { path: "mailing-list", element: <MailingList /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
