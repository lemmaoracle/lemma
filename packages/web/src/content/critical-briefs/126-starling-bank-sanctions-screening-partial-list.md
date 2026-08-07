---
brief_no: 126
title: "FCA が Starling Bank を £29m 制裁：自動サンクション照合は、2017 年以降ずっと制裁リストの一部としか突き合わせていなかった — 照合は動いていた"
title_en: "FCA fines Starling Bank £29m: since 2017, the automated sanctions screening had been matching customers against only a fraction of the list — the screening ran"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["attribute-proof-bypass", "identity-auth"]
incident_date: 2024-10-02
published: 2026-08-07
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["093-a7a5-stablecoin-sanctions-evasion", "086-sumsub-support-environment-breach", "077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach"]
status: published
version: "1.0"
og_lead_ja: "FCA が Starling Bank を £29m 制裁、自動サンクション照合は全リストの一部のみ"
og_lead_en: "FCA fines Starling Bank £29m — sanctions screening covered only a fraction of the list"
gap_detected: "自動サンクション・スクリーニングは稼働していた。顧客は日々照合されており、仕組みが無かったわけではない。"
gap_missing: "その照合先が制裁リストの全体だったかは、2017 年から 2023 年 1 月に自覚するまで、口座を開く前に確かめられていなかった。"
gap_fix: "照合先が原本の全体であることと照合の結果を、口座開設の前に独立に確かめられる形にし、それを伴わない開設を差し止め可能にする。"
analysis_lead_ja: "確かめられていなかったのは、照合したかどうかではない。その照合が、制裁リストの全体に向いていたかどうかである。"
---

## 1. TL;DR

2024 年 10 月 2 日、英 FCA（金融行為規制機構）は Starling Bank に **£28,959,426** の制裁を公表した。理由は金融制裁スクリーニングをめぐる金融犯罪対策の不備である。中核は照合の失敗だった——2023 年 1 月に自覚するまで、Starling の自動スクリーニングは **2017 年以降ずっと、制裁対象の全リストではなくその一部としか顧客を突き合わせていなかった**。あわせて、高リスク顧客の新規口座を開設しないという FCA との合意に反し、2021 年 9 月から 2023 年 11 月に 4.9 万人へ 5.4 万口座超を開設していた。照合の層は在り、稼働していた。**効かなかったのは、その照合が制裁リストの全体に向いていたことを、口座を開く前に確かめる層である。**

## 2. 何が起きたか

- Starling Bank は英国のデジタル銀行で、顧客数は 2017 年の約 4.3 万から 2023 年に 360 万へ急拡大した。FCA は、金融犯罪への対策がこの成長に追いついていなかったと認定している。
- 2021 年、FCA はチャレンジャーバンクの金融犯罪統制をレビューし、Starling のマネーロンダリング対策および制裁フレームワークに重大な懸念を認めた。Starling は、改善するまで高リスク顧客の新規口座を開設しないという要件に合意した。
- Starling はこれを遵守せず、2021 年 9 月から 2023 年 11 月にかけて 4.9 万人の高リスク顧客へ 5.4 万口座超を開設した。
- 2023 年 1 月、Starling は自身の自動スクリーニングが 2017 年以降、金融制裁対象の全リストではなくその一部に対してしか顧客を照合していなかったことを把握した。続く内部レビューは、制裁フレームワークに systemic な問題があることを明らかにした。Starling はその後、複数の制裁違反の可能性を当局へ報告している。
- 制裁額は £28,959,426。Starling が早期解決に応じて 30% の減額が適用されており、減額前は £40,959,426 だった。

失敗は次の連鎖で成立している。

1. 自動サンクション照合を運用する。仕組みは在り、顧客は日々照合される。
2. だが照合先が原本の一部でしかない。制裁対象であっても、照合を通過してしまう。
3. 高リスク顧客も、合意した制限に照らして確かめられないまま口座が開かれる。
4. 制裁該当・高リスクという属性は、口座が開かれた後——内部での自覚と当局の調査に至って初めて——現れる。

## 3. 時系列 — 公表と対応

- 2017：自動スクリーニングが、制裁対象の全リストではなくその一部に対してのみ稼働する状態になる（後に発覚）。この年の顧客数は約 4.3 万。
- 2021：FCA がチャレンジャーバンクの金融犯罪統制をレビューし、Starling の AML・制裁フレームワークに重大な懸念を認定。Starling は高リスク顧客の新規口座開設を制限する要件に合意する。
- 2021-09〜2023-11：その要件に反し、4.9 万人の高リスク顧客へ 5.4 万口座超を開設。
- 2023-01：Starling が、照合対象が全リストの一部に限られていたことを把握する。続く内部レビューで制裁フレームワークの systemic な問題が判明。
- 2024-10-02：FCA が £28,959,426 の制裁を公表（早期解決による 30% 減額後）。

> 本 Brief の金額・期間・口座数・顧客数は、FCA のプレスリリースに基づく。Final Notice（最終通知）は本 Brief 執筆時点で暗号化された PDF として公開されており本文を直接参照できていないため、通知に固有の認定事項には踏み込んでいない。Starling は FCA の認定を受け、是正に着手したと表明している（当事者としての説明）。

公表後の対応と業界の動きは次のとおり。

- FCA の執行担当エグゼクティブディレクターは、Starling の制裁スクリーニング統制について次のように述べた。

