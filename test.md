了解です。
「OpenAI APIで解析→入力までを自動化するChrome拡張」の**詳細設計**をまとめました。実装はTypeScript厳格モード（`noImplicitAny`等）・Manifest V3・React(+MUI)での設定画面/ポップアップを前提にしています。`any`は一切使わず、必要箇所は`unknown`＋ナローイングで扱います。

---

# 1. 目的/要件

## 1.1 目的

* 任意のWebフォームの**構造を解析**し、**ユーザー意図**と**ローカル保存プロファイル**から**入力値をAIで推論**して自動入力。
* ドメインごとの**マッピング学習（継続学習）**と**プライバシー管理**を行いつつ、ワンクリックで入力を完了。

## 1.2 機能要件

* 画面上のフォーム検出（`<form>`タグ以外も対応：モーダル、SPAの仮想フォーム等）。
* 各フィールドの**意味（氏名/住所/電話/会社/カード等）推定**。
* OpenAI APIを用いた**フィールド→値の推論**（JSON構造で厳格受領）。
* **自動入力モード**と**半自動（確認ダイアログ）モード**の切替。
* **ドメイン別マッピング辞書**（CSSセレクタ/role/label等）と**ユーザープロファイル**の保存・編集。
* **入力除外ルール/機密項目の確認**（例：クレカCVVは常に手入力 or 要確認）。
* 実行ログの閲覧（最後のN回）。
* 一時無効化、サイト単位のホワイト/ブラックリスト。
* i18n（最低限、英日）。
* 右側固定のサイドパネル（ページ内オーバーレイ）。
* OpenAI API通信のON/OFFトグル（右側UI）。OFF時はAIを呼ばず、各フィールドにデモ用のプレースホルダ（例："DEMO"、"サンプル太郎"、"example@example.com" 等）を充填。

## 1.3 非機能要件

* **セキュリティ/プライバシー**：既定で**機密項目は送信しない**（オプトイン）。送信時はマスキング・同意必須。
* **パフォーマンス**：解析は**差分更新**、DOM大量監視は`MutationObserver`で節度あるスロットリング。
* **堅牢性**：オフライン/429/5xx時のリトライ、バックオフ、フォールバック（ローカル辞書のみ）。
* **拡張性**：フィールド抽出→スキーマ化→モデル推論→適用の**パイプライン分離**。

---

# 2. 全体アーキテクチャ

## 2.1 コンポーネント（MV3）

* **Service Worker（Background）**

  * OpenAI API呼び出し、レート制御、秘密情報の管理（`chrome.storage`）。
  * コンテンツスクリプトとのメッセージ仲介、ドメイン学習の集約。
* **Content Script**

  * DOM解析（フォーム構造→中間スキーマ化）、ハイライト、入力適用。
  * ユーザー操作（右上ポップアップ経由のコマンド）受信。
* **Side Panel（Content Overlay）**

  * ページ右側に固定表示されるオーバーレイUI。
  * OpenAI通信ON/OFFトグル、実行/やり直し、結果プレビュー、簡易ログを提供。
  * OFF時はローカルのデモ用プレースホルダで即時入力（ネットワーク通信なし）。
* **Popup（React + MUI）**

  * そのページ限定の実行UI、直近結果の確認・やり直し、除外切替。
* **Options（React + MUI）**

  * 全体設定、OpenAIキー、モデル選択、ドメイン辞書、プロフィール編集、機密ポリシー、ログ閲覧。
* **（任意）Devtools Panel**

  * デバッグ（解析結果の可視化）。

## 2.2 データフロー

1. Content ScriptがフォームDOMを**抽出→正規化スキーマ**（`FormSchema`）生成。
2. 既存の**DomainMapping**と**UserProfile**を付与し**Backgroundへ送信**。
3. OpenAIトグルがONの場合、Backgroundが**プロンプト/JSONスキーマ**を構築し**OpenAI API**をコール。
4. ON時は**構造化応答**（`FillPlan`）をContent Scriptへ返却し適用。
3'. トグルがOFFの場合、Background呼び出しをスキップし、Content Scriptが**デモ用プレースホルダ**で`FillPlan`を生成して適用。
5. Content Scriptが安全性チェックを行い、**自動 or 手動確認**で入力適用。
6. ユーザーが修正した場合、差分を**学習データ**としてBackgroundへ送信→**DomainMapping更新**。

---

# 3. スキーマ設計（型定義）

