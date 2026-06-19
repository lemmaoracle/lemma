---
brief_no: 10
title: "Claude Code ソース流出便乗マルウェア — 信頼シグナルと GitHub Releases を配送路に転用した来歴偽装"
title_en: "Claude Code Source-Leak Lures — Weaponizing Trust Signals and GitHub Releases as a Provenance-Spoofed Delivery Channel"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-03-31
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["015-github-vscode-extension-breach", "004-megalodon-github-supply-chain", "003-starlette-badhost"]
version: "1.0"
status: published
og_lead_ja: "信頼シグナルと GitHub Releases を配送路に転用 — Claude Code 流出便乗マルウェア"
og_lead_en: "Trust signals and GitHub Releases weaponized as a delivery channel — Claude Code leak lures"
---

## TL;DR

2026 年 3 月 31 日、Anthropic の npm パッケージ `@anthropic-ai/claude-code`（v2.1.88）が packaging error により内部 TypeScript ソース約 51 万 2,000 行（1,900 ファイル）を含む 59.8MB の source map を露出した。この高注目イベントを、2026 年 2 月から稼働していた AI 系マルウェア配布キャンペーンが流出 24 時間以内に転用し、「流出した Claude Code」を装う偽 GitHub リポジトリ経由で Vidar stealer と GhostSocks proxy を配布した。同キャンペーンは 25 以上のソフトウェアブランドを使い回し、いずれも同一の Rust 製インフォスティーラーを GitHub Releases から配送する。Trend Micro が解析・公表。本事案は、信頼されたブランド名・配布プラットフォームという「信頼シグナル」が、成果物の来歴を独立検証する layer の不在によって攻撃の運搬手段に転用された代表事例である。

---

## 1. 事案概要

- **起点となった露出**: Anthropic `@anthropic-ai/claude-code` v2.1.88 の npm publish に `cli.js.map`（Bun 生成、59.8MB の source map）が誤って同梱。`sourcesContent` に内部 TypeScript ソースツリー約 51 万 2,000 行 / 1,900 ファイルが露出（公開された Cloudflare R2 バケットの build artifact 由来）
- **原因**: `.npmignore` が `.map` を除外しておらず、Bun がデフォルトで full source map を生成するための packaging error（高度な侵害ではない）
- **便乗キャンペーン**: 2026-02 から稼働中の AI 系ルアー型マルウェア配布作戦。25 以上のソフトウェアブランドを使い回し、同一 payload を配送
- **payload**: Rust 製ドロッパ（`TradeAI.exe` / `ClaudeCode_x64.exe`）が Vidar stealer v18.7 と GhostSocks proxy を展開。Vidar はブラウザ認証情報・暗号資産ウォレット・session token 等を多重スレッドで窃取、GhostSocks は被害端末を SOCKS5 residential proxy 化
- **配送路**: GitHub Releases を信頼された配布チャネルとして悪用。78–167MB の trojan 化アーカイブと使い捨てアカウントで takedown を反復回避
- **二次リスク**: 流出ソース自体が脆弱性発見・prompt injection の設計図・agentic attack surface の露出という長期リスクを伴う
- **解析・公表**: Trend Micro（2026-04-03、著者 Jacob Santos / Sophia Nilette Robles / Jeffrey Francis Bonaobra）

---

## 2. タイムライン

- 2026-02: AI 系ツールを装うルアー型マルウェアキャンペーンが稼働開始（`TradeAI.exe`、18 以上の検体、Copilot / Cursor 等を偽装）
- 2026-03-31: Anthropic の npm publish（v2.1.88）が source map を誤同梱、約 51 万 2,000 行のソースを露出。数時間以内に数千の GitHub リポジトリへミラー伝播
- 2026-03-31 以降: Anthropic が人的ミスと確認、該当バージョンを撤回、ミラーへ DMCA / 著作権 takedown を発行（顧客データ・認証情報の露出はないと表明）
- 2026-04-01: 流出 24 時間以内に、既存キャンペーンが「流出 Claude Code」へ pivot。`ClaudeCode_x64.7z` / `ClaudeCode_x64.exe` を GitHub Releases から配布
- 2026-04-03: Trend Micro が解析を公表

---

## 3. 攻撃ベクター

1. **Pre-existing infrastructure**: 2026-02 から AI ツールを装うルアー型キャンペーンが稼働。`TradeAI.exe` を中核に複数ブランドを使い回し、同一の Rust 製インフォスティーラーを配送する基盤を保持
2. **Trust-signal trigger**: 2026-03-31 の Claude Code ソース流出が高注目・時事性のあるルアーを提供。攻撃者は既存インフラを即座に転用
3. **Provenance spoofing**: 24 時間以内に「流出した Claude Code」を装う偽 GitHub リポジトリを作成。ブランド名（Claude Code）と配布プラットフォーム（GitHub Releases）という信頼シグナルを成果物の来歴の代替として悪用
4. **Payload delivery**: 被害者が GitHub Releases から 78–167MB の 7z アーカイブを取得。`ClaudeCode_x64.exe`（Rust 製ドロッパ）が Vidar stealer v18.7 と GhostSocks proxy を展開
5. **Impact realization**: Vidar がブラウザ認証情報・暗号資産ウォレット・session token・システム情報を窃取。GhostSocks が被害端末を residential proxy として外部に転用
6. **Evasion & persistence**: 使い捨てアカウントと大容量 trojan アーカイブで GitHub の takedown を反復回避し、ブランドを切り替えながら継続

