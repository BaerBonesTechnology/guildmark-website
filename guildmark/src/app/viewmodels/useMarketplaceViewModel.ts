/** ViewModel for the Marketplace (PLP): search, filters, sort, paging, stats. */
import { useEffect, useMemo, useState } from "react";
import { useMarketplaceListings } from "../lib/apiHooks";
import { api } from "../lib/api";
import { PAGE_SIZE } from "../constants/marketplace.constants";
import { filterAndSortListings, toggleSetValue } from "../services/marketplace.service";
import type { MarketplaceSort } from "../constants/marketplace.constants";

interface MarketplaceStats {
  avgPricePerUnit: string;
  totalListings: number;
  totalMarketValue: string;
  totalUnits: number;
}

export function useMarketplaceViewModel() {
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [grades, setGrades] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<MarketplaceSort>("newest");
  const [stats, setStats] = useState<MarketplaceStats>({ avgPricePerUnit: "0", totalListings: 0, totalMarketValue: "0", totalUnits: 0 });

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { setPage(1); }, [categories, grades, sortBy]);

  useEffect(() => {
    api.get<{ avgPricePerUnit: number; totalListings: number; totalMarketValue: number; totalUnits: number }>("/marketplace/stats")
      .then((result) => setStats({
        avgPricePerUnit: result.avgPricePerUnit.toLocaleString("en-US", { maximumFractionDigits: 0 }),
        totalListings: result.totalListings,
        totalMarketValue: result.totalMarketValue.toLocaleString("en-US", { maximumFractionDigits: 0 }),
        totalUnits: result.totalUnits,
      }))
      .catch(() => {});
  }, []);

  // Search is server-side; category/condition are multi-select and filtered
  // client-side, so we pull a generous page (fine pre-launch).
  const { data, isError, isLoading } = useMarketplaceListings({ search: debouncedSearch || undefined, page: 1, page_size: 100 });
  const allListings = data?.data ?? [];

  const filteredListings = useMemo(
    () => filterAndSortListings(allListings, { categories, grades, sortBy }),
    [allListings, categories, grades, sortBy],
  );

  const anyFilter = categories.size > 0 || grades.size > 0;
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));
  const pageItems = filteredListings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function clearFilters() {
    setCategories(new Set());
    setGrades(new Set());
  }

  function goToNextPage() {
    setPage((prev) => prev + 1);
  }

  function goToPrevPage() {
    setPage((prev) => prev - 1);
  }

  function toggleCategory(type: string) {
    setCategories((prev) => toggleSetValue(prev, type));
  }

  function toggleGrade(grade: string) {
    setGrades((prev) => toggleSetValue(prev, grade));
  }

  return {
    anyFilter,
    categories,
    clearFilters,
    filteredListings,
    goToNextPage,
    goToPrevPage,
    grades,
    isError,
    isLoading,
    page,
    pageItems,
    search,
    setSearch,
    setSortBy,
    sortBy,
    stats,
    toggleCategory,
    toggleGrade,
    totalPages,
  };
}
