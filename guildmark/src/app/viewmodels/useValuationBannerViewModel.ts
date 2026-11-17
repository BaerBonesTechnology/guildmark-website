/** ViewModel for the AMPS valuation banner: visibility + portfolio refresh. */
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, useValuationStatus } from "../lib/apiHooks";

export function useValuationBannerViewModel() {
  const { data } = useValuationStatus();
  const qc = useQueryClient();
  const prevStatus = useRef<string | undefined>(undefined);

  // visible tracks whether we should render the banner at all.
  // We show it:  (a) immediately if the page loads while a job is running,
  //              (b) when the job transitions to running,
  //              (c) briefly (5 s) after the job transitions to complete.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const curr = data?.status;
    const prev = prevStatus.current;

    if (curr === "running") {
      setVisible(true);
    }

    if (prev === "running" && curr === "complete") {
      // Refresh portfolio data so updated FMVs appear immediately.
      qc.invalidateQueries({ queryKey: queryKeys.portfolio() });
      // Auto-dismiss the success state after 5 s.
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }

    prevStatus.current = curr;
  }, [data?.status, qc]);

  return { data, visible };
}
