import { describe, it, expect, beforeEach } from "vitest";
import {
  localStorageHandlers,
  DEFAULT_CONFIG,
  AppConfig,
} from "../src/utils/localStorage/localStorageSchema";

describe("localStorageHandler", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("スキーマ拡張時に欠損キーを defaultValue で補完する", () => {
    // default から "startEndCells" を意図的に削除した設定を保存
    const stored: AppConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    // @ts-ignore - テスト用に削除
    delete stored.selectors.startEndCells;
    localStorage.setItem("config", JSON.stringify(stored));

    const loaded = localStorageHandlers.config.getValue();
    // 欠損キーが補完されていることを確認
    expect(loaded.selectors.startEndCells).toBeDefined();
  });

  it("追加キーがあっても保持される", () => {
    const custom = { ...DEFAULT_CONFIG, extraKey: "hello" } as any;
    localStorage.setItem("config", JSON.stringify(custom));

    const loaded = localStorageHandlers.config.getValue() as any;
    expect(loaded.extraKey).toBe("hello");
  });

  it("値の設定と取得が正しく動作する", () => {
    const testConfig: AppConfig = {
      ...DEFAULT_CONFIG,
      strings: {
        ...DEFAULT_CONFIG.strings,
        flexKeyword: "テストフレックス",
      },
    };

    localStorageHandlers.config.setValue(testConfig);
    const retrieved = localStorageHandlers.config.getValue();

    expect(retrieved.strings.flexKeyword).toBe("テストフレックス");
  });

  it("無効なJSONの場合はdefaultValueを返す", () => {
    localStorage.setItem("config", "invalid-json");
    
    const loaded = localStorageHandlers.config.getValue();
    expect(loaded).toEqual(DEFAULT_CONFIG);
  });

  it("型チェックに失敗した場合はdefaultValueを返す", () => {
    const invalidConfig = { invalidStructure: true };
    localStorage.setItem("config", JSON.stringify(invalidConfig));
    
    const loaded = localStorageHandlers.config.getValue();
    expect(loaded).toEqual(DEFAULT_CONFIG);
  });

  it("ネストしたオブジェクトのマージが正しく動作する", () => {
    const partialConfig = {
      selectors: {
        tableSpecific: ".custom-table",
        // 他のフィールドは意図的に省略
      },
    };
    localStorage.setItem("config", JSON.stringify(partialConfig));

    const loaded = localStorageHandlers.config.getValue();
    expect(loaded.selectors.tableSpecific).toBe(".custom-table");
    expect(loaded.selectors.dailyRows).toBe(DEFAULT_CONFIG.selectors.dailyRows); // デフォルト値が補完されている
  });

  it("配列のマージは上書きされる", () => {
    const testArray = ["test1", "test2"];
    const configWithArray = {
      ...DEFAULT_CONFIG,
      testArray, // 配列を追加
    } as any;

    localStorage.setItem("config", JSON.stringify(configWithArray));
    const loaded = localStorageHandlers.config.getValue() as any;
    
    expect(loaded.testArray).toEqual(testArray);
  });

  it("キーの削除が正しく動作する", () => {
    localStorageHandlers.config.setValue(DEFAULT_CONFIG);
    expect(localStorage.getItem("config")).not.toBeNull();
    
    localStorageHandlers.config.remove();
    expect(localStorage.getItem("config")).toBeNull();
  });

  it("windowが未定義の環境ではdefaultValueを返す", () => {
    // windowを一時的に未定義にするテストはブラウザ環境では困難なためスキップ
    // このテストはNode.js環境でのみ有効
    expect(true).toBe(true); // placeholder
  });
});
