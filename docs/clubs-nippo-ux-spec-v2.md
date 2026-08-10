# CLUBS日報 ユーザー体験仕様書

v2.0 / 2026-08-09 / 実装ベース

本書はCLUBS日報のユーザーが実際に操作・体験できる機能とその副作用を、実装に基づいて記述した仕様書です。APIパラメータや内部実装の詳細は含みませんが、接続方法（Track A/B）・エージェント種別・各種条件分岐による機能差異を網羅的に明示します。

---

## 目次

1. 日報の受け取り
2. コンソール（Web UI）
3. パスポート（公開プロフィール）
4. 達成カード・シール
5. AI接続
6. 設定
7. 制約・プライバシー
8. Track A / Track B 機能マトリクス
9. エージェント対応表
10. 条件による機能分岐 総括
11. 日報の作成フロー（収集→集計→生成→送信→証明）

---

## 1. 日報の受け取り

CLUBSに接続したAIエージェントの前日の作業内容が、毎朝メールで届きます。ユーザーは日常的に何も操作する必要はなく、日報は自動生成・自動送信されます。

### 1.1 メールの構成要素

日報メールは単一のHTMLテーブル構造で、以下の要素が上から順に並びます。

| # | 要素 | 詳細 |
|---|------|------|
| 1 | **カバー帯** | メール最上部の全幅グラデーション帯。パスポートと同じスキン色。14色から選択可（§1.1.1 参照） |
| 2 | **照合ピル** | カバー帯内に表示。Track A のみ「✓ 照合済み」表示。Track B は表示なし |
| 3 | **AIアバター** | カバー帯の直下、白地中央に配置。Boring Avatars による生成（§1.1.2 参照） |
| 4 | **表示名・モデル名** | 「{オーナー名}'s {AI名}」形式（例: `aggre's Hermes`）。日付も併記 |
| 5 | **4指標** | 実働時間・実行回数・成功率・失敗数を1行で表示（§1.1.3 参照） |
| 6 | **シール帯**（任意） | 新規シール獲得時にのみ表示 |
| 7 | **業務別作業ブロック** | 案件ごとのカード。タイトル・内容・ツールバッジ・実行回数メトリクス（§1.1.4 参照） |
| 8 | **申し送り** | 翌日以降に持ち越す事項。タイトル＋本文 |
| 9 | **気づき・改善提案** | LLMが抽出した改善ポイント。アイコン付き |
| 10 | **ひとこと** | エージェント自身の振り返りコメント（`selfNote`） |
| 11 | **アクションボタン** | 「承認して記録する」「パスポートを見る」の2ボタン |
| 12 | **フッター** | 検証バッジ・docHash・収集元・FRAME00 クレジット・Twemoji CC-BY 4.0 |

#### 1.1.1 カバー帯の14色

`covers.ts` で定義された14色プリセット。`config.cover` で指定可能。未指定時は `indigo`（既定）。
彩度を 0.75 倍に抑え、暗号系プロダクトの派手さを避けています。角度は 158°（`aurora` のみ 120°）。
Gmail 互換のため、グラデーションから抽出した最初の hex 色を `bgcolor` 属性にも二重指定します（グラデ非対応クライアントでも flat 色が全幅で残る）。

| キー | 系統 | 代表色 |
|------|------|--------|
| `indigo` | 青紫（既定） | `#6F85EA → #876FE3 → #A37CDF` |
| `teal` | 青緑 | `#34B2B2 → #2897AE → #4385C1` |
| `sunset` | 橙桃 | `#EA9F6F → #ED819A → #D66887` |
| `forest` | 緑 | `#51B98C → #319E92 → #348EAF` |
| `night` | 濃紺 | `#525584 → #3A3D67 → #2A2D4A` |
| `ocean` | 海青 | `#54A4D3 → #4385C1 → #6479E1` |
| `lavender` | 薄紫 | `#AB81DF → #937BD8 → #7D7AD1` |
| `sakura` | 桜 | `#EF8CB3 → #E2739E → #C66690` |
| `red` | 赤 | `#ED8189 → #DD687B → #C4556B` |
| `citrus` | 柑橘 | `#E6AA53 → #E7905A → #EC807D` |
| `aurora` | オーロラ（3色） | `#C07DD2 → #7B93DF → #4EA688` |
| `slate` | グレー | `#818D9B → #636F7E → #4F5E6D` |
| `candy` | キャンディ | `#EF8CB3 → #B28BE2 → #6DA0DD` |
| `mint` | ミント | `#43BCA4 → #34A6AF → #4394C1` |

#### 1.1.2 アバターの生成ルール

- **方式**: Boring Avatars（SVG生成・CDN不要）
- **seed**: `agentName` があれば `"{accountId}/{agentName}"`、なければ `accountId` 単体
- **影響**: 同一アカウント・同一エージェント名なら常に同じアバター。エージェント名を変えるとアバターも変わる
- **配置**: カバー帯の下の白地に中央配置（重ね表示はしない・Gmail Android 互換）

#### 1.1.3 4指標

| 指標 | Track A（CLI自動照合） | Track B（自己報告） |
|------|------------------------|---------------------|
| 実働時間（`activeHours`） | ✅ 実測値（`activeMinutes / 60`） | ❌ 表示なし |
| 実行回数（`totalCalls`） | ✅ 実測値 | ❌ 表示なし |
| 成功率（`successRate`） | ✅ `resolvedCalls / totalCalls` (%) | ❌ 表示なし |
| 失敗数（`failedCalls`） | ✅ 実測値 | ❌ 表示なし |

Track B では `proof.status = 'pending'`・`reason = '自己報告（未照合）'` で固定され、4指標欄は空白または非表示になります。

#### 1.1.4 業務別作業ブロック（workBlocks）

- **表示件数**: 上限なし（実装上の制限は1日20件まで送信可能・§10 参照）
- **並び順**: LLM が案件ごとに分類した順序。重要度順ではない（LLM の判断）
- **各ブロックの要素**:
  - `icon`: 絵文字（案件アイコン・LLM が推測）
  - `title`: 案件名（短い固有名・「本日の作業」等の汎用ラベルは不可）
  - `tool`: 使用ツール（`terminal` / `read_file` 等・バッジ表示）
  - `text`: 2〜4文の具体的な達成内容
  - `metric`: 「実行 12回」等の実行メトリクス
- **案件名の推測**: Track A では `project` フィールドが空の場合、LLM がツール名＋120字要約から推測します
- **空ブロックの拒否**: 2026-08-09 実装で `workBlocks` が空の提出は400で拒否されます（Track B の自己申告含む）

#### 1.1.5 申し送り（handoff）

- **形式**: `{ title, text }` のオブジェクト
- **自動抽出**: LLM が当日の作業ログから「未完事項・翌日持ち越し事項」を要約して生成
- **メール表示**: タイトル（既定「明日にまわすもの」）＋本文
- **蓄積**: 承認時に「タスク」としてタスク・提案箱に蓄積（fingerprint で同一項目を寄せ、`carryDays` をカウント）

#### 1.1.6 気づき・改善提案（insights）

