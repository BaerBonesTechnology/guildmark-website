import { useEffect } from "react";
import { useLocation } from "react-router";

/** Scroll after routed content mounts, including cold loads with a fragment. */
export function HashScroll() {
  const { hash, key, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    let id: string;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ block: "start", behavior: "instant" });
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, key, pathname]);
  return null;
}
