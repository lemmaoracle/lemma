---
brief_no: 37
title: "AI コーディングエージェントが、リポジトリ同梱の設定ファイルを無検証で自動実行した — 承認プロンプトや署名検査では届かない、エージェントの権限・来歴の落差"
title_en: "When the Assistant Becomes the Trigger — AI Coding Agents Auto-Execute Project-Local Config (SymJack / TrustFall + Miasma)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-05
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "027-librechat-mcp-url-secrets", "006-google-api-key-revocation-lag", "003-starlette-badhost"]
status: published
version: "1.0"
og_lead_ja: "AI コーディングエージェントが同梱設定を無検証で自動実行 — SymJack / Miasma"
og_lead_en: "AI coding agents auto-execute project-local config — SymJack / Miasma"
gap_detected: "不正なコミットは検出でき、GitHub は Microsoft 系 4 組織の 73 リポジトリを一斉に無効化できた。"
gap_missing: "エージェントが同梱設定を実行する前に、「この設定は正規の作者に由来し、認可された範囲か」を確かめる層が無く、「開いた／信頼した」操作がそのまま実行の根拠になった。"
gap_fix: "エージェントが同梱設定を実行する前に「この操作は、この主体に、このスコープで認可され、正規の来歴を持つ」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

AI コーディングエージェント（Claude Code・Cursor・Gemini CLI 等）が、リポジトリ同梱の設定ファイルを中身も出どころも検証せず自動実行する欠陥（SymJack / TrustFall）が、自己増殖型マルウェア Miasma に武器化された。不正コミットは検出され GitHub は Microsoft 系 4 組織の 73 リポジトリを無効化したが、設定が実行され認証情報が窃取された後の事後措置である。欠けていたのは、実行の前に「この設定は正規の作者に由来し、認可された範囲か」を確かめる層であり、「開いた／信頼した」操作がそのまま実行の根拠になった。事後の検出と、行動前に出所/認可を独立検証する事前証明は代替でなく補完である。

---

## 1. 事案概要

- **共通の失敗**: AI コーディングエージェントが、プロジェクトに同梱された設定（agent の settings、MCP サーバー定義、起動時フック）を、「ユーザーがプロジェクトを開いた／フォルダを信頼した」ことを十分な認可と見なして自動実行する
- **SymJack（研究、Adversa AI、2026-05-26）**: シンボリックリンク偽装により、ユーザーには無害なファイルコピーに見える操作で、実際にはエージェント自身の設定ファイルを上書きし、次回起動時に攻撃者コードを実行させる。Claude Code・Gemini CLI（Antigravity）・Cursor Agent CLI・GitHub Copilot CLI・Grok Build・OpenAI Codex CLI で確認
- **TrustFall（研究、Adversa AI、2026-05 開示）**: フォルダの信頼プロンプト（既定が「信頼する」）を承認した瞬間に、プロジェクト定義の MCP サーバーが明示承認なしに自動起動し、1 クリックで遠隔コード実行に至る
- **Miasma 第 3 波（実地、2026-06-03〜05）**: 自己増殖型マルウェア Miasma が、リポジトリに `.claude/settings.json`・`.gemini/settings.json`・Cursor の設定ファイルを仕込み、開発者が AI コーディングツールでプロジェクトを開いた瞬間に認証情報窃取ペイロードを実行。Bun ランタイムを取得して二次ペイロードを起動し、GitHub・npm・AWS・Azure・GCP・Vault・Kubernetes 等の認証情報を掃き出して自己増殖する
- **実地の規模**: 2026-06-05、GitHub が Microsoft の 4 組織（Azure・Azure-Samples・Microsoft・MicrosoftDocs）のリポジトリ 73 件を無効化。Miasma は TeamPCP が OSS 化した Mini Shai-Hulud の変種

---

## 2. タイムライン

- 2026-05 上旬: Adversa AI が TrustFall（フォルダ信頼承認で MCP サーバーが自動起動し 1 クリック RCE）を開示
- 2026-05-26: Adversa AI が SymJack（symlink 偽装でエージェント設定を上書きし起動時に実行）を公表。主要な agentic CLI で再現
- 2026-06-01〜03: Miasma が npm の preinstall フック（第 1 波）・binding.gyp 実行（第 2 波、Phantom Gyp）で展開
- 2026-06-03〜05: Miasma 第 3 波。リポジトリに AI エージェント設定ファイルを仕込み、プロジェクトを開いた瞬間に認証情報窃取を実行する手口へ
- 2026-06-05: GitHub が Microsoft の 4 組織のリポジトリ 73 件を無効化。Microsoft は一部リポジトリを一時削除し、審査後に順次復元と説明
- 2026-06: Red Hat 公式 npm チャンネル経由の Miasma 感染も確認され、波が拡大

