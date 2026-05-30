---
brief_no: 3
title: "Starlette CVE-2026-48710 (BadHost) — HTTP Host ヘッダー操作による MCP server 認証回避"
title_en: "Starlette CVE-2026-48710 (BadHost) — MCP Server Authentication Bypass via HTTP Host Header Manipulation"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-27
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["004-megalodon-github-supply-chain"]
version: "1.0"
status: published
---

## TL;DR

2026 年 5 月 27 日、Python の ASGI フレームワーク Starlette(週 3.25 億ダウンロード)に CVE-2026-48710(BadHost)が公開された。HTTP Host ヘッダーへの 1 文字挿入で、Starlette のパスベース認証ミドルウェアを回避できる脆弱性で、FastAPI、vLLM、LiteLLM、Text Generation Inference、OpenAI 互換プロキシ、MCP サーバー、エージェントハーネス、評価ダッシュボード、モデル管理 UI など Python AI エコシステムの大部分に波及する。発見した X41 D-Sec は CVSS 7 評価を「深刻度を著しく過小評価している」と表現、Secwest も同様の見解。MCP サーバーは外部リソース接続のための認証情報を保管する性質上、攻撃者にとって価値が高く、本脆弱性は AI agent infrastructure 層における trust boundary 失敗の象徴的事例として位置付けられる。

---

## 1. 事案概要

- **脆弱性 ID**: CVE-2026-48710(別名 BadHost)
- **公開日**: 2026-05-27
- **発見者**: X41 D-Sec(マルクス・ヴェルヴィエ氏)
- **影響範囲**: Starlette および同フレームワーク上に構築された Python パッケージ群
  - 直接影響: FastAPI、vLLM、LiteLLM、Text Generation Inference
  - 間接影響: ほとんどの OpenAI 互換プロキシ、MCP サーバー、エージェントハーネス、評価ダッシュボード、モデル管理 UI
- **ダウンロード規模**: Starlette 単体で週 3.25 億回(2026 年 5 月時点)
- **CVSS スコア**: 7/10。X41 D-Sec と Secwest はいずれも「深刻度を著しく過小評価している」と評価
- **修正版**: Starlette 1.0.1 で対応済み
- **検出ツール**: mcp-scan.nemesis.services にて影響サーバー特定用オンラインスキャナーが公開

---

## 2. タイムライン

- 2026-05-27: X41 D-Sec が CVE-2026-48710 を公開、同日 Starlette 1.0.1 リリース
- 2026-05-27: Ars Technica が初報、GIGAZINE が日本語で続報
- 2026-05-27: X41 D-Sec が mcp-scan.nemesis.services オンラインスキャナーを公開
- 2026-05-27: Secwest が「CVSS 評価は過小」とのコメントを公表

---

## 3. 攻撃ベクター

1. **Initial compromise**: 攻撃者は対象 MCP サーバーまたは Starlette 系アプリの公開 HTTP エンドポイントに通常通り HTTP リクエストを送信、ただし Host ヘッダーに 1 文字を意図的に挿入する
2. **Routing 動作の乖離**: Starlette のルーティングアルゴリズムは HTTP path に依存して endpoint を解決する。一方、ミドルウェアやエンドポイントに提供される `request.url.path` 属性は「再構築された URL」に基づくため、HTTP で実際に要求されたパスと一致しない
3. **Authentication bypass**: パスベース認証ミドルウェア(`/admin` 等へのアクセス制御)は `request.url.path` を見るが、ルーティングは実 HTTP path で endpoint を解決するため、middleware が通すパスと endpoint が解決するパスが分離する。認証を経ずに保護された endpoint に到達
4. **Credential exfiltration**: 認証回避された MCP server が保管する外部リソース接続用認証情報(API キー、トークン、SSH 鍵、データベース接続文字列等)を奪取
5. **Lateral movement**: 奪取した認証情報を用いて連結された外部システム(クラウド、データベース、メール、IoT、産業機器)へ侵入

---

## 4. カテゴリと位置

本事案は Pillar 03(エージェント権限証明)の `agent-infrastructure` カテゴリに属する。AI エージェントを動かす土台の HTTP layer(Starlette)に「ルーティング解決パス ≠ ミドルウェアが見るパス」という構造的乖離があり、認証層が trust boundary を独立に検証しない状態が放置されていた。

secondary_categories には `identity-auth` を併記する。本事案の直接的被害は MCP server の認証情報窃取であり、credential lifecycle / identity-auth と直接接続する。

Brief 001(KelpDAO/rsETH)や Brief 002(Stake DAO)の `bridge-config-trust` カテゴリとは異なる primitive(対象が cross-chain message ではなく HTTP request)だが、両者に通底する構造は同じ:**信頼の assertion(本事案ではパスベース認証)が、それを検証する layer と切り離されている**。前者は cross-chain message の trust source、本事案は HTTP path の trust source。Trust boundary の独立検証不在という meta-primitive で同根の category(Pillar 別の枝)に位置する。

---

## 5. 検出 vs 事前証明

X41 D-Sec が公開した mcp-scan.nemesis.services は、影響を受けるサーバーを脆弱バージョン特定で検知する。これは「脆弱性が存在するか」の検出であり、運用上有用である。

一方、本脆弱性の根本は「パスベース認証という仕組み自体が trust boundary を独立検証していない」点にある。Starlette 1.0.1 の patch は当該乖離を修正するが、AI エージェントが外部リソースに HTTP 経由でアクセスする世界では、フレームワーク側のバグ修正に依存しない、より上位の trust boundary 検証が不可欠となる。

