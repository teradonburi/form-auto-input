import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { localStorageHandlers } from "./utils/localStorage/localStorageSchema";

const resources = {
  ja: {
    translation: {
      flexBalance: "フレックス残高",
      overtime: "勤務可能時間",
      details: "詳細",
      average: "平均",
      remainingHours: "不足時間",
      calcBasis: "計算の詳細",
      workingDays: "勤務日数",
      requiredAverage: "必要平均",
      targetExit: "今日退勤目安",
      settings: "設定",
      selectorSettings: "セレクタ設定",
      keywordSettings: "キーワード設定",
      reset: "初期化",
      tableSpecific: "勤務表テーブル基底セレクタ",
      dailyRows: "日次行セレクタ",
      scheduleCell: "スケジュールセルセレクタ",
      workedHoursCell: "実働時間セルセレクタ",
      startEndCells: "開始/終了時間セルセレクタ",
      flexKeyword: "フレックス判定キーワード",
      others: "その他",
      language: "言語",
      averageValue: "{{value}} h/日",
      remainingValue: "{{value}} h (残 {{days}} 日)",
      workingDaysValue: "{{completed}} / {{total}} 日",
      requiredAverageValue: "{{value}} h/日",
      calcFlex: "フレックス残高の計算",
      calcOvertime: "残業可能時間の計算",
      calcRequiredAvg: "必要平均勤務時間の計算",
      monthlyScheduledHours: "所定労働時間（月）",
      monthlyWorkedHours: "実働時間（月）",
      dailyExpectedFormula:
        "1 日あたり基準勤務時間 = 所定労働時間 ÷ 総勤務日数 = {{sh}} ÷ {{days}} = {{daily}} h",
      expectedUntilNowFormula:
        "これまでの基準勤務時間 = 1 日あたり基準勤務時間 × 出勤済日数 = {{daily}} × {{completed}} = {{until}} h",
      flexBalanceFormula:
        "フレックス残高 = 実働時間 − これまでの基準勤務時間 = {{worked}} − {{until}} = {{balance}} h",
      overtimeLimitLabel: "36 協定上限 (月) = {{limit}} h",
      maxAllowedFormula:
        "最大許容実働時間 = 所定労働時間 + 36 協定上限 = {{sh}} + {{limit}} = {{max}} h",
      remainingOTFormula:
        "残業可能時間 = 最大許容実働時間 − 実働時間 = {{max}} − {{worked}} = {{remain}} h",
      remainingScheduledFormula:
        "残り必要勤務時間 = 所定労働時間 − 実働時間 = {{sh}} − {{worked}} = {{remaining}} h",
      remainingDaysLabel: "残勤務日数: {{days}} 日",
      requiredDailyAvgFormula:
        "必要平均勤務時間 = 残り必要勤務時間 ÷ 残勤務日数 = {{remaining}} ÷ {{days}} = {{avg}} h",
    },
  },
  en: {
    translation: {
      flexBalance: "Flex balance",
      overtime: "Available working time",
      details: "Details",
      average: "Average",
      remainingHours: "Remaining hours",
      calcBasis: "Calculation Details",
      workingDays: "Working days",
      requiredAverage: "Required average",
      targetExit: "Today's target exit time",
      settings: "Settings",
      selectorSettings: "Selector settings",
      keywordSettings: "Keyword settings",
      reset: "Reset",
      tableSpecific: "Base selector of attendance table",
      dailyRows: "Daily row selector",
      scheduleCell: "Schedule cell selector",
      workedHoursCell: "Worked hours cell selector",
      startEndCells: "Start/End time cell selector",
      flexKeyword: "Flex identification keyword",
      others: "Others",
      language: "Language",
      averageValue: "{{value}} h/day",
      remainingValue: "{{value}} h ({{days}} days left)",
      workingDaysValue: "{{completed}} / {{total}} days",
      requiredAverageValue: "{{value}} h/day",
      calcFlex: "Flex balance calculation",
      calcOvertime: "Overtime limit calculation",
      calcRequiredAvg: "Required average working hours calculation",
      monthlyScheduledHours: "Scheduled hours (month)",
      monthlyWorkedHours: "Worked hours (month)",
      dailyExpectedFormula:
        "Standard hours per day = scheduled hours ÷ total work days = {{sh}} ÷ {{days}} = {{daily}} h",
      expectedUntilNowFormula:
        "Standard hours up to now = standard hours per day × completed days = {{daily}} × {{completed}} = {{until}} h",
      flexBalanceFormula:
        "Flex balance = worked hours − standard hours up to now = {{worked}} − {{until}} = {{balance}} h",
      overtimeLimitLabel: "Legal overtime limit (month) = {{limit}} h",
      maxAllowedFormula:
        "Maximum allowed work hours = scheduled hours + overtime limit = {{sh}} + {{limit}} = {{max}} h",
      remainingOTFormula:
        "Remaining overtime hours = maximum allowed − worked hours = {{max}} − {{worked}} = {{remain}} h",
      remainingScheduledFormula:
        "Remaining required hours = scheduled hours − worked hours = {{sh}} − {{worked}} = {{remaining}} h",
      remainingDaysLabel: "Remaining work days: {{days}} days",
      requiredDailyAvgFormula:
        "Required daily average = remaining required hours ÷ remaining work days = {{remaining}} ÷ {{days}} = {{avg}} h",
    },
  },
} as const;

const stored = localStorageHandlers.lang.getValue();
const initialLng =
  stored ?? (navigator.language?.startsWith("en") ? "en" : "ja");

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: "ja",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  if (lng === "ja" || lng === "en") {
    localStorageHandlers.lang.setValue(lng);
  }
});

export default i18n;