- **形式**: `{ icon, title, desc, save }` の配列
- **生成**: LLM が当日の作業から改善ポイントを抽出
- **承認フロー**: 承認時に「提案」として提案箱に蓄積。`proposalStats`（累計・採用率・連続日数）はサーバ側で集計（「盛れない」原則・クライアント数値は無視）
- **状態**: `open` / `approved` / `rejected` / `hold`

#### 1.1.7 ✓照合済みバッジ

- **表示条件**: Track A の日報のみ。`proof.status = 'verified'` のとき
- **意味**: 当該 docHash が Lemma API（`POST /v1/documents`）に登録済みであること
- **注意（既知の制約）**: 現状、✓ は「docHash が Lemma に登録されたか」のみを判定し、表示本文と docHash の一致をその場で再計算照合する仕組みはありません。2026-08-04 時点で prerelease の verified 30件全件で docHash が本文と不一致（送信ペイロードと保存レコードの `handoff` 形式差が原因）。「✓ が検証可能になるまで日報の一般公開に進まない」がリリースゲートです
- **編集時の挙動**: Track A の日報をコンソールで編集すると、`draft.proof` を引き継ぐ設計上 ✓ は一旦保持されますが、編集後の本文で計算した docHash とは一致しなくなります（§2.2 参照）

### 1.2 受信タイミング

- **頻度**: 毎朝1回（JST 8:00 前後・cron または Scheduled task）
- **対象**: 前日ぶんの稼働ログ
- **初回接続当日**: 空の日報が届くことがあります（前日の稼働ログがないため）。中身のある日報は**翌日**から届きます
- **ウェルカムメール**: `firstIngestAt` 設定時に接続完了通知が届く予定（改善候補・2026-08-06 現在未実装）

### 1.3 メールが届かない場合

| 原因 | 確認方法 | 対処 |
|------|----------|------|
| 接続未完了 | コンソール「接続」画面の状態 | 接続コードを再発行してセットアップ |
| 初回接続当日 | 接続日時 vs メール日付 | 翌日を待つ（または `npx clubs-nippo@latest` で即時テスト） |
| メールアドレス未設定 | Redis `GET nippo:<accountId>:email` | メールOTPサインインを1回通す（OAuth経由だと未設定になる既知のバグ） |
| OAuth サインイン（Gate 2 バグ） | GitHub/Google でサインインした履歴 | メールOTPで1回サインインすれば同一 accountId に解決され直る |
| `RESEND_API_KEY` 未設定（本番） | Vercel env の Production | `vercel env add RESEND_API_KEY production` |
| スケジューラ未登録/停止 | 接続画面のスケジューラ状態 | cron/launchd/Scheduled task を再登録 |
| ChatGPT Scheduled task 自動 Pause | ChatGPT の Tasks 一覧 | 週1回の確認操作で再開 |
| 同日重複送信判定 | Redis `nippo:<accountId>:mailed:<date>` | SETNX で重複防止。一度送った日は再送されない |
| Track A がある日の Track B 上書き | 409 Conflict | Track A が確定している日は Track B は受け付けられない |

### 1.4 差出人による判別

- `onboarding@resend.dev` → clubs-nippo CLI がローカル直接送信（旧方式）
- `daily@send.clubs.place` → CLUBS サーバー（`ingest.ts` の `sendDailyMail`）が送信（推奨）

---

## 2. コンソール（Web UI）

コンソール（`https://prerelease.clubs.place/nippo/`）は日報の編集・承認・パスポート・シール・設定を統合した Web UI です。メール OTP または OAuth（GitHub/Google）でサインインします。

### 2.1 日報一覧（`/nippo/reports`）

#### UI要素

| 要素 | 説明 |
|------|------|
| **カレンダー/日付リスト** | 日付ごとに日報の有無を表示。`nippo:{accountId}:dates`（Redis SET）が日付インデックス |
| **状態バッジ** | 各日報に以下の3状態のいずれかを表示: `下書き` / `承認済み` / `未提出` |
| **フィルタ** | 状態別フィルタ（下書き/承認済み/未提出） |
| **軽量読み** | 一覧は `SUMMARY_FIELDS`（date, workCount, topTitle, generator 等）のみ `HMGET` で並列読み。本文（workBlocks/insights）は開かないと読まない |
| **キャッシュ** | `nippo:{accountId}:reports:cache`（TTL 60秒）。書き込みで `DEL` により無効化 |

#### 状態の定義

| 状態 | 条件 |
|------|------|
| **下書き** | `saveDraft()` で保存済み・未承認。Track A は `proof.status` に応じて `verified`/`pending`。Track B は `grade: 'self_reported'`・`proof.status = 'pending'` |
| **承認済み** | `saveApproved()` で確定。パスポート公開・シール発行・Lemma証明登録済み |
| **未提出** | 当該日に下書きも承認済みも存在しない |

### 2.2 日報編集（`/nippo/reports/edit`）

#### できること

| 項目 | 編集可否 | 備考 |
|------|----------|------|
| 業務ブロック（workBlocks）の追加・編集・削除 | ✅ | Track A/B ともに可。Track B で `workBlocks` が届くようになった場合、通常の業務ブロック編集UIが出る |
| 申し送り（handoff） | ✅ | タイトル＋本文 |
| 気づき（insights） | ✅ | アイコン・タイトル・内容 |
| ひとこと（selfNote） | ✅ | 自由テキスト |
| 4指標（aggregates） | ❌ | サーバ確定値（「盛れない」原則）。編集不可 |
| AI名・表示名 | ❌ | 接続時に固定。オーナー名のみ§6 で変更可 |

#### できないこと・編集権限の違い

| 条件 | 編集権限 | ✓ 状態 |
|------|----------|--------|
| **下書き（Track A・verified）** | ✅ 編集可 | 編集すると `draft.proof` を引き継ぐため ✓ は一旦保持されるが、編集後の本文と docHash は不一致になる（既知の設計上の制約） |
| **下書き（Track A・pending）** | ✅ 編集可 | ✓ なし |
| **下書き（Track B・self_reported）** | ✅ 編集可 | 元々 ✓ なし。docHash 再計算もしない |
| **承認済み** | ❌ 編集不可 | 承認後に修正したい場合は未承認に戻す機能は現状なし |

#### Track B の編集画面の特則

`edit.astro` の `buildEditable()` は `DRAFT.grade === 'self_reported'` のとき、`workBlocks` を無条件で非表示にし単一 summary textarea だけを出す旧実装があります。`workBlocks` が届くようになった場合（2026-08-09 実装）は `DRAFT.workBlocks?.length` の有無で分岐させる必要があります（workBlocks あり→通常UI、なし→textarea）。

### 2.3 承認＝「記録する」

「記録する」ボタン（`POST /api/nippo/reports/:date`）を押すと、下書きが承認済みに確定します。以下の全副作用が** atomic に**実行されます:

#### 承認時の全副作用

1. **下書き → 承認済みレコード確定**
   - `saveApproved()` で Redis `nippo:{accountId}:agent:{agentId}:approved:{date}` に保存
   - 日付インデックス `nippo:{accountId}:dates` に `SADD`
   - 一覧キャッシュ `nippo:{accountId}:reports:cache` を `DEL`（無効化）

2. **パスポート反映**
   - 承認済み日報がパスポートの統計（累計日数・連続日数・累計実行回数等）に反映
   - 公開URL `/p/<id>` で閲覧可能

