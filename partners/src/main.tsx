import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import { AuthProvider } from "./hooks/useAuth";
import { RequireAuth }  from "./components/RequireAuth";
import { PartnerLayout } from "./components/PartnerLayout";
import { LoginPage }     from "./pages/LoginPage";
import { WorkboardPage } from "./pages/WorkboardPage";
import { ServicesPage }  from "./pages/ServicesPage";
import { AccountPage }   from "./pages/AccountPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected — wrapped in layout */}
            <Route element={<RequireAuth />}>
              <Route element={<PartnerLayout />}>
                <Route index element={<Navigate to="/workboard" replace />} />
                <Route path="/workboard" element={<WorkboardPage />} />
                <Route path="/services"  element={<ServicesPage />} />
                <Route path="/account"   element={<AccountPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/workboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
