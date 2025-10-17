import { parseHours } from "../functions/parser";
import { getSelectors } from "./selectors";
import { dbg } from "../utils/dom";
import { localStorageHandlers } from "../utils/localStorage/localStorageSchema";

export interface DailyScanSummary {
  completedDays: number;
  remainingDays: number;
  todayWorkedHours: number;
  todayStartHours?: number;
  totalWorkedHours: number;
}

/** 勤務表の行を走査し、日次情報を集計 */
export const scanDailyTable = (): DailyScanSummary => {
  const sel = getSelectors();
  const rows = Array.from<HTMLTableRowElement>(
    document.querySelectorAll(sel.dailyRows)
  );

  dbg("dailyRows", rows.length);

  const today = new Date();
  let completedDays = 0;
  let remainingDays = 0;
  let todayWorkedHours = 0;
  let totalWorkedHours = 0;
  let todayStartHours: number | undefined;

  // 設定値
  const cfg = localStorageHandlers.config.getValue();

  rows.forEach((tr) => {
    const dateText = tr.cells[0]?.innerText.trim();
    const scheduleText = tr
      .querySelector<HTMLTableCellElement>(sel.scheduleCell)
      ?.innerText.trim();
    dbg("row", { dateText, scheduleText });
    if (scheduleText !== cfg.strings.flexKeyword) return;

    const workedText = tr
      .querySelector<HTMLTableCellElement>(sel.workedHoursCell)
      ?.innerText.trim();

    if (!dateText) return;
    const [mm, dd] = dateText.split("/").map(Number);
    const rowDate = new Date(today.getFullYear(), mm - 1, dd);

    const workedHours = parseHours(workedText);
    if (workedHours > 0) completedDays += 1;
    else remainingDays += 1;

    if (rowDate.toDateString() === today.toDateString()) {
      todayWorkedHours = workedHours;
      const startCells = tr.querySelectorAll<HTMLTableCellElement>(
        sel.startEndCells
      );
      const startText = startCells[0]?.innerText.trim();
      todayStartHours = parseHours(startText);
    }

    totalWorkedHours += workedHours;
  });

  return {
    completedDays,
    remainingDays,
    todayWorkedHours,
    todayStartHours,
    totalWorkedHours,
  };
};
