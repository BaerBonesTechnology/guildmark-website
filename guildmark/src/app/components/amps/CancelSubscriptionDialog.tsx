/** Confirmation dialog for cancelling an AMPS subscription. */
import { Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

interface CancelSubscriptionDialogProps {
  onCancel: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pending: boolean;
}

export function CancelSubscriptionDialog({ onCancel, onOpenChange, open, pending }: CancelSubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><X className="w-4 h-4" style={{ color: "var(--chart-4)" }} /> Cancel subscription?</DialogTitle>
          <DialogDescription>You'll keep access until the end of your current billing period. Your plan will revert to Free after that.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Keep plan</Button>
          <Button variant="destructive" onClick={onCancel} disabled={pending}>
            {pending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling…</> : "Yes, cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
