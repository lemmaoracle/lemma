---
brief_no: 27
title: "LibreChat CVE-2026-32625 — ユーザーが指定する MCP サーバー URL が、サーバーの秘密情報を運び出す経路になった"
title_en: "LibreChat CVE-2026-32625 — User-Supplied MCP Server URLs as an Exfiltration Channel for Server Secrets"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-02
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["003-starlette-badhost"]
version: "1.0"
status: published
---

## TL;DR

2026 年 6 月 2 日、マルチプロバイダ対応の AI チャット基盤 LibreChat に CVE-2026-32625(CVSS 9.6、Critical)が公開された。0.8.3 以前の MCP サーバー統合は、ユーザーが指定する MCP サーバー URL の Zod スキーマ検証時に、URL 内の `${VAR}` プレースホルダをサーバー自身の `process.env` に対して解決する。低権限の認証済みユーザーが `${CREDS_KEY}` や `${MONGO_URI}` を埋め込んだ攻撃者ドメインの URL を MCP サーバーとして登録するだけで、LibreChat サーバーは暗号鍵・JWT secret・DB 接続情報をリクエスト URL に載せて攻撃者のサーバーへ送信する。管理者権限は不要で、インストール全体の暗号基盤と認証情報が侵害される。修正は 0.8.4-rc1。本事象は Pillar 03(エージェント権限証明)の `agent-infrastructure` における、**エージェントの接続先を記述する設定値そのものが、特権文脈で解釈される未検証入力である**ことを示す事例であり、Brief 003(MCP server の認証回避)に続くエージェント基盤の信頼境界の問題を構成する。

---

## 1. 事案概要

- **対象**: LibreChat(danny-avila/LibreChat)0.8.3 以前の MCP サーバー統合
- **識別子**: CVE-2026-32625 / GHSA-4pcc-j6m6-wcwx(CWE-200: 認可されないアクターへの機微情報露出)
- **深刻度**: CVSS 3.1 = 9.6(Critical)。`AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:N` — ネットワーク経由・低い攻撃複雑性・低権限で足り・ユーザー操作不要・スコープ変更あり
- **公開日**: 2026-06-02(GitHub Security Advisory 経由、CVE reserve は 2026-03-12)
- **根本原因**: ユーザー入力である MCP サーバー URL のスキーマ検証過程で、`${VAR}` 形式のプレースホルダがサーバーの `process.env` に対して展開される。本来は運用者向けの設定機能である環境変数参照が、認証済みユーザー全員の入力に対して有効だった
- **流出対象**: `CREDS_KEY` / `CREDS_IV`(認証情報暗号鍵)、`JWT_SECRET`、`MONGO_URI` 等。これらはインストールの暗号材料と DB 接続情報そのものであり、流出すれば全ユーザーのデータと認証基盤が侵害される
- **悪用状況**: CISA の SSVC 評価で Exploitation: poc(概念実証あり)。修正版 0.8.4-rc1 で対処済み

---

## 2. タイムライン

- 2026-03-12: CVE 番号が reserve される(GitHub assigner)
- 2026-06-02: GitHub Security Advisory(GHSA-4pcc-j6m6-wcwx)と CVE-2026-32625 が公開。修正版 0.8.4-rc1 が利用可能に
- 2026-06-03: CISA が SSVC 評価(Exploitation: poc / Technical Impact: total)を付与
- 2026-06-04: NVD が解析完了(CVSS 9.6 Critical 確定)

---

## 3. 攻撃ベクター

1. **低権限アカウントの取得**: 攻撃者は対象 LibreChat インスタンスの一般ユーザーアカウントを取得する。多くの公開インスタンスではセルフサインアップが有効である
2. **悪性 MCP サーバー設定の作成**: MCP サーバー URL として、攻撃者支配下のドメインに `${CREDS_KEY}` / `${CREDS_IV}` / `${JWT_SECRET}` / `${MONGO_URI}` 等のプレースホルダを埋め込んだ URL を登録する
3. **検証過程での環境変数展開**: LibreChat サーバーは URL の Zod スキーマ検証時に、プレースホルダを自身の `process.env` の値で置換する。ユーザー入力と運用者設定の区別はない
4. **接続による流出**: 展開済み URL に対して LibreChat サーバーが接続を行い、秘密情報が URL の一部として攻撃者のサーバーのアクセスログに記録される
5. **全面侵害への展開**: 流出した暗号鍵で保存済み認証情報の復号、JWT secret でのトークン偽造、`MONGO_URI` での DB 直接アクセスが可能になる

---

## 4. 構造的論点

本事象は Pillar 03(エージェント権限証明)の `agent-infrastructure` カテゴリに属する。中心的な失敗 primitive は、**エージェントがどの外部サーバーに接続するかを記述する設定値が、ユーザー由来の未検証入力のまま、サーバーの特権文脈(`process.env`)で解釈された**点にある。secondary に `identity-auth` を併記する。

