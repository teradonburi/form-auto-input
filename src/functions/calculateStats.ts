import { DailyScanSummary } from "../dom/scanDaily";
import { parseHours, hoursToHHMM } from "./parser";
import { getText } from "../utils/dom";
import { getSelectors } from "../dom/selectors";
import { Stats } from "../types/stats";

const OVERTIME_LIMIT_MONTHLY = 45; // h

export const calculateStats = (scan: DailyScanSummary): Stats => {
  const data: Stats = {
    flexBalanceHours: 0,
    totalWorkedHours: 0,
    scheduledHours: 0,
    averageWorkedHoursPerDay: 0,
    remainingScheduledHours: 0,
    remainingWorkDays: 0,
    requiredDailyAverage: 0,
    totalWorkDays: 0,
    completedWorkDays: 0,
    remainingOvertimeHours: 0,
    maxAllowedWorkHours: 0,
    todayTargetExitTime: undefined,
  };

  // 所定労働時間
  const sel = getSelectors();
  data.scheduledHours = (() => {
    const raw = getText(sel.scheduledHoursCell);
    let h = parseHours(raw);
    if (h === 0) {
      const alt1 = getText(sel.alt1);
      const alt2 = getText(sel.alt2);
      h = parseHours(alt1) || parseHours(alt2);
    }
    return h;
  })();

  // 実績関連
  data.totalWorkedHours = scan.totalWorkedHours;

  // 勤務日情報
  data.completedWorkDays = scan.completedDays;
  data.remainingWorkDays = scan.remainingDays;
  data.totalWorkDays = data.completedWorkDays + data.remainingWorkDays;

  // 上限・残業関連
  data.maxAllowedWorkHours = data.scheduledHours + OVERTIME_LIMIT_MONTHLY;
  data.remainingOvertimeHours = Math.max(
    0,
    data.maxAllowedWorkHours - data.totalWorkedHours
  );

  // 平均・残時間計算
  const dailyExpected = data.totalWorkDays
    ? data.scheduledHours / data.totalWorkDays
    : 0;

  const expectedUntilNow = dailyExpected * data.completedWorkDays;
  data.flexBalanceHours = data.totalWorkedHours - expectedUntilNow;

  data.averageWorkedHoursPerDay = data.completedWorkDays
    ? data.totalWorkedHours / data.completedWorkDays
    : 0;

  data.remainingScheduledHours = Math.max(
    0,
    data.scheduledHours - data.totalWorkedHours
  );

  data.requiredDailyAverage = data.remainingWorkDays
    ? data.remainingScheduledHours / data.remainingWorkDays
    : 0;

  if (scan.todayStartHours !== undefined) {
    data.todayTargetExitTime = hoursToHHMM(
      scan.todayStartHours + dailyExpected
    );
  }

  return data;
};
