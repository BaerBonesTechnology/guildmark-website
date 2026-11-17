import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { accountLabel } from "../../services/accountSettings.service";
import type { useAccountSettingsViewModel } from "../../viewmodels/useAccountSettingsViewModel";

type Model = ReturnType<typeof useAccountSettingsViewModel>;
export function AccountSettingsDialog({ model: vm }: { model: Model }) {
  const opener = useRef<HTMLElement | null>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const reset = vm.dialog === "reset";
  const done = reset ? vm.resetSent : vm.exported;
  return (
    <Dialog
      open={vm.dialog !== null}
      onOpenChange={(open) => {
        if (!open) vm.closeDialog();
      }}
    >
      <DialogContent
        className="gm-settings-dialog"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          opener.current = document.activeElement as HTMLElement;
          cancel.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (
            opener.current?.isConnected &&
            opener.current.matches("button,a,input,select,textarea,[tabindex]")
          )
            opener.current.focus();
          else
            (
              document.querySelector(
                "[data-account-dialog-trigger]:not(:disabled)",
              ) as HTMLElement
            )?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {reset ? "Reset your password" : "Download an account summary"}
          </DialogTitle>
          <DialogDescription>
            {reset
              ? "Request a password-reset link for the email on your signed-in account."
              : "Review the information included in this JSON download."}
          </DialogDescription>
        </DialogHeader>
        <div className="gm-settings-dialog-body" aria-busy={vm.resetBusy}>
          {reset ? (
            <>
              <div className="gm-settings-reset-address">
                <span>Account email</span>
                <strong>{accountLabel(vm.user?.email)}</strong>
              </div>
              {vm.resetSent ? (
                <div className="gm-settings-notice is-success" role="status">
                  <p>
                    If this address is registered, a password-reset email has
                    been requested. Check your inbox and spam folder.
                  </p>
                </div>
              ) : (
                <p>
                  Your password changes only after you follow the reset link and
                  choose a new password.
                </p>
              )}
              {vm.resetError && (
                <p className="gm-settings-field-error" role="alert">
                  {vm.resetError}
                </p>
              )}
            </>
          ) : (
            <>
              <dl className="gm-settings-records">
                <div>
                  <dt>Name</dt>
                  <dd>{accountLabel(vm.user?.full_name)}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{accountLabel(vm.user?.email)}</dd>
                </div>
                <div>
                  <dt>Company</dt>
                  <dd>{accountLabel(vm.user?.company)}</dd>
                </div>
              </dl>
              <h2>Included in the summary</h2>
              <p>
                Your name, account email, workspace role, account and company
                IDs, company name, and the available subscription record shown
                on this page.
              </p>
              <h2>Outside this summary</h2>
              <p>
                Orders, listings, messages, payment details, and security
                settings. This download is a summary of this account view.
              </p>
              {(vm.subscription.isError ||
                vm.subscription.isFetching ||
                !vm.subscription.data) && (
                <p className="gm-settings-help">
                  The subscription record is unavailable for this download. It
                  will be marked as unavailable in the summary.
                </p>
              )}
              {vm.exported && (
                <div className="gm-settings-notice is-success" role="status">
                  <p>Download started. Check your browser’s downloads.</p>
                </div>
              )}
              {vm.exportError && (
                <p className="gm-settings-field-error" role="alert">
                  {vm.exportError}
                </p>
              )}
            </>
          )}
        </div>
        <footer className="gm-settings-dialog-footer">
          <button
            ref={cancel}
            type="button"
            className="gm-text-link"
            disabled={vm.resetBusy}
            onClick={vm.closeDialog}
          >
            {done ? "Done" : "Cancel"}
          </button>
          {!done && (
            <button
              className="gm-button gm-button-small"
              disabled={vm.resetBusy}
              onClick={reset ? vm.sendReset : vm.downloadSummary}
            >
              {reset
                ? vm.resetBusy
                  ? "Requesting link…"
                  : "Send reset link"
                : "Download JSON summary"}
            </button>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
