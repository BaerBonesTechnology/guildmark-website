/** ViewModel for the AMPS Portfolio Overview: summary fetch + chart transforms. */
import { usePortfolioSummary } from "../lib/apiHooks";
import {
  depreciationPct, fleetByCondition, fleetByType, portfolioTrend,
} from "../services/portfolio.service";

export function usePortfolioOverviewViewModel() {
  const { data: portfolio, isLoading, error } = usePortfolioSummary();

  return {
    conditionSlices: fleetByCondition(portfolio),
    depPct: depreciationPct(portfolio),
    error,
    isLoading,
    portfolio,
    trendData: portfolioTrend(portfolio),
    typeSlices: fleetByType(portfolio),
  };
}
