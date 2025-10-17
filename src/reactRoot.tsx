import { createRoot } from "react-dom/client";
import "./i18n";
import { Panel } from "./components/Panel";
import { Stats } from "./types/stats";

const container = document.createElement("div");
container.id = "ftbv-root-react";
document.body.appendChild(container);

const root = createRoot(container);

// 初回は placeholder を描画
root.render(<></>);

window.updateStats = (stats: Stats) => {
  root.render(<Panel stats={stats} />);
};
