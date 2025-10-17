import {
  createLocalStorageHandlers,
  LocalStorageSchema,
} from "./localStorageHandler";
import { isConfig, isLang, isPanelCollapse } from "./typeCheckFunction";

/**
 * タイムスタンプ付きのデータの定義s
 */
export interface TimestampData<T> {
  timestamp: number;
  data: T;
}

/** パネル/カードの開閉状態 */
export type PanelCollapseRecord = Record<string, boolean>;

/** セレクタなどユーザーが変更できる設定値 */
export interface AppConfig {
  /** セレクタ */
  selectors: {
    /** 勤務表テーブルを示す基底セレクタ */
    tableSpecific: string;
    /** 勤務表の日次行を取得するセレクタ */
    dailyRows: string;
    /** スケジュールセル（"td.schedule" 相当） */
    scheduleCell: string;
    /** 作業時間セル（"td.custom3, td.custom18" 相当） */
    workedHoursCell: string;
    /** 出社/退社時間セル（"td.start_end_timerecord" 相当） */
    startEndCells: string;
  };
  /** 文字列 */
  strings: {
    /** スケジュール列に表示されるフレックス判定用文字列 */
    flexKeyword: string;
  };
}

/** アプリの初期設定値 */
export const DEFAULT_CONFIG: AppConfig = {
  selectors: {
    tableSpecific: ".specific-table_800",
    dailyRows: ".htBlock-adjastableTableF tbody tr",
    scheduleCell: "td.schedule",
    workedHoursCell: "td.custom3, td.custom18",
    startEndCells: "td.start_end_timerecord",
  },
  strings: {
    flexKeyword: "フレックス",
  },
};

export type Lang = "ja" | "en";

/**
 *localStorageのスキーマの型定義
 */
type Schema = {
  /** パネル/カードの開閉状態 */
  panelCollapse: PanelCollapseRecord;
  /** 各種セレクタや文字列を保持する設定 */
  config: AppConfig;
  /** UI言語 */
  lang: Lang;
};

/**
 * localStorageの実際の値を設定する
 * デフォルト値と型チェック関数をペアで指定
 */
const schema: LocalStorageSchema<Schema> = {
  panelCollapse: {
    defaultValue: {},
    typeCheckFunction: isPanelCollapse,
  },
  config: {
    defaultValue: DEFAULT_CONFIG,
    typeCheckFunction: isConfig,
  },
  lang: {
    defaultValue: "ja",
    typeCheckFunction: isLang,
  },
};

/**
 * ローカルストレージに対して型安全を保証するハンドラー
 *
 * このプロジェクトでローカルストレージを利用する場合はこれを噛ませるように
 *
 * **定義、利用方法**
 *
 * 1. `localStorageSchema.ts`に保存するオブジェクトを定義
 * 2. `type Schema`に 1 で定義した方を保有するkeyを追加（以降、このkeyでローカルストレージにアクセスする
 * 3. 2をすると`const schema`で型エラーが発生するはずなので、keyとそれに属する`defaultValue`, `typeCheckFunction`を定義する
 *
 * タイムスタンプ付きオブジェクトとする場合は`type TimestampData<T>`型と`const isTimestampData`関数を利用してください
 *
 * @example
 * type Name = { name: string };
 * type TimestampName = TimestampData<Name>;
 *
 * type Schema = {
 *     ...
 *     name: Name,
 *     timestampName: TimestampName
 * };
 *
 * // 通常の型ガード関数
 * const isName = (obj: unknown) is Name => {
 *     return typeof record === "object" && typeof record.name === "string";
 * };
 *
 * const schema: LocalStorageSchema<Schema> = {
 *     // サンプル
 *     name: {
 *         // ローカルストレージに値がない場合に返す値
 *         defaultValue: { name: "" },
 *         typeCheckFunction: isName
 *     },
 *     // タイムスタンプ付きサンプル
 *     timestampName: {
 *         // `defaultValue: null`でもok
 *         defaultValue: {
 *             timestamp: 0
 *             data: { timestampName: "" }
 *         },
 *         typeCheckFunction: isTimestampData(isName)
 *     }
 * };
 */
export const localStorageHandlers = createLocalStorageHandlers(schema);