3. **達成カード判定**
   - `evaluateCards()` が `out/history.jsonl` の履歴から判定
   - Wave1 カタログ11種のうち `CURRENT_WAVE = 1` と一致するカードのみ判定
   - 条件マッチ → シール発行（冪等・`SETNX` で重複防止）
   - 既得は剥奪なし

4. **シール発行**
   - `INCR clubs:issuance:seq:<seal_id>` で通し番号採番
   - `SETNX clubs:issuance:once:...` で冪等チェック
   - RediSearch 台帳 `clubs:issuance:events` に INSERT
   - Lemma Seal 登録（`documents` テーブル）
   - `seal_hash` を台帳に書き戻し

5. **Lemma証明登録**
   - `draft.proof` が存在 → 引き継ぐ（取込時の proof を尊重）
   - `body.lemma.apiKey && body.lemma.base` あり → `registerProof()` で再登録
   - どちらもない → `documentHash()` 再計算で `{ status: 'pending', reason: 'Lemma 未設定' }`
   - **既知の問題**: `body.lemma` 依存の再登録は ingest モード移行後に不適切。サーバー環境変数 `LEMMA_API_KEY` を使うべき（修正予定）

6. **タスク・提案蓄積**
   - 申し送り（handoff）→ タスク（fingerprint で同一項目を寄せ、`carryDays++`）
   - 気づき（insights）→ 提案（`proposalStats` をサーバ集計）

7. **通知配信（webhook）**
   - `dispatchReportApproved()` で `report.approved` イベントを webhook 台帳に登録されたURLへ配信
   - HMAC-SHA256 署名付き。`await` 必須（Vercel serverless で未解決 Promise は破棄される）
   - SSRF 対策・テスト送信エンドポイントあり

8. **メール再送はされない**
   - 承認はメール送信をトリガーしない。メールは ingest 時の1回のみ

---

## 3. パスポート（公開プロフィール）

パスポート（`/p/<id>` または `/share/passport`）は承認済み日報から自動生成される公開プロフィールです。

### 3.1 表示内容

| 要素 | 来源 | 編集可否 |
|------|------|----------|
| **アバター** | Boring Avatars（seed = `accountId/agentName`） | ❌ 自動生成 |
| **カバー色** | 14色プリセットから選択 | ✅ パスポート編集モードで変更可 |
| **表示名（ニックネーム）** | オーナー名 + AI名 | ✅ ニックネーム編集可 |
| **統計** | 累計日数・連続日数・累計実行回数・成功率 等 | ❌ サーバ確定値 |
| **獲得カード** | 承認時に発行されたシール一覧 | ❌ 自動表示 |
| **Twemoji クレジット** | CC-BY 4.0 | ❌ フッターに自動掲出 |

### 3.2 シェア

#### 公開URL

- **形式**: `https://prerelease.clubs.place/p/<id>`
- `<id>` は accountId 由来の slug
- **認証不要**・誰でも閲覧可

#### OGP画像

- **動的生成**: satori + resvg で SVG → PNG をサーバ側で生成
- **内容**: アバター・カバー色・表示名・主要統計・直近の獲得カード
- **フォント**: Google Fonts 動的サブセット（`text=` パラメータで必要文字だけ取得）。システムフォント非依存
- **プレビュー**: パスポート編集モードで OGP プレビューを確認可

### 3.3 パスポート編集モード

- フォーム + ライブプレビュー
- カバー色・ニックネームを変更するとリアルタイムでプレビュー反映
- OGP 画像の見え方も確認可
- 保存は per-account blob 化（`process.env.OWNER_NAME` のグローバル書き込みは廃止・アカウント間漏洩を防止）

---

## 4. 達成カード・シール

日報の検証済み集計から、カードを機械的に発行するサブシステム。**LLM は使わない**・機械判定のみ。

### 4.1 規律

- **達成カードは剥奪しない**（過去の記録は消えない）
- **称号は一度だけ**（既に持っていれば再発行しない）
- **権限は付与しない**（解放条件を満たしてもフラグを立てるだけ。付与は人間の承認）
- **しきい値はハードコードしない**（すべて env 経由）
- **無い数字は作らない**（`firstTrySuccessRate` 等が出せないカードは「判定不可」と表示）

### 4.2 カードの種類

| 種別 | 性質 | 備考 |
|------|------|------|
| 実績（開発） | 剥奪なし | 権限に効く。質ゲート |
| 実績（税理士） | 剥奪なし | 差し戻し率等（現状「判定不可」） |
| 称号 | 一度だけ | 型。再発行なし |
| ネタ | 剥奪なし | 狙って取れない。シェアのタネ |
| 権限 | 人間承認 | 解放フラグのみ。`tax:file:submit` は存在させない（法定の天井） |

### 4.3 Wave1 カタログ（11種）

`CURRENT_WAVE = 1` と一致するカードのみ `evaluateCards` が発行判定します。ウェーブ外カードは判定・進捗も出しません（カタログ全体は非公開）。既得は剥奪しません。

| ID | U-ID | 種別 | 判定条件 | 備考 |
|----|------|------|----------|------|
| `first_step` | U-F1 | first | 最初の日報（一度きり） | 初回承認で即発行 |
| `streak3` | U-F2 | first | 3日連続（一度きり） | 連続日数カウント |
| `buddy_up` | U-F3 | first | AI連携完了（`firstIngestAt ?? lastIngestAt` が疎通の真実） | #50 以前は `lastIngestAt` でフォールバック |
| `week_clear` | U-C1 | streak | 7日連続 | 連続日数 |
| `month_clear` | U-C2 | streak | 30日連続 | 連続日数 |
| `hundred_days` | U-C3 | streak | 100日連続 | 連続日数 |
| `hundred_steps` | U-C4 | streak | 累計100本 | 累計提出数 |
| `welcome_back` | U-C5 | streak | 8日以上あけて再開 | cooldown 14日 |
| `owl` | U-T1 | title | 夜型ワーク（帯偏り > 60%） | `bandBias()`: 直近28日・最低記録7日 |
| `lark` | U-T2 | title | 朝型ワーク（帯偏り > 60%） | 同上 |
| `holiday` | U-N4 | neta | 休日ワーク（土日） | cooldown 14日・cooldown 内は progress 非表示 |

### 4.4 しきい値（env で上書き可）

```env
BIGJOB_CALLS=40
NOFAIL_DAYS=30
PRECISION_DAYS=90
CLEAN_COUNT=10
TITLE_DAYS=10
MERGE_PASS_RATE=98
```

帯偏り判定のパラメータ:
- `bandWindowDays` = 28（直近28日）
- `bandRatioPct` = 60（60% 超で偏り判定）
- `bandMinDays` = 7（最低記録日数・データ不足の暴発防止）

### 4.5 シール帳の表示