> 注: 個別リポジトリの感染経路・復元状況は調査の進行に依存するため、本文では断定しない。

---

## 3. 攻撃の経路：エージェントが同梱設定を実行するまで

本事象は、エージェントが同梱設定を行動の前に独立検証しない構造に起因する。失敗が認証情報窃取・横展開へ伝播する経路は以下の通り。

1. **同梱設定の配置**: 攻撃者が、リポジトリに agent の設定（`.claude/settings.json` 等）・MCP サーバー定義・起動時フックを仕込む。あるいは symlink 偽装で、表示と実体（書き込み先）を乖離させる
2. **「開く／信頼する」を認可と見なす**: 開発者がプロジェクトを AI コーディングツールで開く、またはフォルダ信頼プロンプトを承認する。エージェントはこの操作を十分な認可と見なし、同梱設定を自動でロード・実行する。承認プロンプトは「何が実行されるか」を正確には伝えない
3. **実行と窃取**: 設定の実行により、認証情報窃取ペイロードが起動する。Bun ランタイム取得・二次ペイロード起動を経て、開発環境がアクセスできる認証情報（GitHub・npm・クラウド・Vault・Kubernetes 等）が掃き出される
4. **自己増殖**: 窃取した認証情報を使い、その環境からアクセス可能な他リポジトリ・パッケージに同型の設定を仕込み、信頼された公開・コミット経路を通じて増殖する。1 台の感染が組織全体へ波及する
5. **検出と無効化**: 不正コミットが検出されると、プラットフォーム側でリポジトリが一斉無効化される。ただしこれは設定が実行され認証情報が窃取された後に作動する事後の措置である

---

## 4. 構造的論点

本事象は、Pillar 03（エージェント権限証明）の `agent-infrastructure` カテゴリに属する。中心的な失敗 primitive は、**エージェントが、プロジェクトに同梱された設定・アクションを実行する際に、その設定の認可スコープと来歴を行動の前に独立検証しない**点にある。「ユーザーがプロジェクトを開いた／フォルダを信頼した」ことは、同梱設定が安全である・正規の作者に由来するという保証にはならない。承認プロンプト（TrustFall）も、表示されるファイル操作（SymJack）も、実際に何が実行されるかを正確には伝えない。インフォームド・コンセントには、その操作が何をするかの正確な像が必要だが、エージェントの信頼境界はそれを欠いている。secondary に `identity-auth`（実行主体・設定発行元の認証）を併記する。

Brief 027（ユーザー指定の MCP URL がサーバーの秘密を運び出す）、Brief 003（Host ヘッダー操作による MCP server 認証回避）、Brief 014（有効な署名でも成果物は悪性）と対象は異なるが、共通する primitive は同じである。すなわち、**ある操作・設定の実行が、それを認可・検証する layer と切り離されている**。本事案が示すのは、研究で開示された潜在欠陥（SymJack / TrustFall）が、実地のマルウェア（Miasma 第 3 波）によって Microsoft 規模で武器化されたという、設計上の落差から実害への直結である。また Miasma の再燃について、5 月の感染で使われた認証情報が完全にローテーションされていなかった可能性が指摘されており、認証情報の失効属性の独立検証不在（Brief 006）とも接続する。

---

## 5. 検出と証明の落差

本事象では、研究側の開示（Adversa AI）、プラットフォーム側の不正利用対策（GitHub による 73 リポジトリの無効化）、ベンダーリサーチという検出の系列が機能し、手口と感染が外部から可視化された。これは検出の典型的成功であり、本 Brief が検出層の役割を否定するものではない。検出は、手口の公表、感染範囲の特定、無効化と是正に不可欠である。

一方で、検出は「エージェントが実行しようとしている同梱設定が、正規に認可され、正規の作者に由来するか」を、**エージェントがその設定をロード・実行する時点で**独立に立証する材料にはならない。署名検査は「リポジトリは有効」としか見えず、承認プロンプトは「ユーザーが開いた／信頼した」としか見えない。いずれも、設定が認証情報を窃取するか否かを実行前に区別できない。プラットフォームの無効化も、設定が実行された後に作動する事後の系列である。これは検出層の射程外にある、構造的に独立した層の落差である。

現状、AI コーディングエージェントの運用モデル全体において、同梱設定の認可・来歴の独立検証は、「ユーザーが開いた／信頼した」という操作への信頼に依存しており、まだ独立した層として扱われていない。事前証明（pre-execution attestation）は、エージェントが設定・アクションを実行する経路に権限証明を 1 段挟むことで、この落差を埋める。事前証明は検出に対する代替ではなく **補完** であり、両層の組み合わせでエージェント操作の trust boundary が確立される。