```ts
// 共通ユーティリティ
export type Brand<T, B extends string> = T & { __brand: B };

// ====== 抽出（Content Script） ======
export type FieldType =
  | 'text' | 'email' | 'tel' | 'password' | 'number'
  | 'date' | 'datetime-local' | 'url'
  | 'textarea' | 'select' | 'radio' | 'checkbox' | 'hidden';

export type FieldConfidence = 0 | 1 | 2; // 簡易指標

export type FieldDescriptor = {
  id: string;
  name?: string;
  labelText?: string;
  placeholder?: string;
  ariaLabel?: string;
  role?: string;
  type: FieldType;
  required: boolean;
  maxlength?: number;
  pattern?: string;
  // DOM参照情報（入力時に使用）
  selector: string;
  // 意味推定のための手掛かり
  contextTexts: string[]; // 近傍のテキスト、fieldset legend等
};

export type FormSchema = {
  formId: string;
  action?: string;
  method?: 'get' | 'post' | 'dialog';
  fields: FieldDescriptor[];
};

// ====== ローカルデータ ======
export type UserProfile = {
  // 任意：ユーザーが保存する基本情報（送信はポリシーに従い制限）
  person?: {
    fullName?: string;
    givenName?: string;
    familyName?: string;
    email?: string;
    tel?: string;
  };
  company?: {
    name?: string;
    department?: string;
    title?: string;
    tel?: string;
  };
  address?: {
    country?: string;
    postalCode?: string;
    region?: string; // 都道府県
    locality?: string; // 市区町村
    street?: string;
    building?: string;
  };
  // 他、ユーザー任意項目…
};

export type FieldMeaning =
  | 'full_name' | 'family_name' | 'given_name'
  | 'email' | 'tel' | 'company' | 'department' | 'title'
  | 'postal_code' | 'address_region' | 'address_locality' | 'address_street' | 'address_building'
  | 'url' | 'note'
  | 'username' | 'password' | 'password_confirm'
  | 'card_number' | 'card_holder' | 'card_exp' | 'card_cvv'
  | 'unknown';

export type DomainMappingRule = {
  selector: string;               // 特定フィールドのセレクタ
  meaning: FieldMeaning;          // 意味付け
  valueTemplate?: string;         // 既知の固定値/テンプレ
  lastUpdatedAt: number;          // epoch ms
};

export type DomainMapping = {
  domain: string;
  rules: DomainMappingRule[];
};

// ====== AI入出力 ======
export type FillItem = {
  fieldId: string;
  meaning: FieldMeaning;
  value: string | boolean;  // checkbox/radioはbooleanまたは固定値
  confidence: number;       // 0-1
  requiresConfirmation: boolean;
  // 禁止・除外判定（例：passwordは常にtrue）
  sensitive: boolean;
};

export type FillPlan = {
  formId: string;
  items: FillItem[];
  notes?: string[];
};

// ====== メッセージング ======
export type MsgExtractForm = {
  kind: 'extract_form';
  payload: { schema: FormSchema; url: string };
};

export type MsgRequestFill = {
  kind: 'request_fill';
  payload: { schema: FormSchema; domainMapping?: DomainMapping; profile?: UserProfile; locale: string };
};

export type MsgApplyFill = {
  kind: 'apply_fill';
  payload: { plan: FillPlan };
};

export type MsgLearnMapping = {
  kind: 'learn_mapping';
  payload: { domain: string; corrections: FillItem[] };
};

export type BgToCsMessage =
  | { kind: 'fill_result'; payload: { plan: FillPlan } }
  | { kind: 'error'; payload: { message: string } };

export type CsToBgMessage = MsgRequestFill | MsgLearnMapping;
```

---

# 4. 解析ロジック（Content Script）

## 4.1 フォーム抽出

* タグ`form`に限定せず、**入力系要素が近傍に集合**するコンテナも対象。
* `MutationObserver`でノード追加/削除を監視、**スロットリング（例：500ms）**。
* 各フィールドに対して以下を収集：

  * 識別子（`id/name`・安定セレクタ生成：`cssPath`）
  * 表示ラベル（`<label for=...>`・周辺テキスト）
  * アクセシビリティ属性（`aria-label`, `role`）
  * HTML属性（`type`, `required`, `pattern`, `maxlength`）
* **中間スキーマ `FormSchema`** を作る。

## 4.2 既知辞書の適用（軽量ヒューリスティック）

