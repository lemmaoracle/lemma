---
brief_no: 4
title: "Megalodon GitHub supply chain — 6 時間で 5,561 リポジトリを汚染した CI/CD credential 窃取キャンペーン"
title_en: "Megalodon GitHub Supply Chain — CI/CD Credential-Theft Campaign That Poisoned 5,561 Repositories in 6 Hours"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-22
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["003-starlette-badhost"]
version: "1.0"
status: published
---

## TL;DR

2026 年 5 月に発覚した Megalodon は、自動化されたサプライチェーン攻撃キャンペーン。6 時間で GitHub リポジトリ 5,561 件に 5,781 件の悪意あるコミットが push され、CI/CD 認証情報を盗み取るマルウェアが拡散された。Safe Dep と Ox Security が初期解析、Hudson Rock がインフォスティーラー感染を起点として特定。攻撃の chain は、感染した開発者の窃取された GitHub credentials を用いた直接 push であり、npm パッケージ @tiledesk/tiledesk-server の正規 npm アカウントは触らずに GitHub リポジトリ側を侵害して悪意あるバージョン(2.18.6 〜 2.18.12)を流通させた。本事案は code provenance(commit author / origin)の独立検証不在を露呈した最近の代表事例である。

---

## 1. 事案概要

- **キャンペーン名**: Megalodon
- **発見・報告**: Safe Dep、Ox Security、Hudson Rock
- **規模**: 6 時間で GitHub リポジトリ 5,561 件、悪意あるコミット 5,781 件
- **主要なペイロード経路**: @tiledesk/tiledesk-server npm パッケージ(オープンソースのライブチャット / チャットボット基盤)バージョン 2.18.6 〜 2.18.12(2026-05-19 〜 2026-05-21 公開)。最後のクリーン版は 2.18.5
- **盗み取られたもの**: AWS 秘密鍵、Google Cloud アクセストークン、AWS/GCP/Azure メタデータ、インスタンスロール認証情報、SSH 秘密鍵、Docker / Kubernetes 構成、Vault トークン、GitHub トークン、Bitbucket トークン
- **攻撃者 GitHub アカウント特徴**: ランダムなユーザー名(rkb8el9r、bhlru9nr 等)、侵害された PAT または deploy key を用いて push
- **偽装の特徴**: build-bot / auto-ci / ci-bot / pipeline-bot の 4 つの author 名と、ルーチン CI メンテナンスを装う 7 種類のコミットメッセージを使い回し

---

## 2. タイムライン

- 2026-05-19: tiledesk-server 2.18.6(初の backdoor 版)が npm に公開
- 2026-05-19 〜 2026-05-21: 2.18.7 〜 2.18.12 まで連続して backdoor 版を公開
- 2026-05-22: The Register が Megalodon キャンペーンの初報
- 2026-05-22: Safe Dep と Ox Security がそれぞれ独立に技術解析を公表
- 2026-05-22 前後: Hudson Rock がインフォスティーラー感染を起点とする経路を報告。影響リポジトリと紐づくユーザー名の 33% がスティーラー感染コンピューターと直接一致、加えてメールアドレス経由で追加の一致を確認
- 2026-05-25: Codebook(マキナレコード)が日本語でまとめ報道

---

## 3. 攻撃ベクター

1. **Initial compromise**: インフォスティーラーへの感染。開発者個人マシンから GitHub 認証情報(PAT、deploy key、session token)を窃取
2. **Credential routing**: 窃取された credentials を用いて、感染開発者がアクセス権を持つ複数の GitHub リポジトリに直接 push アクセス
3. **Mass push**: 自動化された script で 6 時間以内に 5,561 リポジトリに対し、ルーチン CI メンテナンス偽装のコミット 5,781 件を push。各コミットは build-bot / auto-ci / ci-bot / pipeline-bot の偽装 author 名を持つ
4. **Persistence vehicle**: GitHub Actions ワークフローファイル(`.github/workflows/`)内に Megalodon ペイロードをバンドル、オリジナルのワークフローを攻撃者の "Optimize-Build" ワークフローに置き換え
5. **Downstream amplification**: リポジトリオーナーが悪意あるコミットを merge すると、当該 CI/CD パイプラインで Megalodon が実行され、自身の CI 環境から AWS / GCP / Azure / Vault credentials を奪取、さらに連鎖伝播
6. **Impact realization 例**: @tiledesk/tiledesk-server の npm アカウント(`eljohnny`)を **攻撃者は一切触れずに**、GitHub リポジトリ側を侵害してメンテナが悪意版を知らずに 2.18.6 〜 2.18.12 として公開

