---
brief_no: 87
title: "Polymarket：第三者ベンダーの依存から注入された JavaScript が、正規サイトで利用者に偽の承認を求めた(BleepingComputer ほかの報道)"
title_en: "Polymarket: JavaScript injected through a third-party vendor dependency asked users for fake approvals on the real site (BleepingComputer and others)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-06-26
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["030-stripe-trusted-channel-skimmer", "081-bybit-safe-wallet-ui-injection", "004-megalodon-github-supply-chain", "059-vercel-contextai-oauth"]
status: "published"
gate: "signing"
version: "1.0"
og_lead_ja: "Polymarket：第三者依存への JS 注入で利用者に偽承認、約300万ドル流出（コントラクトは無傷）"
og_lead_en: "Polymarket: JS injected via a third-party dependency drove fake approvals, ~$3M drained (contracts intact)"
layout: "report"
sections: "proof"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "正規のサイトで、\n偽の承認を求められた。\n<accent>約 300 万ドルが流出</accent>"
og_headline_en: "A real site asked\nusers to approve fakes.\n<accent>About $3M drained.</accent>"
key_figures:
  - value: "約 300"
    unit: "万ドル"
    label: "利用者のウォレットから流出した暗号資産（pUSD）の額（報道）"
    tone: "alert"
  - value: "15 未満"
    unit: "アカウント"
    label: "不正な承認をして、被害を受けたアカウントの数（報道）"
  - value: "約 1,893"
    unit: "ETH"
    label: "盗まれた pUSD の交換先。Polygon から Ethereum へブリッジされた（PeckShield・Bubblemaps の追跡）"
glossary:
  - term: "依存コンポーネント"
    desc: "Web サイトのフロントエンドが読み込む、第三者のベンダーが提供するスクリプトなどの部品。読み込んだ部品は、サイト自身のコードと同じ権限でブラウザの中で動く。"
  - term: "ウォレットの承認"
    desc: "暗号資産のウォレットで、取引に署名して、その実行を認めること。承認された取引は、ウォレットから資産を動かせる。"
  - term: "pUSD"
    desc: "Polymarket の決済用ステーブルコイン（Polymarket USD、USDC 担保）。一部の報道の ParionUSD・ParyonUSD は、同じトークンを指す。"
insight:
  slug: "real-domain-unchecked-code"
  label: "正規のドメイン、照合されないコード"
  quote: "正規のドメインから届いたコードでも、運営者が配信したものかを利用者に承認を求める前に照合しなければ、承認させる取引の中身は差し替えられる。"
industries: ["finance", "supply-chain"]
operations: ["approval"]
controls:
  - slug: "ownership-check"
    item: "ブラウザで動くコードが、Polymarket が配信したものかを照合する"
attack_method: "supply-chain"
impact: "約 300 万ドル相当の資産が盗まれた"
takeaway: "第三者ベンダーの依存から注入された JavaScript が、正規サイトで利用者に偽の承認を求めた。承認を求める前に、ブラウザで動くコードと承認させる取引が正規のものかを照合する。"
self_check: "利用者のブラウザで動くコードが、自社が配信したものかを、承認を求める前に照合しているか。"
countries: ["global"]
---

## 1. 要点

攻撃者は、Polymarket のフロントエンドが読み込む第三者ベンダーの依存コンポーネントを侵害し、正規のサイトに JavaScript を注入した。利用者が正規のサイトを開くと、そのスクリプトがブラウザの中で動き、正規の取引に見える形で、ウォレットの不正な承認を求めた。Polymarket のバックエンド、サーバー、スマートコントラクトは侵害されていない。<strong>正規のドメインから届いたコードでも、運営者が配信したものかを利用者に承認を求める前に照合しなければ、承認させる取引の中身は差し替えられる。</strong>

## 2. 通った操作

- **通った操作**: 利用者による、ウォレットの不正な承認（取引への署名）。利用者は正規のサイトの操作と信じて承認し、承認された取引で、ウォレットから pUSD が引き出された。
- **侵害されなかった範囲**: Polymarket のバックエンド、サーバー、スマートコントラクト。被害は、フロントエンドと利用者の操作にとどまった（Polymarket）。
- **受け付けた側に届くもの**: 一般に、ブラウザは、正規のドメインから届いたスクリプトを、そのサイトのコードとして動かす。利用者に見えるのは、サイトの画面と、ウォレットの承認の画面である。承認を求めているコードが運営者の配信したものかは、画面からは分からない。
- **公表されていないこと**: どのベンダーの、どの依存が、どう侵害されたか。注入が始まった日と、スクリプトが動いていた期間（報道は「2026-06-26 以前」と推定）。攻撃者の帰属（特定の攻撃者への確度の高い帰属はされていない）。

## 3. 何を照合するか

経路を問わず区別できる条件は、利用者に承認を求める前に、ブラウザで動くコードがサイトの運営者の配信したものか、承認させる取引が正規の業務の流れで作られたものかを、ドメインの正当性とは別に照合することである。

