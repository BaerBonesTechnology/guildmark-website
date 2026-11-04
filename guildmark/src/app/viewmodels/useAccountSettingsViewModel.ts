import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../lib/apiHooks";
import { api } from "../lib/api";
import {
  buildAccountSummary,
  validResetEmail,
} from "../services/accountSettings.service";

export function useAccountSettingsViewModel() {
  const { user, logout } = useAuth();
  const subscription = useSubscription();
  const navigate = useNavigate();
  const client = useQueryClient();
  const base = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  const [dialog, setDialog] = useState<"reset" | "export" | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const resetLock = useRef(false);
  const signOutLock = useRef(false);
  function openDialog(next: "reset" | "export") {
    if (resetLock.current || signOutLock.current) return;
    setResetSent(false);
    setResetError(null);
    setExportError(null);
    setExported(false);
    setDialog(next);
  }
  function closeDialog() {
    if (!resetLock.current) setDialog(null);
  }
  async function sendReset() {
    if (resetLock.current || resetSent) return;
    if (!validResetEmail(user?.email)) {
      setResetError(
        "Your account email is unavailable. A reset request cannot be sent here.",
      );
      return;
    }
    resetLock.current = true;
    setResetBusy(true);
    setResetError(null);
    try {
      await api.post(
        "/auth/forgot_password",
        { email: user!.email.trim() },
        { skipAuth: true },
      );
      setResetSent(true);
    } catch {
      setResetError("We couldn’t request a password-reset email. Try again.");
    } finally {
      resetLock.current = false;
      setResetBusy(false);
    }
  }
  function downloadSummary() {
    if (!user) {
      setExportError(
        "Account details are unavailable. Sign in again to download a summary.",
      );
      return;
    }
    let url: string | undefined;
    let downloadLink: HTMLAnchorElement | undefined;
    try {
      const current =
        !subscription.isError && !subscription.isFetching
          ? (subscription.data ?? null)
          : null;
      const payload = buildAccountSummary(user, current);
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      downloadLink = link;
      link.href = url;
      link.download = "guildmark-account-summary.json";
      document.body.append(link);
      link.click();
      link.remove();
      setExported(true);
      setExportError(null);
    } catch {
      setExportError("The account summary couldn’t be downloaded. Try again.");
    } finally {
      downloadLink?.remove();
      if (url) {
        const downloadUrl = url;
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }
    }
  }
  async function signOut() {
    if (signOutLock.current) return;
    signOutLock.current = true;
    setSigningOut(true);
    setSignOutError(null);
    try {
      if (await logout({ requireServer: true })) {
        client.clear();
        navigate(`${base}/login`, { replace: true });
      } else
        setSignOutError(
          "We couldn’t confirm sign-out. You’re still signed in here. Try again.",
        );
    } catch {
      setSignOutError("We couldn’t confirm sign-out. Try again.");
    } finally {
      signOutLock.current = false;
      setSigningOut(false);
    }
  }
  return {
    user,
    subscription,
    base,
    dialog,
    openDialog,
    closeDialog,
    resetBusy,
    resetSent,
    resetError,
    sendReset,
    exported,
    exportError,
    downloadSummary,
    signingOut,
    signOutError,
    signOut,
  };
}
