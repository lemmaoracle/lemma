---
brief_no: 14
title: "TanStack npm 汚染 — 正規 OIDC trusted publisher で署名された悪性パッケージ、来歴署名が有効でも成果物は悪性"
title_en: "The TanStack npm Compromise — Malicious Packages Signed Under a Legitimate OIDC Trusted Publisher, Where a Valid Provenance Signature Did Not Mean a Trustworthy Artifact"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-11
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["015-github-vscode-extension-breach", "004-megalodon-github-supply-chain", "018-hackerbot-claw-ai-vs-ai"]
version: "1.0"
status: published
og_lead_ja: "正規 OIDC trusted publisher で署名された悪性パッケージ — TanStack npm 汚染"
og_lead_en: "Malicious npm packages signed under a legitimate OIDC trusted publisher — TanStack"
gap_detected: "外部の研究者が公開から 20〜26 分という短時間で悪性公開を見つけ、影響範囲の特定と注意喚起につなげられた。"
gap_missing: "「正規の発行元が署名した＝信頼できる成果物」という前提で受け取っていたため、署名は本物でも中身が差し替えられた成果物を、署名検証では止められなかった。"
gap_fix: "高リスクな成果物の取り込み前に「この成果物が、意図されたソースとビルド経路から生成されている」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

2026 年 5 月、`@tanstack/*` に悪性バージョンが公開された。攻撃者は認証情報窃取ではなく、TanStack 正規の OIDC trusted publisher 連携をビルド実行中に乗っ取り、本物の発行元として署名された悪性成果物を正規経路から配った。署名は「誰が公開したか」を証すが「中身が意図されたビルド出力か」は証さず、検出公表前に取得した環境は署名が有効であるがゆえに警戒しにくい。事後の検出と、行動前に出所/認可を独立検証する事前証明は代替でなく補完である。

---

## 1. 事案概要

- **対象**: npm 上の `@tanstack/*` 名前空間 42 パッケージ、計 84 悪性バージョン（CVE-2026-45321、CVSS 9.6）
- **公開時刻**: 2026-05-11 19:20–19:26 UTC（約 6 分間）
- **手口の核心**: npm トークン窃取ではなく、TanStack の正規 GitHub Actions OIDC trusted publisher 連携をワークフロー実行中に乗っ取り、**正規の OIDC アイデンティティで署名・公開**。署名付き provenance 証明書は有効なまま悪性成果物が流通した
- **連鎖した脆弱性**: `pull_request_target`（"Pwn Request"）の設定不備 → fork↔base 信頼境界をまたぐ GitHub Actions キャッシュ汚染 → Actions runner プロセスからの OIDC トークンのメモリ抽出
- **ペイロード**: 約 2.3MB の難読化 `router_init.js`。AWS / GCP / Kubernetes / HashiCorp Vault / npm / GitHub トークン / SSH 秘密鍵 / `.npmrc` を窃取。GitHub トークンを 60 秒ごとに監視し、失効を検知すると `rm -rf ~/`（ホームディレクトリ全削除）を実行
- **攻撃主体**: TeamPCP（StepSecurity による帰属）。同日中に npm / PyPI で 170 以上のパッケージ（Mistral AI、UiPath、OpenSearch、Guardrails AI 等）を汚染した "Mini Shai-Hulud" ワームの一部
- **検出**: 外部研究者（StepSecurity の ashishkurmi）が公開後 20–26 分で公的に検知
- **関連**: TeamPCP は Aqua Trivy（2026-03）、Bitwarden CLI npm（2026-04）等も汚染。同時期の GitHub 内部リポジトリ侵害（Brief 015）と同一アクター

---

## 2. タイムライン

- 2026-03 / 2026-04: TeamPCP が Aqua Trivy、Bitwarden CLI npm 等を汚染(前段のキャンペーン)
- 2026-05-11 19:20–19:26 UTC: `@tanstack/*` 42 パッケージに 84 悪性バージョンが、正規 OIDC 公開経路から公開
- 2026-05-11 公開後 20–26 分: StepSecurity の研究者が公的に検知・公表
- 2026-05-11 同日中: 同一アクターが npm / PyPI 横断で 170 以上のパッケージを汚染(Mini Shai-Hulud)
- 2026-05 以降: CVE-2026-45321 採番、TanStack が postmortem を公開、各社が IOC・対応を整理

---

## 3. 攻撃ベクター

1. **Pwn Request の悪用**: `pull_request_target` の設定不備を突き、fork からの PR で base リポジトリの信頼コンテキストにコードを差し込む足がかりを得る
2. **キャッシュ汚染**: GitHub Actions のキャッシュを fork↔base の信頼境界をまたいで汚染し、ワークフロー実行中に攻撃者制御コードを runner 上で実行
3. **OIDC トークンのメモリ抽出**: Actions runner プロセスのメモリから OIDC トークンを実行時に抽出。これにより npm の trusted publisher として**正規に署名・公開する権限**を一時的に掌握
4. **正規経路からの悪性公開**: 盗んだ token ではなく、乗っ取った正規 OIDC アイデンティティで 84 悪性バージョンを公開。provenance 署名は有効なまま
5. **インストール時のペイロード実行**: 導入環境で `router_init.js` が AWS / GCP / Kubernetes / Vault / npm / GitHub / SSH の認証情報を窃取
6. **破壊的トリガ**: GitHub トークンの失効を検知すると `rm -rf ~/` を実行し、被害環境のホームディレクトリを全削除

---

## 4. 構造的論点

