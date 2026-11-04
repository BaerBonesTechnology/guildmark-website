/** Preserve unavailable data instead of manufacturing zero-valued KPIs. */
import { useDashboard } from "../lib/apiHooks";
export function useDashboardViewModel() {
  const query = useDashboard();
  return { ...query, hasData: Boolean(query.data) };
}