Brief 003(Starlette/BadHost)と同じくエージェント基盤の信頼境界の問題だが、方向が異なる。003 は外部からの HTTP Host ヘッダー操作で MCP server への**入口**(認証)が回避された事例、本事象はユーザーが指定する接続先設定という**出口**側で、接続行為そのものが秘密情報の搬出経路になった事例である。両者に共通するのは、MCP というエージェント接続層が、従来の Web アプリケーションでは入力検証の対象として確立していた境界(ヘッダー、ユーザー入力 URL)を、エージェント設定という新しい皮をかぶせたまま特権的に処理してしまう構造である。

エージェント基盤の文脈では、MCP サーバーの登録は「エージェントに新しい能力と接続先を与える」権限行為に相当する。本事象は、その権限行為が誰の認可で・どの範囲の文脈にアクセスして実行されるのかが検証されないとき、設定の記述形式(プレースホルダ)ひとつで権限境界が崩れることを示している。

---

## 5. Detection 層では届かない構造的 gap

脆弱性スキャナや依存関係監査、egress の監視は、既知 CVE への対処と異常通信の発見に不可欠であり、本 Brief がその役割を否定するものではない。本事象も advisory 公開と修正版の即日提供という、coordinated disclosure の正常系で処理された。

一方で、検出は「サーバーがどの接続先に・何を載せて接続するか」の決定自体を変えない。本事象の悪用通信は、LibreChat サーバー自身が発する正規の outbound HTTPS 接続であり、宛先は攻撃者ドメインだが通信パターンとしては MCP サーバーへの正常な接続試行と区別がつかない。秘密情報は暗号化された TLS の URL パスに載って出ていくため、内容検査でも捕捉は難しい。欠けていたのは「この MCP 接続設定は誰が登録し、どの環境文脈にアクセスすることが認可されているか」の実行前検証であり、これは通信の監視とは別系統である。監査の観点でも、流出後に「どの秘密が・いつ・誰の登録した設定で送出されたか」を立証する独立した証跡は、アクセスログの突合以上のものが残らない。

事前証明(pre-execution attestation)は、エージェント基盤への接続先登録を権限行為として扱い、設定値が解釈される前に「登録者の権限」「設定が参照しうる文脈の範囲」を独立検証可能な証明として要求する設計を採る。proof が「この設定は登録者の権限を超える文脈(サーバー環境変数)を参照する」と告げれば、接続は実行前に block される(検出と事前証明の thesis は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)(Lemma、2026-05)を参照)。

---

## 6. 対応経緯と業界動向

- **LibreChat**: GitHub Security Advisory(GHSA-4pcc-j6m6-wcwx)として coordinated disclosure を実施し、修正版 0.8.4-rc1 を公開。修正はユーザー入力 URL に対する環境変数展開の無効化
- **CISA / NVD**: 公開翌日に SSVC 評価(Exploitation: poc / Technical Impact: total)、2 日後に NVD 解析完了と、AI 基盤系 CVE としては早いサイクルで処理された
- **業界横断の論点**: MCP 統合を持つ AI チャット/エージェント基盤は 2026 年に入り CVE の集中領域になっており(Brief 003 の Starlette/BadHost、各種 MCP server の認証不在の調査報告等)、「エージェント接続層の設定値をどの信頼レベルで扱うか」が共通の設計課題として浮上している

セルフホスト型 AI 基盤の普及により、同種の「設定値経由の特権文脈アクセス」は LibreChat 固有ではなく、MCP クライアント実装一般の検証項目になりつつある。

---

## 7. Lemma による分析

本事象で露呈した構造的 gap(エージェントの接続先設定が、登録者の権限と参照可能な文脈の範囲について独立検証されないまま特権文脈で解釈される)に対して、Lemma は、エージェント基盤への接続先登録・能力付与を権限行為として証跡化し、実行前に「誰が・何を・どの範囲で」認可したかを独立検証可能な証明として検証する設計を提示している。エージェント権限証明の設計思想は [Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/)(Lemma)を参照のこと。

---

## 8. Sources

- **GitHub Security Advisory**: "LibreChat Exfiltrates Server Secrets via MCP Server URL Injection"(GHSA-4pcc-j6m6-wcwx、2026-06-02)— https://github.com/danny-avila/LibreChat/security/advisories/GHSA-4pcc-j6m6-wcwx
- **NVD**: CVE-2026-32625(CVSS 9.6 Critical、2026-06-04 解析完了)— https://nvd.nist.gov/vuln/detail/cve-2026-32625
- **CIRCL Vulnerability-Lookup**: CVE-2026-32625(CISA SSVC 評価を含む集約レコード)— https://vulnerability.circl.lu/vuln/cve-2026-32625

---

## 9. Brief 配布について

Lemma Critical Brief は Lemma が発行する threat intelligence brief です。本資料は公開情報の構造化分析であり、特定の組織への監査・診断・推奨ではありません。意思決定の参考として用いる場合は、貴組織の Lemma Critical 担当に直接ご相談ください。

Discovery Call: https://tally.so/r/Pd2Rl5
ホワイトペーパー: https://tally.so/r/xX0VYv

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