本事案は Pillar 01(来歴証明)の `code-provenance` カテゴリに属する。中心的な失敗 primitive は、来歴の保証が「正規の publisher アイデンティティで署名されたか(OIDC trusted publisher)」に依拠していたために、ワークフロー実行中にそのアイデンティティが乗っ取られると、**有効な署名を伴ったまま悪性成果物が正規経路から流通**した点にある。署名は「誰が公開したか」を attest するが、「この成果物の内容が、意図された・レビュー済みのビルド出力か」を attest しない。secondary に `identity-auth`(OIDC アイデンティティの乗っ取り)を併記する。

Brief 004(Megalodon GitHub supply chain)と同じ `code-provenance` だが primitive が異なる。Brief 004 は窃取した開発者 credential での直接 push、本事案は正規 OIDC trusted publisher の実行時乗っ取り。両者は「成果物の origin が、それを独立検証する layer と切り離されたまま accept される」という構造で同根。Brief 015(GitHub 内部リポジトリ侵害、毒入り VS Code 拡張)とは同一アクター(TeamPCP)による開発者信頼面キャンペーンであり、Brief 010(Claude Code 偽装配布)とも「信頼シグナルの悪用」という論点で隣接する。本事案は「有効な署名付き provenance を伴った初のサプライチェーンワーム」とされ、署名の有効性と成果物の完全性の橋渡し不能性を最も鋭く示す。

---

## 5. 検出と証明の落差

本事案では、外部研究者が公開後 20–26 分という短時間で悪性公開を検知・公表し、CVE 採番・postmortem・IOC 整理が続いた。検出・脅威共有の層は被害範囲の把握と封じ込めに不可欠であり、本 Brief がその役割を否定するものではない。

一方で、検出は受信側(npm registry、依存パッケージを取得する CI/CD・開発者環境)が「何を accept するか」自体を変えない。本事案では、悪性成果物が **有効な OIDC provenance 署名を伴って** 正規経路から公開されたため、署名検証は通過した。「trusted publisher が署名した＝信頼できる成果物」という前提が、ワークフロー実行中のアイデンティティ乗っ取りで崩れた。検出が公表されるまでの数十分の窓で取得した環境は、署名が有効であるがゆえに警戒しにくい。規制報告・監査で「この成果物は正規のビルド出力か」を立証する材料として、publisher アイデンティティの署名だけでは独立した証跡にならない。

事前証明(pre-execution attestation)は、来歴を publisher アイデンティティの署名にとどめず、「この成果物が、意図されたソース・ビルド入力・レビュー経路から生成された」ことをビルド来歴に紐づく独立検証可能な暗号証明として固定する設計を採る。ワークフロー実行中に runner が乗っ取られれば、ビルド来歴の proof は不整合となり、受信側は署名が形式上有効でも reject できる。検出(IOC・異常監視)と事前証明(build provenance proof)は代替ではなく **補完** の関係にある。

---

## 6. 対応経緯と業界動向

- **TanStack**: postmortem を公開し、ワークフロー設定(`pull_request_target` の扱い)・OIDC 公開経路の見直しを整理
- **StepSecurity / 研究者**: 公開後 20–26 分で検知・公表し、IOC と影響パッケージを共有
- **npm / GitHub エコシステム**: OIDC trusted publisher と Actions のキャッシュ・信頼境界をめぐる設計が論点化。trusted publisher は token 窃取への対策として推奨されてきたが、実行時のアイデンティティ乗っ取りという新たな攻撃面が顕在化
- **業界横断の論点**: 本事案は "Mini Shai-Hulud" ワームの一部で、同日中に npm / PyPI 横断 170 以上のパッケージへ波及。axios(2026-04)など正規公開パイプラインの悪用が続いており、依存パッケージのバージョン監視と、署名検証に加えたビルド来歴の検証が課題として浮上

「正規の署名・正規の公開経路だったか」だけでなく「成果物が意図されたビルド来歴から生成されたか」をどう検証するかが、本事案を契機にサプライチェーン防御の論点として進む見込み。

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差(来歴の保証が publisher アイデンティティの署名にとどまり、ワークフロー実行中の乗っ取りで有効署名のまま悪性成果物が流通する)に対して、Lemma は、来歴を「誰が公開したか」の署名ではなく、「この成果物がどのソース・ビルド入力・経路から生成されたか」を独立検証可能な暗号証明としてビルド来歴に固定する設計を提示している。OIDC アイデンティティが実行時に乗っ取られても、ビルド来歴の proof は別系統で「正規のビルド経路から生成された / されていない」を告げるため、受信側は署名が形式上有効でも proof の不整合で reject できる。Lemma は既存の署名・trusted publisher を否定するものではなく、署名(publisher の同定)に対してビルド来歴の証明(成果物の origin)を補完する層を提供する。

---

## 8. Sources

- **Snyk**: "TanStack npm Packages Hit by Mini Shai-Hulud"(2026-05、攻撃概要・OIDC 乗っ取り・ペイロード)— https://snyk.io/blog/tanstack-npm-packages-compromised/
- **TanStack 公式 postmortem**: "Postmortem: TanStack npm supply-chain compromise"(2026-05)— https://tanstack.com/blog/npm-supply-chain-compromise-postmortem
- **GitHub Advisory Database / CVE-2026-45321**: "Malware in @tanstack/* packages exfiltrates cloud credentials, GitHub tokens, and SSH keys"(GHSA-g7cv-rxg3-hmpx)— https://github.com/advisories/GHSA-g7cv-rxg3-hmpx
- **The Hacker News**: "Mini Shai-Hulud Worm Compromises TanStack, Mistral AI, Guardrails AI & More Packages"(2026-05)— https://thehackernews.com/2026/05/mini-shai-hulud-worm-compromises.html
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