- **誰が承認を出すか**: サイトの運営者。配信するコードを、運営者が出したものとして登録する。第三者の依存も、運営者が認めた版だけを登録する。
- **どこで照合するか**: 利用者のウォレットに承認を求める前。登録と合わないコードからの承認の要求は、始めない。承認させる取引も、画面の表示とは別に、正規の流れで作られたかを照合する。
- **何が残るか**: どのコードの、どの版が、どの取引の承認を求めたかの記録。配信の仕組みの全体を開示せずに、「このコードは運営者が配信したものだ」ということだけを示す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝利用者に承認を求める前に、ブラウザで動くコードと承認させる取引が正規のものかを照合し、記録に残すこと。検知＝承認と流出の後に気づくこと。日付は、各社が公表・公開した日。依存が侵害された日は公表されていない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>承認を求める前に、コードと取引が正規のものかを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>15 未満のアカウントから<br>約 300 万ドル相当が流出</span></div>
<div class="rx-zone det"><b>検知 · 流出の後に働いた</b>依存を外し、資金の流れを追跡する</div>
<div class="rx-g g1"><div class="t">06-26 以前</div><b>第三者の依存が侵害される（推定）</b></div>
<div class="rx-g g2"><div class="t">06-26</div><b>正規のサイトで、偽の承認を求める</b></div>
<div class="rx-g g3"><div class="t">06-26</div><b>Polymarket が公表し、依存を外す</b></div>
<div class="rx-g g4"><div class="t">06-29</div><b>Rescana が解析を公開する</b></div>
</div>
</figure>

