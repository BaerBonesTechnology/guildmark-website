import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, preLaunchRouter } from "./routes";
import { AuthProvider } from "./hooks/useAuth";
import { isLaunch, isDebug } from "./config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on 401/403 — auth errors need user action
        if (error instanceof Error && "status" in error) {
          const status = (error as { status: number }).status;
          if (status === 401 || status === 403) return false;
        }
        return failureCount < 2;
      },
      staleTime: 60 * 1000,   // 1 minute default
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={preLaunchRouter} />
      </AuthProvider>
    </QueryClientProvider>
  );
}