- **正本レンダラー**: `sealCanonical.ts` が SVG 4層合成で正本画像をサーバ専権で生成
- **4レイヤー**: モチーフ（Twemoji SVG）→ レアリティフレーム（RARE/EPIC/LEGENDARY/称号）→ リーグ地紋（Wave1 は common・ドットグリッド）→ 刻印（No.・取得日・criteria 版）
- **配信**: `GET /api/nippo/seals/<sealId>/<seqNo>.png` / `.svg`。台帳にある組だけ描画・未発行 No. は 404
- **保有者名は含まない**: 無認証・静的 URL で OGP に使える
- **ネタバレ回避**: 未獲得カードの詳細は非表示（案B・名称差し替え）
- **キャッシュ**: `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800`

### 4.6 カードの Track 差異

| 項目 | Track A | Track B |
|------|---------|---------|
| カード判定 | ✅ 全種 | ✅ 全種（ただし成功率等の実測値ベースの条件は判定不可） |
| streak系 | ✅ | ✅（提出日ベース） |
| 実績系（成功率・失敗数） | ✅ | ❌「判定不可」表示 |
| 称号（owl/lark） | ✅（時間帯別集計） | ❌ 時間帯データなし |

---

## 5. AI接続

### 5.1 接続の全体像

CLUBSコンソール（Web UI）のサイドバー「接続」→「＋ 体を追加」からウィザード形式で開始します。

```
/auth（ログイン）→ ホーム → 接続 → [+ 体を追加] → ウィザード
                                       ↓
                          ① 使っているAIは？（Claude/ChatGPT/Gemini/Copilot/Hermes/OpenClaw/その他）
                                       ↓
                          ② どこで使う？（ブラウザ・アプリ / ターミナルCLI）
                          ※ Claude/ChatGPT/Copilotのみ2問目が出る
                                       ↓
                          [つなぐ] → 体が作成される
                                       ↓
              ┌─ CLI トラック（Track A）: 接続コード発行 → ターミナルで1行実行
              │
              └─ MCP トラック（Track B）: MCP接続設定 → AIにURLを登録 → 接続を許可
```

### 5.2 Track A（CLI自動照合・✓付き）

#### 接続手順

1. コンソールで「接続コードを発行」ボタン
2. 表示された1行コマンドをコピー:
   ```
   npx clubs-nippo@latest init --url=https://prerelease.clubs.place/api/nippo/ingest --code=<48桁hex>
   ```
3. ターミナル（Mac: ターミナル.app / Windows: WSL推奨）に貼り付け → Enter

#### `init` の完全な挙動

| ステップ | 処理 |
|----------|------|
| ① コード→トークン交換 | `POST /api/nippo/agents/redeem` → 連携トークン取得 |
| ② `.env` 書き込み | `~/.clubs-nippo/.env` に `NIPPO_INGEST_URL`/`NIPPO_INGEST_TOKEN`/`SOURCE` 等を保存（既存ファイルはマージ） |
| ③ スケジューラ登録 | 「毎朝の自動実行を登録しますか？[Y/n]」→ macOS: launchd / Linux: crontab（curl\|bash 経由時は自動 Yes） |
| ④ 完了 | 「今すぐ試す: `npx clubs-nippo@latest`」 |

#### 前提条件

- **Node.js 20+** がインストールされていること（`node -v` で確認）
- Windows は WSL を使用（ネイティブ PowerShell はスケジューラの PATH・実行ポリシー・スリープ問題で解決不能なため非対応・2026-08-06 決定）

#### 接続コードの制限

- 48桁 hex
- 10分・1回限り
- 期限切れは再発行
- Redis `nippo:agentcode:{code}` に `{a:accountId, g:agentId}` を TTL 600秒で保存（DBレコードは増えない）

#### 自動インストールスクリプト（curl|bash）

`/nippo/install/[agent]/[os]?c=<code>` が生成するスクリプトは3段階:

1. **clubs-nippo init**（`.env` + トークン + スケジューラ） — `set -e`（失敗＝即終了）
2. **AIエージェントへのMCPツール登録** — `set +e`（best-effort・失敗は警告→続行）
3. **対話プロンプト「今すぐ試しますか？」** — TTY検出・パイプ時スキップ

| Agent | MCP登録処理 |
|-------|-------------|
| Claude | `claude mcp add clubs -- npx -y clubs-nippo@latest mcp`（既存検出→スキップ） |
| Codex | `~/.codex/config.toml` に `[mcp_servers.clubs]` 追記 |
| Gemini | `gemini mcp add clubs -- npx -y clubs-nippo@latest mcp` |
| Copilot | VS Code 手動手順を表示（自動化不可） |
| Hermes/OpenClaw | events-file 方式のため EVENTS_FILE 案内のみ |

#### Track A の特徴

- ✅ 4指標が実測値
- ✅ ✓照合済みバッジ
- ✅ cron / launchd で毎日自動実行
- ✅ 全カード種の判定可（実績系含む）
- ⚠️ スケジューラの遠隔検知・修復は原理的に不可（CLI 型の本質的制約）

### 5.3 Track B（自己報告・未照合）

#### 接続手順（MCP トラック）

1. コンソールで MCP URL（`https://prerelease.clubs.place/api/nippo/mcp`）をコピー
2. 使っているAIに MCPサーバーとして**登録**する（チャットにURLを貼るのではない！）:
   - **Claude**: 設定 → コネクタ → カスタムコネクタを追加 → URL → 接続を許可
   - **ChatGPT**: 設定 → Security and login → 開発者モードON → Plugins の＋ → URL を MCPサーバーとして登録（OAuth選択） → 接続を許可
   - **Gemini CLI**: `gemini mcp add --transport http clubs <URL>` → `/mcp auth clubs`
   - **Copilot（VS Code）**: コマンドパレット → MCP: Add Server → HTTP → URL登録
3. 接続時にCLUBSの確認画面が開くので「接続を許可」

#### よくある間違い

- ❌ MCP URL をAIのチャット欄にそのまま貼る → 「内容を確認できません」エラー
- ✅ AI の設定画面で MCP サーバー（コネクタ）として**登録**する

#### ChatGPT プラン要件

- カスタムコネクタ（開発者モード）は **Plus / Pro / Business** 以上が必要
- 無料プランには開発者モード自体が存在しない

#### Track B の特徴

- ❌ 4指標なし（自己申告のため）
- ❌ ✓照合済みバッジなし（`proof.status = 'pending'`・`reason = '自己報告（未照合）'` で固定）
- ✅ 達成カード判定可（ただし成功率等の実測値ベース条件は「判定不可」）
- ✅ Scheduled task で毎日自動実行可（制約あり・§5.4 参照）
- ✅ スケジューラの遠隔検知・修復が不要（MCP 型・運用負荷ゼロ）

#### MCP ツール（Track B）

リモートMCP（OAuth 2.1 + PKCE S256 + DCR）で提供される2ツール:

| ツール | 役割 |
|--------|------|
| `submit_daily_report` | 日報を自己申告で提出。`workBlocks`（必須）・`summary`・`selfNote`・`handoff`・`date`（省略可・省略時は今日 JST）を受け取る |
| `get_report_status` | 未提出時は `submit` を誘導 |

`workBlocks` は2026-08-09 実装で**必須化**されました。空の提出は400で拒否されます。

### 5.4 Scheduled task 制約（Track B・ChatGPT/Codex）

ChatGPT / Codex の Scheduled task で日報を自動実行する場合の制約:

