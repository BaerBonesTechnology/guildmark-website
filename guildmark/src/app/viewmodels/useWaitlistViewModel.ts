/** ViewModel for waitlist forms: submission status + error, shared by sections. */
import { useState } from "react";
import { submitWaitlist, type WaitlistPayload } from "../services/waitlist.service";

export type WaitlistStatus = "error" | "idle" | "loading" | "success";

export function useWaitlistViewModel() {
  const [status, setStatus] = useState<WaitlistStatus>("idle");
  const [error, setError] = useState("");

  async function submit(payload: WaitlistPayload) {
    setStatus("loading");
    setError("");
    try {
      await submitWaitlist(payload);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return { error, status, submit };
}
