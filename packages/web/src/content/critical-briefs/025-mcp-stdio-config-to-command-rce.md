---
brief_no: 25
title: "MCP の標準設計が、広範な遠隔コード実行（RCE）の経路になった — 特定言語の実装バグではなく、対応言語を横断するリファレンス SDK の設計に内在"
title_en: "MCP Design: Config-to-Command Execution and Supply-Chain-Scale RCE — Not a single-language implementation bug but inherent in the reference SDK design across supported languages"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance"]
incident_date: 2026-04-20
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_briefs: ["003-starlette-badhost", "006-google-api-key-revocation-lag", "024-invisible-unicode-instruction-injection", "026-adaptive-ai-worm-runtime-exploit"]
version: "1.0"
status: draft
og_lead_ja: "エージェント基盤の信頼境界が、リファレンス実装の設計段階で検証されない構造"
og_lead_en: "Agent infrastructure trust boundaries, unverified at the reference implementation design level"
gap_detected: "セキュリティ企業や CVE 報告者の調査により、影響範囲の特定と問題の可視化はできた。"
gap_missing: "受け取った設定を「正当な権限に基づく実行か」を実行の前に確かめる層が無く、設定がそのまま実行に直結した。"
gap_fix: "設定から実行に移る前に「この構成は、許可された権限の範囲内にある」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

セキュリティ企業 OX Security の調査で、AI エージェントを動かすための標準的な共通基盤（Anthropic の MCP 公式部品）が、外部から渡された設定をそのまま実行に移す作りになっており、悪用されれば攻撃者が任意のコマンドを動かせる状態だと判明した。これは特定の製品の不具合ではなく標準部品そのものの設計に根ざすため、それを使う数千〜数万の実装に広がり、累計 1 億 5,000 万回超のダウンロード、公開 7,000 台超のサーバー、最大約 20 万インスタンスに影響し得ると報告された。提供元は、この挙動を「想定通り」として中核設計を変えない立場と報じられている。

設定を受理した ≠ 実行を許可した

---

## 1. 事案概要

- **公表**: 2026-04、OX Security が MCP 公式 SDK の設計上の問題を公表（"The Mother of All AI Supply Chains"）。CSA・複数メディアが追随
- **技術的性質**: 特定実装のバグではなく、MCP の STDIO インターフェースにおける「設定から直接コマンド実行」という設計に内在するとされる問題。対応言語（Python/TS/Java/Rust）を横断
- **影響規模**: 累計 1 億 5,000 万回超 DL、公開 7,000 台超のサーバー、最大約 20 万インスタンス（報告ベース）
- **関連 CVE（独立報告）**: MCP SDK 経由のコマンドインジェクション CVE-2026-30623、MCP Inspector CVE-2025-49596、LibreChat CVE-2026-22252、Cursor CVE-2025-54136 ほか（同一の中核問題系列として整理されている）
- **ベンダー対応**: Anthropic は中核アーキテクチャの変更を行わず、当該挙動は「想定通り（expected）」との立場と報じられている。結果として、リファレンス実装が同じパターンを広げ続ける構造が残る

---

## 2. タイムライン

- **2025〜2026**: MCP がエージェント連携の事実上の標準として急速に普及。関連する個別脆弱性（Inspector・各種サーバー実装）が断続的に報告
- **2026-04-20 前後**: OX Security が SDK 設計の中核問題を公表。CSA が "MCP by Design: RCE Across the AI Agent Ecosystem" を整理
- **2026-04**: The Hacker News・Infosecurity Magazine 等が報道（「150M DL」「7,000+ サーバー」「最大 200,000 インスタンス」）
- **以降**: 同一中核問題に基づく CVE が各実装で継続的に報告

---

## 3. 設定から実行までの経路（概略）

本 Brief は再現性のある手順を記載しない。信頼境界の構造を理解するための概略のみを示す。

1. **設定の受理**: MCP サーバー／クライアントが、ツール定義・起動設定など外部由来の構成情報を受理する
2. **設定から実行への直結**: STDIO インターフェース上で、受理した構成が権限の独立検証を挟まずに実行（コマンド起動）へ直結する設計になっている
3. **供給網への伝播**: この設計がリファレンス SDK に内在するため、SDK を用いた各実装（数千〜数万）が同じパターンを継承する。利用側は「公式 SDK だから安全」という暗黙の前提で受け入れる
4. **悪用の成立**: 構成情報を操作できる経路があれば、設定→コマンド実行の直結を通じて RCE が成立し得る。機微データ・内部 DB・API キー・会話履歴へのアクセスに繋がる
5. **帰結**: 単一実装の修正では塞がらず、設計とリファレンス実装の水準で扱わない限り、供給網全体にリスクが残存する

---

## 4. 構造的論点

本事象は、**エージェント基盤の信頼境界が、リファレンス実装の設計段階で独立に検証されない**構造の代表例である。「設定・構成を受理した」ことと「その構成を権限ある実行として許可してよい」ことは本来別の判断だが、設定から実行への直結はこの 2 つを同一視する。検証層が設計の外側にしか存在しないため、ある構成が正当な権限に基づくかは、実行の時点で問われない。