検知は流出の後に働き、被害の範囲の特定と、アカウントごとの補償を進めた。同じように、承認の画面の表示と、実際に承認する対象が食い違った事案に、[Bybit](https://lemma.frame00.com/ja/critical/briefs/081-bybit-safe-wallet-ui-injection/)（Safe{Wallet} のフロントエンドに JavaScript が注入された）がある。信頼された経路に載るコードが汚染された事案に、[Stripe の信頼された経路を使ったスキマー](https://lemma.frame00.com/ja/critical/briefs/030-stripe-trusted-channel-skimmer/)がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、利用者に承認を求める段に組み込む。** ドメインが正規かの確認の代わりではなく、その上で、ブラウザで動くコードが運営者の配信したものか、承認させる取引が正規の流れで作られたかを、承認を求める前に照合する。

### 注意したい業界・業務

- **業界 · 金融**: 暗号資産の取引所や予測市場など、Web のフロントエンドから、利用者のウォレットに承認を求めるサービス。
- **業界 · サプライチェーン**: 第三者のベンダーが提供する依存コンポーネントを、フロントエンドに読み込む Web サイト。
- **業務 · 承認・決裁**: 利用者に、取引の承認（署名）を求める操作。

### いまの対策と Lemma の違い

今回の経路は、1 列目（正規のサイトに注入されたコードが求めた、ウォレットの承認）である。2 列目は、流出の後の被害の把握で、今回は依存の除去と資金の追跡が働いた。

| 対策 | 注入されたコードが求めた承認 | 流出の後の被害の把握 |
| --- | --- | --- |
| ドメインの正当性（TLS・URL の見た目） | 効かない | 関係しない |
| 利用者による承認の画面の確認 | 効かない | 関係しない |
| 依存の除去と資金の追跡 | 効かない | 効く |
| **Lemma（実行の前の照合）** | 効く | 一部 |

ドメインの正当性は、サイトがどこにあるかを示すが、そこに載るコードが運営者の配信したものかは示さない。利用者は、正規のドメインで正規に見える画面を操作し、承認の対象はサイトの内側から差し替えられた。依存の除去と資金の追跡は、被害の範囲の特定とアカウントごとの補償を進めたが、承認が通った時点の引き出しは止めない。Lemma は、承認を求める前に、ブラウザで動くコードが運営者の配信したものか、承認させる取引が正規の流れで作られたかを照合する。どのコードがどの承認を求めたかの記録が残るので、流出の後の把握にも使える。

注：Lemma の照合が働くのは、利用者に承認を求める仕組みに照合を組み込み、配信するコードと認めた依存の登録が、配信の経路の外で管理されている場合に限る。登録そのものが侵害されている場合や、認めた版の依存の中に悪意あるコードが入っている場合は、この照合を通りうる。依存がどう侵害されたかは公表されていない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

Web のフロントエンドから利用者に承認を求める組織で確認する 3 項目

- 利用者のブラウザで動くコードが、自社が配信したもの（認めた版の第三者の依存を含む）かを、承認を求める前に照合しているか。
- 承認させる取引が、正規の業務の流れで作られたものかを、画面の表示とは別に照合しているか。
- フロントエンドが読み込む第三者の依存を、認めた版だけに限り、変わったときに分かるようにしているか。

## 5. 事実と時系列

- **サービス**: Polymarket（暗号資産を使う予測市場のプラットフォーム）の Web フロントエンドと、その利用者のウォレット。
- **被害の規模**: 約 300 万ドル相当の暗号資産。影響を受けたのは 15 未満のアカウント。
- **侵害の起点**: フロントエンドが読み込む第三者ベンダーの依存コンポーネント（ソフトウェアの依存）が侵害された。MITRE ATT&CK の T1195.002（Supply Chain Compromise: Compromise Software Dependencies and Development Tools）に対応する（Rescana）。
- **手口**: 侵害された依存を通じて、Polymarket の正規のサイトに JavaScript が注入された。利用者がサイトを訪れると、スクリプトがブラウザの中で動き、正規の取引に見える形で、ウォレットの不正な承認を求めた（T1059.007 JavaScript・T1189 Drive-by Compromise・T1566.002 phishing via service、Rescana）。
- **資金の流れ**: 盗まれたのは、Polymarket の決済用ステーブルコイン pUSD（[Polymarket USD](https://docs.polymarket.com/concepts/pusd)、USDC 担保）。攻撃者は、これを約 1,893 ETH に交換し、Polygon から Ethereum へブリッジした（PeckShield・Bubblemaps が追跡）。
- **侵害されなかった範囲**: Polymarket のバックエンド、サーバー、スマートコントラクトは侵害されていない。
- **文脈**: 手口は、EC や暗号資産のプラットフォームを狙う Magecart 系の JavaScript の注入と同じ型で、特定の攻撃者への確度の高い帰属はされていない。

### 時系列

- **2026-06-26 以前（推定）**: フロントエンドが読み込む第三者ベンダーの依存が侵害され、JavaScript が正規のサイトに注入される。
- **2026-06-26**: 注入されたスクリプトが利用者のブラウザで動き、15 未満のアカウントが不正な承認をして、約 300 万ドル相当が流出する。pUSD は約 1,893 ETH に交換され、Polygon から Ethereum へブリッジされる。
- **2026-06-26**: Polymarket が事案を公表する。BleepingComputer・OffSeq Radar が報じる。Polymarket は、影響を受けた依存の除去と、全額の補償を表明する。
- **2026-06-29**: Rescana が、サプライチェーンの構造の解析を公開する（PeckShield・Bubblemaps の追跡を引く）。

> 規模と帰属は、Polymarket の公表と、外部の解析（Rescana・BleepingComputer・PeckShield・Bubblemaps）に拠る。本 Brief は、調査の時点で確認できた値を記し、出所を明示する。盗まれたステーブルコインは、Polymarket の決済用の pUSD（Polymarket USD、USDC 担保）で、一部の報道の ParionUSD・ParyonUSD は、同じトークンを指す表記の揺れである。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Polymarket**: 事案を公表し、影響を受けた第三者の依存をシステムから外した。影響を受けた利用者に連絡し、全額の補償を表明した。バックエンドとスマートコントラクトが侵害されていないことを確認した。
- **Rescana**: サプライチェーンの構造の解析を公開し、MITRE ATT&CK への対応（T1195.002 ほか）と、第三者の依存のリスクの一般化を示した。
- **PeckShield・Bubblemaps**: pUSD から ETH への交換と、Polygon から Ethereum へのブリッジを含む、資金の流れを追跡した。
- **業界の論点**: DeFi や暗号資産のプラットフォームは、第三者の依存が多く、利用者の操作が Web のウォレットを通るため、フロントエンドの依存の継続的な監査、配信するコードの完全性の確認、利用者への周知（不審な承認の要求の見分け方）が、守りの論点として改めて共有された。

## 6. Sources

- **Rescana**: “Polymarket Supply-Chain Attack Analysis: $3 Million Cryptocurrency Theft via Compromised Third-Party Dependency”（2026-06-29）— <https://www.rescana.com/post/polymarket-supply-chain-attack-analysis-3-million-cryptocurrency-theft-via-compromised-third-party-dependency>
- **BleepingComputer**: “Polymarket customers lose $3 million in supply chain attack”（2026-06-26）— <https://www.bleepingcomputer.com/news/security/polymarket-customers-lose-3-million-in-supply-chain-attack/>
- **Decrypt**: “Polymarket to Refund Users After Scammers Swipe Millions in Website Exploit”（2026-06）— <https://decrypt.co/372129/polymarket-refund-users-scammers-swipe-millions-website-exploit>
- **The Next Web**: “Polymarket confirms hackers stole $3 million from users after third-party vendor was compromised”（2026-06）— <https://thenextweb.com/news/polymarket-hack-3-million-stolen-third-party-breach>
- **TechRadar Pro**: “Prediction market giant Polymarket hit by cyberattack…”（2026-06）— <https://www.techradar.com/pro/security/prediction-market-giant-polymarket-hit-by-cyberattack-with-company-confirming-user-funds-stolen-here-is-what-we-know>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
