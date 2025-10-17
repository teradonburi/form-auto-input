import { describe, it, expect, beforeEach } from "vitest";
import { scanDailyTable } from "../src/dom/scanDaily";
import {
  localStorageHandlers,
  DEFAULT_CONFIG,
  AppConfig,
} from "../src/utils/localStorage/localStorageSchema";

// 便利関数: 現在日付 (MM/DD) を返す
const todayMMDD = (): string => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${month}/${day.toString().padStart(2, "0")}`;
};

/** テーブル HTML を生成するヘルパ. rows は [date, schedule, worked, start] */
const buildTable = (
  rows: Array<[string, string, string, string]>
) => {
  const htmlRows = rows
    .map(
      ([date, schedule, worked, start]) =>
        `<tr class="day">
            <td>${date}</td><td class="other"></td><td class="other"></td><td class="other"></td><td class="schedule">${schedule}</td><td class="worked">${worked}</td><td class="start_end">${start}</td>
        </tr>`
    )
    .join("");

  document.body.innerHTML = `
    <table class="tbl">
      <tbody>${htmlRows}</tbody>
    </table>`;
};

describe("scanDailyTable", () => {
  const cfg: AppConfig = {
    ...DEFAULT_CONFIG,
    selectors: {
      tableSpecific: ".tbl",
      dailyRows: "tr.day",
      scheduleCell: "td.schedule",
      workedHoursCell: "td.worked",
      startEndCells: "td.start_end",
    },
    strings: {
      flexKeyword: "フレックス",
    },
  };

  beforeEach(() => {
    // localStorage をクリーン
    localStorage.clear();
    localStorageHandlers.config.setValue(cfg);
    // JSDOM では innerText が未実装のため polyfill
    if (!("innerText" in HTMLElement.prototype)) {
      Object.defineProperty(HTMLElement.prototype as any, "innerText", {
        get() {
          return this.textContent ?? "";
        },
        set(v: string) {
          this.textContent = v;
        },
      });
    }
  });

  it("フレックス行のみを対象として統計を算出できる", () => {
    buildTable(
      [
        // 日付, スケジュール, 実働, 開始
        [todayMMDD(), "フレックス", "8:00", "09:00"], // 今日勤務済
        ["1/02", "フレックス", "", ""], // 未勤務
        ["1/03", "休暇", "8:00", "09:00"], // フレックスではない => 無視
      ]
    );

    const s = scanDailyTable();
    expect(s.completedDays).toBe(1);
    expect(s.remainingDays).toBe(1);
    expect(s.totalWorkedHours).toBeCloseTo(8);
    expect(s.todayWorkedHours).toBeCloseTo(8);
    // 開始時間 09:00 = 9h
    expect(s.todayStartHours).toBeCloseTo(9);
  });

  it("非フレックス行は無視される", () => {
    buildTable(
      [
        [todayMMDD(), "休暇", "8:00", "09:00"], // 休暇はフレックスではない
        ["1/02", "有給", "8:00", "09:00"], // 有給もフレックスではない
      ]
    );

    const s = scanDailyTable();
    expect(s.completedDays).toBe(0);
    expect(s.remainingDays).toBe(0);
    expect(s.totalWorkedHours).toBe(0);
  });

  it("実働時間が空の行は残り日数にカウントされる", () => {
    buildTable(
      [
        ["1/10", "フレックス", "", ""], // 実働時間空
        ["1/11", "フレックス", "--", "--"], // 実働時間無効
        ["1/12", "フレックス", "0:00", ""], // 実働0時間
      ]
    );

    const s = scanDailyTable();
    expect(s.completedDays).toBe(0);
    expect(s.remainingDays).toBe(3);
    expect(s.totalWorkedHours).toBe(0);
  });

  it("数値パースが正しく行われる", () => {
    buildTable(
      [
        ["1/01", "フレックス", "7:30", "08:30"], // 7.5h
        ["1/02", "フレックス", "8:15", "09:00"], // 8.25h
        ["1/03", "フレックス", "9:45", "08:00"], // 9.75h
      ]
    );

    const s = scanDailyTable();
    expect(s.completedDays).toBe(3);
    expect(s.totalWorkedHours).toBeCloseTo(25.5); // 7.5 + 8.25 + 9.75
  });

  it("月跨ぎの日付でも正しく処理される", () => {
    const nextYearDate = `1/01`; // 来年1月01日と仮定
    
    buildTable(
      [
        [nextYearDate, "フレックス", "8:00", "09:00"],
      ]
    );

    const s = scanDailyTable();
    // 今日ではないのでtodayWorkedHoursは0
    expect(s.todayWorkedHours).toBe(0);
    expect(s.totalWorkedHours).toBe(8);
  });

  it("テーブルが空の場合でもエラーにならない", () => {
    document.body.innerHTML = `<table class="tbl"><tbody></tbody></table>`;
    
    const s = scanDailyTable();
    expect(s.completedDays).toBe(0);
    expect(s.remainingDays).toBe(0);
    expect(s.totalWorkedHours).toBe(0);
    expect(s.todayWorkedHours).toBe(0);
    expect(s.todayStartHours).toBeUndefined();
  });
});
