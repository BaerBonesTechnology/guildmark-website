/** ViewModel for the GM Pro signup page: plan/checkout state + fees. */
import { useState } from "react";
import { useNavigate } from "react-router";
import type { PaidPlan } from "../components/SubscriptionCheckoutDialog";
import { useAuth } from "../hooks/useAuth";
import { usePlatformFees } from "../lib/apiHooks";

export function useProSignupViewModel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: fees } = usePlatformFees();
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlan | null>(null);

  return {
    checkoutPlan,
    currentPlan: user?.subscription_plan ?? "free",
    fees,
    onCheckoutSuccess: () => navigate("/pre/amps"),
    setCheckoutPlan,
  };
}
