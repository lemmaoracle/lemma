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
related_briefs: ["001-kelpdao-rseth"]
version: "1.0"
status: published
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
- 2026-05-27: PeckShieldAlert が swap および bridge を含む流出経路を解析
- 2026-05-28: Stake DAO 公式 X が初期声明。コントリビューターがメインネット上の vsdCRV 裏付資産を保護、vsdCRV ブリッジを停止
- 2026-05-29: Stake DAO チームが初期調査結果を公表。影響範囲が Arbitrum に限定されたこと、Boosted Yields など主要プロトコルが影響外であることを確認。法執行機関およびセキュリティパートナーと連携した調査継続

---

## 3. 攻撃ベクター

1. **Initial compromise**: Stake DAO デプロイヤー秘密鍵の侵害。詳細経路は記事執筆時点で未公表
2. **Trust source rewriting**: 侵害したデプロイヤー鍵を用いて LayerZero v2 設定を変更。本来、Arbitrum 側 vsdCRV は Ethereum 側の正規コントラクトから送られる cross-chain message のみを trust する仕組みだったが、攻撃者はその trusted source の指定を、自身が展開したコントラクトへ書き換えた
3. **Forged messages**: 攻撃者のコントラクトから偽の cross-chain message を Arbitrum 側 vsdCRV へ発出
4. **Impact realization**: Arbitrum 側 vsdCRV が偽 message を accept、5.4 兆 vsdCRV が不正ミント。一部を DEX 上で 43.781 ETH(約 $91K)へ swap、Ethereum へブリッジ
5. **Containment**: Stake DAO チームが速やかにメインネット側 vsdCRV 裏付資産を保護、vsdCRV ブリッジを停止することで影響範囲を Arbitrum に限定。攻撃者は裏付資産を seize することはできなかった

---

## 4. カテゴリと位置

本事案は **bridge-config-trust** カテゴリの代表事例である。Cross-chain bridge における trust source の表明と検証が config 層で集中点を持ち、その config 自体が単一の主体(本事案ではデプロイヤー秘密鍵)で書き換え可能な状態に置かれていた。

同カテゴリの先行事案として **Brief 001: KelpDAO / rsETH 不正アンロック**(2026-04-18)がある。両事案の構造的位置関係を表で示す:

| 観点 | Brief 001(KelpDAO/rsETH) | Brief 002(Stake DAO) |
| --- | --- | --- |
| Initial compromise | オペレーション環境への侵入(社会工学起点と指摘される) | デプロイヤー秘密鍵 |
| 操作されたレイヤー | DVN 観測層(RPC 応答内容) | LayerZero v2 trust source 設定そのもの |
| 改ざんの形式 | 観測結果を歪める | trusted source 指定を書き換える |
| DVN 署名鍵 | 侵害なし | 該当しない(設定書き換えで完結) |
| Bridge 防御の決壊点 | 1-of-1 DVN 構成 | trust source 指定の単一鍵集中 |
| 共通する primitive | Cross-chain message の trust が config 層で集中点を持ち、その集中点を単一主体が書き換え可能 | 同左 |

両事案は別ベクターから同一カテゴリの primitive に到達している。LayerZero Labs が Brief 001 を契機に observation layer を独立カテゴリ化し、1-of-1 構成での DVN 署名拒否と 3-of-3 default 化を発表したにもかかわらず、本事案は LayerZero v2 設定の trust source 指定そのものを直接書き換えるベクターで成立した。Brief 001 後の防御強化は、本事案のベクターを直接遮断するものではなかった。

---

## 5. 検出 vs 事前証明

本事案では Blockaid が attack を分単位で real-time 検出し、Stake DAO チームの迅速な containment(裏付資産保護、vsdCRV ブリッジ停止)につながった。検出層は damage の拡大を制限する点で確実に機能した。Lemma の thesis は検出層の価値を否定するものではない。検出は事象後の blast window を狭める層として依然として重要であり、本事案でもそれが奏功している。

一方で、検出は bridge が「何を accept するか」自体を変えない。Forged message が Arbitrum 側 vsdCRV に届いた時点で、bridge は config(攻撃者によって書き換えられた trusted source 指定)に従って accept する。検出は accept そのものを止められない、という構造的な層境界がある。

規制報告・行政手続き・訴訟で「許可されていない権限行使があった」と立証する材料として、本事案のように「設定書き換えが正規プロセスを通じて実行された(攻撃者の鍵に対して LayerZero v2 が config 変更を受け入れた)」事案では、検出スコアと立証の間に独立した層が必要となる。

事前証明(pre-execution attestation)は、検出への代替ではなく **補完** の関係に位置する。Cross-chain message そのものに独立検証可能な暗号証明を埋め込むことで、verifier は config が trusted source として何を指定しているかに依存せず、message の origin を独立に確認できる。Config が書き換えられた状態でも、proof は別系統で message の起源を verifier に告げる。検出 + 事前証明の二段構成で trust boundary を確立する設計が、本事案で露出した gap への構造的応答である。

---

## 6. 業界の対応

Stake DAO(2026-05-28〜29):

- メインネット上の vsdCRV 裏付資産を保護(攻撃者が seize できない状態に)
- vsdCRV ブリッジを停止、影響範囲を Arbitrum に限定
- Boosted Yields、Liquid Lockers、Votemarket、Morpho 上の Stake DAO レンディングは影響外であることを確認
- Arbitrum 上の asdCRV Llamalend 市場は終了手続きへ
- 法執行機関およびセキュリティパートナーと連携した調査継続

