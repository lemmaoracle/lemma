---
brief_no: 103
title: "Ostium：オラクルの署名鍵が侵害され、未来日付の価格が有効な署名つきで受理された(CoinDesk ほかの報道)"
title_en: "Ostium: A compromised oracle signer key let future-dated prices be accepted with valid signatures (CoinDesk and others)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["identity-auth", "bridge-config-trust"]
incident_date: 2026-07-15
published: 2026-07-21
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["074-taiko-bridge-prover-key-leak", "067-syscoin-bridge-spv-proof-parsing", "001-kelpdao-rseth", "045-humanity-protocol-multisig-key-custody", "023-alephium-tokenbridge", "016-verus-ethereum-bridge"]
status: published
gate: "payment-instruction"
version: "1.0"
og_lead_ja: "Ostium — オラクル署名鍵1本の侵害で「未来の価格」が有効署名で受理され $18M 流出"
og_lead_en: "Ostium — one compromised oracle signer key let \"future prices\" be accepted as validly signed, draining $18M"
layout: "report"
sections: "proof"
og_kicker_ja: "サイバー攻撃事例 · 署名鍵の侵害"
og_kicker_en: "CYBERATTACK · SIGNER KEY COMPROMISE"
og_headline_ja: "オラクルの署名鍵が侵害され、\n未来の価格が有効な署名で通った。\n<accent>最大約 1,800 万ドルが流出</accent>"
og_headline_en: "A compromised oracle signer key\nlet future prices pass with valid signatures.\n<accent>Up to ~$18M drained.</accent>"
key_figures:
  - value: "1,800"
    unit: "万ドル"
    label: "公開流動性ボルト（OLP）から流出した USDC。共同創業者が確認した額。一部の報道は最大約 2,400 万ドル"
    tone: "alert"
  - value: "約 5"
    unit: "分"
    label: "攻撃が続いた時間。UTC の 14:18〜14:23（共同創業者が確認）"
  - value: "1 時間以内"
    label: "Ostium が攻撃を数分で把握してから、全取引を停止するまで"
glossary:
  - term: "オラクルと署名鍵"
    desc: "価格など、ブロックチェーンの外の情報を、その上のプログラムへ届ける仕組みがオラクル。届ける価格レポートには、署名鍵で署名が付き、受け取る側は署名が正しいかを検証する。"
  - term: "OLP ボルト"
    desc: "Ostium の公開流動性ボルト（Ostium Liquidity Provider vault）。取引の支払いは、ここから引き出される。"
  - term: "現実資産（RWA）の永続先物"
    desc: "株式や商品など、現実の資産の価格に連動する、期限の無い先物取引。Ostium は Arbitrum 上でこれを扱う。"
insight:
  slug: "valid-signature-compromised-signer"
  label: "有効な署名と、侵害された署名者"
  quote: "外のデータで支払いを確定する操作は、署名が有効かに加えて、署名した者がいま正当か、データが妥当かを支払いの前に照合しなければ、侵害された鍵の署名でも通る。"
industries: ["finance"]
controls:
  - slug: "hold-unverified"
    item: "署名者と価格データが正当かを確認できるまで、支払いを確定しない"
attack_method: "account-takeover"
impact: "最大約 1,800 万ドル（USDC）が流出"
takeaway: "オラクルの署名鍵 1 本が侵害され、未来日付の価格が有効な署名つきで受理された。外の価格を支払いに反映する前に、署名者の正当性とデータの妥当性を、署名の有効性とは別に照合する。"
self_check: "外から届く価格で支払いを確定する前に、署名が有効かとは別に、署名者がいまも正当かを確認する仕組みがあるか。"
countries: ["global"]
---

## 1. 要点

攻撃者は、オラクルの署名鍵を侵害し、未来日付のタイムスタンプを付けた価格レポートに署名して提出した。署名は有効で、プロトコルの署名検証を通った。検証が答えたのは「この署名は正しいか」で、「その署名者はいま正当・無侵害か」「その価格データは真正・妥当か」ではなかった。<strong>署名の有効性は、署名者の正当性とも、データの妥当性とも別の問いで、支払いを確定する前にこの 2 つを署名とは別に照合しなければ、侵害された鍵の署名でも通る。</strong>

## 2. 通った操作

- **通った操作**: 未来日付の価格レポートを根拠にした、OLP ボルトからの支払い。攻撃者は、損失取引を利益取引に見せかけ、委任アクション（delegated actions）を通じて約 20 回のループ取引を回し、実際の市場エクスポージャーを負わずに架空の利益を作った。
- **署名の検証**: 働いた。レポートの署名は有効だったため、正しく通過した。
- **受け付けた側に届くもの**: 一般に、署名の検証は、レポートが登録済みの署名者のものかに答える。署名した者がいまも正当で無侵害か、タイムスタンプや価格が妥当（未来日付でない・市場と整合する）かは、署名の有効性とは別の問いで、署名からは分からない。
- **検知**: Blockaid が攻撃の進行中に検出した。Ostium は数分で把握し、1 時間以内に取引を停止した。オンチェーンの異常監視も、損失を約 5 分間に封じ込める役割を果たした。
- **公表されていないこと**: 署名鍵がどう侵害されたか（漏洩・窃取・管理不備など）。損失総額の確定値、根本原因、最終のポストモーテム、補償計画。

