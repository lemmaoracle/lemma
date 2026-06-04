---
brief_no: 2
title: "Stake DAO vsdCRV 不正ミント — デプロイヤー鍵による LayerZero v2 信頼設定書き換え"
title_en: "Stake DAO vsdCRV Unauthorized Mint — LayerZero v2 Trust Source Rewriting via Deployer Key"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-27
published: 2026-05-29
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["001-kelpdao-rseth", "016-verus-ethereum-bridge"]
version: "1.0"
status: published
og_lead_ja: "デプロイヤー鍵で LayerZero 信頼設定を書き換え不正ミント — Stake DAO vsdCRV"
og_lead_en: "Deployer key rewrote LayerZero v2 trust config to mint tokens — Stake DAO vsdCRV"
---

## TL;DR

2026 年 5 月 27 日、DeFi プロトコル Stake DAO の vsdCRV を巡る cross-chain インフラ上で、Arbitrum 上に 5.4 兆 vsdCRV が不正にミントされた。攻撃者は Stake DAO デプロイヤー秘密鍵を侵害し、その鍵を用いて LayerZero v2 における vsdCRV の信頼設定(Arbitrum 側 vsdCRV が message を受け入れる Ethereum 側 trusted source)を、攻撃者自身が展開したコントラクトへ書き換えた。その後、攻撃者のコントラクトから偽 cross-chain メッセージを送信して 5.4 兆 vsdCRV を不正ミントし、一部を 43.781 ETH(約 $91K)へ交換して Ethereum へブリッジした。Stake DAO チームは即座にメインネット側 vsdCRV の裏付資産を保護し、vsdCRV ブリッジを停止することで影響範囲を Arbitrum に限定した。

---

## 1. 事案概要

- **被害規模**: Arbitrum 上で 5.4 兆 vsdCRV を不正ミント。一部を 43.781 ETH(約 $91K)に swap し Ethereum へブリッジ
- **対象プロトコル**: Stake DAO(vsdCRV ガバナンス派生トークン)
- **基盤**: LayerZero v2 を介した cross-chain message
- **被害認識**: 2026-05-27、Blockaid が real-time 検出
- **侵害された資産**: Stake DAO デプロイヤー秘密鍵
- **影響範囲**: Arbitrum に限定。Boosted Yields、Liquid Lockers、Votemarket、Morpho 上の Stake DAO レンディングは影響なし
- **継続事案**: Arbitrum 上の asdCRV Llamalend 市場は終了手続きへ

---

## 2. タイムライン

- 2026-05-27 早期: 攻撃者が Stake DAO デプロイヤー秘密鍵を用いて LayerZero v2 設定を書き換え、その後の偽メッセージ送信で 5.4 兆 vsdCRV を Arbitrum 上にミント
- 2026-05-27: Blockaid が ongoing exploit として real-time 検出、attack 過程を公開
- 2026-05-27: PeckShield Alert が swap および bridge を含む流出経路を解析
- 2026-05-28: Stake DAO 公式が初期声明。コントリビューターがメインネット上の vsdCRV 裏付資産を保護、vsdCRV ブリッジを停止
- 2026-05-29: Stake DAO チームが初期調査結果を公表。影響範囲が Arbitrum に限定されたこと、Boosted Yields など主要プロトコルが影響外であることを確認。法執行機関およびセキュリティパートナーと連携した調査継続

---

## 3. 攻撃ベクター

