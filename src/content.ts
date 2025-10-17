import "./style.css";
import "./reactRoot";

import { scanDailyTable } from "./dom/scanDaily";
import { calculateStats } from "./functions/calculateStats";
import { dbg } from "./utils/dom";
import { getSelectors } from "./dom/selectors";

// 5分ごとに再計算
const POLL_INTERVAL_MS = 5 * 60 * 1000;
// 変更検知後に何度も計算が走らないよう適度に遅延させる
const OBSERVER_DEBOUNCE_MS = 300;

const runOnce = () => {
  const scan = scanDailyTable();
  const stats = calculateStats(scan);

  dbg("computed", stats);

  window.updateStats?.(stats);
};

// DOM 構築待ち & ポーリング
const waitAndStart = () => {
  const rowsReady =
    document.querySelectorAll(getSelectors().dailyRows).length > 0;
  if (rowsReady) {
    runOnce();
    setInterval(runOnce, POLL_INTERVAL_MS);

    // --- リアルタイム再計算用 MutationObserver ---
    try {
      const target =
        document.querySelector(getSelectors().dailyRows)?.parentElement ??
        document.body;
      let timer: number | undefined;
      const debounced = () => {
        if (timer) clearTimeout(timer);
        timer = window.setTimeout(() => {
          runOnce();
        }, OBSERVER_DEBOUNCE_MS);
      };

      const observer = new MutationObserver(() => debounced());
      observer.observe(target, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    } catch (err) {
      console.error("MutationObserver setup failed", err);
    }
  } else {
    setTimeout(waitAndStart, 500);
  }
};

waitAndStart();
