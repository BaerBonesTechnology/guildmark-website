import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useBusinessBadgeViewModel(companyId: string) {
  const query = useQuery({
    queryKey: ["business-badge", companyId],
    queryFn: () => api.get<{ verified_business: boolean }>(`/business-badge?company_id=${encodeURIComponent(companyId)}`, { skipAuth: true }),
    enabled: !!companyId,
    staleTime: 0,
  });
  return query.data?.verified_business === true && !query.isError;
}
