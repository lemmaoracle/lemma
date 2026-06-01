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
related_briefs: ["014-tanstack-oidc-trusted-publisher", "003-starlette-badhost"]
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
- 2026-05-22: Safe Dep と Ox Security がそれぞれ独立に技術解析を公表
- 2026-05-22 前後: Hudson Rock がインフォスティーラー感染を起点とする経路を報告。影響リポジトリと紐づくユーザー名の 33% がスティーラー感染コンピューターと直接一致、加えてメールアドレス経由で追加の一致を確認

---

## 3. 攻撃ベクター

1. **Initial compromise**: インフォスティーラーへの感染。開発者個人マシンから GitHub 認証情報(PAT、deploy key、session token)を窃取
2. **Credential routing**: 窃取された credentials を用いて、感染開発者がアクセス権を持つ複数の GitHub リポジトリに直接 push アクセス
3. **Mass push**: 自動化された script で 6 時間以内に 5,561 リポジトリに対し、ルーチン CI メンテナンス偽装のコミット 5,781 件を push。各コミットは build-bot / auto-ci / ci-bot / pipeline-bot の偽装 author 名を持つ
4. **Persistence vehicle**: GitHub Actions ワークフローファイル(`.github/workflows/`)内に Megalodon ペイロードをバンドル、オリジナルのワークフローを攻撃者の "Optimize-Build" ワークフローに置き換え
5. **Downstream amplification**: リポジトリオーナーが悪意あるコミットを merge すると、当該 CI/CD パイプラインで Megalodon が実行され、自身の CI 環境から AWS / GCP / Azure / Vault credentials を奪取、さらに連鎖伝播
6. **Impact realization 例**: @tiledesk/tiledesk-server の npm アカウント(`eljohnny`)を **攻撃者は一切触れずに**、GitHub リポジトリ側を侵害してメンテナが悪意版を知らずに 2.18.6 〜 2.18.12 として公開

---

## 4. 構造的論点

本事案は、コミット / リリース / CI/CD pipeline の各段で **commit author の identity と repository owner の認証が独立検証されないまま chain を構成していた** という構造の代表事例である。attacker が一段(個人開発者の credentials)を奪取するだけで、後段(npm 公開、CI/CD 実行、被疑者なき malicious 配信)全てが正規プロセスを経由して成立した。

Brief 001 / 002(同じ bridge ベースの cross-chain message trust)とは異なる primitive(対象が cross-chain message ではなく code commit)だが、共通の構造を持つ:**信頼の chain が、各段で独立検証されない**。前者は config / observation 層、本事案は commit author / repo owner の authentication 層。Trust boundary 検証不在という構造で同根。

Brief 003(Starlette/BadHost)とは別の構造(本事案は code commit の origin、Brief 003 は HTTP request の authentication)に見えるが、credential 集中と認証回避が共通論点である点で隣接する。

---

## 5. Detection 層では届かない構造的 gap

本事案では Safe Dep、Ox Security、Hudson Rock の 3 社が独立に解析し、原因(インフォスティーラー起点)と影響範囲(5,561 リポジトリ、4 名義の偽装 author)を 5 日以内に特定した。検出層は事象の輪郭把握に貢献し、業界横断で問題を可視化した。検出企業の役割が本 Brief で否定されるものではない。

しかし、検出は受信側(GitHub、npm registry、CI/CD パイプライン)が「何を accept するか」自体を変えない。攻撃者の偽装コミットは正規の commit signature プロセスを経由して push され、レジストリは正規のメンテナアカウントによる公開を accept した。検出は damage の拡大を制限したが、accept そのものは止められなかった。

規制報告・行政手続きで「正規の commit / 正規の公開だったか」を立証する材料として、検出スコアは独立した証跡を伴わない。事前証明(pre-execution attestation)は、検出に対する代替ではなく **補完** の関係に位置する。各 commit に「正規の開発者個人によって、正規の権限の下で生成された」ことを示す独立検証可能な暗号証明を埋め込み、CI/CD pipeline が commit を build する前に proof を検証する設計が要求される。GitHub の signing commit(GPG 署名)は概念的に近い方向だが、鍵そのものがマシン上に存在する以上、インフォスティーラーで奪取される構造を残す。鍵を露出させずに commit author の identity を ZK 証明として固定する方向の議論は、別途 [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)(Lemma、2026-05)を参照(検出と事前証明の関係についての thesis は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)(Lemma、2026-05)を参照)。

---

## 6. 対応経緯と業界動向

- **Safe Dep**: tiledesk-server における Megalodon ペイロード経路の特定と公表
- **Ox Security**: Megalodon CI/CD malware の独立解析(リード研究者 Bustan 氏)
- **Hudson Rock**: インフォスティーラー起点の経路を実証データ(33% のユーザー名一致)で確定
- **GitHub / npm**: 同期間に npm の「段階的リリース」を導入(2026-05-22)。流出した token だけではパッケージ公開できないステップを追加(別途関連事案)
- **npm registry**: メンテナアカウントを介した悪意公開の早期発見・撤回プロセスを業界横断で整備中

TeamPCP との関係性:Megalodon の発覚直前に TeamPCP が Shai-Hulud サプライチェーンワームを「オープンソース化」し「サプライチェーン攻撃コンペティション」を発表していたが、Ox Security の Bustan 氏は Megalodon を TeamPCP と結びつける証拠は見つかっていないと言及している。

---

## 7. Lemma による分析

本事案で露呈した構造的 gap(commit author / repo origin の独立検証不在)に対して、Lemma は、コミット / リリース / CI/CD pipeline 各段で「この commit / artifact は正規の origin から来た」ことを独立検証可能な暗号証明として固定する設計を提示している。鍵そのものが奪取可能なマシン上に存在しない設計(key-less proof と組み合わせ)を中核とし、commit author の identity を ZK 証明として固定する方向にある。設計の詳細は [「2026 年のブリッジ事象が示しているもの — 来歴証明というカテゴリについて」](https://lemma.frame00.com/ja/blog/verifiable-origin-bridge-exploits-2026/)(Lemma、2026-04)および [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)(Lemma、2026-05)、リファレンス実装は [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin)(GitHub)を参照のこと。

---

## 8. Sources

- **Safe Dep technical analysis**: "Megalodon mass GitHub repo backdooring of CI workflows"(2026-05、Safe Dep 公式 blog)— https://safedep.io/megalodon-mass-github-repo-backdooring-ci-workflows/
- **Ox Security technical analysis**: "Megalodon CI/CD malware on GitHub"(2026-05、Ox Security 公式 blog、リード研究者 Bustan 氏)— https://www.ox.security/blog/megalodon-cicd-malware-github/
- **Hudson Rock analysis**: "Infostealers just spawned a 5,000-repo GitHub supply chain attack"(2026-05、Hudson Rock 公式 blog)— インフォスティーラー起点経路を実証データで確定。https://www.hudsonrock.com/blog/infostealers-just-spawned-a-5000-repo-github-supply-chain-attack