* ドメイン辞書`DomainMapping`に一致する`selector`があれば**先行意味付け**。
* ラベル/placeholder/周辺語から簡易ルール（例：`/電話|tel|phone/i` → `tel`）。
* これらは**AIプロンプトへのヒント**＆**フォールバック入力**に使用。

---

# 5. 推論（Background）

## 5.1 OpenAI 呼び出し方針

* **入力**：`FormSchema`＋`DomainMapping`のヒント＋`UserProfile`（送信許諾済みキーのみ）。
* **出力形式**：**JSON Schemaを指定**し、**構造化応答**（`FillPlan`）を強制。
* **プロンプト**：システム＋ユーザー複合。冪等性のため**役割/制約を明記**。
* **機密方針**：`password/card_*`は**既定で送信禁止**。送る必要がある場合は**ユーザーの都度同意**が必要。

### サンプル：リクエスト（概略）

```ts
// fetchを使用。model名はOptionsで設定可能にし、ここではプレースホルダ。
const callOpenAI = async (args: {
  schema: FormSchema;
  profile?: UserProfile;
  domainMapping?: DomainMapping;
  locale: string;
  model: string;
  apiKey: string;
}): Promise<FillPlan> => {
  const body = {
    model: args.model,
    // 応答をJSONスキーマで固定（実際のAPIの最新仕様はOptionsで切替可能に）
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'fill_plan',
        schema: {
          type: 'object',
          required: ['formId', 'items'],
          properties: {
            formId: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['fieldId', 'meaning', 'value', 'confidence', 'requiresConfirmation', 'sensitive'],
                properties: {
                  fieldId: { type: 'string' },
                  meaning: { type: 'string' },
                  value: { oneOf: [{ type: 'string' }, { type: 'boolean' }] },
                  confidence: { type: 'number', minimum: 0, maximum: 1 },
                  requiresConfirmation: { type: 'boolean' },
                  sensitive: { type: 'boolean' }
                },
                additionalProperties: false
              }
            },
            notes: { type: 'array', items: { type: 'string' } }
          },
          additionalProperties: false
        },
        strict: true
      }
    },
    messages: [
      {
        role: 'system',
        content: [
          'あなたはフォーム入力の自動化エージェントです。',
          '出力は厳密にJSONスキーマに従ってください。説明文は出力しないでください。',
          '機密項目（password, card_*）は`sensitive: true`とし、必ず`requiresConfirmation: true`とします。',
          '既知のドメインマッピングがあれば優先し、なければ推論します。',
          'ラベル/周辺文脈からフィールドの意味付けを行い、確信度を0-1で示してください。',
        ].join('\n')
      },
      {
        role: 'user',
        content: JSON.stringify({
          locale: args.locale,
          schema: args.schema,
          hints: args.domainMapping ?? null,
          // profileはユーザー設定の「送信許可フィールド」に基づき絞り込み
          profile: args.profile ?? null
        })
      }
    ]
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${args.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status}`);
  }
  const data: unknown = await res.json();
  // 応答からJSONペイロードを安全に取り出す（実際のレスポンス構造に合わせてナローイング）
  const plan = safeExtractFillPlan(data);
  return plan;
};
```

> 注：OpenAIの最新エンドポイント/モデル名は時間で変わることがあるため**Optionsで文字列設定**にします（固定しない）。`response_format`やfunction-calling互換は**切替可能な実装**にしてください。

## 5.2 レート制御/リトライ

* キュー化（タブ×フォーム単位）。429/5xxは**指数バックオフ（例：500ms→1s→2s→…最大16s）**。
* 失敗時は**ローカル辞書のみ**でフォールバック（ヒューリスティック入力）。

---

# 6. 入力適用（Content Script）

## 6.1 セーフティ

* `sensitive===true`な項目は**常に確認UI**を出し、**既定で未入力**。
* `requiresConfirmation===true`は**差し戻し可能**な確認ダイアログで明示。
* 入力前に**可視ハイライト**（MUI風の小さなツールチップ/バッジ）。

## 6.2 適用手順

* `input`, `textarea`, `select`は**ユーザー操作イベント風**に入力（`value`設定→`input`/`change`発火）。
* radio/checkboxは**値一致**または**最初の候補**を安全に選択（`value`一致がない場合はスキップ）。
* `maxlength`や`pattern`に反する場合は**切り詰め/整形**か**スキップ**し、ログに記録。

---

# 7. 学習（Domain Mapping更新）

## 7.1 学習トリガ

* ユーザーが手動修正 → 修正後の`FillItem`をBackgroundへ送信し、`DomainMappingRule`を更新。
* ドメインごとに**最大件数**と**TTL**を設け、古い/低精度ルールを整理。

## 7.2 ルール作成

* できる限り**安定セレクタ**（`id`, `name`, `aria-label`＋位置）を採用。
* ルールは`meaning`中心。`valueTemplate`は再利用価値が高いときのみ。

---

# 8. 設定UI設計（React + MUI）

## 8.1 Options 画面（主要ページ）

* **General**：有効/無効、ボタンクイック操作、ログ保存期間、言語。
* **OpenAI**：API Key（`chrome.storage.local`）、モデル名、温度等。
* **Privacy**：送信許可フィールドのチェックボックス、機密ポリシー、ドメイン許可/拒否。
* **Profile**：ユーザー基本情報編集（人/会社/住所…）。
* **Mappings**：ドメインごとのルール一覧・編集・削除。
* **Logs**：直近の実行ログ（成功/失敗、送信サイズ、所要時間）。

### 画面用Propsの例

```ts
export type ToggleProps = { label: string; checked: boolean; onChange: (v: boolean) => void };
export const Toggle: React.FC<ToggleProps> = undefined as unknown as never; // ← 実装時はReact.FCを使わない方針のため、後述のコンポーネント記法で