## 3. 何を照合するか

経路を問わず区別できる条件は、外のデータを支払いに反映する前に、署名が有効かだけでなく、署名した者がいま正当・無侵害でそのスコープで認可されているか、データが真正で妥当性の境界（タイムスタンプの整合・価格の許容範囲）の中にあるかを、署名の有効性とは別に照合することである。

- **誰が承認を出すか**: 価格レポートの署名者を認可する側（プロトコルの運用）。署名者の正当性を、1 本の鍵を持っていることだけに置かず、認可を独立に確認できる形にする。鍵が侵害されても、署名だけでは支払いが確定しないようにする。
- **どこで照合するか**: 価格レポートを支払い（payout）に反映する直前。「登録済みの鍵で署名されている」ことを、受理の終点にしない。反映する前に、署名者の認可と、データの妥当性の境界を確認する。確認できないレポートは、支払いに反映せず止める。
- **何が残るか**: どの署名者の、どのデータを、どの妥当性の境界で確認して、支払いを確定した（または止めた）かの記録。内部の署名鍵や資格情報は環境の外に出さず、「この入力は来歴と妥当性の要件を満たす」ことだけを示す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝価格レポートを支払いに反映する前に、署名者の正当性とデータの妥当性を、署名の有効性とは別に照合し、記録に残すこと。検知＝取引が進んだ後に気づくこと。報道に日付は 1 つ（2026-07-15）で、攻撃は UTC の 14:18〜14:23 の約 5 分間。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>価格レポートを支払いに反映する前に、署名者とデータを、署名とは別に照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>約 5 分で、OLP ボルトから<br>最大約 1,800〜2,400 万ドルが流出</span></div>
<div class="rx-zone det"><b>検知 · 進行中に働いた</b>Blockaid が検出し、Ostium が取引を停止した</div>
<div class="rx-g g1"><div class="t">侵害</div><b>オラクルの署名鍵が侵害される（経路は未公表）</b></div>
<div class="rx-g g2"><div class="t">提出</div><b>未来日付の価格に、有効な署名を付ける</b></div>
<div class="rx-g g3"><div class="t">支払い</div><b>約 20 回のループ取引で、ボルトから払い出す</b></div>
<div class="rx-g g4"><div class="t">検知</div><b>Blockaid が検出し、1 時間以内に停止</b></div>
</div>
</figure>

