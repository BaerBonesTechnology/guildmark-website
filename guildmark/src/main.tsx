import { createRoot } from "react-dom/client";
import { initializeRemoteFeatures } from "./app/config";
import "./styles/index.css";
import "./i18n/index"; // initialise i18next before the app renders

const root = createRoot(document.getElementById("root")!);
root.render(
  <div className="gm-container" role="status" style={{ paddingTop: 48 }}>
    Loading GuildMark�
  </div>,
);

// Remote flags must resolve before module-level route arrays are built.
async function bootstrap() {
  await initializeRemoteFeatures();
  const { default: App } = await import("./app/App.tsx");
  root.render(<App />);
}
void bootstrap();
