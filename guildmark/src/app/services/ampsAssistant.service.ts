export const ASSISTANT_SELECTION_LIMIT = 5;

/** The limit applies to records; a record can represent several devices. */
export function toggleAssistantSelection(selected: string[], id: string): string[] {
  if (selected.includes(id)) return selected.filter((value) => value !== id);
  return selected.length < ASSISTANT_SELECTION_LIMIT ? [...selected, id] : selected;
}

export function assistantErrorMessage(error: unknown): string {
  const status = (error as { status?: number } | null)?.status;
  if (status === 401) return "Your session has expired. Sign in again to use your company's assistant.";
  if (status === 402) return "Your AMPS subscription payment needs attention before the assistant is available.";
  if (status === 403) return "An active AMPS subscription is required. Check your plan or contact your company administrator.";
  if (status === 429) return "Your available valuation credits or request limit was reached. Review plan usage and the billing period, then retry when credits are available. Viewing and CSV export remain available.";
  if (status === 409) return "The selected records or a previous request changed. Refresh your inventory and usage before retrying.";
  if (status === 503) return "The assistant's data service is unavailable. Try again when the service is ready.";
  return "We couldn't confirm this request. This assistant does not publish listings. Refresh your inventory and usage before retrying.";
}

export function formatAssistantMoney(value: number | null): string {
  return value === null ? "Not estimated" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
