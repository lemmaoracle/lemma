---
brief_no: 87
title: "Polymarket：正規サイトに信頼されたまま、第三者ベンダー経由で注入された JavaScript が利用者に偽の承認をさせた"
title_en: "Polymarket: Malicious JavaScript Injected via a Compromised Third-Party Vendor Tricked Users Into Approving Fraudulent Transactions"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-06-26
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["030-stripe-trusted-channel-skimmer", "081-bybit-safe-wallet-ui-injection", "004-megalodon-github-supply-chain", "059-vercel-contextai-oauth"]
status: "published"
version: "1.0"
og_lead_ja: "Polymarket：第三者依存への JS 注入で利用者に偽承認、約300万ドル流出（コントラクトは無傷）"
og_lead_en: "Polymarket: JS injected via a third-party dependency drove fake approvals, ~$3M drained (contracts intact)"
gap_detected: "Polymarket の迅速な公表・影響依存の除去・利用者への連絡と全額補償、PeckShield・Bubblemaps の資金追跡が作動した。"
gap_missing: "利用者のブラウザで実行されるフロントエンドコードが「Polymarket の配信した正規の来歴を持つか」を実行の前に独立検証する層が無く、正規ドメインの内側から承認対象が差し替えられた。"
gap_fix: "フロントエンドコードと承認対象トランザクションの来歴を実行・承認の前に Lemma で独立検証し、正規の来歴が確認できなければ承認セッションを開始しない。"
---

## TL;DR

予測市場プラットフォーム Polymarket の利用者が、いつも通り正規サイトを開いて取引を承認したところ、約300万ドル相当の資産を失った。スマートコントラクトもバックエンドも侵害されていない。攻撃者はフロントエンドが読み込む第三者ベンダーの依存コンポーネントを侵害し、Polymarket の正規サイトに悪意ある JavaScript を注入した。そのスクリプトは利用者のブラウザで実行され、本人に「正規の操作」と見える形で不正なウォレット承認を求めた。盗まれたのはプラットフォームの決済用ステーブルコイン pUSD（Polymarket USD、USDC 担保）で、約1,893 ETH に交換され Polygon から Ethereum へブリッジされた。被害は15アカウント未満にとどまったが、利用者には「いま自分のブラウザで動いているフロントエンドのコードが、Polymarket が配信した正規のものか」を実行の前に確かめる手段がなかった。発覚後のサイト依存関係の除去・利用者への連絡・全額補償の表明は機能したが、コードの来歴を実行の前に独立検証する層は存在しなかった。検出と事前証明は代替ではなく補完である。

---

## 1. 事案概要