---

## 4. 構造的論点

本事案は Pillar 01（来歴証明）の `code-provenance` カテゴリに属する。中心的な失敗 primitive は、ダウンロードされる成果物が「本当に Anthropic の Claude Code か」を、利用者・配布プラットフォームが取得時点で独立検証する layer を欠いていた点にある。攻撃者は脆弱性を突いたのではなく、ブランド名と GitHub Releases という **信頼シグナルそのもの** を来歴の代替として悪用した。secondary に `identity-auth` を併記する。

Brief 004（Megalodon GitHub supply chain）と同じ `code-provenance` だが primitive が異なる。Brief 004 は窃取された開発者 credential を用いた正規プロセス経由の汚染（commit author の origin 偽装）、本事案は信頼ブランドの impersonation による成果物 origin の偽装（配布アーティファクトの来歴偽装）。両者は「成果物の origin が、それを検証する layer と切り離されたまま accept される」という構造で同根である。Brief 003（Starlette/BadHost）とも、identity / origin の主張が独立検証されないという論点で隣接する。なお本事案は、流出元（Anthropic 側の packaging error）と便乗攻撃（第三者によるブランド偽装）という二層構造を持ち、ソフトウェア脆弱性ではなく人的・組織的ギャップが material impact の起点になりうることを示している。

---

## 5. 検出と証明の落差

本事案では、Anthropic が流出を人的ミスとして確認し該当バージョンを撤回・DMCA takedown を発行、Trend Micro が便乗キャンペーンの payload 経路・IOC を解析・公表し、配布プラットフォーム側も takedown を実施した。検出層は事象の輪郭把握・封じ込め・IOC 共有に貢献し、業界横断で問題を可視化した。検出企業・プラットフォームの役割を本 Brief が否定するものではない。

一方で、検出は受信側（成果物を取得する開発者・CI/CD・端末）が「このアーティファクトを accept するか」自体を変えない。攻撃者は使い捨てアカウントとブランド切り替えで takedown を反復回避しており、検出と撤回の後追いでは accept の瞬間を止められない。流出した正規ソースと、ブランドを騙る悪意アーティファクトの双方について、利用者は「これは本当に正規 origin から来たものか」を取得時点で独立検証する手段を持たなかった。規制報告・行政手続きで「正規配布だったか」を立証する材料としても、ブランド名や配布先 URL は独立した証跡を伴わない。

事前証明（pre-execution attestation）は、各アーティファクトに「正規の origin（ここでは公式 publisher）によって生成・公開された」ことを示す独立検証可能な暗号証明を埋め込み、取得側が実行・インストール前に proof を検証する設計を採る。proof が「正規 origin なし」と告げれば、当該アーティファクトは事前に reject される。npm の署名や GitHub の verified バッジは概念的に近い方向だが、ブランド名や配布チャネルの信頼に依存する限り、impersonation の余地を残す。検出と事前証明は代替ではなく **補完** の関係にある。

---

## 6. 対応経緯と業界動向

- **Anthropic**: 流出を人的ミスと確認、該当 npm バージョンを撤回、ミラーへ DMCA / 著作権 takedown を発行、顧客データ・認証情報の露出はないと表明。本件は同社にとって 2 か月で 2 度目のソース露出（先行する「Mythos」関連の露出に続く）
- **Trend Micro**: 便乗キャンペーンの payload・配送路・IOC を解析公表し、AI 開発ツールは指定インストール経路のみ承認すること、agentic リスクに対する governance を control plane として適用することを推奨
- **GitHub（配布プラットフォーム）**: 偽リポジトリ・Releases への takedown を実施。ただし使い捨てアカウントとブランド切り替えにより反復回避が継続
- **業界横断の論点**: セキュリティ侵害がソフトウェア脆弱性に限らず、人的・組織的ギャップ（packaging 設定ミス、信頼シグナルへの過依存）から生じうること。AI 開発ツールの配布・取得における来歴検証が共通課題として顕在化

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差（取得アーティファクトの origin が独立検証されないまま、ブランド名・配布チャネルの信頼で accept される）に対して、Lemma は、各成果物に「正規の origin から生成・公開された」ことを独立検証可能な暗号証明として固定し、取得側が実行前に proof を検証する設計を提示している。ブランド名や配布 URL が偽装されても、proof は別系統で「この artifact は正規 publisher の下で生成された / 生成されていない」を告げる構造である。

---

## 8. Sources

- **Trend Micro technical analysis**: "Weaponizing Trust Signals: Claude Code Lures and GitHub Release Payloads"（2026-04-03、著者 Jacob Santos / Sophia Nilette Robles / Jeffrey Francis Bonaobra）— https://www.trendmicro.com/en_us/research/26/d/weaponizing-trust-claude-code-lures-and-github-release-payloads.html
- **Trend Micro follow-up**: "Claude Code Packaging Error Remains a Lure in an Active Campaign: What Defenders Should Do"（2026-04）— https://www.trendmicro.com/en_us/research/26/d/claude-code-remains-a-lure-what-defenders-should-do.html
- **PCMag**: "Anthropic Issues 8,000 Copyright Takedowns to Scrub Claude Code Leak"（2026-03）— https://www.pcmag.com/news/anthropic-issues-8000-copyright-takedowns-to-scrub-claude-code-leak
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
