/**
 * Compare state for the marketplace. Buyers add listings to a compare tray
 * (max 4 per category / asset_type); the CompareDrawer renders a side-by-side
 * spec/price table. State is app-scoped so it survives PLP ↔ PDP navigation.
 */

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { MarketplaceListing } from "../models/marketplace";

const MAX_PER_CATEGORY = 4;

export function categoryOf(l: MarketplaceListing): string {
  return l.asset_type ?? "other";
}

interface CompareContextValue {
  compared: MarketplaceListing[];
  flashId: string | null;
  atMax: (l: MarketplaceListing) => boolean;
  toggle: (l: MarketplaceListing) => void;
  remove: (id: string) => void;
  clear: () => void;
  isCompared: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextValue>({
  compared: [], flashId: null,
  atMax: () => false, toggle: () => {}, remove: () => {}, clear: () => {}, isCompared: () => false,
});

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compared, setCompared] = useState<MarketplaceListing[]>([]);
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerFlash = (id: string) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlashId(id);
    flashTimer.current = setTimeout(() => setFlashId(null), 800);
  };

  const toggle = useCallback((listing: MarketplaceListing) => {
    setCompared((prev) => {
      if (prev.some((l) => l.id === listing.id)) return prev.filter((l) => l.id !== listing.id);
      const sameCategory = prev.filter((l) => categoryOf(l) === categoryOf(listing));
      if (sameCategory.length >= MAX_PER_CATEGORY) return prev;
      triggerFlash(listing.id);
      return [...prev, listing];
    });
  }, []);

  const remove = useCallback((id: string) => setCompared((prev) => prev.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setCompared([]), []);
  const isCompared = useCallback((id: string) => compared.some((l) => l.id === id), [compared]);
  const atMax = useCallback(
    (l: MarketplaceListing) =>
      !compared.some((x) => x.id === l.id) &&
      compared.filter((x) => categoryOf(x) === categoryOf(l)).length >= MAX_PER_CATEGORY,
    [compared],
  );

  return (
    <CompareContext.Provider value={{ compared, flashId, atMax, toggle, remove, clear, isCompared }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
