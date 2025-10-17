import {
  AppConfig,
  Lang,
  PanelCollapseRecord,
  TimestampData,
} from "./localStorageSchema";

// timestamp の型チェックを行う関数
const isTimestamp = (value: unknown): value is number => {
  return typeof value === "number";
};

/**
 * タイムスタンプ付きデータの型判定を行う高階関数
 * 下記のようなデータ構造のものの判定を行う
 *
 * ```ts
 * const obj = {
 *      data: T, // こっちはisDataValid引数に渡されるチェック関数で判定
 *      timestamp: number // こっちはこの関数内で判定
 * }
 * ```
 * @param isDataValid タイムスタンプに関連づける`data`の型ガード
 * @returns すべての型ガードが`true`だった場合`true`
 */
export const isTimestampData =
  <T>(isDataValid: (data: unknown) => data is T) =>
  (obj: unknown): obj is TimestampData<T> => {
    const record = obj as TimestampData<T>;

    return (
      record !== null &&
      typeof record === "object" &&
      isTimestamp(record.timestamp) &&
      isDataValid(record.data)
    );
  };

/**
 * 引数の値が文字列かどうかを確認する
 * @param value 判定する値
 */
export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

/**
 * 引数の値が数値かどうかを確認する
 * @param value 判定する値
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

/**
 * 引数の値が`object`かどうかを確認する
 * @param value
 */
export const isObject = (value: unknown): value is object => {
  if (!value) return false;
  return typeof value === "object";
};

/**
 * 引数の値が`boolean`かどうかを確認する
 * @param value 判定する値
 */
export const isBoolean = (value: unknown): value is object => {
  return typeof value === "boolean";
};

/**
 * 引数の値が`AppConfig`型かどうかを確認する
 * @param value 判定する値
 */
export const isConfig = (value: unknown): value is AppConfig => {
  const record = value as AppConfig;
  return (
    typeof record === "object" &&
    record !== null &&
    typeof record.selectors === "object" &&
    typeof record.strings === "object" &&
    typeof record.selectors.tableSpecific === "string" &&
    typeof record.selectors.dailyRows === "string" &&
    typeof record.selectors.scheduleCell === "string" &&
    typeof record.selectors.workedHoursCell === "string" &&
    typeof record.selectors.startEndCells === "string" &&
    typeof record.strings.flexKeyword === "string"
  );
};

/**
 * 引数の値が`PanelCollapseRecord`型かどうかを確認する
 * @param value 判定する値
 */
export const isPanelCollapse = (
  value: unknown
): value is PanelCollapseRecord => {
  return typeof value === "object" && value !== null;
};

/**
 * 引数の値が`Lang`型かどうかを確認する
 * @param value 判定する値
 */
export const isLang = (value: unknown): value is Lang => {
  return value === "ja" || value === "en";
};
