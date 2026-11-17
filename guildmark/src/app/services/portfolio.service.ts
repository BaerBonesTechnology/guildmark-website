/** AMPS portfolio service — pure transforms from the summary payload to charts. */
import { FLEET_TYPE_COLORS } from "../constants/amps.constants";
import { grades } from "../lib/tokens";
import type { PortfolioSummary } from "../models/portfolio";

export interface ConditionSlice {
  color: string;
  name: string;
  value: number;
}

export interface TrendPoint {
  book: number;
  month: string;
  portfolio: number;
}

export interface TypeSlice {
  color: string;
  name: string;
  value: number;
}

export function conditionLabel(grade: string): string {
  return grade === "A" ? "Excellent (A)" : grade === "B" ? "Good (B)" : "Fair (C)";
}

export function depreciationPct(portfolio: PortfolioSummary | undefined): string {
  return portfolio ? (portfolio.depreciation_pct * 100).toFixed(1) : "0";
}

export function fleetByCondition(portfolio: PortfolioSummary | undefined): ConditionSlice[] {
  return Object.entries(portfolio?.by_condition ?? {}).map(([name, d]) => ({
    name: conditionLabel(name),
    value: d.count,
    color: name === "A" ? grades.A.bg : name === "B" ? grades.B.bg : grades.C.bg,
  }));
}

export function fleetByType(portfolio: PortfolioSummary | undefined): TypeSlice[] {
  return Object.entries(portfolio?.by_type ?? {}).map(([name, d], ndx) => ({
    name, value: d.count, color: FLEET_TYPE_COLORS[ndx % FLEET_TYPE_COLORS.length],
  }));
}

export function formatUsd(num: number): string {
  return `$${num.toLocaleString()}`;
}

export function portfolioTrend(portfolio: PortfolioSummary | undefined): TrendPoint[] {
  return (portfolio?.trend ?? []).map((t) => ({
    month: new Date(t.snapshot_date).toLocaleDateString("en-US", { month: "short" }),
    portfolio: t.total_portfolio_value,
    book: t.total_book_value,
  }));
}