1. **Initial compromise**: Stake DAO デプロイヤー秘密鍵の侵害。詳細経路は記事執筆時点で未公表
2. **Trust source rewriting**: 侵害したデプロイヤー鍵を用いて LayerZero v2 設定を変更。本来、Arbitrum 側 vsdCRV は Ethereum 側の正規コントラクトから送られる cross-chain message のみを trust する仕組みだったが、攻撃者はその trusted source の指定を、自身が展開したコントラクトへ書き換えた
3. **Forged messages**: 攻撃者のコントラクトから偽の cross-chain message を Arbitrum 側 vsdCRV へ発出
4. **Impact realization**: Arbitrum 側 vsdCRV が偽 message を accept、5.4 兆 vsdCRV が不正ミント。一部を DEX 上で 43.781 ETH(約 $91K)へ swap、Ethereum へブリッジ
5. **Containment**: Stake DAO チームが速やかにメインネット側 vsdCRV 裏付資産を保護、vsdCRV ブリッジを停止することで影響範囲を Arbitrum に限定。攻撃者は裏付資産を seize することはできなかった

---

## 4. 構造的論点

本事案は、cross-chain bridge において **信頼の起点となる設定そのものが単一鍵で書き換え可能な状態に置かれていた** という構造の代表事例である。LayerZero v2 における vsdCRV の trusted source 指定は、コントラクト所有者(本事案ではデプロイヤー秘密鍵保有者)が変更可能な config として実装されており、その config 自体に対する独立検証 layer は存在しない。受信側コントラクト(Arbitrum 側 vsdCRV)は config が示す「正規の送信元」を信頼して message を accept する設計のため、config 書き換え後の偽 message は仕様通りに accept された。

同じ構造の事案として、4 月の **KelpDAO / rsETH 不正アンロック**(Brief 001)がある。両事案の構造を対比すると:

| 観点 | KelpDAO / rsETH(2026-04) | Stake DAO(2026-05) |
| --- | --- | --- |
| Initial compromise | LayerZero Labs オペレーション環境への侵入(社会工学起点と指摘) | Stake DAO デプロイヤー秘密鍵 |
| 操作されたレイヤー | DVN 観測層(RPC 応答内容) | LayerZero v2 trust source 設定そのもの |
| 改ざんの形式 | 観測結果を歪める | trusted source 指定を書き換える |
| DVN 署名鍵 | 侵害なし | 該当しない(設定書き換えで完結) |
| Bridge 防御の決壊点 | 1-of-1 DVN 構成 | trust source 指定の単一鍵集中 |
| 共通する構造 | cross-chain message の trust が config / 観測層に集中点を持ち、その集中点を単一主体が支配可能 | 同左 |

両事案は別ベクターから同一構造に到達している。LayerZero Labs は KelpDAO 事案を契機に「observation layer」を独立カテゴリとして命名し、DVN の 1-of-1 構成での署名拒否ポリシーや 3-of-3 default 化を発表したが、これらの防御強化は LayerZero v2 設定そのものを直接書き換える本事案のベクターを遮断するものではなかった。

---

## 5. Detection 層では届かない構造的 gap

本事案では Blockaid が attack を分単位で real-time 検出し、Stake DAO チームの迅速な containment(裏付資産保護、vsdCRV ブリッジ停止)につながった。検出層は damage の拡大を制限する点で確実に機能し、本事案で奏功している。検出企業の役割が本 Brief で否定されるものではない。

一方で、検出は bridge が「何を accept するか」自体を変えない。Forged message が Arbitrum 側 vsdCRV に届いた時点で、bridge は config(攻撃者によって書き換えられた trusted source 指定)に従って accept する。検出は accept そのものを止められない、という構造的な層境界が残る。

規制報告・行政手続き・訴訟で「許可されていない権限行使があった」と立証する材料として、「設定書き換えが正規プロセスを通じて実行された(攻撃者の鍵に対して LayerZero v2 が config 変更を受け入れた)」という本事案のような事象では、検出スコアと立証の間に独立した層が必要となる。事象後の検出と、事象前に message 自体に独立検証可能な証拠を付与する事前証明(pre-execution attestation)は、代替関係ではなく補完関係にあり、両層を組み合わせて trust boundary を確立する設計が、構造的応答として求められる(検出と事前証明の関係についての詳細な議論は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)(Lemma、2026-05)を参照)。

---

## 6. 対応経緯と業界動向

Stake DAO(2026-05-28〜29):

