---
brief_no: 15
title: "GitHub 内部リポジトリ侵害 — マーケット掲載 18 分の毒入り VS Code 拡張が開発者の信頼面を突いた"
title_en: "The GitHub Internal Repository Breach — A Poisoned VS Code Extension, Live for 18 Minutes, Exploited the Developer Trust Surface"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-18
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "010-claude-code-leak-lure"]
version: "1.0"
status: published
og_lead_ja: "マーケット掲載 18 分の毒入り VS Code 拡張で開発者を突破 — GitHub 内部侵害"
og_lead_en: "A poisoned VS Code extension lived 18 minutes on the marketplace — GitHub internal breach"
gap_detected: "GitHub は翌日に不正アクセスを検知し、即日で重要な認証情報を切り替えて影響範囲（社内リポジトリのみ・顧客非影響）を特定・公表できた。"
gap_missing: "正規マーケットに正規拡張として並んでいた毒入り版を、署名や掲載という信頼の印だけでインストール前に見分ける手立てが無く、抜き取られた認証情報も静的で別環境からそのまま使い回せた。"
gap_fix: "開発ツールの取り込み前に「この拡張が正規のビルド経路から生成された改ざんのない成果物である」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

2026 年 5 月、攻撃グループ TeamPCP が、正規 VS Code 拡張 Nx Console の trojan 化版を公式マーケットに 18 分間掲載し、インストールした GitHub 従業員の端末から認証情報を窃取、社内リポジトリ約 3,800 件を複製した。悪性版は正規拡張として並び、署名・掲載という信頼の印を通過したため、インストール前に見分けられなかった。事後の検出・撤回は受信側が何を取り込むかを変えない。

---

## 2. 何が起きたか

