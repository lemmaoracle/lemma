---
brief_no: 3
title: "Starlette（BadHost）：MCP サーバーの認証が Host ヘッダー操作で回避された — CVE-2026-48710 によるサーバー認証バイパス"
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
og_lead_ja: "Host ヘッダー操作で MCP server の認証を回避 — Starlette CVE-2026-48710 (BadHost)"
og_lead_en: "Host header manipulation bypassed MCP server auth — Starlette CVE-2026-48710 (BadHost)"
gap_detected: "影響を受けるサーバーを脆弱なバージョンから特定するオンライン点検ツールが、発見者から公開された。"
gap_missing: "通信の宛先情報を 1 文字だけ細工すると、本来そこで止めるはずの認証の関門を、行動の前に「誰の正規の要求か」を確かめないまま素通りできた。"
gap_fix: "外部リソースへアクセスする前に「この要求は、誰が、どの権限で、どこまで出したものか」を Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

Starlette の CVE-2026-48710（BadHost）が公開された。Host ヘッダーへの 1 文字挿入で、ルーティングの解決パスとミドルウェアが見るパスが乖離し、パスベース認証を素通りできる。FastAPI / MCP サーバーなど Python AI 基盤の大半が影響を受ける。脆弱バージョンの検出は有用だが、パスベース認証自体が trust boundary を独立検証しておらず、修正パッチだけでは届かない。要求の出所と認可を実行前に独立検証する層が欠けていた事案であり、事後の検出と、行動前に独立検証する事前証明は代替でなく補完である。

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

## 4. 構造的論点

本事案は、AI エージェントを動かす土台の HTTP layer(Starlette)において **「ルーティング解決パス ≠ ミドルウェアが見るパス」という構造的乖離が認証層と切り離されたまま放置されていた** という構造の代表事例である。フレームワーク内部で trust boundary を独立に検証しない設計が、HTTP Host ヘッダーへの 1 文字挿入という最小限の入力操作で破壊される構造になっていた。

Brief 001(KelpDAO/rsETH)や Brief 002(Stake DAO)とは異なる primitive(対象が cross-chain message ではなく HTTP request)だが、両者に通底する構造は同じ:**信頼の assertion(本事案ではパスベース認証)が、それを検証する layer と切り離されている**。前者は cross-chain message の trust source、本事案は HTTP path の trust source。Trust boundary の独立検証不在という構造で同根。

---

## 5. 検出と証明の落差

X41 D-Sec が公開した mcp-scan.nemesis.services は、影響を受けるサーバーを脆弱バージョン特定で検知する。これは「脆弱性が存在するか」の検出であり、運用上有用である。検出企業の役割が本 Brief で否定されるものではない。

一方、本脆弱性の根本は「パスベース認証という仕組み自体が trust boundary を独立検証していない」点にある。Starlette 1.0.1 の patch は当該乖離を修正するが、AI エージェントが外部リソースに HTTP 経由でアクセスする世界では、フレームワーク側のバグ修正に依存しない、より上位の trust boundary 検証が不可欠となる。

事前証明(pre-execution attestation)の文脈でこれを再構成すると、「エージェント / 認証主体 / 委任スコープ」を HTTP request 自体に独立検証可能な暗号証明として埋め込む設計が要求される。フレームワークが何を accept するかではなく、accept されるべきものが何かを別系統で証明する層が必要となる。X41 D-Sec が「CVSS 7 では過小評価」と表現した深刻度は、本質的にはこの構造的欠落の規模に由来する。

なお、Host ヘッダー操作による認証バイパスのような事案において、事後の検知・修正（detection）と、行動の前に出所・認可を独立検証する事前証明（pre-execution attestation）は代替ではなく **補完** の関係にある。MCP サーバーが外部リソースへアクセスする前に要求の正規性を証明することは、脆弱バージョンを検出する取り組みを置き換えるものではなく、これを補って機能するものである。

---

## 6. 対応経緯と業界動向

- **Starlette**: バージョン 1.0.1 で BadHost 修正をリリース。`request.url.path` と実 HTTP path の整合性を回復
- **X41 D-Sec**: mcp-scan.nemesis.services を公開、AI エージェントエコシステム横断のスキャン経路を提供
- **Secwest**: CVSS 評価への警鐘
- FastAPI / vLLM / LiteLLM / Text Generation Inference を採用するプロダクトには即時の依存関係 update が要請される。X41 D-Sec の指摘「深刻度は極めて高い」が示すように、特に MCP server を運用する組織は exposure 全面再評価が必要

X41 D-Sec が列挙した data at risk のカテゴリは、本事案の波及性を示す:バイオ医薬品 AI(臨床試験データベース、M&A データ、SSRF)、本人確認(顔分析、KYB、ライブ PII、内部コードベース)、IoT / 産業機器(踏み台経由 SSH、RCE)、メール / SaaS、人事 / 採用、CMS / マーケティング、文書管理、クラウド監視、サイバーセキュリティ(資産目録、ライブ核スキャナーアクセス)、個人の健康 / 財務データ。MCP サーバーが「すべての企業データへの蝶番」として配置されつつある現状を裏打ちする。

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差(エージェント / 認証主体 / 委任スコープを HTTP request 自体に証明として乗せる層の不在)に対して、Lemma は、エージェントが外部リソースへ HTTP アクセスする時点で「誰が」「どの権限で」「どこまで」「どのリソースに対して」要求しているかを HTTP request 自体に独立検証可能な暗号証明として埋め込み、受信側が config / path ではなく proof を見て accept 判定できる設計を提示している。フレームワーク側の path 解決バグが存在しても、proof は別系統で「この request は正規の委任関係の下で生成された / 生成されていない」を告げる構造である。

---

## 8. Sources

- **CVE-2026-48710 公式記録**(MITRE CVE)— BadHost の脆弱性記述と CVSS 評価を含む。https://www.cve.org/CVERecord?id=CVE-2026-48710
- **X41 D-Sec advisory and MCP scanner**(X41 D-Sec 公式)— mcp-scan.nemesis.services の公開 scanner と technical advisory。https://mcp-scan.nemesis.services/
- **Starlette 1.0.1 release notes**(フレームワーク公式、GitHub release)— BadHost への patch 反映。https://github.com/Kludex/starlette/releases/tag/1.0.1
- **Ars Technica analysis**: "Millions of AI agents imperiled by critical vulnerability in open source package"(2026-05-27、独立報道)— https://arstechnica.com/information-technology/2026/05/millions-of-ai-agents-imperiled-by-critical-vulnerability-in-open-source-package/
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