事前証明(pre-execution attestation)の文脈でこれを再構成すると、「エージェント / 認証主体 / 委任スコープ」を HTTP request 自体に独立検証可能な暗号証明として埋め込む設計が要求される。フレームワークが何を accept するかではなく、accept されるべきものが何かを別系統で証明する層が必要となる。X41 D-Sec が「CVSS 7 では過小評価」と表現した深刻度は、本質的にはこの構造的欠落の規模に由来する。

---

## 6. 業界の対応

- **Starlette**: バージョン 1.0.1 で BadHost 修正をリリース。`request.url.path` と実 HTTP path の整合性を回復
- **X41 D-Sec**: mcp-scan.nemesis.services を公開、AI エージェントエコシステム横断のスキャン経路を提供
- **Secwest**: CVSS 評価への警鐘
- FastAPI / vLLM / LiteLLM / Text Generation Inference を採用するプロダクトには即時の依存関係 update が要請される。X41 D-Sec の指摘「深刻度は極めて高い」が示すように、特に MCP server を運用する組織は exposure 全面再評価が必要

X41 D-Sec が列挙した data at risk のカテゴリは、本事案の波及性を示す:バイオ医薬品 AI(臨床試験データベース、M&A データ、SSRF)、本人確認(顔分析、KYB、ライブ PII、内部コードベース)、IoT / 産業機器(踏み台経由 SSH、RCE)、メール / SaaS、人事 / 採用、CMS / マーケティング、文書管理、クラウド監視、サイバーセキュリティ(資産目録、ライブ核スキャナーアクセス)、個人の健康 / 財務データ。MCP サーバーが「すべての企業データへの蝶番」として配置されつつある現状を裏打ちする。

---

## 7. Lemma の応答層

本事案の primitive(エージェント / 認証主体 / 委任スコープを HTTP request 自体に証明として乗せる層の不在)に対する Lemma の応答は、4 柱のうち **Pillar 03: エージェント権限証明(agent-authority-proof)** に位置する。

設計の中核は、エージェントが外部リソースへ HTTP アクセスする時点で、「誰が」「どの権限で」「どこまで」「どのリソースに対して」要求しているかを HTTP request 自体に独立検証可能な暗号証明として埋め込むことにある。フレームワーク側の path 解決バグが存在しても、proof は別系統で「この request は正規の委任関係の下で生成された / 生成されていない」を受信側に告げる。

**Reference architecture(参考実装方針):**

- HTTP request header に Trust402 拡張として委任証明を載せる
- 委任の各階層(オーナー → エージェント → サブエージェント)を ZK 証明として固定
- Receiver(MCP server や API)は config / path ではなく、proof を見て accept 判定する

本 reference architecture は Lemma の設計方針を示すものであり、現時点で各要素の実装状況および roadmap については別途プロダクトドキュメント / Whitepaper を参照のこと。

製品ライン上の位置付け:

- **Lemma Critical**(基幹インフラ・製造業対象): 本事案の波及範囲(産業機器、IoT、cloud monitoring)に直接対応
- **Trust402**: x402 経済圏での自律エージェント決済における HTTP header 拡張としての権限証明埋込。Starlette / FastAPI / MCP server を採用するスタック全体に乗る
- **Pack C: Agent Governance**: AI エージェント経済対応として、本事案で露出した「MCP server を中継点とする credential 集中」リスクへの組織的応答
- **Pack A: Incident Response**: 本事案で必要となる「どの request が認証を経たか」「どの credentials が漏れたか」の事後調査自動化

実装サンプル(verifiable-origin の最小例):
https://github.com/lemmaoracle/example-origin

関連エッセイ:

- [Proof-as-Auth: 鍵を一度も送らずにサインインする](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)(2026-05-24)— 認証における key-less proof の Lemma 設計
- [AI 時代のサイバー防衛に残された、最後の層](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)(2026-05-22)

---

## 8. 関連 Brief

- Lemma Critical Brief No.004: Megalodon GitHub supply chain — 同じく credential 集中と CI/CD 経由の侵入経路を扱う(Pillar 01 code-provenance)
- Lemma Critical Brief No.001 / 002: Pillar が異なる(01 来歴証明)が、信頼の assertion が独立検証されないという meta-primitive を共有
- 今後の Pillar 03 ライン候補: Microsoft 365 Copilot Cowork による情報流出事案、GitHub VS Code 拡張機能経由 3800 リポジトリ侵入事案

---

## 9. Sources

- **CVE-2026-48710 公式記録**(MITRE CVE)— BadHost の脆弱性記述と CVSS 評価を含む。https://www.cve.org/CVERecord?id=CVE-2026-48710
- **X41 D-Sec advisory and MCP scanner**(X41 D-Sec 公式)— mcp-scan.nemesis.services の公開 scanner と technical advisory。https://mcp-scan.nemesis.services/
- **Starlette 1.0.1 release notes**(フレームワーク公式、GitHub release)— BadHost への patch 反映。URL: [Mayumi 確認待ち / Starlette 公式 release 投稿先]
- **Ars Technica analysis**: "Millions of AI agents imperiled by critical vulnerability in open source package"(2026-05-27、独立報道)— https://arstechnica.com/information-technology/2026/05/millions-of-ai-agents-imperiled-by-critical-vulnerability-in-open-source-package/
- **Lemma Oracle essay**: 「Proof-as-Auth: 鍵を一度も送らずにサインインする」(2026-05-24、Lemma 自社一次情報)— https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/
- **Lemma Oracle essay**: 「AI 時代のサイバー防衛に残された、最後の層」(2026-05-22、Lemma 自社一次情報)— https://lemma.frame00.com/ja/blog/detection-is-not-proof/
- **Lemma Oracle reference implementation**: verifiable-origin proof sample(Lemma 公開 GitHub)— https://github.com/lemmaoracle/example-origin
