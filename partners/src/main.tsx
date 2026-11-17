import { createRoot } from "react-dom/client";
const main = import.meta.env.VITE_MAIN_SITE_URL;
if (main) window.location.replace(new URL("/partners", main).toString());
else createRoot(document.getElementById("root")!).render(<p>This workspace is part of the main GuildMark website. Open /partners on the main site.</p>);