業界の即時 response:

- Blockaid: ongoing exploit の real-time 検出と attack 過程の公開
- PeckShieldAlert: swap および bridge 経路の解析を独立に公表
- Brief 001 で LayerZero Labs が示した observation layer の独立カテゴリ化と防御強化は、本事案のベクター(config 直接書き換え)を直接遮断するものではなかったが、業界全体に「cross-chain 信頼設定の単一鍵集中」という構造的論点を浸透させる前提を作っていた

---

## 7. Lemma の応答層

本事案の primitive(cross-chain bridge における trust source の config 集中とその単一鍵書き換え可能性)に対する Lemma の応答は、Brief 001 と同じく **Pillar 01: 来歴証明(verifiable-origin proof)** に位置する。

設計の中核は、cross-chain message そのものに独立検証可能な暗号証明を埋め込むことで、verifier が config 層(trusted source 指定、observation layer の入力)を介さずに message の origin を検証できる構造にある。Config が書き換えられた状態でも、proof は別系統で「この message は正規の origin から来た / 来ていない」を verifier に告げる。

**Reference architecture(参考実装方針)** は Brief 001 §7 と共通(Groth16 over BN254 + Poseidon ハッシュで message origin を ZK 証明として固定、Circom サーキットで domain 固有のポリシーを回路化、第三者検証可能)。本 reference architecture の各要素について、現時点の Lemma 実装状況と roadmap 段階の要素については別途プロダクトドキュメント / Whitepaper を参照のこと。

製品ライン上の位置付けは Brief 001 と同じ:

- **Lemma Critical**(基幹インフラ・製造業対象): cross-chain operation を含む産業 IT のための pre-execution attestation 層
- **Pack A: Incident Response**: 本事案で Stake DAO チームが行った種類の containment 対応の体系化
- **Pack B: Regulatory**: 能動的サイバー防御法・NCO 様式・EU AI Act 対応の規制報告 envelope
- **Trust402**: x402 経済圏での自律エージェント決済における header 拡張としての来歴証明埋込

実装サンプル(verifiable-origin の最小例):
https://github.com/lemmaoracle/example-origin

関連エッセイ:
- [2026 年のブリッジ事象が示しているもの — 「来歴証明(verifiable origin proof)」というカテゴリについて](https://lemma.frame00.com/ja/blog/verifiable-origin-bridge-exploits-2026/)(2026-04-30)
- [AI 時代のサイバー防衛に残された、最後の層](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)(2026-05-22)

---

## 8. 関連 Brief

- Lemma Critical Brief No.001: KelpDAO / rsETH 不正アンロック(同 bridge-config-trust カテゴリ、別ベクター)
- Lemma Critical Brief No.003(作成中): AI agent infrastructure(Starlette/BadHost)
- Lemma Critical Brief No.004(作成中): Code provenance(Megalodon supply chain)

---

## 9. Sources

- **Stake DAO official statement (initial)**(2026-05-27、Stake DAO 公式 X 投稿)— 「We are aware of the ongoing situation. Please do not interact with vsdCRV.」最初の認知声明。公式 blog 単独投稿はなく X が primary statement 経路。https://x.com/StakeDAOHQ/status/2059586800255910039
- **Stake DAO official statement (follow-up)**(2026-05-28、Stake DAO 公式 X 投稿)— preliminary investigation、デプロイヤー秘密鍵侵害の公表、メインネット側裏付資産保護、vsdCRV ブリッジ停止、影響範囲 Arbitrum 限定化、Boosted Yields / Liquid Lockers / Votemarket / Morpho 上 Stake DAO レンディングが影響外であることを含む。https://x.com/StakeDAOHQ/status/2059938235724320959
- **Blockaid threat intelligence (real-time detection)**(2026-05-27、Blockaid 公式 X 投稿)— ongoing exploit としての real-time 検出、5.4 兆 vsdCRV mint と ETH への swap、malicious peer deployment・setPeer call・mint transaction の onchain evidence を公開。公式 blog 単独投稿はなく X が primary statement 経路。https://x.com/blockaid_/status/2059573118927049152
- **PeckShield analysis**(2026-05-27、PeckShield Alert 公式 X 投稿)— 5.4 兆 vsdCRV mint と 43.781 ETH(約 $91K)swap の独立確認、Curve / KyberSwap 経由の swap と Ethereum への bridge 経路の解析を含む。公式 blog 単独投稿はなく X が primary statement 経路。https://x.com/PeckShieldAlert/status/2059578749352640679
- **Lemma Oracle essay**: 「2026 年のブリッジ事象が示しているもの — 来歴証明(verifiable origin proof)というカテゴリについて」(2026-04-30、Lemma 自社一次情報)— https://lemma.frame00.com/ja/blog/verifiable-origin-bridge-exploits-2026/
- **Lemma Oracle essay**: 「AI 時代のサイバー防衛に残された、最後の層」(2026-05-22、Lemma 自社一次情報)— https://lemma.frame00.com/ja/blog/detection-is-not-proof/
- **Lemma Oracle reference implementation**: verifiable-origin proof sample(Lemma 公開 GitHub)— https://github.com/lemmaoracle/example-origin