検知は進行中に働き、損失を約 5 分に封じ込める役割を果たした。署名は有効なのに、署名者の側が侵害されていた事案に、[Taiko ブリッジ](https://lemma.frame00.com/ja/critical/briefs/074-taiko-bridge-prover-key-leak/)（prover の鍵の漏洩で、偽の出金が有効と通った）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、外のデータを支払いに反映する段に組み込む。** 署名の検証の代わりではなく、その後ろで、署名者がいま正当・無侵害で認可されているか、データが妥当性の境界の中かを、署名の有効性とは別に、支払いの前に照合する。

### 注意したい業界・業務

- **業界 · 金融**: オラクルの価格や署名を根拠に、支払いや決済を確定するプロトコルと取引所。署名が有効なことを、受理の終点にしている仕組み。

### いまの対策と Lemma の違い

今回の経路は、1 列目（署名つきの価格レポートの受理）である。2 列目は、受理された後、取引が進むあいだの被害の拡大で、今回は Blockaid の検出と取引の停止が働いた。

| 対策 | 署名つきの価格レポートの受理 | 進行中の被害の拡大 |
| --- | --- | --- |
| 署名の検証 | 効かない | 関係しない |
| オンチェーンの異常監視と取引の停止 | 効かない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 |

署名の検証は、有効な署名のレポートを正しく通した。署名が有効でも、署名者が侵害されているか、データが未来日付の偽物かは、署名からは分からない。オンチェーンの異常監視と取引の停止は、取引が異常な結果を生み始めてから働き、損失を約 5 分に封じ込める役割を果たしたが、データが支払いに接続される前には働かない。Lemma は、価格レポートを支払いに反映する前に、署名者がいま正当・無侵害で認可されているか、データが妥当性の境界を満たすかを、署名の有効性とは別に照合する。支払いごとの記録が残るので、どの署名者の、どのデータで支払ったかを後から確認できる。

注：Lemma の照合が働くのは、価格レポートを支払いに反映する仕組みに照合を組み込み、署名者の認可と妥当性の境界が、署名鍵の外で管理されている場合に限る。認可の管理が、侵害された鍵や環境と同じ場所にあれば、照合を通りうる。妥当性の境界の内側に収まる偽のデータは、境界では止まらない。署名鍵がどう侵害されたかは公表されていない。進行中の被害の拡大について、Lemma は支払いごとに照合するので、署名の有効性だけでは以降の支払いが通らない。ただし、今回そうなったかは公表されていない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

外のデータで支払いを確定する組織で確認する 3 項目

- 受理するデータが、妥当性の境界（タイムスタンプの整合・価格の許容範囲）の中にあるかを、反映の前に確認しているか。
- 署名鍵が 1 本侵害されても、署名だけで支払いが確定しないよう、認可を鍵の保持とは別に確認できる形にしているか。
- どの署名者の、どのデータで支払いを確定したかを、あとから確認できる記録として残しているか。

## 5. 事実と時系列

- **サービス**: Ostium。Arbitrum 上で、現実資産（RWA）連動の永続先物を扱う分散型取引所。影響を受けたのは、公開流動性ボルト（Ostium Liquidity Provider vault, OLP）。
- **確認されたこと**: 2026-07-15、UTC の 14:18〜14:23 の約 5 分間。共同創業者 Kaledora Kiernan-Linn が、時間帯と OLP への影響を確認した。
- **手口**: 攻撃者がオラクルの署名鍵（signer key）を侵害。未来日付のタイムスタンプを付けた価格レポートを提出し、損失取引を利益取引に見せかけた。委任アクションを通じて約 20 回のループ取引を回し、実際の市場エクスポージャーを負わずに架空の利益を作り、ボルトからの支払いを引き出した。
- **流出規模**: 共同創業者が確認した約 1,800 万ドル（USDC）から、一部の報道の最大約 2,400 万ドルまで、出典により幅がある。約 1,800 万ドルは、プロトコルの TVL（約 6,300 万ドル）の概ね 28%。
- **検知と対応**: ブロックチェーンセキュリティ企業 Blockaid が、攻撃の進行中に検出した。Ostium は数分で把握し、1 時間以内に取引を停止した。法執行機関・SEAL 911・第三者のセキュリティ専門家と連携しているとした。
- **鍵の侵害**: どう侵害されたか（漏洩・窃取・管理不備など）は、公式には未確定。

### 時系列

- **2026-07-15**: 14:18〜14:23（UTC）に攻撃が発生。約 5 分の間に、未来日付の価格レポートを用いた約 20 回のループ取引が行われ、OLP ボルトから支払いが引き出された。Blockaid が進行中の攻撃を検出し、Ostium が数分で把握して、1 時間以内に全取引を停止した。
- **2026-07-15〜16**: 共同創業者が、時間帯と OLP への影響を確認し、法執行機関・SEAL 911・第三者の専門家と連携していると表明した。損失総額の確定値、根本原因、最終のポストモーテム、補償計画は、この時点で未公表。

> 技術的な事実は、Blockaid の検出、Ostium の共同創業者の確認、および報道（CoinDesk・Decrypt など）に拠る。損失額は出典により約 1,800 万〜最大約 2,400 万ドルの幅があり、署名鍵がどう侵害されたかを含む根本原因は、公式のポストモーテムを待つ段階にある。最新の一次情報を参照されたい。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Ostium**: 攻撃を数分で把握し、1 時間以内に全取引を停止した。共同創業者が、事象の時間帯（UTC の 14:18〜14:23）と OLP ボルトへの影響を確認し、法執行機関・SEAL 911・第三者のセキュリティ専門家と連携していると表明した。損失総額の確定値、鍵の侵害の根本原因、最終のポストモーテム、補償計画は、本稿の執筆時点で未公表。
- **Blockaid**: ブロックチェーンセキュリティ企業 Blockaid が、攻撃を進行中に検出・フラグし、取引の停止につながった。
- **位置づけ**: 本件は、2026 年に続く、オラクルや署名鍵を起点にした DeFi 攻撃の系列に位置づけられる。

## 6. Sources

- **CoinDesk（一次報道）**: “Ostium loses $18 million in oracle attack that gamed its own price-feed infrastructure”（2026-07-15）— <https://www.coindesk.com/business/2026/07/15/ostium-suffers-usd18-million-exploit-as-oracle-attack-wave-continues-to-hit-defi>
- **crypto.news（Blockaid 検出）**: “Blockaid uncovers $18M exploit that forces Ostium halt”（2026-07-15）— <https://crypto.news/blockaid-uncovers-18m-exploit-that-forces-ostium-halt/>
- **Decrypt**: “Another DeFi Exploit: Perp DEX Ostium Loses $18 Million in Oracle Attack”（2026-07-15）— <https://decrypt.co/373566/defi-exploit-ostium-oracle-hack>
- **The Defiant**: “Ostium Halts Trading After Oracle Exploit Drains up to $18M from Vault”（2026-07）— <https://thedefiant.io/news/hacks/ostium-halts-trading-after-oracle-exploit-drains-up-to-usd18m-from-vault>
- **CryptoSlate（手口解説）**: “How prices from the future fooled a crypto oracle into paying out up to $24 million”（2026-07）— <https://cryptoslate.com/how-prices-from-the-future-fooled-a-crypto-oracle-into-paying-out-up-to-24-million/>
