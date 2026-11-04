import { createContext, useContext } from "react";
export const PortalBaseContext = createContext("");
export function usePortalPath() {
  const base = useContext(PortalBaseContext);
  return (path: string) => `${base}${path === "/" ? "" : path}` || "/";
}
