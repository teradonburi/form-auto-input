class LocalStorageHandler<T> {
  private typeCheckFunction: (obj: unknown) => obj is T;

  constructor(
    private key: string,
    private defaultValue: T,
    typeCheckFunction: (obj: unknown) => obj is T
  ) {
    this.typeCheckFunction = typeCheckFunction;
  }

  /**
   * localStorageから値を取得する
   * @returns keyに対応した型安全が保証された値
   */
  public getValue(): T {
    if (typeof window === "undefined") return this.defaultValue;

    try {
      const item = localStorage.getItem(this.key);
      if (item) {
        const parsedItem = JSON.parse(item) as unknown;
        const isValidOriginal = this.typeCheckFunction(parsedItem);

        // スキーマ拡張時のマイグレーション: 欠損キーを defaultValue で補完
        let migrated = this.deepMerge(this.defaultValue, parsedItem) as T;

        // 無効な JSON 構造だった場合は未知キーを除去
        if (!isValidOriginal) {
          migrated = this.stripUnknown(this.defaultValue, migrated) as T;
        }

        if (this.typeCheckFunction(migrated)) {
          if (JSON.stringify(migrated) !== item) {
            localStorage.setItem(this.key, JSON.stringify(migrated));
          }
          return migrated;
        }
      }
    } catch (error) {
      console.error(
        `key: "${this.key}" を localStorage から読み取ることができませんでした`,
        error
      );
    }
    return this.defaultValue;
  }

  /**
   * 指定したスキーマに対して値を格納する
   * スキーマで定義した値のみ代入可能
   * @param value ローカルストレージに格納する値
   */
  public setValue(value: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(value));
    } catch (error) {
      console.error(
        `key: "${this.key}" を localStorage に格納することができませんでした`,
        error
      );
    }
  }

  /**
   * 指定したスキーマの保存済みの値を削除する
   */
  public remove(): void {
    localStorage.removeItem(this.key);
  }

  /** defaultValue と既存データを再帰的にマージし、欠損キーを補完する */
  private deepMerge = (base: unknown, override: unknown): unknown => {
    // 原始値・null・配列は override 優先で上書き
    if (
      typeof base !== "object" ||
      base === null ||
      Array.isArray(base) ||
      typeof override !== "object" ||
      override === null ||
      Array.isArray(override)
    ) {
      return override ?? base;
    }

    const merged: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) {
      merged[key] = this.deepMerge(
        (base as Record<string, unknown>)[key],
        (override as Record<string, unknown>)[key]
      );
    }

    // 追加キー（schema 拡張で default に無いキーが override にあるケース）
    for (const key of Object.keys(override as Record<string, unknown>)) {
      if (!(key in merged))
        merged[key] = (override as Record<string, unknown>)[key];
    }
    return merged;
  };

  /** base に存在しないキーを除外して新オブジェクトを返す */
  private stripUnknown = (base: unknown, obj: unknown): unknown => {
    if (typeof base !== "object" || base === null || Array.isArray(base))
      return obj;
    if (typeof obj !== "object" || obj === null || Array.isArray(obj))
      return obj;

    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(base)) {
      if (key in obj) {
        cleaned[key] = this.stripUnknown(
          (base as Record<string, unknown>)[key],
          (obj as Record<string, unknown>)[key]
        );
      } else {
        cleaned[key] = (base as Record<string, unknown>)[key];
      }
    }
    return cleaned;
  };
}

export type LocalStorageHandlers<S> = {
  [K in keyof S]: LocalStorageHandler<S[K]>;
};

export type LocalStorageSchema<S> = {
  [K in keyof S]: {
    /** ローカストレージに未格納もしくは値が不正に書き換えられている（構造が違う）場合に返す値, `null`でもOK */
    defaultValue: S[K];
    /** ローカスストレージに格納された値の検証を行う型ガード関数 */
    typeCheckFunction: (obj: unknown) => obj is S[K];
  };
};

/**
 * 定義されたスキーマから対応するkeyのインスタンスを生成して返す
 * @param schema ローカスストレージ定義
 * @returns インスタンス生成済みのハンドレーオブジェクト
 */
export const createLocalStorageHandlers = <S>(
  schema: LocalStorageSchema<S>
): LocalStorageHandlers<S> => {
  const handlers = {} as LocalStorageHandlers<S>;

  for (const key in schema) {
    const { defaultValue, typeCheckFunction } = schema[key];

    handlers[key] = new LocalStorageHandler<S[typeof key]>(
      key,
      defaultValue,
      typeCheckFunction
    );
  }

  return handlers;
};