- メインネット上の vsdCRV 裏付資産を保護(攻撃者が seize できない状態に)
- vsdCRV ブリッジを停止、影響範囲を Arbitrum に限定
- Boosted Yields、Liquid Lockers、Votemarket、Morpho 上の Stake DAO レンディングは影響外であることを確認
- Arbitrum 上の asdCRV Llamalend 市場は終了手続きへ
- 法執行機関およびセキュリティパートナーと連携した調査継続

業界各社の動き:

- Blockaid: ongoing exploit の real-time 検出と attack 過程の公開
- PeckShield Alert: swap および bridge 経路の解析を独立に公表
- KelpDAO 事案後に LayerZero Labs が発表した observation layer の独立カテゴリ化と DVN 構成の強化は、本事案のベクター(config 直接書き換え)を直接遮断するものではなかったが、業界全体に「cross-chain 信頼設定の単一鍵集中」という構造的論点を浸透させる前提を作っていた

---

## 7. Lemma による分析

本事案で露呈した構造的 gap(cross-chain message の信頼設定が config 層に集中点を持ち、その集中点を単一主体が支配可能)に対して、Lemma は cross-chain message 自体に独立検証可能な暗号証明を埋め込み、verifier が config 層に依存せず message の origin を独立検証できる設計を提示している。Config が書き換えられた状態でも、proof は別系統で「この message は正規の origin から来た / 来ていない」を verifier に告げる構造である。設計の詳細は [「2026 年のブリッジ事象が示しているもの — 来歴証明というカテゴリについて」](https://lemma.frame00.com/ja/blog/verifiable-origin-bridge-exploits-2026/)(Lemma、2026-04)、リファレンス実装は [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin)(GitHub)を参照のこと。

---

## 8. Sources

- **Stake DAO official statement (initial)**(2026-05-27、Stake DAO 公式 X 投稿)— 「We are aware of the ongoing situation. Please do not interact with vsdCRV.」最初の認知声明。公式 blog 単独投稿はなく X が primary statement 経路。https://x.com/StakeDAOHQ/status/2059586800255910039
- **Stake DAO official statement (follow-up)**(2026-05-28、Stake DAO 公式 X 投稿)— preliminary investigation、デプロイヤー秘密鍵侵害の公表、メインネット側裏付資産保護、vsdCRV ブリッジ停止、影響範囲 Arbitrum 限定化、Boosted Yields / Liquid Lockers / Votemarket / Morpho 上 Stake DAO レンディングが影響外であることを含む。https://x.com/StakeDAOHQ/status/2059938235724320959
- **Blockaid threat intelligence (real-time detection)**(2026-05-27、Blockaid 公式 X 投稿)— ongoing exploit としての real-time 検出、5.4 兆 vsdCRV mint と ETH への swap、malicious peer deployment・setPeer call・mint transaction の onchain evidence を公開。公式 blog 単独投稿はなく X が primary statement 経路。https://x.com/blockaid_/status/2059573118927049152
- **PeckShield Alert analysis**(2026-05-27、PeckShield Alert 公式 X 投稿)— 5.4 兆 vsdCRV mint と 43.781 ETH(約 $91K)swap の独立確認、Curve / KyberSwap 経由の swap と Ethereum への bridge 経路の解析を含む。公式 blog 単独投稿はなく X が primary statement 経路。https://x.com/PeckShieldAlert/status/2059578749352640679

---

## 9. Brief 配布について

Lemma Critical Brief は Lemma が発行する脅威インテリジェンス・ブリーフです。本資料は公開情報の構造化分析であり、特定の組織への監査・診断・推奨ではありません。意思決定の参考として用いる場合は、貴組織の Lemma Critical 担当に直接ご相談ください。

[Discovery Call を予約する →](https://tally.so/r/EkBqDX)
[ホワイトペーパーをダウンロード →](https://tally.so/r/xX0VYv)
[ニュースレターを購読する →](https://tally.so/r/EkMj82?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
