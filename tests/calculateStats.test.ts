import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateStats } from "../src/functions/calculateStats";
import { DailyScanSummary } from "../src/dom/scanDaily";

// モック: DOM から参照される getText / getSelectors を置き換え
vi.mock("../src/utils/dom", () => ({
  getText: vi.fn(() => "160:00"), // 所定労働時間 160h
}));

vi.mock("../src/dom/selectors", () => ({
  getSelectors: () => ({
    scheduledHoursCell: "td.scheduled", // ダミー
    alt1: "td.alt1",
    alt2: "td.alt2",
  }),
}));

describe("calculateStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sample: DailyScanSummary = {
    completedDays: 5,
    remainingDays: 15,
    todayWorkedHours: 0,
    totalWorkedHours: 40, // 40h 実働
    todayStartHours: undefined,
  };

  let stats = calculateStats(sample);

  it("所定労働時間を正しく計算できる", () => {
    expect(stats.scheduledHours).toBe(160);
  });

  it("フレックスバランスを正しく計算できる", () => {
    // 1日あたり基準 160/20 = 8h, 5日経過 → 40h
    // flexBalance = totalWorkedHours - expectedUntilNow = 40 - 40 = 0
    expect(stats.flexBalanceHours).toBeCloseTo(0);
  });

  it("残り必要時間を正しく計算できる", () => {
    // 残り必要時間 = 160 - 40 = 120
    expect(stats.remainingScheduledHours).toBeCloseTo(120);
  });

  it("平均実働時間を正しく計算できる", () => {
    // 総実働40h ÷ 完了日数5日 = 8h/日
    expect(stats.averageWorkedHoursPerDay).toBeCloseTo(8);
  });

  it("必要な日次平均を正しく計算できる", () => {
    // 残り必要120h ÷ 残り日数15日 = 8h/日
    expect(stats.requiredDailyAverage).toBeCloseTo(8);
  });

  it("残業上限を正しく計算できる", () => {
    // 所定160h + 上限45h = 205h
    expect(stats.maxAllowedWorkHours).toBe(205);
    // 残り残業可能時間 = 205 - 40 = 165h
    expect(stats.remainingOvertimeHours).toBe(165);
  });

  it("今日の開始時間がある場合の目標退勤時間を計算できる", () => {
    const sampleWithStart: DailyScanSummary = {
      ...sample,
      todayStartHours: 9, // 9:00開始
    };
    const statsWithStart = calculateStats(sampleWithStart);
    // 9:00 + 8h(日次基準) = 17:00
    expect(statsWithStart.todayTargetExitTime).toBe("17:00");
  });

  it("完了日数が0の場合でもエラーにならない", () => {
    const zeroCompleted: DailyScanSummary = {
      completedDays: 0,
      remainingDays: 20,
      todayWorkedHours: 0,
      totalWorkedHours: 0,
      todayStartHours: undefined,
    };
    const zeroStats = calculateStats(zeroCompleted);
    expect(zeroStats.averageWorkedHoursPerDay).toBe(0);
    expect(zeroStats.flexBalanceHours).toBe(0);
  });

  it("残り日数が0の場合でもエラーにならない", () => {
    const zeroRemaining: DailyScanSummary = {
      completedDays: 20,
      remainingDays: 0,
      todayWorkedHours: 8,
      totalWorkedHours: 160,
      todayStartHours: undefined,
    };
    const zeroStats = calculateStats(zeroRemaining);
    expect(zeroStats.requiredDailyAverage).toBe(0);
    expect(zeroStats.remainingScheduledHours).toBe(0);
  });
});
