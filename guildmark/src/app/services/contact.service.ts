/**
 * Contact form service — POST /contact, which stores the message in the
 * mailing_list table with source = 'contact'.
 */
import { apiUrl } from "../config";

export interface ContactFields {
  email: string;
  message: string;
  name: string;
}

export async function submitContact(fields: ContactFields): Promise<void> {
  const res = await fetch(`${apiUrl}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? "Something went wrong. Please try again.");
  }
}
