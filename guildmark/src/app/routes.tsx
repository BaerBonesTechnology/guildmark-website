import { createBrowserRouter, Navigate } from "react-router";
import { ExecutiveDashboard } from "./pages/ExecutiveDashboard";
import { MarketCalculator } from "./pages/MarketCalculator";
import { OffloadWorkflow } from "./pages/OffloadWorkflow";
import { Marketplace } from "./pages/Marketplace";
import { MyListings } from "./pages/MyListings";
import { Orders } from "./pages/Orders";
import { OrderDetail } from "./pages/OrderDetail";
import { OfferInbox } from "./pages/OfferInbox";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { AccountSettings } from "./pages/Settings";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { HowItWorks } from "./pages/HowItWorks";
import { Layout } from "./components/Layout";
import { PreLaunchLayout } from "./components/PreLaunchLayout";
import { AMPSLayout } from "./components/AMPSLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PortfolioOverview } from "./pages/amps/PortfolioOverview";
import { AssetInventory } from "./pages/amps/AssetInventory";
import { MDMConnections } from "./pages/amps/MDMConnections";
import { Invoices } from "./pages/amps/Invoices";
import { Settings } from "./pages/amps/Settings";
import { InsightPage } from "./pages/Insights";
import { PreLaunch } from "./pages/PreLaunch";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "reset-password", Component: ResetPassword },
      { path: "how-it-works", Component: HowItWorks },
      { path: "marketplace", Component: Marketplace },
      { path: "insights", Component: InsightPage },
      {
        path: "dashboard",
        element: <ProtectedRoute />,
        children: [
          { index: true, Component: ExecutiveDashboard },
        ],
      },
      {
        path: "calculator",
        element: <ProtectedRoute />,
        children: [
          { index: true, Component: MarketCalculator },
        ],
      },
      {
        path: "offload",
        element: <ProtectedRoute />,
        children: [
          { index: true, Component: OffloadWorkflow },
        ],
      },
      {
        path: "my-listings",
        element: <ProtectedRoute />,
        children: [
          { index: true, Component: MyListings },
        ],
      },
      {
        path: "orders",
        element: <ProtectedRoute />,
        children: [
          { index: true, Component: Orders },
          { path: ":id", Component: OrderDetail },
        ],
      },
      {
        path: "offers",
        element: <ProtectedRoute />,
        children: [
          { index: true, Component: OfferInbox },
        ],
      },
      {
        path: "settings",
        element: <ProtectedRoute />,
        children: [
          { index: true, Component: AccountSettings },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/amps",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/amps",
        Component: AMPSLayout,
        children: [
          { index: true, Component: PortfolioOverview },
          { path: "assets", Component: AssetInventory },
          { path: "mdm", Component: MDMConnections },
          { path: "invoices", Component: Invoices },
          { path: "settings", Component: Settings },
        ],
      },
    ],
  },
]);

/**
 * Pre-launch router — used when didLaunch === false.
 * Only /insights is accessible alongside the waitlist landing page.
 * All other paths redirect to the pre-launch hero.
 */
export const preLaunchRouter = createBrowserRouter([
  {
    path: "/",
    Component: PreLaunchLayout,
    children: [
      { index: true, Component: PreLaunch },
      // Redirect /insights to the bottom sheet so direct URL navigation works
      { path: "insights", element: <Navigate to="/?sheet=insights" replace /> },
      { path: "*",        Component: PreLaunch },
    ],
  },
]);
