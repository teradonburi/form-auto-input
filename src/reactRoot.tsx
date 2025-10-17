import { createRoot } from "react-dom/client";
import "./i18n";
import { Panel } from "./components/Panel";
import { Stats } from "./types/stats";

const container = document.createElement("div");
container.id = "ftbv-root-react";
document.body.appendChild(container);

const root = createRoot(container);

// 初回は全ページで右側に「あああ」を表示
root.render(
  <div
    style={{
      position: "fixed",
      top: "20vh",
      right: 16,
      zIndex: 2147483647,
      backgroundColor: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: 4,
      padding: "6px 10px",
      minWidth: 60,
      textAlign: "center",
      boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
    }}
  >
    あああ
  </div>
);

console.log("reactRoot");

window.updateStats = (stats: Stats) => {
  root.render(<Panel stats={stats} />);
};