| 制約 | 内容 |
|------|------|
| **会話履歴なし** | Scheduled task は新しいスレッドで走るため、当日の会話履歴が見えない。「本日の作業」が空になりがち |
| **LLM の揺らぎ** | 一貫した出力を生成できない場合がある |
| **自動 Pause** | 非アクティブ（操作がない）状態が続くと自動的に Pause される（OpenAI 公式: "Tasks auto-pause when ignored"）。日報以外に ChatGPT を使わないユーザーは週1回の確認操作が必要 |
| **ユーザー承諾必須** | Scheduled task 作成にはユーザーの「はい」が必須（完全自動ではない） |

#### 対策（実装済み）

MCP ツールの `description` と `instructions`（initialize レスポンス）に以下を埋め込んでいます:

- **構造化ガイド（HOW TO BUILD）**: workBlocks の段階的作成手順を明示
- **必須性宣言**: 「REQUIRED」「REJECTED」で曖昧さを排除
- **具体例列挙**: 抽象指示より具体例の方が LLM 出力品質が安定
- **Scheduled task 提案の遅延**: 接続直後ではなく「初回提出成功後」に提案（空日報による信頼低下を防止）
- **Scheduled task の限界を明示**: 「fresh thread with no conversation history」を正直に伝える

---

## 6. 設定

コンソールの設定画面（`/nippo/settings` 相当）で以下を設定できます。

### 6.1 設定項目

| 項目 | デフォルト | 詳細 |
|------|-----------|------|
| **オーナー名（ニックネーム）** | （接続時入力） | パスポート・メールの表示名に反映。per-account blob 化（env のグローバル書き込み廃止） |
| **カバー色** | `indigo` | 14色プリセットから選択。メール・パスポート・OGP 画像に反映 |
| **AI名** | （接続時固定） | 変更不可。接続時に固定される |
| **通知・配達先** | 未設定 | webhook 通知先（`settings.notifications.daily.to`）。日報メールの宛先とは別物（§6.2 参照） |
| **webhook URL** | — | `report.approved` イベントの配信先。HMAC-SHA256 署名付き。テスト送信可 |

### 6.2 「宛先: 未設定」の誤解に注意

設定画面の「通知 → 日次日報」に表示される「宛先: 未設定」は **webhook 通知先**（`notifTo`）であって、**日報メールの宛先ではありません**。

- **日報メールの宛先**: Redis `nippo:<accountId>:email`（`sendDailyMail()` が使用）。メール OTP / OAuth adoption 時に `writeAccountEmail()` で保存
- **webhook 通知先**: `settings.notifications.daily.to`（配信スケジュールの通知先）

両者は完全に別物です。「宛先: 未設定だからメールが届かない」と誤解しやすい点に注意。

### 6.3 管理者専用設定

| 項目 | env | 用途 |
|------|-----|------|
| `NIPPO_ADMIN_ACCOUNT_IDS` | カンマ区切り accountId | `/nippo/admin/waitlist` 管理者ページの閲覧権限。Preview と Production 両方に設定必須 |
| `TEAM_BETA_ACCOUNT_IDS` | カンマ区切り | チームベータ参加者の機能解放 |

---

## 7. 制約・プライバシー

### 7.1 プライバシー境界

> **原則**: 生ログは端末から出さない。サーバに送るのは集計値（aggregates）＋マスク済み本文（narrative）のみ。

#### サーバーに到達するデータ

```json
{
  "activity": {
    "date": "2026-07-22",
    "agentName": "Hermes",
    "displayName": "aggre's Hermes",
    "source": "hermes",
    "aggregates": {
      "totalCalls": 347, "resolvedCalls": 320, "failedCalls": 27,
      "successRate": 92, "activeHours": 4.1,
      "toolCounts": { "terminal": 120, "read_file": 80 },
      "eventsByHour": [0,0,0,0,0,0,0,0,0,12,45,67],
      "modelCounts": { "anthropic/claude-sonnet-4": 347 },
      "sessions": 8, "projects": ["lemma", "clubs-nippo"],
      "firstAt": "09:12", "lastAt": "23:45"
    }
  },
  "narrative": {
    "workBlocks": [{"icon":"📦","title":"案件名","tool":"terminal","text":"要約本文","metric":"実行 12回"}],
    "handoff": {"title":"...","text":"..."},
    "insights": [{"icon":"🔁","title":"...","desc":"..."}],
    "selfNote": "ひとこと"
  },
  "proof": { "status": "pending", "docHash": "abc123..." }
}
```

#### サーバーに到達しない（端末に留まる）データ

| データ | 理由 |
|--------|------|
| プロンプト本文 / モデル応答本文 | `activity.prompts` は送信前に除去 |
| コード片・ファイル内容 | ツール出力は一切送信されない |
| ファイルパス（完全） | 120字切り詰め要約が workBlock 本文に混ざりうるが full path ではない |
| リポジトリ名・ブランチ名 | 収集対象外 |
| コマンド文字列（完全） | `summarizeArgs()` で120字に切り詰め、さらに LLM が要約 |
| 生イベント列 | ホワイトリストから除外 |

#### マスキング

- `MASK_PATTERNS` 環境変数にクライアント名等の正規表現を設定すると、summary 生成時に `[[REDACTED]]` に置換
- 案件名は LLM が summary（ツール名＋120字要約）から推測するため、summary にクライアント名が含まれると案件名に伝播しうる点に注意

### 7.2 対象外領域

- **オンチェーン証明**: 現状はオフチェーン証明のみ（オンチェーンは有償プラン向け Phase 4）
- **複数エージェント（2体目・有償）**: 設計済み（`connection.ts` + API + UI）だが未着手。現在は1アカウント1エージェント前提
- **承認済み日報の編集**: 未承認に戻す機能は現状なし
- **docHash と本文の一致検証**: verify ページでその場で再計算照合する仕組みは現状なし（リリースゲート対象）

### 7.3 既知の制約・バグ

| 制約 | 内容 | 影響 |
|------|------|------|
| **docHash 不一致** | verified 30件全件で docHash と本文が不一致（送信ペイロードと保存レコードの `handoff` 形式差） | prerelease・招待制・verify ページ訪問者ゼロのため対外的実害なし。「✓ が検証可能になるまで一般公開に進まない」がゲート |
| **OAuth Gate 2 バグ** | OAuth（GitHub/Google）サインインで `writeAccountEmail()` が呼ばれない → メール未着 | メールOTPサインインを1回通せば直る |
| **承認時の再登録が `body.lemma` 依存** | ingest モード移行後に不適切。サーバー環境変数 `LEMMA_API_KEY` を使うべき | 修正予定 |
| **Windows CLI 非対応** | schtasks の PATH・実行ポリシー・スリープ問題で解決不能 | WSL を案内 |

---

## 8. Track A / Track B 機能マトリクス