---

## 4. カテゴリと位置

本事案は Pillar 01(来歴証明)の `code-provenance` カテゴリに属する。コミットの author 情報、リポジトリ owner の認証、CI/CD pipeline が trust する commit signature が、いずれも独立検証されない状態で chain を構成しており、attacker が一段(個人開発者の credentials)を奪取するだけで、後段(npm 公開、CI/CD 実行、被疑者なき malicious 配信)全てが正規プロセスを経由して成立した。

secondary_categories には `identity-auth` を併記する。本事案の起点は credentials 窃取であり、credential lifecycle / identity-auth と直接接続する。

Brief 001 / 002(同じ Pillar 01、bridge-config-trust カテゴリ)とは異なる primitive(対象が cross-chain message ではなく code commit)だが、共通の meta-primitive を持つ:**信頼の chain が、各段で独立検証されない**。前者は config / observation 層、本事案は commit author / repo owner の authentication 層。Trust boundary 検証不在という meta-primitive で同根。

Brief 003(Starlette/BadHost)とは Pillar が異なる(本事案は 01 来歴、Brief 003 は 03 エージェント権限)が、credential 集中と認証回避が同じく中核論点である点で隣接する。

---

## 5. 検出 vs 事前証明

本事案では Safe Dep、Ox Security、Hudson Rock の 3 社が独立に解析し、原因(インフォスティーラー起点)と影響範囲(5,561 リポジトリ、4 名義の偽装 author)を 5 日以内に特定した。検出層は事象の輪郭把握に貢献した。

しかし、検出は受信側(GitHub、npm registry、CI/CD パイプライン)が「何を accept するか」自体を変えない。攻撃者の偽装コミットは正規の commit signature プロセスを経由して push され、レジストリは正規のメンテナアカウントによる公開を accept した。検出は damage の拡大を制限したが、accept そのものは止められなかった。

規制報告・行政手続きで「正規の commit / 正規の公開だったか」を立証する材料として、検出スコアは不足する。

事前証明(pre-execution attestation)はこの gap を構造的に埋める。各 commit に「正規の開発者個人によって、正規の権限の下で生成された」ことを示す独立検証可能な暗号証明を埋め込み、CI/CD pipeline が commit を build する前に proof を検証する設計が要求される。GitHub の signing commit(GPG 署名)は概念的に近い方向だが、鍵そのものがマシン上に存在する以上、インフォスティーラーで奪取される構造を残す。Lemma の verifiable-origin proof は、proof 生成過程で鍵を露出せず(Proof-as-Auth と同系統)、commit author の identity を ZK 証明として固定する方向の category にある。

---

## 6. 業界の対応

- **Safe Dep**: tiledesk-server における Megalodon ペイロード経路の特定と公表
- **Ox Security**: Megalodon CI/CD malware の独立解析(リード研究者 Bustan 氏)
- **Hudson Rock**: インフォスティーラー起点の経路を実証データ(33% のユーザー名一致)で確定
- **GitHub / npm**: 同期間に npm の「段階的リリース」を導入(2026-05-22)。流出した token だけではパッケージ公開できないステップを追加(別途関連事案)
- **npm registry**: メンテナアカウントを介した悪意公開の早期発見・撤回プロセスを業界横断で整備中

TeamPCP との関係性:Megalodon の発覚直前に TeamPCP が Shai-Hulud サプライチェーンワームを「オープンソース化」し「サプライチェーン攻撃コンペティション」を発表していたが、Ox Security の Bustan 氏は Megalodon を TeamPCP と結びつける証拠は見つかっていないと言及している。

---

## 7. Lemma の応答層

本事案の primitive(commit author / repo origin の独立検証不在)に対する Lemma の応答は、Brief 001 / 002 と同じく **Pillar 01: 来歴証明(verifiable-origin proof)** に位置する。対象が cross-chain message から code commit に拡張される。