- **影響を受けた組織**: GitHub(自社の内部リポジトリ)
- **攻撃主体**: TeamPCP(別名 UNC6780)。オープンソースのセキュリティ系ユーティリティや AI ミドルウェアを標的とするサプライチェーン攻撃グループ
- **侵入口**: 正規拡張 Nx Console(`nrwl.angular-console`)の trojan 化バージョン v18.95.0。VS Code Marketplace に 2026-05-18 公開、悪性版の掲載は 12:30–12:48 UTC の約 18 分間
- **窃取対象**: IDE ローカル環境から 1Password 保管庫、Anthropic Claude Code 設定、npm・GitHub・AWS の認証情報・アクセストークン
- **被害**: GitHub の内部リポジトリ約 3,800 件をクローン・窃取。犯罪フォーラムで 5 万ドル超で売却の掲載
- **影響範囲(GitHub 公表)**: 顧客リポジトリ・Enterprise アカウント・ユーザーデータには影響なし。流出は GitHub 内部リポジトリのみで、約 3,800 件という主張は調査と整合的
- **検知・対応**: GitHub が 2026-05-19 に検知、即日 IR・重要シークレットのローテーション。2026-05-26 に GHES 3.20.3 をリリースし予防的な署名鍵ローテーションを実施
- **関連**: TeamPCP は Aqua Trivy、Checkmarx KICS、LiteLLM、Telnyx SDK、TanStack([Brief 014](https://lemma.frame00.com/ja/critical/briefs/014-tanstack-oidc-trusted-publisher/))、Mistral AI 等も汚染。[Brief 014](https://lemma.frame00.com/ja/critical/briefs/014-tanstack-oidc-trusted-publisher/) と同一アクターの開発者信頼面キャンペーン

事象は次の連鎖で成立している。

1. **信頼面への毒入れ**: 正規拡張 Nx Console の trojan 化版を VS Code Marketplace に公開。開発者が日常的に信頼するマーケット・拡張という経路を悪用
2. **短時間掲載**: 悪性版の掲載は約 18 分間に限定し、審査・撤回の網にかかりにくい窓を作る
3. **ローカル環境からの認証情報窃取**: インストール先の IDE ローカル環境から 1Password 保管庫・Claude Code 設定・npm / GitHub / AWS の認証情報・トークンを収集。拡張は IDE 内のローカルシークレットに広範にアクセスできる構造
4. **横展開**: 窃取した GitHub 認証情報で内部リポジトリへアクセス
5. **大規模クローン**: GitHub 内部リポジトリ約 3,800 件をクローン・窃取
6. **収益化**: 窃取データを犯罪フォーラムで 5 万ドル超の売却対象として掲載

---

## 3. 時系列 — 公表と対応

- 2026-05-18 12:30–12:48 UTC: Nx Console の trojan 化版 v18.95.0 が VS Code Marketplace に掲載(約 18 分間)。この間に従業員端末が侵害され、認証情報が窃取される
- 2026-05-18 以降: 窃取した認証情報で GitHub 内部リポジトリ約 3,800 件をクローン
- 2026-05-19: GitHub が不正アクセスを検知、IR 開始、重要シークレットを即日ローテーション
- 2026-05-20 前後: GitHub が「毒入り VS Code 拡張を介した従業員端末侵害を検知・封じ込め」と公表。TeamPCP が内部リポジトリの売却をダークウェブ／犯罪フォーラムに掲載(5 万ドル超)
- 2026-05-26: GHES 3.20.3 リリース、予防的署名鍵ローテーション

> 注: 固有名・CVE は一次（研究機関・GitHub Advisory・NVD 等）に基づき、各実装の対応状況は時点により異なるため最新情報を参照。

公表後の対応と業界の動きは次のとおり。

- **GitHub**: 2026-05-19 に検知・IR 開始、重要シークレットを即日ローテーション。内部リポジトリのみ流出・顧客非影響と公表。2026-05-26 に GHES 3.20.3 で予防的署名鍵ローテーション
- **VS Code / 拡張エコシステム**: マーケットプレイス掲載拡張の審査・撤回プロセスと、拡張が IDE ローカルシークレットへ持つアクセス範囲が論点化。開発組織における拡張インストールポリシーの整備が急務とされる
- **業界横断の論点**: 本事案は TeamPCP による一連の開発者信頼面キャンペーン(Aqua Trivy、Checkmarx KICS、LiteLLM、Telnyx SDK、TanStack、Mistral AI 等)の一環。開発インフラそのものを狙う攻撃が 2026 年に集中し、「侵害前提」での開発環境シークレット管理(静的トークンの最小化)と成果物来歴の検証が共通課題として浮上

「開発者が信頼する配布・公開の経路(拡張・パッケージ・ブランド)が、成果物の完全性をどう保証するか」は、本事案を契機に開発組織の調達・運用の論点として進む見込み。

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「開発者ツール（IDE 拡張）の正規マーケット掲載・配布経路が、この拡張バージョンが安全な意図された成果物かを保証しないまま、開発者の信頼の前提として機能した」</strong>点にある。拡張がインストール先の IDE ローカル環境のシークレットに広範にアクセスできる構造が、被害を認証情報窃取へと直結させた。

Brief 014(TanStack OIDC trusted publisher 汚染)と同一アクター(TeamPCP)による開発者信頼面キャンペーンであり、対の事案として相互参照する。[Brief 014](https://lemma.frame00.com/ja/critical/briefs/014-tanstack-oidc-trusted-publisher/) はパッケージ公開経路(OIDC アイデンティティ)の乗っ取り、本事案は IDE 拡張という配布経路の悪用。両者は「開発者が信頼する配布・公開の経路が、成果物の完全性を独立検証する layer と切り離されている」という構造で同根。Brief 004(Megalodon、commit author の origin 偽装)、Brief 010(Claude Code 偽装配布、ブランド信頼シグナルの悪用)とも隣接する。

本事案では、GitHub が翌日に検知して即日 IR・シークレットローテーションに動き、影響範囲(内部リポジトリのみ・顧客非影響)を特定して公表した。検出・封じ込めの層は被害の確定と拡大防止に不可欠であり、本 Brief がその役割を否定するものではない。

一方で、検出は「どの拡張バージョンを accept してインストールするか」「インストールされた拡張がローカルシークレットにアクセスできるか」自体を変えない。悪性版は正規マーケットに正規拡張として掲載され、署名・掲載という信頼シグナルを通過した。掲載が 18 分間に限定されたことで、審査・撤回が事象に追いつく前にインストールが成立した。さらに、窃取された認証情報の多くは再利用可能な静的トークンであり、端末から抜き取られた時点で別環境から replay 可能だった。規制報告・監査で「この拡張は正規の・改ざんされていない成果物だったか」を立証する材料として、マーケット掲載や署名だけでは独立した証跡にならない。

---

## 5. 証明があれば、何が変わるか

事前証明(pre-execution attestation)は、(1) 拡張・ツールの成果物に「正規の origin・ビルド経路から生成された」ことを示すビルド来歴の独立検証可能な証明を付与し、取得側がインストール前に検証する、(2) 開発環境の認証を、端末上に静的な再利用可能トークンを置かない key-less な証明に置き換える、という二方向で構造を変える。前者は trojan 化版の不整合を検出時点ではなく実行前に reject し、後者は端末から窃取された「認証情報」が別環境で replay できないようにする。検出(拡張の事後撤回・IR)と事前証明(成果物来歴 + key-less 認証)は代替ではなく **補完** の関係にある。

本事案で露呈した検出と証明の落差(開発者ツールの正規配布経路が成果物の完全性を保証せず、端末上の再利用可能トークンが窃取で replay される)に対して、Lemma は二方向の設計を提示している。

- **成果物来歴の証明**: 拡張・ツール等の成果物に「正規の origin・ビルド経路から生成された」ことをビルド来歴の独立検証可能な暗号証明として固定する。
- **実行前の reject**: 取得側が実行前に proof を検証し、正規マーケットに掲載された trojan 化版を署名の有無に依らず reject できるようにする。
- **key-less 認証**: 開発環境の認証を端末上に静的な再利用可能トークンを残さない key-less な証明に置き換える。
- **replay 不能化**: 端末から窃取された「認証情報」が別環境で replay されないようにする。

Lemma はマーケットの審査や検出を否定するものではなく、配布経路の信頼シグナルに対して成果物来歴の証明と key-less 認証を補完する層を提供する。

---

## 6. Sources

- **Help Net Security**: "TeamPCP breached GitHub's internal codebase via poisoned VS Code extension"(2026-05-20)— https://www.helpnetsecurity.com/2026/05/20/github-breached-teampcp/
- **The Hacker News**: "GitHub Internal Repositories Breached via Malicious Nx Console VS Code Extension"(2026-05、拡張名・掲載時間・窃取対象)— https://thehackernews.com/2026/05/github-internal-repositories-breached.html
- **Sophos**: "GitHub internal repositories breached"(2026-05、手口と対応)— https://www.sophos.com/en-us/blog/github-internal-repositories-breached
- **Infosecurity Magazine**: "GitHub Confirms Breach of Internal Repositories Via Malicious VS Code Extension"(2026-05、GitHub の公表内容・影響範囲)— https://www.infosecurity-magazine.com/news/github-confirms-breach-vs-code/
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/)、[Trust402](https://lemma.frame00.com/ja/trust402/)