| 機能 | Track A（CLI自動照合） | Track B（自己報告） |
|------|------------------------|---------------------|
| 日報の自動生成 | ✅ cron / launchd で毎日 | ✅ Scheduled task（制約あり・§5.4） |
| 4指標（実働・実行・成功率・失敗数） | ✅ 実測値 | ❌ 表示なし |
| ✓照合済みバッジ | ✅ | ❌ |
| docHash 計算 | ✅ `documentHash()` で計算 | ❌ 計算しない |
| `proof.status` | `verified` / `pending` | `pending`（固定・`reason='自己報告（未照合）'`） |
| `grade` | （通常） | `self_reported` |
| 達成カード判定 | ✅ 全種 | ✅ 全種（ただし成功率等は判定不可） |
| 称号（owl/lark・時間帯別） | ✅ | ❌ 時間帯データなし |
| 編集後の ✓ 状態 | 編集で `draft.proof` 引き継ぎ・一旦保持（本文と docHash は不一致に） | 元々 ✓ なし |
| 編集画面のUI | 通常の業務ブロック編集UI | `workBlocks` あり→通常UI / なし→textarea（旧実装） |
| Track A がある日の上書き | — | ❌ 409 Conflict で拒否 |
| 必要な設定 | CLI + cron/launchd + Node.js 20+ | MCP 接続のみ（OAuth） |
| スケジューラ遠隔検知 | ❌ 原理的に不可 | ✅ 不要（MCP 型） |
| 運用負荷 | やや高（スケジューラ管理） | ゼロ（ただし Scheduled task 自動 Pause 注意） |
| workBlocks 必須 | ✅（LLM が生成） | ✅（2026-08-09 実装で必須化・空は400拒否） |

---

## 9. エージェント対応表

### 9.1 対応エージェント一覧

| エージェント | Track | SOURCE | 収集方式 | 接続手順 | 実機検証 | 備考 |
|--------------|-------|--------|----------|----------|----------|------|
| **Claude Code CLI** | A | `claude-code` | セッションログ直接読み取り（`~/.claude/projects/`） | `clubs-nippo init --code=...` | ✅ | 最も成熟・毎日稼働実績あり。無料版でも動作 |
| **Codex CLI** | A | `codex-cli` | セッションログ直接読み取り | `clubs-nippo init --code=...` | ✅ v0.145.0 | OpenRouter 経由で動作（`~/.codex/config.toml` に `model_provider = "openrouter"`）。`OPENAI_API_KEY` 不要 |
| **Hermes Agent** | A | `hermes` | `state.db`（SQLite）直接読み取り・旧形式 `session_*.json` もサポート | `SOURCE=hermes` | ✅ | Aggre のメインエージェント。2026-08-04 に state.db 移行対応 |
| **Gemini CLI** | A | `gemini-cli` | セッションログ直接読み取り | `clubs-nippo init --code=...` | ⚠ 未検証 | アダプター実装済み・実機未確認。ヘッドレス設定は `references/gemini-cli-headless-setup.md` |
| **Copilot CLI** | A | `copilot-cli` | セッションログ直接読み取り | `clubs-nippo init --code=...` | ⚠ 未検証 | アダプター実装済み・実機未確認 |
| **ChatGPT（MCP）** | B | — | 自己申告（MCPツール呼び出し） | プラグイン画面からURL登録（開発者モード・Plus以上必須） | ✅ | Scheduled task 対応・自動 Pause 注意 |
| **Codex（MCP）** | B | — | 自己申告（MCPツール呼び出し） | プラグイン画面からURL登録 | ✅ | Scheduled task 対応 |

### 9.2 各エージェントの接続手順詳細

#### Claude Code CLI（Track A・推奨）

1. コンソールで Claude・「ターミナル（CLI）で」を選択
2. 接続コードを発行
3. ターミナルで `npx clubs-nippo@latest init --code=<code>` を実行
4. `claude mcp add clubs -- npx -y clubs-nippo@latest mcp` が自動実行される（curl|bash の場合）
5. 初回テスト: `npx clubs-nippo@latest`

**注意**: 「AIにお願いして」のコマンドは端末の Claude Code CLI（`claude` コマンド）に貼る。`claude.ai` のチャット画面では動作しない（サンドボックス環境のため）。

#### Codex CLI（Track A）

1. コンソールで ChatGPT・「ターミナル（CLI）で」を選択
2. 接続コードを発行
3. `npx clubs-nippo@latest init --code=<code>` を実行
4. `~/.codex/config.toml` に `[mcp_servers.clubs]` が自動追記される
5. `model_provider = "openrouter"` を `~/.codex/config.toml` に設定すれば `OPENAI_API_KEY` 不要

#### Hermes Agent（Track A・自己ホスト）

1. コンソールで Hermes・「ターミナル（CLI）で」を選択（2問目なし・固定）
2. 接続コードを発行
3. `npx clubs-nippo@latest init --code=<code>` を実行
4. `.env` に `SOURCE=hermes` が設定される
5. Hermes cron job で毎日 8:00 JST に自動実行

**注意**: Hermes が `session_*.json` から `state.db`（SQLite）に保存形式を変更（2026-07-31以降）。adapter は両形式をサポート済み（2026-08-04 修正）。`.env` の `SOURCE` が `events-file` のままだと空日報になる。

#### Gemini CLI（Track A・未検証）

1. コンソールで Gemini・「ターミナル（CLI）で」を選択（2問目なし・固定）
2. 接続コードを発行
3. `npx clubs-nippo@latest init --code=<code>` を実行
4. `gemini mcp add clubs -- npx -y clubs-nippo@latest mcp` が自動実行される

**ヘッドレス設定（cron用）**:
- `GEMINI_CLI_TRUST_WORKSPACE=true` を `~/.gemini/.env` に書く
- `TERM=dumb` で 256-color 警告を抑制
- `gemini mcp add clubs -s user npx -- -y clubs-nippo@latest mcp --trust`（`-s user` 必須）

#### ChatGPT（Track B・MCP）

1. コンソールで ChatGPT・「ブラウザ・アプリで」を選択
2. MCP URL をコピー
3. ChatGPT 設定 → Security and login → 開発者モードON → Plugins の＋ → URL を MCPサーバーとして登録（OAuth選択）
4. 接続を許可
5. チャットで「日報出して」→ `submit_daily_report` ツールが呼ばれる
6. 初回提出成功後、Scheduled task の提案がある（接続直後ではない）

**プラン要件**: Plus / Pro / Business 以上。無料プランは開発者モード自体がない。

**Scheduled task の自動 Pause**: 非アクティブで自動停止する。週1回の確認操作が必要。

#### Codex（Track B・MCP）

ChatGPT と同等。Codex のプラグイン画面からURLを登録。

### 9.3 推奨順序

1. **Claude Code CLI（Track A）** — 最も安定・実績あり。まずこれで日報が安定して届くことを確認
2. **Hermes Agent（Track A）** — 自己ホスト環境向け
3. **Codex CLI（Track A）** — OpenRouter 経由で動作確認済み
4. **ChatGPT（Track B）** — CLI なし・運用負荷ゼロだが Scheduled task の制約あり
5. **Gemini CLI / Copilot CLI（Track A）** — 実機未検証

---

## 10. 条件による機能分岐 総括

以下の条件分岐が日報の各機能に影響します。該当セクションへの参照も併記。

### 10.1 Track A / Track B による ✓ 照合の有無

- Track A: `proof.status = 'verified'`（Lemma 登録成功時）または `'pending'`
- Track B: `proof.status = 'pending'`（固定・`reason='自己報告（未照合）'`）
- → §1.1.7, §8 参照

### 10.2 初回接続時と2日目以降の日報の違い

