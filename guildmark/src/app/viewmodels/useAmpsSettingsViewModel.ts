/** ViewModel for AMPS Settings: subscription, company, notifications, cancel. */
import { useState } from "react";
import type { NotificationKey, PlanKey } from "../constants/ampsSettings.constants";
import type { PaidPlan } from "../components/SubscriptionCheckoutDialog";
import { useAuth } from "../hooks/useAuth";
import { useCancelSubscription, usePlatformFees, useReconcileSubscription, useSubscription } from "../lib/apiHooks";

export interface CompanyProfile {
  industry: string;
  name: string;
  size: string;
}

export type NotificationState = Record<NotificationKey, boolean>;

export function useAmpsSettingsViewModel() {
  const { user } = useAuth();
  const { data: subData, isLoading: subLoading } = useSubscription();
  const currentPlan = ((subData?.plan ?? user?.subscription_plan) ?? "free") as PlanKey;
  const { data: fees } = usePlatformFees();
  const cancelSub = useCancelSubscription();
  const reconcile = useReconcileSubscription();

  const [companyData, setCompanyData] = useState<CompanyProfile>({ name: "", industry: "", size: "" });
  const [notifications, setNotifications] = useState<NotificationState>({ syncFailures: true, valuationAlerts: true, offerActivity: false });
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlan | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  async function handleCancel() {
    await cancelSub.mutateAsync();
    setCancelConfirm(false);
  }

  return {
    cancelConfirm, cancelSub, checkoutPlan, companyData, currentPlan, fees, handleCancel,
    notifications, setCancelConfirm, setCheckoutPlan, setCompanyData, setNotifications,
    subData, subLoading, reconcile,
  };
}
