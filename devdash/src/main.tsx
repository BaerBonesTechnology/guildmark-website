import { createRoot } from "react-dom/client";
const main = import.meta.env.VITE_MAIN_SITE_URL;
if (main) window.location.replace(new URL("/admin", main).toString());
else createRoot(document.getElementById("root")!).render(<p>This workspace is part of the main GuildMark website. Open /admin on the main site.</p>);