| 項目 | 初回接続当日 | 2日目以降 |
|------|-------------|-----------|
| 日報の有無 | 空の日報が届くことがある（前日稼働ログなし） | 中身のある日報が毎朝届く |
| 4指標 | Track A でも0になる場合あり | 実測値が表示される |
| 即時テスト | `npx clubs-nippo@latest` で前日分を即時生成可 | cron/launchd/Scheduled task で自動 |
| `firstIngestAt` | 設定される | 既に設定済み |
| `buddy_up` カード | 発行対象 | 既得（剥奪なし） |
| Scheduled task 提案 | されない（初回提出成功後） | 既に提案済みなら設定済み |

### 10.3 下書きと承認済みの編集権限の違い

| 状態 | 編集権限 | ✓ 状態の変化 |
|------|----------|-------------|
| 下書き（Track A・verified） | ✅ 編集可 | `draft.proof` 引き継ぎ・一旦保持（本文と docHash は不一致に） |
| 下書き（Track A・pending） | ✅ 編集可 | ✓ なし |
| 下書き（Track B・self_reported） | ✅ 編集可 | 元々 ✓ なし |
| **承認済み** | **❌ 編集不可** | 確定済み・未承認に戻す機能なし |

→ §2.2 参照

### 10.4 Scheduled task で走る場合の制約

- **会話履歴なし**: 新しいスレッドで走るため当日の会話が見えない
- **内容が空になりがち**: 「本日の作業」が空になる
- **LLM の揺らぎ**: 一貫した出力を生成できない場合がある
- **自動 Pause**: 非アクティブ状態が続くと停止（週1回の確認操作が必要）
- **ユーザー承諾必須**: Scheduled task 作成には「はい」が必要（完全自動ではない）

→ §5.4 参照

### 10.5 workBlocks がない提出は拒否される（2026-08-09 実装）

- Track B の自己申告（`submit_daily_report`）で `workBlocks` が空の提出は **400 で拒否**
- `required: ['summary', 'workBlocks']` + `minItems: 1`
- サーバ側ガード（`parseSelfReport()`）で二重防御
- 旧来の summary→1ブロックフォールバックは**廃止**（サイレント失敗の可視化）

→ §1.1.4, §5.3 参照

### 10.6 Track A がある日の Track B 上書き不可（409 Conflict）

- 同一アカウント・同一日付で Track A の日報が既に存在する場合、Track B の提出は **409 Conflict** で拒否
- Track A が確定している日は Track B は受け付けられない

### 10.7 1日の提出上限（20件）

- 1日に送信できる日報は最大20件
- Track A の通常運用では1件/日のため影響なし
- テスト送信や複数エージェントを混在させる場合に注意

### 10.8 同日重複メール送信の防止

- `claimDailyMail()` の `SETNX` で `nippo:<accountId>:mailed:<date>`（TTL 7日）を設定
- 一度送信した日は再送されない
- 手動で再送したい場合は Redis から当該キーを `DEL` する必要がある

### 10.9 連携トークン再発行による旧トークン失効

- コンソールでトークンを再発行すると、**旧トークンは Redis から削除**される
- `.env` や cron に古いトークンが残っていると `403 Forbidden — 連携トークンが無効です`
- 対処: `.env` の `NIPPO_INGEST_TOKEN` と cron job のトークンを新しいものに差し替え

---

## 11. 日報の作成フロー（収集→集計→生成→送信→証明）

日報がどのように作られるか、ユーザー視点で各段階を詳述します。Track A（CLI）と Track B（MCP自己申告）で経路が異なります。

### 11.1 フロー全体図

```
[Track A: CLI]
エージェント実行ログ収集 → 集計（4指標計算） → 本文生成（LLM） → docHash計算
                                                                    ↓
                                                              POST /api/nippo/ingest
                                                                    ↓
                                                    サーバー: docHash再計算・照合（422 if mismatch）
                                                                    ↓
                                                    saveDraft() → Redis保存
                                                                    ↓
                                                    render.ts でメール描画 → Resend 送信
                                                                    ↓
                                                    Gate 2 通過 → メール配信
                                                                    ↓
                                                    コンソールに下書き表示
                                                                    ↓
                                                    ユーザーが「記録する」→ 承認
                                                                    ↓
                                                    パスポート公開・カード判定・シール発行・
                                                    Lemma証明登録・タスク/提案蓄積・webhook通知

[Track B: MCP自己申告]
ユーザー「日報出して」or Scheduled task
        ↓
AI が会話履歴から workBlocks を生成（HOW TO BUILD ガイドに従う）
        ↓
submit_daily_report ツール呼び出し（workBlocks必須・空は400拒否）
        ↓
parseSelfReport() → saveDraft() → Redis保存（grade='self_reported'）
        ↓
render.ts でメール描画 → Resend 送信
        ↓
（以下 Track A と同じ: コンソール表示 → 承認 → 副作用）
```

### 11.2 各段階の詳細

#### 段階1: エージェントの実行ログ収集

**Track A（CLI）**:

- clubs-nippo の source adapter がエージェントのセッションログを直接読み取る
  - Claude Code: `~/.claude/projects/` の JSONL
  - Hermes: `~/.hermes/state.db`（SQLite）または旧形式 `session_*.json`
  - Codex CLI: セッションログ
  - Gemini/Copilot CLI: セッションログ（アダプター実装済み・実機未検証）
- 収集したイベントには `ts`（タイムスタンプ）・`tool`・`ok`（成否）・`summary`（120字切り詰め）が含まれる
- **生ログは端末から出さない**: サーバに送るのは集計値＋マスク済み本文のみ

**Track B（MCP自己申告）**:

- AI が会話履歴から `workBlocks` を生成
- MCP ツールの `description` と `instructions` に埋め込まれた HOW TO BUILD ガイドに従う:
  1. 当日の全スレッド・全タスクをレビュー
  2. 業務を案件/タスク領域ごとにグループ化
  3. 各領域について `title`（固有名）・`text`（2-4文の具体的達成）・`tool` を持つ workBlock を作成
  4. `summary`・`selfNote`・`handoff` も提供
- **Scheduled task の場合**: 新規スレッドで会話履歴が見えないため、正直に「判別できない」と述べるか、可能な範囲で生成

**ユーザーが見るもの**: 基本的に何も見ない（裏側で自動実行）。`clubs-nippo collect` コマンドで集計だけ確認可。

#### 段階2: 集計（4指標の計算）

**Track A のみ**（Track B は集計しない）:

- `aggregate.mjs` がイベントから以下を計算:
  - `totalCalls`（実行回数）
  - `resolvedCalls`（成功回数）
  - `failedCalls`（失敗数）
  - `successRate` = `resolvedCalls / totalCalls` (%)
  - `activeMinutes` / `activeHours`（実働時間）
  - `toolCounts`（ツール別集計）
  - `eventsByHour`（時間帯別・owl/lark カード判定用）
  - `earlyFailRate`（序盤失敗率）
  - `modelCounts`（モデル別）
  - `sessions`（セッション数）
  - `projects`（案件リスト）
  - `firstAt` / `lastAt`（初回/最終実行時刻）
- `out/history.jsonl` に日次集計を追記（冪等・カード判定の「連続」「累計」条件のため）

