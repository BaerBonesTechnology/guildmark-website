/** ViewModel for the Compare drawer: open/flash state + grouped listings. */
import { useEffect, useRef, useState } from "react";
import { useCompare } from "../components/CompareContext";
import { groupByCategory } from "../services/compare.service";

export function useCompareDrawerViewModel() {
  const { compared, clear } = useCompare();
  const [open, setOpen] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const prevCount = useRef(compared.length);

  useEffect(() => {
    if (compared.length > prevCount.current) {
      setFlashing(true);
      const timer = setTimeout(() => setFlashing(false), 800);
      prevCount.current = compared.length;
      return () => clearTimeout(timer);
    }
    prevCount.current = compared.length;
  }, [compared.length]);

  useEffect(() => { if (compared.length === 0) setOpen(false); }, [compared.length]);

  const groups = groupByCategory(compared);

  return { clear, compared, flashing, groups, open, setOpen };
}
