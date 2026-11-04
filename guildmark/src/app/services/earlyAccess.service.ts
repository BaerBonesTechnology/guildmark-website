import type { WaitlistPayload } from "./waitlist.service";

const value = (data: FormData, field: string) => String(data.get(field) ?? "").trim();

export function earlyAccessPayload(data: FormData, audience: "team" | "supply"): WaitlistPayload {
  return {
    email: value(data, "email"),
    company: value(data, "company") || undefined,
    source: audience === "team" ? "waitlist" : "supply",
    partner_type: audience === "team"
      ? (value(data, "size") ? `Refresh size: ${value(data, "size")}` : undefined)
      : [value(data, "role"), value(data, "volume") && `Volume: ${value(data, "volume")}`].filter(Boolean).join(" · ") || undefined,
  };
}

export function partnerLoiDetails(data: FormData) {
  return { name: value(data, "name"), email: value(data, "email"), company: value(data, "company"),
    partnerType: [value(data, "service"), value(data, "coverage")].filter(Boolean).join(" · "), phone: "" };
}