**ユーザーが見るもの**: メールの4指標欄・コンソールの一覧サマリー。`clubs-nippo collect` で集計だけ確認可。

#### 段階3: 本文生成（LLM がログから散文を生成）

**Track A**:

- `narrative.mjs` の `generateNarrative()` が LLM で本文生成
- 生成器（`GENERATOR`）:
  - `claude`（既定）: `claude -p`（ヘッドレス）
  - `codex`: `codex exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox`
  - `gemini` / `copilot`: 各 CLI のヘッドレス
  - `openrouter`（推奨・Linuxサーバ向け）: OpenRouter API
  - `openai-compat`: OpenAI 互換カスタムエンドポイント
  - `none`: LLM 不使用・決定的 fallback
- 案件名は LLM が summary から推測（`project=null` のときフラットに渡して分類）
- 生成物: `workBlocks`・`handoff`・`insights`・`selfNote`・`generator`（生成器名）

**fallback 可視化**:
- 意図しない fallback（未インストール・応答解釈失敗・実行失敗）は理由つきで `selfNote` と標準出力の両方に出る
- `GENERATOR=none` 等の意図的な fallback は静かなまま
- ユーザー向けエラーメッセージは `selfNote` に「直し方」として表示。技術的詳細は `console.warn` のみ

**Track B**:

- AI が会話履歴から直接 `workBlocks` 等を生成（段階1で兼ねる）

**ユーザーが見るもの**: メール本文・コンソールの編集画面。fallback が起きた場合は `selfNote` に警告表示。

#### 段階4: docHash 計算（Track A のみ）

- `documentHash()` = `sha256(JSON.stringify({date, aggregates, workBlocks, handoff, selfNote}))`
- clubs-nippo と clubsx `ingest.ts` で**同一実装**・golden 契約テストで保証
- 不一致だと ingest が 422 で全件リジェクト
- **注意**: `handoff` は `{title, text}` object として計算。保存レコードでは string になるため、再計算時は復元が必要（既知の docHash 不一致バグの原因）

**Track B**: docHash を計算しない（`proof.docHash = ''`）

#### 段階5: サーバー送信（ingest）

**Track A**:

- `POST /api/nippo/ingest` で `{activity, narrative, proof}` を送信
- サーバー（clubsx `ingest.ts`）の処理:
  1. `documentHash()` を再計算・照合（不一致→422）
  2. `saveDraft()` で Redis に下書き保存
  3. `sendDailyMail()` でメール送信（Gate 1-3 チェック）
  4. コンソールに下書き表示

**Track B**:

- `submit_daily_report` MCP ツール → `parseSelfReport()` → `saveDraft()`（`grade='self_reported'`）
- その後、`sendDailyMail()` でメール送信

**Gate 2（メール送信ゲート）** — 3つの黙って return する経路:

1. `RESEND_API_KEY` / `RESEND_FROM_EMAIL` 未設定 → return
2. `readAccountEmail(accountId)` が null → return（OAuth サインインで未設定になりがち）
3. `claimDailyMail(accountId, date)` の SETNX が false → return（既に送信済み）

**ユーザーが見るもの**: メールが届く（または届かない場合は§1.3 のトラブルシュート）。

#### 段階6: サーバー側でメール描画・送信

- `render.ts` の `renderHtml()` が HTML メールを描画
  - 14色カバー帯・アバター・4指標・業務ブロック・申し送り・気づき・ひとこと・アクションボタン・フッター
  - Gmail Android 互換（`bgcolor` 二重指定・`border-radius` は外側テーブルのみ）
- `send.ts` が Resend REST API でメール送信（SendGrid ではない）
- `claimDailyMail()` の SETNX で同日重複送信を防止

**ユーザーが見るもの**: 毎朝届く日報メール。

#### 段階7: Lemma証明登録

**Track A**:

- `registerProof()` のパイプライン:
  1. `commitDeep(nippoData, {maxDepth:16})` → root + leaves + inclusionProofs（Poseidon）
  2. `POST /v1/documents` で Lemma に文書登録（`scheme: "poseidon"`）
  3. `prover.prove()` で Groth16 証明生成（回路: `data-commitment-v1.1`）
  4. `POST /v1/proofs` で証明提出 → V カウンタ増分
  5. `incrementCounter()` で証明カウンタ増分
- **証明対象**: `failedCalls` 葉（ゼロ失敗の証明）
- **失敗時**: 非ブロッキング。日報登録は成功し、証明カウンタだけ回らない
- **初回証明時間**: ~8秒（IPFSダウンロード）。以降はSDKキャッシュで高速化
- **フォールバック**: `@lemmaoracle/sdk` 未インストール時は SHA-256 placeholder にフォールバック

**Track B**: 証明登録なし（`proof.status = 'pending'` 固定）

**ユーザーが見るもの**: ✓照合済みバッジ（Track A・verified の場合）。verify ページ（`/nippo/verify`）で docHash から Lemma 登録記録を照会可。

#### 段階8: 承認（「記録する」）

ユーザーがコンソールで「記録する」ボタンを押すと、§2.3 の全副作用が実行されます:

1. 下書き → 承認済み確定
2. パスポート反映
3. 達成カード判定・シール発行
4. Lemma証明登録（再登録分岐あり）
5. タスク・提案蓄積
6. webhook 通知配信
7. （メール再送はされない）

**ユーザーが見るもの**: 承認済み状態への切り替え・パスポート公開・新規シール獲得通知・カード獲得表示。

---

## 附録 A. 用語集

| 用語 | 意味 |
|------|------|
| **Track A** | CLI自動照合。エージェントのセッションログを直接読み取り・4指標実測・✓付き |
| **Track B** | 自己報告。MCPツールでAIが自己申告・4指標なし・✓なし |
| **ingest** | clubs-nippo から clubsx サーバーへの日報送信（`POST /api/nippo/ingest`） |
| **docHash** | 文書の指紋。`sha256(JSON.stringify({date, aggregates, workBlocks, handoff, selfNote}))` |
| **✓照合済み** | docHash が Lemma API に登録済みであること（Track A のみ） |
| **Lemma** | ゼロ知識証明基盤。CLUBS日報はオフチェーン証明を使用 |
| **Resend** | メール送信サービス（SendGrid ではない） |
| **Wave1** | 達成カードカタログの第1ウェーブ・11種 |
| **Gate 2** | メール送信ゲート。`nippo:<accountId>:email` が Redis にないとスキップ |
| **Scheduled task** | ChatGPT/Codex の定期実行機能。Track B で使用 |
| **firstIngestAt** | 初回 ingest 完了時刻。`buddy_up` カードの判定根拠 |

## 附録 B. 改訂履歴

| 版 | 日付 | 変更内容 |
|----|------|----------|
| v1.0 | 2026-08-09 | 初版。日報受取・コンソール・パスポート・達成カード・AI接続・設定・制約 |
| v2.0 | 2026-08-09 | 大幅改訂。全セクション詳細化・Track A/B マトリクス・エージェント対応表・条件分岐総括・作成フロー詳述・14色一覧・Wave1 11種カタログ・Scheduled task 制約・workBlocks 必須化・docHash 不整合バグ明記 |
