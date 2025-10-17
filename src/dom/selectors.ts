import { localStorageHandlers } from "../utils/localStorage/localStorageSchema";

/**
 * 最新の設定をもとにセレクタ文字列を生成して返す
 */
export const getSelectors = () => {
  const cfg = localStorageHandlers.config.getValue();
  const TABLE_SPECIFIC = cfg.selectors.tableSpecific;

  return {
    scheduledHoursCell: `${TABLE_SPECIFIC} tbody tr td:nth-child(4)`,
    alt1: `${TABLE_SPECIFIC} tbody tr td:first-child`,
    alt2: `${TABLE_SPECIFIC} tbody tr td.htBlock-normalTable_splitter`,
    dailyRows: cfg.selectors.dailyRows,
    scheduleCell: cfg.selectors.scheduleCell,
    workedHoursCell: cfg.selectors.workedHoursCell,
    startEndCells: cfg.selectors.startEndCells,
  } as const;
};