受理した ≠ 許可した

Brief 003（Starlette/BadHost、HTTP Host ヘッダー操作による MCP サーバーの認証回避）と同じ Agent Infrastructure の primitive に属し、本件はその信頼境界の問題が**個別実装ではなくリファレンス設計の水準**で現れた点で、クラスタの中核に位置づけられる。Brief 006（Google API キー失効遅延）でも見られた「ベンダーが当該挙動を『想定通り』とする」構図が再び現れ、利用側で信頼境界を独立検証する層の必要性を浮かび上がらせる。

---

## 5. 検出と証明の落差

本事象では、OX Security・CSA・各 CVE 報告者による検出・開示が機能し、供給網全体の問題が可視化された。脆弱性スキャン・実行時監視・サプライチェーン SBOM などの検出層は、影響範囲の特定と是正に不可欠であり、本 Brief がその役割を否定するものではない。

一方で、検出は「設定から実行への直結」という設計そのものを変えることはできない。ベンダーが当該挙動を「想定通り」とする以上、利用側は脆弱な設計の上で運用を続けることになる。実行時監視は悪用の兆候を捉え得るが、「その構成が正当な権限に基づくものか」を実行の時点で独立に保証する材料にはならない。これは検出層の射程外にある、構造的に独立した層の gap である。

現状、エージェント基盤の運用モデル全体において、設定・構成を権限の観点で実行前に独立検証する層は、まだ独立した層として扱われていない。事前証明（pre-execution attestation）は、設定→実行の経路に権限証明を 1 段挟むことで、この gap を埋める。事前証明は検出に対する代替ではなく**補完**であり、両層の組み合わせでエージェント基盤の trust boundary が確立される。

---

## 6. 対応経緯と業界動向

- **研究・業界団体**: OX Security の公表と CSA の整理により、MCP の設計水準の問題が供給網全体の論点として共有された。複数の独立した CVE 報告が、同一中核問題の広がりを裏づけている
- **ベンダー対応**: 中核アーキテクチャの変更は行われず、当該挙動は「想定通り」との立場と報じられている。リファレンス実装が同じパターンを広げる構造は残存
- **利用側の動き**: MCP サーバー／クライアントの権限分離、構成の出所検証、実行前のスコープ確認など、利用側で信頼境界を補強する実務が広がりつつある

エージェント基盤の信頼境界を実行前に独立検証する層の不在は、特定ベンダーの問題にとどまらず、MCP を採用するエコシステム横断の運用課題として浮上している。

---

## 7. Lemma による分析

Lemma 自身も MCP エコシステムの一部として MCP サーバーを提供しており（Smithery 上で公開）、本 Brief は MCP を否定するものではない。論点は、MCP が普及させた「エージェント連携の利便性」に対して、**信頼境界を独立検証する層が標準では伴っていない**ことにある。Lemma は、その層をエージェント権限証明（Pillar 03）として補う設計を提示している。

- **構成・委任の証跡化**: ツール定義・起動構成・委任関係を発行者署名付きで発行し、Poseidon over BN254 でコミットする。構成の出所と版を docHash で固定する
- **実行前の権限検証**: 設定から実行へ直結させる代わりに、その構成が正当な委任スコープ内であることを Groth16（Circom 回路）で検証してから実行する。スコープ外は実行前に拒否される
- **最小開示**: BBS+ over BLS12-381 により、「この構成は許可された権限に基づく」ことだけを検証側に開示する。委任の全容・内部構成は渡さない

これにより、設定→実行の直結が悪用される経路に、権限の独立検証という 1 段が挟まる。検出（脆弱性スキャン・実行時監視）は発覚後の是正に、事前証明（実行前の権限検証）は信頼境界の固定に、それぞれ相補的に働く。

データは渡さない。証明は渡る。

Models change. Proofs remain.

---

## 8. Sources

研究機関・業界団体・規制報告の公表資料を出典として示す。攻撃の再現に資する詳細は引用しない。

- **OX Security（一次情報・研究）**: "The Mother of All AI Supply Chains: Critical, Systemic Vulnerability at the Core of Anthropic's MCP"（2026-04）— <https://www.ox.security/blog/the-mother-of-all-ai-supply-chains-critical-systemic-vulnerability-at-the-core-of-the-mcp/>
- **CSA（一次情報・業界団体）**: "MCP by Design: RCE Across the AI Agent Ecosystem"（2026-04-20）— <https://labs.cloudsecurityalliance.org/research/csa-research-note-mcp-by-design-rce-ox-security-20260420-csa/>
- **報道（二次情報）**: The Hacker News "Anthropic MCP Design Vulnerability Enables RCE"（2026-04）— <https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html> ／ Infosecurity Magazine "Systemic Flaw in MCP Protocol Could Expose 150 Million Downloads"
- **CVE 参照（一次情報）**: CVE-2026-30623（MCP SDK 経由のコマンドインジェクション、liteLLM advisory）ほか同系列 CVE

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