// 方針に合わせた記法（React.FCを使わない）
export type SwitchRowProps = {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
};
export const SwitchRow = (props: SwitchRowProps) => {
  // MUIのSwitchとTypographyで行レイアウト
  return (
    <div>
      {/* 実装時、MUIで整える */}
    </div>
  );
};
```

> 注：実装時は**React.FC不使用**・**props:「type」**定義・**MUI使用**に統一。

## 8.2 Popup

* 現在タブのフォームを**解析→プラン取得→実行**のワンショットUI。
* 自動/半自動切替、今回のみ除外、ログリンク。

### 8.3 Side Panel（ページ右側固定UI）

* 常時右側に表示（折りたたみ可）。
* OpenAI通信トグル（ON/OFF）。ON: Background経由で推論／OFF: プレースホルダで充填（ネットワーク通信なし）。
* 実行/やり直し/除外、直近結果、簡易ログの表示。

---

# 9. 権限/Manifest/ビルド

## 9.1 Manifest v3（概要）

```json
{
  "manifest_version": 3,
  "name": "AI Form Autofill",
  "version": "0.1.0",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://*/*", "http://*/*"],
  "background": { "service_worker": "background.js", "type": "module" },
  "action": { "default_popup": "popup.html" },
  "options_page": "options.html",
  "content_scripts": [
    {
      "matches": ["https://*/*", "http://*/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "icons": { "16": "icons/16.png", "48": "icons/48.png", "128": "icons/128.png" }
}
```

## 9.2 ビルド/構成

* Bundler：Vite（`build.rollupOptions.output.format: 'esm'`）。
* TypeScript：`"strict": true`、`"noImplicitAny": true`、`"useUnknownInCatchVariables": true`。
* パス：`src/background/`, `src/content/`, `src/popup/`, `src/options/`, `src/shared/`。
* MUIはOptions/Popupのみで使用（Content/BackgroundはDOM/API主体）。

---

# 10. セキュリティ/プライバシー

* **デフォルト設定**：機密（`password`, `card_*`）は**送信禁止＆自動入力しない**。
* 送信時は**明示のトグル＋その場の確認**（ワンタイム許可）。
* OpenAIトグルOFF時はネットワーク通信を行わない（ゼロ送信）。
* 送信前に**プロファイルからの抽出フィールドを限定**（不要データは送らない）。
* ログは**マスク**（例：メールは`a***@d***.com`、電話は末尾4桁のみ）。
* API Keyは`chrome.storage.local`に暗号化保存（拡張内暗号鍵でも、漏えい対策に**最小権限**＆**バックアップOFF**推奨）。
* CORSはBackground経由でコール。

---

# 11. 失敗時のフォールバック

* **オフライン/失敗**：DomainMapping + ヒューリスティックのみで入力（氏名/電話/住所など）。
* **厳格バリデーション**に弾かれたら、該当フィールドを**未入力**に戻し、UIで理由提示。

---


# 13. 参考プロンプト（雛形）

**System**

```
あなたはWebフォーム自動入力の専門エージェントです。
- 入力はユーザーのプロフィールとドメイン辞書を優先します。
- 目的は自然かつ妥当な値でフォームを埋めることです。
- 出力は与えたJSONスキーマに厳密に従い、余計な文字列を含めないでください。
- passwordやクレジットカード情報はsensitive=trueにし、requiresConfirmation=trueを必ず設定します。
- 不明な項目はmeaning='unknown'で、無理に値を作らないでください。
```

**User（例）**

```
{
  "locale": "ja-JP",
  "schema": { ...FormSchema... },
  "hints": { ...DomainMapping... },
  "profile": { ...UserProfile(許可済み項目のみ)... }
}
```

---

# 14. 実装スケルトン（抜粋・TypeScript, any不使用）

### 14.1 Content Script：抽出→送信

```ts
// src/content/index.ts
import { FormSchema, FieldDescriptor, CsToBgMessage, BgToCsMessage, FillPlan } from '../shared/types';

const qsa = (root: Document | Element, sel: string): Element[] => Array.from(root.querySelectorAll(sel));

const buildCssPath = (el: Element): string => {
  // 安定セレクタ生成（簡易版）
  const id = el.getAttribute('id');
  if (id) return `#${CSS.escape(id)}`;
  const name = el.getAttribute('name');
  if (name) return `${el.tagName.toLowerCase()}[name="${CSS.escape(name)}"]`;
  return el.tagName.toLowerCase();
};

const extractField = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): FieldDescriptor => {
  const labelEl = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
  const labelText = labelEl?.textContent?.trim() ?? undefined;
  const placeholder = (el as HTMLInputElement | HTMLTextAreaElement).placeholder || undefined;
  const ariaLabel = el.getAttribute('aria-label') ?? undefined;
  const role = el.getAttribute('role') ?? undefined;

  const typeAttr = (el as HTMLInputElement).type as unknown;
  const type = ((): FieldDescriptor['type'] => {
    const t = typeof typeAttr === 'string' ? typeAttr.toLowerCase() : '';
    if (t === 'textarea') return 'textarea';
    if (t === 'select-one' || el.tagName === 'SELECT') return 'select';
    if (t === 'radio') return 'radio';
    if (t === 'checkbox') return 'checkbox';
    if (t === 'password') return 'password';
    if (t === 'email') return 'email';
    if (t === 'tel') return 'tel';
    if (t === 'number') return 'number';
    if (t === 'date') return 'date';
    if (t === 'datetime-local') return 'datetime-local';
    if (t === 'url') return 'url';
    if (t === 'hidden') return 'hidden';
    return 'text';
  })();

  const contextTexts: string[] = [];
  const parent = el.closest('fieldset, .form-group, form') ?? el.parentElement;
  if (parent) {
    const near = parent.textContent ?? '';
    const trimmed = near.replace(/\s+/g, ' ').trim();
    if (trimmed) contextTexts.push(trimmed.slice(0, 300));
  }

  return {
    id: el.id || el.name || buildCssPath(el),
    name: el.getAttribute('name') ?? undefined,
    labelText,
    placeholder,
    ariaLabel,
    role,
    type,
    required: el.hasAttribute('required'),
    maxlength: el.getAttribute('maxlength') ? Number(el.getAttribute('maxlength')) : undefined,
    pattern: el.getAttribute('pattern') ?? undefined,
    selector: buildCssPath(el),
    contextTexts
  };
};

const extractFormSchema = (): FormSchema[] => {
  const forms: FormSchema[] = [];
  // フォーム要素あり
  qsa(document, 'form').forEach((fEl) => {
    const inputs = qsa(fEl, 'input, textarea, select') as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];
    const fields = inputs.map(extractField);
    forms.push({
      formId: (fEl.getAttribute('id') ?? '') || `form-${forms.length + 1}`,
      action: fEl.getAttribute('action') ?? undefined,
      method: (fEl.getAttribute('method')?.toLowerCase() as FormSchema['method']) ?? undefined,
      fields
    });
  });
  // 非formコンテナ（簡易例）
  if (forms.length === 0) {
    const inputs = qsa(document, 'input, textarea, select') as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];
    if (inputs.length > 0) {
      forms.push({
        formId: 'virtual-form-1',
        fields: inputs.map(extractField)
      });
    }
  }
  return forms;
};

