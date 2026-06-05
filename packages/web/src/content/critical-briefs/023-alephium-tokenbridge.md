---
brief_no: 23
title: "Alephium TokenBridge で約 81.5 万ドル流出 — guardian の鍵は無事でも、署名対象のイベントの来歴が検証されなかった"
title_en: "The Alephium TokenBridge Exploit ($815K) — Guardian Keys Intact, But No Verification of the Provenance of the Events They Signed"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-30
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["001-kelpdao-rseth", "002-stakedao-vsdcrv", "016-verus-ethereum-bridge"]
version: "1.0"
status: published
---

## TL;DR

2026 年 5 月 30 日、Alephium の TokenBridge(Wormhole フォーク)が Ethereum / BNB Chain の両側で exploit を受け、約 81.5 万ドル相当の資産が流出、1,375.7 万 wALPH が無担保でミントされた。guardian の秘密鍵は侵害されておらず、スマートコントラクトのバグでもない。攻撃者は LOG7 で偽の Wormhole メッセージを emit するコントラクトをデプロイし、ブリッジのバックエンドのオフチェーン脆弱性を突いて、偽造イベントを guardian に「観測」させ、署名させた。guardian の署名は有効、VAA も形式上有効——しかし署名対象のイベント自体が攻撃者のコントラクトから発されたものだった。主要な流出は約 64 秒で完了した。本事案は Pillar 01(来歴証明)の `bridge-config-trust` における、**署名の有効性とイベントの来歴は別問題である**ことを示す直近の代表事例であり、Brief 001(観測層への偽データ注入)・016(有効 Proof でも金額整合未検証)に続く bridge 信頼層の第 3 の failure primitive を構成する。

---

## 1. 事案概要

- **対象**: Alephium TokenBridge(Wormhole のフォーク、Ethereum / BNB Chain ⇔ Alephium)
- **被害額**: 約 81.5 万ドル(USDT / USDC / WETH / WBTC / WBNB)+ 無担保ミント 1,375.7 万 wALPH
- **発生日**: 2026-05-30(主要流出は 09:16:59–09:18:02 UTC、約 64 秒)
- **根本原因**: Alephium の post-incident 公表によれば「特定のエッジケースで発動しうるブリッジバックエンドのオフチェーン脆弱性」。guardian 秘密鍵の侵害でもスマートコントラクトのバグでもない
- **悪用の核心**: 攻撃者がデプロイしたコントラクトが LOG7 命令で偽の Wormhole メッセージを emit し、それを guardian が正規イベントとして観測・署名した。署名済みの偽造 VAA 6 件により `completeTransfer(bytes)` が実行された
- **構成上の背景**: Alephium フォークの guardian は 4 ノード・quorum 3(Wormhole 本体は 19 ノード・quorum 13)。偽造イベントを観測させるべき guardian の数が構造的に少ない
- **検知**: Blockaid が 5 月 30 日に最初に検知・公表。SEAL 911 が調査を支援
- **事後**: 6 月 2 日に governance upgrade 関数で無担保 wALPH の約 96.4%(1,325.7 万)を焼却。約 50 万 wALPH は焼却前に流動性プールへ流入し回収不能。ブリッジは停止中で、補償計画と完全な技術 postmortem の公表を予告

---

## 2. タイムライン

(時刻はすべて 2026-05-30 UTC、Alephium 公式 on-chain report に基づく)

- 02:36:23: 攻撃者が Ethereum 上で 0.01 ETH を使い Uniswap Universal Router 経由で 485.19 wALPH を購入
- 02:36 以降: 正規のブリッジ手順で wALPH を Alephium チェーンへ移動(Ethereum 側 burn → Alephium 側ミント)。ALPH を 5 / 150 / 130 に分割しデプロイヤーウォレットへ送付
- 06:30:47: 偽の Wormhole メッセージを LOG7 で emit する単一関数のコントラクトをデプロイ
- 07:00–09:00: ブリッジネットワークに接続障害が発生し、システムがバックアップ系の検証へ切り替わる
- 09:16:59: 主攻撃開始。Ethereum 側で 200,967.31 USDT 流出
- 09:17:23–09:17:47: 0.335 WBTC、17,594.63 USDC、5.18 WETH が順次流出
- 09:17:59: 1,375.7 万 wALPH が無担保ミント
- 09:18:02 頃: BNB Chain 側で 36,750.106 USDT・24.39 WBNB が流出(Ethereum 側完了の約 3 秒後)
- 同日: Blockaid が攻撃を検知・公表。当初は「guardian 鍵の侵害」と報じられたが、その後 Alephium / Blockaid がともに鍵侵害説を撤回し「偽造イベントの観測・署名」へ訂正
- 5 月 30 日以降: 窃取資産は Uniswap X / PancakeSwap / deBridge 経由で ETH へ集約され、一部は Tornado Cash でミキシング
- 06-02: governance upgrade 関数(`upgrade(bytes encodedVM)`)により攻撃者ウォレットの無担保 wALPH 1,325.7 万(約 96.4%)を焼却
- 06-03: Alephium が完全な on-chain breakdown を公開。補償計画と技術 postmortem の続報を予告