設計の中核は、コミット / リリース / CI/CD pipeline 各段で「この commit / artifact は正規の origin から来た」ことを独立検証可能な暗号証明として固定することにある。

**Reference architecture(参考実装方針)** は Brief 001 §7 と共通の枠(Groth16 over BN254 + Poseidon ハッシュ + Circom サーキット + 第三者検証可能)に立つ。code-provenance 固有の追加要素として、鍵そのものが奪取可能なマシン上に存在しない設計(Proof-as-Auth 系の key-less proof と組み合わせ)が commit author identity proof の要件となる。本 reference architecture の各要素について、現時点の Lemma 実装状況と roadmap 段階の要素については別途プロダクトドキュメント / Whitepaper を参照のこと。

製品ライン上の位置付け:

- **Lemma Critical**(基幹インフラ・製造業対象): OSS 依存を持つすべての enterprise 開発組織に直接対応
- **Trust402**: x402 経済圏での自律エージェント開発フロー(エージェント自身が code をデプロイする世界)では、agent identity と commit origin の連結が必須
- **Pack A: Incident Response**: 本事案で必要となった「どの commit から侵害が始まったか」「どの credentials が漏れたか」の調査自動化
- **Pack B: Regulatory**: 能動的サイバー防御法・NCO 様式・EU AI Act における「使用したコードの出所証明」要件

実装サンプル(verifiable-origin の最小例):
https://github.com/lemmaoracle/example-origin

関連エッセイ:

- [2026 年のブリッジ事象が示しているもの — 「来歴証明(verifiable origin proof)」というカテゴリについて](https://lemma.frame00.com/ja/blog/verifiable-origin-bridge-exploits-2026/)(2026-04-30)
- [Proof-as-Auth: 鍵を一度も送らずにサインインする](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)(2026-05-24)

---

## 8. 関連 Brief

- Lemma Critical Brief No.001 / 002: 同じ Pillar 01 来歴証明、別カテゴリ(bridge-config-trust)。共通の meta-primitive は trust boundary 検証不在
- Lemma Critical Brief No.003: Starlette/BadHost。別 Pillar(03 agent-authority)だが、credential 集中と認証回避が共通論点
- 今後の `code-provenance` ライン候補: GitHub VS Code 拡張機能経由 3800 リポジトリ侵入事案、漏洩 Google API キーが削除後 23 分有効事案、Shai-Hulud / TeamPCP 系の続報

---

## 9. Sources

- **Safe Dep technical analysis**: "Megalodon mass GitHub repo backdooring of CI workflows"(2026-05、Safe Dep 公式 blog)— https://safedep.io/megalodon-mass-github-repo-backdooring-ci-workflows/
- **Ox Security technical analysis**: "Megalodon CI/CD malware on GitHub"(2026-05、Ox Security 公式 blog、リード研究者 Bustan 氏)— https://www.ox.security/blog/megalodon-cicd-malware-github/
- **Hudson Rock analysis**: "Infostealers just spawned a 5,000-repo GitHub supply chain attack"(2026-05、Hudson Rock 公式 blog)— インフォスティーラー起点経路を実証データで確定。https://www.hudsonrock.com/blog/infostealers-just-spawned-a-5000-repo-github-supply-chain-attack
- **The Register**: "Megalodon chums the waters in 55K GitHub repo poisonings"(2026-05-22、独立報道)— https://www.theregister.com/security/2026/05/22/megalodon-chums-the-waters-in-55k-github-repo-poisonings/
- **Lemma Oracle essay**: 「2026 年のブリッジ事象が示しているもの — 来歴証明(verifiable origin proof)というカテゴリについて」(2026-04-30、Lemma 自社一次情報)— https://lemma.frame00.com/ja/blog/verifiable-origin-bridge-exploits-2026/
- **Lemma Oracle essay**: 「Proof-as-Auth: 鍵を一度も送らずにサインインする」(2026-05-24、Lemma 自社一次情報)— https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/
- **Lemma Oracle reference implementation**: verifiable-origin proof sample(Lemma 公開 GitHub)— https://github.com/lemmaoracle/example-origin
