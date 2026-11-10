import { useEffect, useState } from "react";
export type ThemePreference = "system" | "light" | "dark";
const read = (): ThemePreference => {
  try {
    const p = localStorage.getItem("theme");
    return p === "light" || p === "dark" ? p : "system";
  } catch {
    return "system";
  }
};
export function useTheme() {
  const [preference, update] = useState<ThemePreference>(read);
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => update(read());
    const change = () => setSystemDark(media.matches);
    media.addEventListener("change", change);
    window.addEventListener("storage", sync);
    window.addEventListener("guildmark-theme", sync);
    return () => {
      media.removeEventListener("change", change);
      window.removeEventListener("storage", sync);
      window.removeEventListener("guildmark-theme", sync);
    };
  }, []);
  const theme =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const setPreference = (p: ThemePreference) => {
    try {
      localStorage.setItem("theme", p);
    } catch {}
    update(p);
    window.dispatchEvent(new Event("guildmark-theme"));
  };
  return {
    theme,
    preference,
    setPreference,
    toggleTheme: () => setPreference(theme === "dark" ? "light" : "dark"),
  };
}