---

## 3. 攻撃ベクター

1. **正規ユーザーとしての準備**: 攻撃者は 0.01 ETH 起点で wALPH を取得し、正規のブリッジ手順で Alephium 側へ移動。この段階ではいかなる検証にも引っかからない
2. **偽造イベント発生源の設置**: LOG7 命令で Wormhole 形式の偽メッセージを emit するコントラクトをデプロイ。イベントの「形式」は正規のものと識別不能
3. **バックエンドの縮退状態**: 07:00–09:00 の接続障害でブリッジシステムがバックアップ検証へ切り替わる。Alephium の言う「特定のエッジケース」がこの縮退経路にあたるとみられる
4. **guardian による観測・署名**: 偽造イベントが guardian に正規イベントとして観測され、quorum 3 / 4 の署名が成立。偽造 VAA 6 件が発行される
5. **`completeTransfer` の実行**: 形式上有効な VAA により、Ethereum / BNB Chain 両側で資産払出と無担保ミントが約 64 秒で完了
6. **資金洗浄**: DEX スワップ・チェーン間ブリッジ・Tornado Cash を組み合わせて資産を分散・秘匿

---

## 4. 構造的論点

本事案は Pillar 01(来歴証明)の `bridge-config-trust` カテゴリに属する。中心的な失敗 primitive は、guardian の署名が「このイベントを観測した」ことしか証明せず、**観測対象のイベントがどのコントラクトから・どの正規経路で発されたのかという来歴が、署名の前提として独立検証されていなかった**点にある。secondary に `identity-auth` を併記する。

Brief 001(KelpDAO/rsETH)・Brief 002(Stake DAO/vsdCRV)・Brief 016(Verus-Ethereum)と同じ `bridge-config-trust` だが primitive が異なる。001 は DVN の観測層へ偽データを注入(RPC 改ざん)、002 はデプロイヤー鍵で信頼設定そのものを書き換え、016 は暗号的に有効な Proof の背後で入出力額の整合が未検証、本事案は**署名者の手前で観測対象イベント自体が偽造**された。4 事案は「cross-chain で受け渡される主張が、それを独立検証する層と切り離されたまま accept される」という構造で同根である。

001 との対比は特に重要である。001 では攻撃者が外部ノードを DDoS して観測系を単一障害点へ追い込んだ。本事案でも 07:00–09:00 の接続障害がバックアップ検証への切替えを誘発しており、**検証系が縮退した瞬間に観測層の信頼が崩れる**というパターンが反復している。また guardian 4 ノード・quorum 3 という構成は、Wormhole 本体(19 ノード・quorum 13)に比べ、バックエンドのバグ 1 件が説得すべき署名者の数を構造的に減らしている——フォークが本家のセキュリティ前提を継承しない典型例でもある。

---

## 5. Detection 層では届かない構造的 gap

Blockaid によるリアルタイム検知と SEAL 911 の調査支援は、被害の把握・ブリッジ停止・無担保トークンの焼却・資金追跡に不可欠であり、本 Brief がその役割を否定するものではない。本事案でも検知から焼却(96.4%)まで 3 日で到達している。

一方で、検出は guardian が「どのイベントに署名するか」自体を変えない。本事案では、guardian の鍵は健在で、署名プロセスも正常に機能し、VAA の形式検証も通過した。欠けていたのは「署名対象のイベントが正規のコントラクト・正規の経路から発されたものか」というイベント来歴の検証であり、これは署名の有効性検証とは別系統である。検知が発火した時点で主要な流出(64 秒)はすでに完了しており、約 50 万 wALPH は焼却前に流動性プールへ流入した。規制報告・監査で「この VAA は正規イベントに基づくか」を立証する材料として、guardian 署名の有効性だけではイベント来歴の独立した証跡にならない。