> Starling の金融制裁スクリーニング統制は驚くほど杜撰だった。金融システムを犯罪者と制裁対象者に対して大きく開いたままにしていた。さらに、金融犯罪を助長するリスクを下げるために自ら合意した FCA の要件を、適切に遵守しなかったことがこれを悪化させた。

- FCA は、本件が調査開始から結着まで 14 か月であったことに触れている（同種案件の平均は 42 か月）。
- Starling は制裁違反の可能性を当局へ報告し、スクリーニングと関連統制の是正に取り組む姿勢を示している。

## 4. なぜ止まらなかったか

この事案の失敗は、照合の仕組みが無かったことでも、検出が破られたことでもない。**照合は動いていたが、その照合先が制裁リストの全体であることを、口座を開く前に確かめる層が無かった**ことにある。

スクリーニングは稼働していた。顧客は日々照合されていた。効かなかったのはその手前——照合先が原本の全体か、そしてその照合が口座開設という行動の前に効いているかを、独立に確かめる形である。原本の一部としか突き合わせていない照合は、通過しても属性を確かめたことにはならない。しかも 2017 年から 2023 年 1 月までの約 6 年、その状態は内部でも気づかれなかった。

> 照合は、原本の全体に向いて初めて意味を持つ。断片としか突き合わせていない照合は、通過しても確かめたことにならず、制裁該当は口座が開かれた後にしか現れない。

高リスク顧客の口座開設も同じ形をしている。開設しないという合意は在ったが、個々の開設が合意に照らして確かめられる形にはなっていなかった。規制属性が独立に照合されないまま金融の動線に乗る構造として、これは [Brief 093](https://lemma.frame00.com/ja/critical/briefs/093-a7a5-stablecoin-sanctions-evasion/)（制裁下での資金移動）と方向を共有し、本人性・属性の検証層が痩せる点で [Brief 013](https://lemma.frame00.com/ja/critical/briefs/013-coinbase-kyc-insider-breach/) · [Brief 086](https://lemma.frame00.com/ja/critical/briefs/086-sumsub-support-environment-breach/) · [Brief 077](https://lemma.frame00.com/ja/critical/briefs/077-idmerit-kyc-data-exposure/) の KYC/AML クラスタに連なる。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、口座が開かれる一つひとつの行動の前に、照合の相手を固定する一段を経路へ挟む。照合が回っていることを確認の代用にせず、「この顧客は、どの版の・どの範囲のリストに照らして照合されたのか」を、口座が成立する前に、受け取った側が発行者に問い合わせずに確かめられる形にする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>照合の相手を固定する</strong>：判定を、実際に突き合わせたリストの版と範囲に結びつけ、どのリストに照らした結果かを行動の前に確かめられる形で残す。</li>
<li><strong>照合の証跡</strong>：その結びつけが「いつ・どの機関の発行で・改ざんなく」行われたかを、後から覆せない形で残す。照合したという説明が、説明のままでは済まなくなる。</li>
<li><strong>合意した制限への照合</strong>：高リスク指定のような制限を、口座開設という個々の行動に結びつけ、合意を守ったことを建前でなく検証可能な事実として残す。</li>
<li><strong>結果だけの開示</strong>：リスト全体や顧客の機微情報を相手に渡さず、「制裁対象に非該当」「制限に適合」という結果の証明だけを検証可能にする。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>リストそのものの正しさ・網羅性を保証するものではない。原本を維持するのは発行機関である。</li>
<li>照合の結果が妥当かを判断するのは、この結びつきを前提にした人である。</li>
<li>口座開設を止めるのは銀行の業務フローであり、この層が出せるのはその判断材料までである。</li>
</ul>

自社の照合ログとの違いはここにある。ログは自社が自社のために出すものであり、監督当局も取引の相手方も、独立に確かめられない。本事案で照合先が痩せていた 6 年間、稼働ログは正常に積み上がっていたはずである。

Lemma はサンクション・スクリーニング製品を置き換えるものではなく、金融犯罪を検知するものでもない。スクリーニング・人手審査・監査は、この層と代替ではなく補完の関係にある。前者は既知の該当を弾き、後者は口座が開かれる前の一点を閉じる。

## 6. Sources

- **FCA（一次・公式発表）**: "FCA fines Starling Bank £29m for failings in their financial crime systems and controls"（初出 2024-10-02）— <https://www.fca.org.uk/news/press-releases/fca-fines-starling-bank-failings-financial-crime-systems-and-controls>
- **FCA（一次・当局決定／最終通知）**: Final Notice: Starling Bank Limited（2024）— <https://www.fca.org.uk/publication/final-notices/starling-bank-limited-2024.pdf>
- **Starling Bank（当事者・公式声明）**: "Starling Bank response to FCA Final Notice" — <https://www.starlingbank.com/news/starling-bank-response-to-fca-final-notice/>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）。設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、適用範囲は [Pillar 04 — 規制属性証明](https://lemma.frame00.com/ja/pillars/#attribute) · [Brief 093（制裁下での資金移動）](https://lemma.frame00.com/ja/critical/briefs/093-a7a5-stablecoin-sanctions-evasion/) · [Brief 013（Coinbase 内部者による KYC 情報流出）](https://lemma.frame00.com/ja/critical/briefs/013-coinbase-kyc-insider-breach/)
