# freee 勤怠管理 Plus Plus

freee 勤怠管理 Plus でフレックスタイム残高を即座に確認できる Chrome / Edge 拡張機能。

## ビルド手順

```bash
npm install   # or npm ci / yarn
npm run build # `dist/` に manifest & content.js を生成
```

Edge の場合は `edge://extensions` → 「デベロッパーモード」→「パッケージ化されていない拡張機能を読み込む」で `dist/` を指定。

## 開発時ウォッチ

```bash
npm run dev
```

ブラウザ拡張をリロード (`Ctrl+R` in 拡張管理ページ) して動作確認。

## 設定項目 (localStorage)

拡張機能内の「設定」カードを通じて変更した値は `localStorage` に保存されます。

- **config** – 勤務表テーブルの CSS セレクタやフレックス判定用キーワード
- **panelCollapse** – 各パネル / カードの開閉状態
- **lang** – UI 言語（`ja` / `en`）

ブラウザの DevTools ▶︎ Application ▶︎ Local Storage から直接確認・編集できます。

---

### 免責

個人利用目的のサンプルです。公式 UI の仕様変更で動作しなくなる可能性があります。
