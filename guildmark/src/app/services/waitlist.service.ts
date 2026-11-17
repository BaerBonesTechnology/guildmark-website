/** Waitlist service — POST /waitlist; source + notes make submissions segmentable. */
import { apiUrl } from "../config";

export interface WaitlistPayload {
  company?: string;
  email: string;
  partner_type?: string;
  source: string;
}

export async function submitWaitlist(payload: WaitlistPayload): Promise<void> {
  const res = await fetch(`${apiUrl}/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? "Something went wrong. Please try again.");
  }
}