---

## 6. 対応経緯と業界動向

- **ベンダー・プラットフォーム**: GitHub が不正コミットを検出してリポジトリを一斉無効化、Microsoft は一部を一時削除し審査後に復元と説明した。AI コーディングツール各社では、フォルダ信頼の既定値・同梱設定の自動実行・MCP サーバー自動起動の扱いが論点となっている
- **研究・標準**: 「承認プロンプトの提示＝インフォームド・コンセント」という業界横断の前提が、研究側（Adversa AI）から問い直された。エージェントが実行する操作の表示と実体の整合、project-local 設定の権限スコープの最小化が課題として挙がっている
- **規制の重心移動**: 規制の重心はデータ開示からコンプライアンス証明へ移りつつある。自律的に動作するエージェントについて、その操作が正規に認可されたものであることを、事後のログではなく行動前に独立検証可能な形で示す要請が強まっている

エージェントの同梱設定の認可・来歴を、実行の時点で独立検証する層の不在は、特定ツールの問題ではなく、AI コーディングエージェントを採用する組織横断の運用課題として残っている。

---

## 7. Lemma による分析

本事象で露呈した落差（エージェントが同梱設定を、その認可・来歴の独立検証から切り離したまま実行する）に対して、Lemma は、エージェントが操作を実行する前に、その操作が認可され正規の来歴を持つことを独立検証可能な暗号証明として要求する設計を提示している。

- **行動前の認可証明（proof-as-auth）**: エージェントが同梱設定の実行・MCP サーバーの起動・破壊的操作を行う前に、「この操作は、この主体に、このスコープで認可されている」ことを署名付きで証明する。「ユーザーが開いた／信頼した」ことを認可の終点にしない
- **設定の来歴バインド**: 実行対象の設定・成果物を、その発行元（正規の作者・配布元）に紐付け、来歴を docHash で検証する。表示と実体（symlink の書き込み先など）の乖離を、実行前に検出可能にする
- **スコープ付き権限**: エージェントに与える権限を操作ごとに最小化し、認可の範囲を超える実行を証明なしには成立させない。エージェントの正規操作と、攻撃者が仕込んだ設定による操作とを、証跡で区別する
- **選択的開示**: 「この操作が認可スキーマを満たす」ことだけを最小開示し、内部の鍵・資格情報は環境外に出さない

これにより、実行の時点で固定された証明が、「この操作は正規に認可され、正規の来歴を持つか」を、エージェントが同梱設定を実行する前に独立検証可能なトレイルとして機能させる。検出（事後の無効化・ベンダーリサーチ）は発覚後の是正に、事前証明（実行前の認可・来歴検証）はエージェント操作の独立検証に、それぞれ相補的に働く。

---

## 8. Sources

- **Adversa AI（研究・一次）**: “The approval prompt is lying: a critical coding agent security flaw”（SymJack、2026-05-26、symlink 偽装でエージェント設定を上書き）— <https://adversa.ai/blog/the-approval-prompt-is-lying-to-you-symlink-rce-in-five-ai-coding-agents-claude-code-cursor-antigravity-copilot-grok-build/>
- **Adversa AI（研究・一次）**: “TrustFall: coding agent security flaw enables one-click RCE in Claude, Cursor, Gemini CLI and GitHub Copilot”（2026-05、フォルダ信頼承認で MCP 自動起動）— <https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/>
- **Microsoft Security Blog（一次）**: “Preinstall to persistence: Inside the Red Hat npm Miasma credential-stealing campaign”（2026-06-02、Miasma の手口と認証情報窃取）— <https://www.microsoft.com/en-us/security/blog/2026/06/02/preinstall-persistence-inside-red-hat-npm-miasma-credential-stealing-campaign/>
- **StepSecurity（ベンダーリサーチ）**: “Miasma Worm Hits Microsoft Again: Azure Functions Action and 72 Other Repositories Disabled”（2026-06、Microsoft 4 組織 73 リポジトリ無効化）— <https://www.stepsecurity.io/blog/miasma-worm-hits-microsoft-again-azure-functions-action-and-72-other-repositories-disabled-after-supply-chain-attack-targeting-ai-coding-agents>
- **safedep（ベンダーリサーチ）**: “Miasma Worm Targets AI Coding Agents via GitHub Repos”（第 3 波、`.claude/settings.json` 等の設定注入による自動実行）— <https://safedep.io/miasma-worm-ai-coding-agent-config-injection/>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
