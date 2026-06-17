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
import { ComplianceLayout } from "./components/ComplianceLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PortfolioOverview } from "./pages/amps/PortfolioOverview";
import { AssetInventory } from "./pages/amps/AssetInventory";
import { MDMConnections } from "./pages/amps/MDMConnections";
import { Invoices } from "./pages/amps/Invoices";
import { Settings } from "./pages/amps/Settings";
import { InsightPage } from "./pages/Insights";
import { PreLaunch } from "./pages/PreLaunch";
import { Contact } from "./pages/Contact";
import { TermsOfService } from "./pages/compliance/TermsOfService";
import { PrivacyPolicy } from "./pages/compliance/PrivacyPolicy";
import { SellerPlatformAgreement } from "./pages/compliance/SellerPlatformAgreement";
import { SellerLetterOfIntent } from "./pages/compliance/SellerLetterOfIntent";
import { PartnerLetterOfIntent } from "./pages/compliance/PartnerLetterOfIntent";
import { PartnerGuildmarkAgreement } from "./pages/compliance/PartnerGuildmarkAgreement";
import { ProSignup } from "./pages/amps/ProSignup";

// ── Shared compliance children ─────────────────────────────────────────────
const complianceChildren = [
  { path: "terms", Component: TermsOfService },
  { path: "privacy-policy", Component: PrivacyPolicy },
  { path: "seller-agreement", Component: SellerPlatformAgreement },
  { path: "seller-loi", Component: SellerLetterOfIntent },
  { path: "partner-loi", Component: PartnerLetterOfIntent },
  { path: "partner-agreement", Component: PartnerGuildmarkAgreement },
];

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
      { path: "contact", Component: Contact },
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
    path: "/compliance",
    Component: ComplianceLayout,
    children: complianceChildren,
  },
  {
    path: "/amps",
    element: <ProtectedRoute />,
    children: [
      // Pro signup — no sidebar, shown to free-tier users upgrading
      { path: "pro-signup", Component: ProSignup },
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
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

/**
 * Pre-launch router — used when didLaunch === false.
 * Only /insights and /compliance/* are accessible alongside the waitlist landing.
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
      { path: "contact", Component: Contact },
    ],
  },
  {
    path: "/compliance",
    Component: ComplianceLayout,
    children: complianceChildren,
  },
  // Add router to the pre-release section
  {
    path: "/pre",
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
      { path: "contact", Component: Contact },
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
        path: "amps",
        element: <ProtectedRoute />,
        children: [
          // Pro signup — no sidebar, shown to free-tier users upgrading
          { path: "pro-signup", Component: ProSignup },
          {
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
]);
