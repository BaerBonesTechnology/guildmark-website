/** ViewModel for the Marketplace (PLP): URL-synced search, filters, sort, paging. */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useMarketplaceListings } from "../lib/apiHooks";
import { MARKETPLACE_CATEGORIES, MARKETPLACE_GRADES, MARKETPLACE_SORTS, PAGE_SIZE } from "../constants/marketplace.constants";
import { filterAndSortListings, toggleSetValue } from "../services/marketplace.service";
import type { MarketplaceSort } from "../constants/marketplace.constants";

const SORT_VALUES = new Set(MARKETPLACE_SORTS.map((option) => option.value));

export function useMarketplaceViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL query string is the source of truth for filters, sort and page, so
  // a filtered view is shareable, restorable and survives Back/Forward.
  const categories = useMemo(
    () => new Set(searchParams.getAll("category").filter((value) => MARKETPLACE_CATEGORIES.some((category) => category.type === value))),
    [searchParams],
  );
  const grades = useMemo(
    () => new Set(searchParams.getAll("grade").filter((value) => MARKETPLACE_GRADES.some((entry) => entry.grade === value))),
    [searchParams],
  );
  const urlSearch = searchParams.get("q") ?? "";
  const sortParam = searchParams.get("sort") as MarketplaceSort | null;
  const sortBy: MarketplaceSort = sortParam && SORT_VALUES.has(sortParam) ? sortParam : "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  // The search box keeps a local mirror for responsive typing; it is debounced
  // into the URL (which drives the query) and kept in sync with external nav.
  const [search, setSearch] = useState(urlSearch);
  useEffect(() => { setSearch(urlSearch); }, [urlSearch]);
  useEffect(() => {
    if (search === urlSearch) return;
    const timer = setTimeout(() => {
      setSearchParams((previous) => {
        const params = new URLSearchParams(previous);
        if (search) params.set("q", search); else params.delete("q");
        params.delete("page");
        return params;
      }, { replace: true, preventScrollReset: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [search, urlSearch, setSearchParams]);

  // Search is applied server-side; category/condition/sort are multi-select and
  // applied client-side over a generous page. True server-side filtering is
  // blocked until the API accepts multi-value category/grade + a sort param
  // (see the optimize note); backend is mid-migration to Firebase.
  const { data, isError, isLoading, refetch } = useMarketplaceListings({ search: urlSearch || undefined, page: 1, page_size: 100 });
  const allListings = data?.data ?? [];

  const filteredListings = useMemo(
    () => filterAndSortListings(allListings, { categories, grades, sortBy }),
    [allListings, categories, grades, sortBy],
  );

  const anyFilter = categories.size > 0 || grades.size > 0;
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredListings.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function patchParams(mutate: (params: URLSearchParams) => void, resetPage = true) {
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);
      mutate(params);
      if (resetPage) params.delete("page");
      return params;
    }, { replace: true, preventScrollReset: true });
  }

  function setSortBy(next: MarketplaceSort) {
    patchParams((params) => { if (next === "newest") params.delete("sort"); else params.set("sort", next); });
  }
  function toggleCategory(type: string) {
    const next = toggleSetValue(categories, type);
    patchParams((params) => { params.delete("category"); next.forEach((value) => params.append("category", value)); });
  }
  function toggleGrade(grade: string) {
    const next = toggleSetValue(grades, grade);
    patchParams((params) => { params.delete("grade"); next.forEach((value) => params.append("grade", value)); });
  }
  function clearFilters() {
    patchParams((params) => { params.delete("category"); params.delete("grade"); });
  }
  function goToNextPage() {
    patchParams((params) => params.set("page", String(safePage + 1)), false);
  }
  function goToPrevPage() {
    patchParams((params) => { const previousPage = safePage - 1; if (previousPage <= 1) params.delete("page"); else params.set("page", String(previousPage)); }, false);
  }

  return {
    anyFilter, categories, clearFilters, filteredListings, goToNextPage, goToPrevPage,
    grades, isError, isLoading, page: safePage, pageItems, refetch, search, setSearch,
    setSortBy, sortBy, toggleCategory, toggleGrade, totalPages,
  };
}