const requestAI = (schema: FormSchema) => {
  const msg: CsToBgMessage = {
    kind: 'request_fill',
    payload: { schema, domainMapping: undefined, profile: undefined, locale: navigator.language || 'ja-JP' }
  };
  chrome.runtime.sendMessage(msg as unknown, (resp: unknown) => {
    const r = resp as BgToCsMessage | undefined;
    if (!r || r.kind !== 'fill_result') return;
    applyFill(r.payload.plan);
  });
};

const applyFill = (plan: FillPlan) => {
  plan.items.forEach((it) => {
    const el = document.querySelector(it.fieldId.startsWith('#') || it.fieldId.startsWith('.') ? it.fieldId : `[name="${CSS.escape(it.fieldId)}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (!el) return;
    if (it.sensitive || it.requiresConfirmation) return; // ここでは自動適用しない（UI確認フロー別実装）

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      if (el.type === 'checkbox') {
        if (typeof it.value === 'boolean') el.checked = it.value;
      } else if (el.type === 'radio') {
        const radios = document.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`);
        let applied = false;
        radios.forEach((node) => {
          const r = node as HTMLInputElement;
          if (String(r.value) === String(it.value)) {
            r.checked = true;
            r.dispatchEvent(new Event('change', { bubbles: true }));
            applied = true;
          }
        });
        if (!applied) { /* スキップ */ }
      } else {
        if (typeof it.value === 'string') {
          el.value = it.value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    } else if (el instanceof HTMLSelectElement) {
      if (typeof it.value === 'string') {
        el.value = it.value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
};

// 初期起動
const init = () => {
  const schemas = extractFormSchema();
  schemas.forEach(requestAI);
};

init();
```

### 14.2 Background：API呼び出し・レート制御（骨子）

```ts
// src/background/index.ts
import { CsToBgMessage, BgToCsMessage, FormSchema, FillPlan } from '../shared/types';

chrome.runtime.onMessage.addListener((msg: unknown, sender, sendResponse) => {
  const m = msg as CsToBgMessage;
  (async () => {
    if (m.kind === 'request_fill') {
      try {
        const plan = await makePlan(m.payload.schema);
        const resp: BgToCsMessage = { kind: 'fill_result', payload: { plan } };
        sendResponse(resp);
      } catch (e: unknown) {
        const resp: BgToCsMessage = { kind: 'error', payload: { message: (e as Error).message } };
        sendResponse(resp);
      }
    }
  })();
  return true; // async
});

const makePlan = async (schema: FormSchema): Promise<FillPlan> => {
  // storageから設定読込（キー、モデル、許可フィールド、プロフィール、ドメイン辞書等）
  // → OpenAI呼び出し → JSON抽出 → FillPlan返却
  // ここではダミー
  return { formId: schema.formId, items: [] };
};
```

> **実コードでは**：
>
> * `chrome.storage.local.get`で設定取得
> * Backoff/Retry
> * `safeExtractFillPlan`でJSONナローイング
>   を実装。

---

# 15. 追加の実装指針

* **i18n**：`chrome.i18n`＋簡易辞書で対応。
* **アクセシビリティ**：視覚ハイライトはコントラスト十分、キーボード操作可。
* **監査ログ**：日時/URL/送信サイズ/応答サイズ/所要時間/入力結果。
* **データ最小化**：プロンプトには**必要最小限**の文脈のみ（全テキスト丸投げ禁止）。
* **プラグ可能な推論器**：将来Claude/ローカルLLM等へ差し替え可能なIFに。

---

# 16. 12時間実装の目安（ラフWBS）

1. ベース（2.5h）

* Manifest/ディレクトリ/ビルド設定、TS厳格、通信骨子

2. 抽出器 & ハイライト（2h）

* 基本フォーム抽出、セレクタ生成、プレビュー

3. Background API（2h）

* OpenAI設定/呼び出し/JSON抽出、簡易バックオフ

4. 適用ロジック（2h）

* 基本型（text/select/checkbox/radio）、イベント発火

5. UI（2h）

* Options（APIキー・モデル・プライバシー最低限）、Popup（実行ボタン）

6. 学習（1.5h）

* 修正→DomainMapping更新の最小ループ

※ 追加時間があれば：ログ、i18n、セキュリティUIの磨き込み

---

必要なら、この設計をベースに**雛形リポジトリ（Vite + MV3 + React + MUI + strict TS）**の初期コードや、**プロンプト/JSONスキーマの実戦テンプレ**をすぐ用意します。
