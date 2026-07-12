/** ViewModel for the Fleet Dashboard: flattens the /dashboard payload. */
import { useDashboard } from "../lib/apiHooks";

export function useDashboardViewModel() {
  const { data, error, isError, isPending } = useDashboard();

  return {
    activeListings: data?.active_listings ?? 0,
    ampsPortfolioValue: data?.amps_portfolio_value ?? 0,
    chartData: data?.value_trend ?? [],
    efficiencyPct: data?.fleet_efficiency_pct ?? 0,
    error,
    highDemandAssets: data?.high_demand_assets ?? [],
    inMarketValue: data?.in_market_value ?? 0,
    isError,
    isPending,
    overpricedCount: data?.overpriced_count ?? 0,
    pendingOffers: data?.pending_offers ?? 0,
    projectedLoss: data?.projected_loss_6mo ?? 0,
    recoveryOpportunity: data?.recovery_opportunity ?? 0,
    stagedValue: data?.staged_value ?? 0,
    totalFleetValue: data?.total_fleet_value ?? 0,
    totalListedValue: data?.total_listed_value ?? 0,
    totalMarketValue: data?.total_market_value ?? 0,
    totalRecovered: data?.total_recovered ?? 0,
  };
}