事前証明(pre-execution attestation)は、guardian が署名する前に、観測対象イベントの emitter・経路・整合性を独立検証可能な暗号証明として要求する設計を採る。proof が「このイベントの発生源は登録された正規コントラクトではない」と告げれば、署名は事前に block される。署名の有効性検証(「この guardian が署名した」)とイベント来歴の事前証明(「署名対象は正規の発生源から来た」)は代替ではなく**補完**の関係にある(検出と事前証明の thesis は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)(Lemma、2026-05)を参照)。

---

## 6. 対応経緯と業界動向

- **Alephium**: 攻撃当日にブリッジを停止し、6 月 2 日に governance upgrade で無担保 wALPH の 96.4% を焼却。6 月 3 日に完全な on-chain breakdown を公開し、補償計画・技術 postmortem・外部セキュリティレビュー後の再開方針を予告。根本原因を「ブリッジバックエンドのオフチェーン脆弱性」と特定し、当該脆弱性は修正済みと表明
- **Blockaid**: 最初の検知・公表を担い、初期の「guardian 鍵侵害」説をその後のフォレンジックで「偽造イベントの観測・署名」へ訂正。初期報道と確定原因が異なった点は、bridge 事案の原因確定には on-chain データだけでなくオフチェーン系の調査が不可欠であることを示した
- **業界横断の論点**: 2026 年のブリッジ関連 exploit は累計 3.4 億ドル規模・14 件に達したとの集計があり、Wormhole 型アーキテクチャのフォークが本家より小さい guardian set で運用される構造的リスクが再認識された

「guardian が署名する前に、観測対象イベントの来歴をどう独立検証するか」は、001・016 に続く本事案で、ブリッジ設計の中心的な論点として固まりつつある。

---

## 7. Lemma による分析

本事案で露呈した構造的 gap(guardian 署名の有効性は検証されるが、署名対象イベントの来歴は独立検証されない)に対して、Lemma は、ブリッジの観測層が受け取るイベントの emitter と経路を、署名の前に独立検証可能な暗号証明として検証する設計を提示している。guardian の署名が形式上有効でも、イベント来歴の proof が偽造発生源を告げれば署名・払出は事前に reject される。「暗号論理的に有効 ≠ 来歴が正しい」という来歴証明カテゴリの設計思想と、その reference 実装は [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin)(GitHub)に示している。設計の背景は [「2026 年のブリッジ事象が示しているもの — 来歴証明というカテゴリについて」](https://lemma.frame00.com/ja/blog/verifiable-origin-bridge-exploits-2026/)(Lemma、2026-04)を参照のこと。

---

## 8. Sources

- **Alephium**: "The Alephium Bridge Exploit: On-Chain Report"(2026-06-03、公式 on-chain breakdown・タイムライン・焼却措置)— https://alephium.org/news/post/the-alephium-bridge-exploit-on-chain-report/
- **The Defiant**: "Alephium Bridge Loses $815K to Forged Guardian Messages, Not Stolen Keys"(2026-05/06、原因訂正の経緯・guardian 構成の対比)— https://thedefiant.io/news/hacks/alephium-bridge-815k-forged-guardian-messages
- **The Crypto Times**: "Bridge Breach Unpacked: Alephium Traces $815K Hack Step by Step"(2026-06-03、on-chain report の詳細整理)— https://www.cryptotimes.io/2026/06/03/bridge-breach-unpacked-alephium-traces-815k-hack-step-by-step/
- **AMBCrypto**: "$815K gone in 7 minutes – Inside Ethereum's Alephium TokenBridge exploit"(2026-05/06)— https://ambcrypto.com/815k-gone-in-7-minutes-inside-ethereums-alephium-tokenbridge-exploit/

---

## 9. Brief 配布について

Lemma Critical Brief は Lemma が発行する threat intelligence brief です。本資料は公開情報の構造化分析であり、特定の組織への監査・診断・推奨ではありません。意思決定の参考として用いる場合は、貴組織の Lemma Critical 担当に直接ご相談ください。

Discovery Call: https://tally.so/r/Pd2Rl5
ホワイトペーパー: https://tally.so/r/xX0VYv

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
