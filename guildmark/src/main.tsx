import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import "./i18n/index"; // initialise i18next before the app renders

createRoot(document.getElementById("root")!).render(<App />);
