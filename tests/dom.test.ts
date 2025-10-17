import { describe, it, expect, vi, beforeEach } from "vitest";
import { getText, dbg } from "../src/utils/dom";

describe("dom utilities", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    // Polyfill for innerText in jsdom
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

  describe("getText", () => {
    it("要素が存在する場合はinnerTextを返す", () => {
      document.body.innerHTML = `<div class="test">テスト文字列</div>`;
      
      const result = getText(".test");
      expect(result).toBe("テスト文字列");
    });

    it("要素が存在しない場合はnullを返す", () => {
      const result = getText(".nonexistent");
      expect(result).toBeNull();
    });

    it("複数の要素がある場合は最初の要素のテキストを返す", () => {
      document.body.innerHTML = `
        <div class="multi">最初</div>
        <div class="multi">2番目</div>
      `;
      
      const result = getText(".multi");
      expect(result).toBe("最初");
    });

    it("空のテキストも正しく処理される", () => {
      document.body.innerHTML = `<div class="empty"></div>`;
      
      const result = getText(".empty");
      expect(result).toBe("");
    });

    it("ネストした要素のテキストも取得できる", () => {
      document.body.innerHTML = `
        <div class="parent">
          親テキスト
          <span>子テキスト</span>
          親テキスト2
        </div>
      `;
      
      const result = getText(".parent");
      expect(result?.trim()).toContain("親テキスト");
      expect(result?.trim()).toContain("子テキスト");
    });
  });

  describe("dbg", () => {
    it("デバッグログが出力される", () => {
      const consoleSpy = vi.spyOn(console, "log");
      
      dbg("テストメッセージ", { key: "value" });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "[FTBV]",
        "テストメッセージ",
        { key: "value" }
      );
      
      consoleSpy.mockRestore();
    });

    it("複数の引数を渡すことができる", () => {
      const consoleSpy = vi.spyOn(console, "log");
      
      dbg("メッセージ1", "メッセージ2", 123, { test: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "[FTBV]",
        "メッセージ1",
        "メッセージ2",
        123,
        { test: true }
      );
      
      consoleSpy.mockRestore();
    });
  });
});