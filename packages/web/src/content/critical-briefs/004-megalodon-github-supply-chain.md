---
brief_no: 4
title: "Megalodon GitHub サプライチェーン — 6 時間で 5,561 リポジトリを汚染した CI/CD 認証情報窃取キャンペーン"
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
og_lead_ja: "6 時間で 5,561 リポジトリの CI/CD 認証情報を窃取 — Megalodon GitHub サプライチェーン"
og_lead_en: "5,561 repos poisoned in 6 hours via CI/CD credential theft — Megalodon GitHub supply chain"
gap_detected: "セキュリティ企業 3 社が独立に解析し、感染の起点と影響範囲（5,561 リポジトリ）を 5 日以内に特定できた。"
gap_missing: "盗まれた正規の認証情報で投入されたため、コードを取り込む前に「本当に正規の開発者が出したものか」を確かめる層が無く、偽装コミットが正規扱いで通った。"
gap_fix: "コードを取り込み・公開する前に「この変更は正規の開発者が正規の権限で出したものである」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

Megalodon は、窃取した開発者の正規認証情報を悪用し、6 時間で GitHub 上 5,561 リポジトリに偽装コミットを送り込んだ CI/CD 認証情報窃取キャンペーンである。3 社が 5 日内に起点と範囲を特定したが、検出は受信側が「何を accept するか」を変えない。偽装コミットは正規プロセスを経て push され受理された。検出と事前証明は代替でなく補完である。

---

## 1. 事案概要

- **キャンペーン名**: Megalodon
- **発見・報告**: Safe Dep、Ox Security、Hudson Rock
- **規模**: 6 時間で GitHub リポジトリ 5,561 件、悪意あるコミット 5,781 件
- **主要なペイロード経路**: @tiledesk/tiledesk-server npm パッケージ(オープンソースのライブチャット / チャットボット基盤)バージョン 2.18.6 〜 2.18.12(2026-05-19 〜 2026-05-21 公開)。最後のクリーン版は 2.18.5
- **盗み取られたもの**: AWS 秘密鍵、Google Cloud アクセストークン、AWS/GCP/Azure メタデータ、インスタンスロール認証情報、SSH 秘密鍵、Docker / Kubernetes 構成、Vault トークン、GitHub トークン、Bitbucket トークン
- **攻撃者 GitHub アカウント特徴**: ランダムなユーザー名(rkb8el9r、bhlru9nr 等)、侵害された PAT または deploy key を用いて push
- **偽装の特徴**: build-bot / auto-ci / ci-bot / pipeline-bot の 4 つの author 名と、ルーチン CI メンテナンスを装う 7 種類のコミットメッセージを使い回し
- **核心**: 本事案の構造的失敗は、commit author の identity と repository owner の認証が各段で独立検証されないまま信頼の chain を構成し、盗まれた正規認証情報による偽装コミットが「正規開発者の正規コミット」として受理された点にある。

---

## 2. タイムライン

- 2026-05-19: tiledesk-server 2.18.6(初の backdoor 版)が npm に公開
- 2026-05-19 〜 2026-05-21: 2.18.7 〜 2.18.12 まで連続して backdoor 版を公開
- 2026-05-22: Safe Dep と Ox Security がそれぞれ独立に技術解析を公表
- 2026-05-22 前後: Hudson Rock がインフォスティーラー感染を起点とする経路を報告。影響リポジトリと紐づくユーザー名の 33% がスティーラー感染コンピューターと直接一致、加えてメールアドレス経由で追加の一致を確認

> 注: 固有名・パッケージ名・バージョンは Safe Dep・Ox Security・Hudson Rock の各一次解析および npm registry の公開情報に基づき、各実装の対応状況は時点により異なるため最新情報を参照のこと。

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

## 5. 検出と証明の落差

本事案では Safe Dep、Ox Security、Hudson Rock の 3 社が独立に解析し、原因(インフォスティーラー起点)と影響範囲(5,561 リポジトリ、4 名義の偽装 author)を 5 日以内に特定した。検出層は事象の輪郭把握に貢献し、業界横断で問題を可視化した。検出企業の役割が本 Brief で否定されるものではない。

しかし、検出は受信側(GitHub、npm registry、CI/CD パイプライン)が「何を accept するか」自体を変えない。攻撃者の偽装コミットは正規の commit signature プロセスを経由して push され、レジストリは正規のメンテナアカウントによる公開を accept した。検出は damage の拡大を制限したが、accept そのものは止められなかった。

規制報告・行政手続きで「正規の commit / 正規の公開だったか」を立証する材料として、検出スコアは独立した証跡を伴わない。事前証明(pre-execution attestation)は、検出に対する代替ではなく **補完** の関係に位置する。各 commit に「正規の開発者個人によって、正規の権限の下で生成された」ことを示す独立検証可能な暗号証明を埋め込み、CI/CD pipeline が commit を build する前に proof を検証する設計が要求される。GitHub の signing commit(GPG 署名)は概念的に近い方向だが、鍵そのものがマシン上に存在する以上、インフォスティーラーで奪取される構造を残す。求められるのは、鍵を露出させずに commit author の identity を ZK 証明として固定する方向である。

事後の検知が証明にならない論点は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、行動前に独立検証する設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）を参照。

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

Lemma の設計は、commit author / repo origin の独立検証不在という本事案の gap に対し、CI/CD pipeline が build する前に各 commit の来歴を proof として検証する点で対置される。

- **発信元の来歴バインド**: コミット / リリース / CI/CD pipeline 各段で「この commit / artifact は正規の origin から来た」ことを独立検証可能な暗号証明として固定する。
- **鍵を露出させない設計(key-less proof)**: GPG 署名と異なり鍵そのものを奪取可能なマシン上に置かないため、インフォスティーラーで credentials を奪っても偽装コミットの proof は生成できない。
- **行動前の認可証明(proof-as-auth)**: commit author の identity を ZK 証明として固定し、pipeline が build / merge する前段で正規の権限を検証する。
- **検出との補完**: 3 社が範囲を特定したような事後解析と、accept 前に来歴を固定する proof は、対立軸ではなく二段構成として機能する。

これは「暗号論理的に有効 ≠ 来歴が正しい」という来歴証明カテゴリの設計思想であり、検出層を置き換えるものではなく補完する。

設計と適用範囲は、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) および [Trust402](https://lemma.frame00.com/ja/trust402/) を参照のこと。

---

## 8. Sources

- **Safe Dep technical analysis**: "Megalodon mass GitHub repo backdooring of CI workflows"(2026-05、Safe Dep 公式 blog)— https://safedep.io/megalodon-mass-github-repo-backdooring-ci-workflows/
- **Ox Security technical analysis**: "Megalodon CI/CD malware on GitHub"(2026-05、Ox Security 公式 blog、リード研究者 Bustan 氏)— https://www.ox.security/blog/megalodon-cicd-malware-github/
- **Hudson Rock analysis**: "Infostealers just spawned a 5,000-repo GitHub supply chain attack"(2026-05、Hudson Rock 公式 blog)— インフォスティーラー起点経路を実証データで確定。https://www.hudsonrock.com/blog/infostealers-just-spawned-a-5000-repo-github-supply-chain-attack
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