- **対象**: Polymarket（暗号資産ベースの予測市場プラットフォーム）の Web フロントエンドおよびその利用者ウォレット
- **被害規模**: 約300万ドル相当の暗号資産。影響を受けたのは15アカウント未満
- **公表日**: 2026-06-26（Polymarket が公表。BleepingComputer・OffSeq Radar が同日報道、Rescana が 2026-06 下旬に構造解析を公開）
- **侵害の起点**: フロントエンドが読み込む第三者ベンダーの依存コンポーネント（ソフトウェア依存）が侵害された。MITRE ATT&CK では T1195.002（Supply Chain Compromise: Compromise Software Dependencies and Development Tools）に対応
- **悪用の核心**: 侵害された依存を通じて Polymarket の正規サイトに悪意ある JavaScript が注入された。利用者がサイトを訪れると、そのスクリプトがブラウザ内で実行され、本人に「正規の取引」と見える形で不正なウォレット承認を求めた（T1059.007 JavaScript／T1189 Drive-by Compromise／T1566.002 phishing via service）
- **資金の流れ**: 盗まれたのは Polymarket の決済用ステーブルコイン pUSD（[Polymarket USD](https://docs.polymarket.com/concepts/pusd)、USDC 担保。一部報道では ParionUSD／ParyonUSD とも表記されるが同一トークンを指す）。攻撃者はこれを約1,893 ETH に交換し、Polygon から Ethereum へブリッジした（PeckShield・Bubblemaps が追跡）
- **侵害されなかった範囲**: Polymarket のバックエンド・サーバー・スマートコントラクトは侵害されていない。被害はフロントエンドと利用者操作に限定された
- **事後対応**: Polymarket は影響を受けた依存を速やかにシステムから除去し、影響利用者へ連絡。全額補償を表明
- **文脈**: 手口は EC・暗号資産プラットフォームを標的にした Magecart 系の JavaScript 注入と同型で、特定脅威アクターへの確度の高い帰属はなされていない
- **核心**: 利用者が承認したのは「正規ドメインで表示された UI」であり、「そのフロントエンドコードが Polymarket の配信した正規のものか（来歴）」は実行の前に検証されていなかった — ドメインの正当性とコードの来歴が分離されていた

---

## 2. タイムライン

- 2026-06-26 以前（推定）: フロントエンドが読み込む第三者ベンダーの依存が侵害され、悪意ある JavaScript が正規サイトに注入される
- 2026-06-26: 注入スクリプトが利用者ブラウザで実行され、15アカウント未満が不正なウォレット承認を行い、約300万ドル相当が流出。pUSD は約1,893 ETH に交換され Polygon→Ethereum へブリッジ
- 2026-06-26: Polymarket が事案を公表。BleepingComputer・OffSeq Radar が報道。Polymarket は影響依存の除去と全額補償を表明
- 2026-06 下旬: Rescana がサプライチェーン構造解析を公開（PeckShield・Bubblemaps の追跡を引用）

> 注: 規模・帰属は Polymarket の公表および外部解析（Rescana・BleepingComputer・PeckShield・Bubblemaps）に基づく。本 Brief は調査時点で確認できた値を記し、断定を避けて出所を明示する。盗まれたステーブルコインは Polymarket の決済用 pUSD（Polymarket USD、USDC 担保）で、一部報道の ParionUSD／ParyonUSD は同一トークンを指す表記揺れである。

---

## 3. 攻撃ベクター

1. **第三者依存の侵害**: Polymarket のフロントエンドが読み込むベンダー提供の依存コンポーネントが攻撃者に侵害される。Polymarket 自身のコードベース・サーバーは侵害されていない
2. **正規サイトへの JS 注入**: 侵害された依存を経由して、Polymarket の正規ドメイン上に悪意ある JavaScript が配信される。利用者から見ればサイトは正規のまま
3. **ブラウザ内実行**: 利用者が Polymarket を訪れると、注入スクリプトが本人のブラウザで実行される。サイトに到達して操作するだけで影響を受ける（drive-by）
4. **偽の承認要求**: スクリプトが、本人に「正規の取引」と見える形で不正なウォレット承認（トランザクション署名）を求める。利用者は正規サイト上の操作と信じて承認する
5. **資産の窃取**: 承認された取引により利用者ウォレットから pUSD が引き出される
6. **資金の交換とブリッジ**: 攻撃者は pUSD を約1,893 ETH に交換し、Polygon から Ethereum へブリッジして資金を集約する
7. **事後対応**: Polymarket が影響依存を除去し、利用者へ連絡・全額補償を表明。PeckShield・Bubblemaps が資金を追跡（承認が通った後に作動する事後の系列）

---

## 4. 構造的論点

本事案は Pillar 01（来歴証明）の `code-provenance` カテゴリに属する。中心的な失敗 primitive は、**利用者のブラウザで実行されるフロントエンドコードが「正規ドメインから配信された」ことは確認できても、「そのコードが Polymarket の配信した正規のものか（来歴）」が実行の前に独立検証されていなかった**点にある。ドメインの正当性（TLS・URL の見た目）は、そこに載るコードの来歴を保証しない。攻撃者は暗号も Polymarket のサーバーも破る必要がなく、フロントエンドに混ざり込む第三者依存という「配信されるコードの来歴」に介入した。

本事案は Brief No.030（Stripe の信頼された API インフラがカード窃取コードの配送・保管に転用された Magecart 事案）と同根である。いずれも「信頼されたチャネルに載るコードの来歴」が汚染され、正規に見える経路から悪性コードが利用者に届いた。Brief No.081（Bybit、Safe{Wallet} フロントエンドへの JS 注入で署名者が「何に署名しているか」を確かめられなかった）とは、署名・承認 UI に表示される内容と実際に署名・承認する対象が、利用者側で独立検証されないまま乖離した点で表裏をなす。Brief No.004（Megalodon、GitHub サプライチェーンで正規配布物に悪性コードを混入）とは、開発・配布の上流を起点に正規の成果物へ悪性コードを混ぜた構造で連なる。Brief No.059（AI ツールに渡した OAuth がベンダー侵害でそのまま侵入経路に）とは、第三者ベンダーへの信頼が侵害の伝播経路になった点で隣接する。

secondary カテゴリとして、利用者のトランザクション承認が「正規の操作」と独立検証されない点で `identity-auth` を、配信されるフロントコードの来歴という点で `data-provenance` を併記する。

---

## 5. 検出と証明の落差

Polymarket の迅速な公表、影響依存の除去、利用者への連絡と全額補償の表明、PeckShield・Bubblemaps による資金追跡は、被害の把握・封じ込め・是正に不可欠であり、本 Brief がその役割を否定するものではない。実際、被害範囲の特定とアカウント単位の補償はこれらの検知・解析によって進められた。検出は確かに機能した。

一方で、検出は受信側（フロントコードを実行する利用者ブラウザ、承認を求められる本人）が「何を実行し、何を承認するか」自体を変えない。利用者は正規ドメインで正規に見える UI を操作したが、「いま実行されているフロントエンドコードが Polymarket の配信した正規のものか」を実行の前に確かめる手段がなかった。悪意ある JS は正規サイトの内側で、利用者の確認動作の外側から承認対象を差し替えた。ドメインが正規であることは「サイトの所在」を証明するが、「そこに載るコードの来歴」を証明しない。欠けていたのは、フロントエンドコードの実行前に「このコードは Polymarket が配信した正規の来歴を持つか」を独立検証する層である。事後の検知が資金追跡・補償に発火しても、承認が通った時点の引き出しは止まらない。

事前証明（pre-execution attestation）は、利用者のブラウザで実行されるフロントエンドコードと、署名・承認の対象になるトランザクションの来歴を、実行・承認の前に独立検証可能な暗号証明として固定する。配信されるコードが「正規の来歴を持つ」ことを事前証明し、来歴が確認できなければ承認セッションを開始しない。正規ドメインの確認（detection 的な「サイトは本物に見える」）と、配信コードの来歴の事前証明（「実行するコードは正規の配信物だ」）を切り離さず、両者が重なって初めて、Web フロントエンド越しの資産操作を実務に安心して載せられる。検出と事前証明は代替ではなく **補完** の関係にある。

事後の検知が証明にならない論点は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、行動前に独立検証する設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）を参照。

---

## 6. 対応経緯と業界動向

- **Polymarket**: 事案を公表し、影響を受けた第三者依存をシステムから除去。影響利用者へ連絡し、全額補償を表明。バックエンド・スマートコントラクトの無侵害を確認
- **Rescana**: サプライチェーン構造解析を公開し、MITRE ATT&CK へのマッピング（T1195.002 ほか）と第三者依存リスクの一般化を提示
- **PeckShield / Bubblemaps**: pUSD→ETH の交換と Polygon→Ethereum のブリッジを含む資金の流れを追跡
- **業界横断の論点**: DeFi・暗号資産プラットフォームは第三者依存が多く、利用者操作が Web ウォレット経由で媒介されるため、フロントエンド依存の継続監査・配信コードの完全性検証・利用者教育（不審な承認要求の見分け）が防御の論点として改めて共有された

「Web フロントエンドに載るコードの来歴を、ドメインの正当性とは別にどう実行前に独立検証するか」は、本事案を契機に DeFi フロントエンド設計の論点として議論が進む見込み。

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差（正規ドメインでも、配信されるフロントコードの来歴が実行・承認の前に独立検証されていない）に対し、Lemma は以下の設計を提示する。

- **配信コードの来歴証明**: 利用者のブラウザで実行されるフロントエンドコードが「正規の配信物である」ことを、実行の前に独立検証可能な来歴証明として固定し、改ざん・注入されたコードを事前に排除する
- **承認対象の来歴固定**: 署名・承認の対象になるトランザクションが「正規の業務フローを経て生成された」ことを、UI 表示とは独立に事前証明し、表示と承認対象の乖離を実行前に検出する
- **ドメイン正当性 ≠ コード来歴**: 「サイトが正規ドメインである」事実と「そこに載るコードが正規の来歴を持つ」事実を切り離さず、後者を事前証明の対象とする
- **選択的開示**: 配信パイプライン全体を開示せずに、「このコードは正規の来歴を持つ」ことだけを最小開示で証明する

検出（事後の依存除去・資金追跡・補償）は被害の是正に、事前証明（実行・承認前のコードおよび承認対象の来歴の独立検証）は Web フロントエンド越しの資産操作の信頼確立に、それぞれ相補的に働く。

設計と適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) および [Seal](https://lemma.frame00.com/ja/seal/) を参照のこと。

---

## 8. Sources

- **Rescana**: “Polymarket Supply-Chain Attack Analysis: $3 Million Cryptocurrency Theft via Compromised Third-Party Dependency”（2026-06-29）— <https://www.rescana.com/post/polymarket-supply-chain-attack-analysis-3-million-cryptocurrency-theft-via-compromised-third-party-dependency>
- **BleepingComputer**: “Polymarket customers lose $3 million in supply chain attack”（2026-06-26）— <https://www.bleepingcomputer.com/news/security/polymarket-customers-lose-3-million-in-supply-chain-attack/>
- **Decrypt**: “Polymarket to Refund Users After Scammers Swipe Millions in Website Exploit”（2026-06）— <https://decrypt.co/372129/polymarket-refund-users-scammers-swipe-millions-website-exploit>
- **The Next Web**: “Polymarket confirms hackers stole $3 million from users after third-party vendor was compromised”（2026-06）— <https://thenextweb.com/news/polymarket-hack-3-million-stolen-third-party-breach>
- **TechRadar Pro**: “Prediction market giant Polymarket hit by cyberattack…”（2026-06）— <https://www.techradar.com/pro/security/prediction-market-giant-polymarket-hit-by-cyberattack-with-company-confirming-user-funds-stolen-here-is-what-we-know>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
