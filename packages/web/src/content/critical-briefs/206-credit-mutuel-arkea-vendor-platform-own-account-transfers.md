---
brief_no: 206
title: "Crédit Mutuel Arkéa：委託先のプラットフォームを経て入った攻撃者に、銀行の自己勘定から他行への送金を通された(同行の公表)"
title_en: "Crédit Mutuel Arkéa: Attackers who came in through a service provider's platform pushed transfers from the bank's own account to other banks (bank's disclosure)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [code-provenance]
incident_date: 2026-11-04
published: 2026-11-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["201-bank-sinopac-vendor-setting-unauthorized-transfers", "081-bybit-safe-wallet-ui-injection", "204-ntt-data-stdirect-vendor-saas-admin-rights"]
status: draft
version: "1.0"
og_lead_ja: "フランスの Crédit Mutuel Arkéa で、委託先のプラットフォームを経て入った攻撃者が、銀行の自己勘定から他行へ送金した。同行は報道の 1 億 1,800 万ユーロについて、額は確認せず桁だけを認めた"
og_lead_en: "At France's Crédit Mutuel Arkéa, attackers who came in through a service provider's platform sent money from the bank's own account to other banks. The bank confirmed only the order of magnitude of the reported €118 million"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · 委託先のプラットフォーム"
og_kicker_en: "CYBERATTACK · VENDOR PLATFORM"
og_headline_ja: "委託先を経て、\n銀行の自己勘定\nから送金が出た。\n<accent>約 1 億ユーロ規模</accent>"
og_headline_en: "Via a vendor's platform,\nmoney left the bank's\nown account.\n<accent>Around €100m in scale.</accent>"
key_figures:
  - value: "約 1 億"
    unit: "ユーロ"
    label: "自己勘定から送られた額の規模。報道の 1 億 1,800 万ユーロ（1 億 3,300 万ドル）について、同行は額を確認せず、桁だけを認めた（同行の FAQ）。AFP は、同行が暫定の見積もりで約 1 億ユーロとしたと伝えた"
    tone: "alert"
  - value: "11-02 → 11-04"
    label: "ブロックチェーンの調査者 ZachXBT が暗号資産の不審な引き出しを指摘した日から、同行が攻撃を公表した日まで（Silicon.fr・CSO・同行の発表）"
glossary:
  - term: "自己勘定（compte propre）"
    desc: "銀行が自らの資金の決済に使う勘定。顧客の口座とは別にある。Crédit Mutuel Arkéa によれば、攻撃者はこの勘定を使って他行へ送金し、顧客の口座は使われていない。"
  - term: "委託先（prestataire）"
    desc: "銀行の業務やシステムの一部を受け持つ外部の事業者。同行は、攻撃者が委託先の 1 社のプラットフォームを経て同行に達したとしたが、委託先の名前とプラットフォームの種類は公表していない。"
  - term: "OFAC"
    desc: "フランスの警察のサイバー犯罪の捜査機関（Office anticybercriminalité）。パリ検察が本件の捜査を任せた。"
insight:
  slug: "own-account-transfer-reached-via-vendor"
  stop: true
  label: "委託先の経路から出せる自己勘定の送金"
  quote: "自己勘定から他行へ送金する前に、その指示を、どの経路から届いたかではなく、社内で登録した担当の承認と送金先と上限で照合する。"
industries: ["finance"]
operations: ["approval"]
controls:
  - slug: "verify-entry"
    item: "自己勘定からの送金の指示は、社内の系統に届いたことだけでなく、登録した担当の承認と結びついているかを、実行の前に確認する"
  - slug: "hold-unverified"
    item: "登録した担当の承認と結びつかない指示、登録の無い送金先への指示、1 回・1 日の上限を超える指示は、実行の前に保留する"
  - slug: "audit-trail"
    item: "自己勘定の送金が、どの経路から届き、誰の承認を経て、どの送金先へ出たかを、委託先の系統とは別に残す"
attack_method: "supply-chain"
impact: "委託先のプラットフォームを経て入った攻撃者が、銀行の自己勘定から他行へ送金した。同行は報道の 1 億 1,800 万ユーロの桁を認めたが、額は確認していない。顧客の資産に影響は無いとしている"
takeaway: "委託先のプラットフォームを経て入った攻撃者に、銀行の自己勘定から他行への送金を通された。自己勘定の送金は、届いた経路ではなく、登録した担当の承認と送金先と上限で照合してから実行する。"
self_check: "自社の勘定からの送金が、指示の届く経路ごとに、社内で登録した担当の承認と照合されてから実行されているかを把握しているか。"
countries: ["fr"]
---

## 1. 要点

フランスの銀行グループ Crédit Mutuel Arkéa（Crédit Mutuel de Bretagne・Crédit Mutuel du Sud-Ouest・Fortuneo などの親）は 2026 年 11 月 4 日、攻撃で不正な取引が行われたと公表した。同行によれば、攻撃者は同行の自己勘定を使って他行へ送金し、その資金は暗号資産に替えられた可能性がある。顧客の口座は使われておらず、顧客の資産に影響は無いとしている。

同行は同じ日の FAQ で、攻撃者は委託先の 1 社のプラットフォームを経て同行に直接達したとし、人の操作の誤りではなく外部からの高度な攻撃だとした。報道の 1 億 1,800 万ユーロについては、額は確認せず桁だけを認め、資金の一部は止められたとしている。委託先の名前と、攻撃の詳しい手口は公表されていない。パリ検察が捜査している。

<strong>送金の指示が銀行の内側の系統から出たことは、その送金を銀行の担当が承認したことを示さない。</strong>

## 2. 通った操作

- **通った操作**: 銀行の自己勘定から他行への送金。Crédit Mutuel Arkéa によれば、攻撃者は同行の自己勘定を使って他の銀行への取引を行い、その資金は専門のプラットフォームで暗号資産に替えられた可能性がある。顧客の口座は使われていない。同行は、検知のあと一部の取引を一時止め、11 月 4 日の午前にほぼすべての取引を再開した。
- **受け付けた側に届くもの**: 一般に、銀行が他行への送金を実行する手順には、社内の系統から、送る勘定・送金先・金額の指示が届く。その指示が担当の承認を経たかは、指示を出した系統の判定としてしか届かない。同行によれば、攻撃者は委託先のプラットフォームを経て同行に直接達した。
- **公表されていないこと**: 委託先の名前とプラットフォームの種類。委託先のプラットフォームから、どう自己勘定の送金に達したか（同行は、攻撃の出どころと手口を当局と調べているとした）。送金の件数・送金先・期間。確定した額と、止められた額。報道の一部は Fortuneo が入口だと伝えたが、同行は否定している。

## 3. 実行前の照合

経路を問わず区別できる条件は、自己勘定から他行へ送金する前に、その指示が社内で登録した担当の承認を経たものかを、指示が届いた系統の判定とは別に、承認の記録と送金先と上限で照合することである。

- **誰が承認を出すか**: 銀行の資金の担当。自己勘定からの送金ごとに、委託先の系統や社内の系統の設定だけでは作れない形の承認（担当ごとの鍵など）を出す。
- **どこで照合するか**: 銀行が他行への送金を実行する手順。指示がどの系統から届いても、登録した担当の承認と結びつかない指示、登録の無い送金先への指示、1 回・1 日の上限を超える指示は保留する。
- **何が残るか**: 自己勘定の送金が、どの経路から届き、誰の承認を経て、どの送金先へ出たかの記録。委託先の系統とは別に残し、被害の範囲の特定、送金先の銀行への凍結の依頼、当局と捜査への報告に使う。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝自己勘定から他行へ送金する前に、指示を登録した担当の承認と送金先と上限で照合し、記録に残すこと。検知＝不審な取引に気づき、一部の取引を止めて、資金の一部を止めること。日付は同行の発表と FAQ、Silicon.fr・CSO・AFP の報道に拠る。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>自己勘定の送金の指示を、届いた系統の判定とは別に、担当の承認と送金先と上限で照合してから実行する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>自己勘定から他行への送金<br>約 1 億ユーロ規模（同行は桁だけを認めた）</span></div>
<div class="rx-zone det"><b>検知 · 働いた</b>一部の取引を一時止め、資金の一部を止めて、取り戻す手続きを進める</div>
<div class="rx-g g1"><div class="t">11-02</div><b>ZachXBT が暗号資産の不審な引き出しを指摘する</b></div>
<div class="rx-g g2"><div class="t">11-04</div><b>パリ検察が同行の告訴を受け、捜査を始める</b></div>
<div class="rx-g g3"><div class="t">11-04</div><b>同行が攻撃を公表し、取引を順に再開する</b></div>
<div class="rx-g g4"><div class="t">11-04</div><b>FAQ で、委託先と自己勘定を説明する</b></div>
</div>
</figure>

同行によれば、検知の仕組みは不審な動きをすぐに見つけ、一部の取引を止めて、資金の一部を止めた。それでも、報道で 1 億ユーロを超えるとされる規模の送金が、自己勘定から他行へ出ている。新しい取引システムの提供元の設定を経て、本人のログインの無い送金が通った事案に [永豊銀行](https://lemma.frame00.com/ja/critical/briefs/201-bank-sinopac-vendor-setting-unauthorized-transfers/)、委託先のウォレットの画面に注入されたコードで、表示と違う取引に承認が通った事案に [Bybit](https://lemma.frame00.com/ja/critical/briefs/081-bybit-safe-wallet-ui-injection/)、委託先の SaaS で管理者権限が取られた事案に [NTT データ](https://lemma.frame00.com/ja/critical/briefs/204-ntt-data-stdirect-vendor-saas-admin-rights/) がある。今回は、委託先のプラットフォームを経て、銀行自身の勘定から送金が出た。

## 4. Lemma でできること

**Lemma は、実行前の照合を、銀行が自己勘定から他行への送金を実行する手順に組み込む。** 侵入や攻撃者を見つけるのではなく、指示が登録した担当の承認と結びつくかと、送金先と上限の中かを、実行の前に照合する。

### 注意したい業界・業務

- **業界 · 金融**: 決済・資金の管理・取引の処理を、外部の事業者のプラットフォームとつないで動かす銀行・証券・決済の事業者。委託先の系統が社内の系統に届くと、そこから自己勘定の送金に近づく経路ができうる。
- **業務 · 承認・決裁**: 自己勘定からの送金の指示の受付と実行（担当の承認・送金先の登録・1 回・1 日の上限）。

### いまの対策と Lemma の違い

今回の経路は 1 列目（委託先のプラットフォームを経て入った攻撃者が、自己勘定から送金を出す）である。2 列目は、社員の ID とパスワードが盗まれ、送金の画面から送金される場合、3 列目は、担当がだまされて自分で送金する場合で、今回そうだったという公表は無い。

| 対策 | 委託先のプラットフォームを経た、自己勘定からの送金 | 盗まれた社員の ID とパスワードでの送金 | 担当がだまされて自分で送金する |
| --- | --- | --- | --- |
| 社員のログインの多要素認証 | 一部 | 効く | 効かない |
| 委託先の接続の制限（接続元・権限の絞り込み） | 一部 | 関係しない | 関係しない |
| 異常な取引の監視 | 一部 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 | 効かない |

社員のログインの多要素認証は、ログインする人を確かめるが、今回の攻撃者が社員のログインを経たかは公表されていない。委託先の接続の制限は、委託先から届く範囲を絞るが、絞った範囲の中に送金に近づく経路があれば通る。監視は、同行の検知のように不審な動きを見つけて止めるが、気づくまでの間は通る。Lemma は、指示が届いた系統ではなく、登録した担当の承認と結びつくかと、送金先と上限の中かを、実行の前に照合する。

注：Lemma の照合が働くのは、銀行が自己勘定の送金を実行する手順に照合を組み込み、担当の承認の鍵と送金先の登録と上限を、委託先の系統とは別の場所で管理する場合に限る。担当の鍵そのものが盗まれた場合は、送金先と上限の照合だけが働く。担当がだまされて自分で承認した送金は通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではなく、送られた資金を取り戻すものでもない。

### 点検チェックリスト

委託先とのつなぎと自己勘定の送金について、組織で確認する 3 項目

- 委託先のプラットフォームから社内の系統へつながる接続と、その接続で届く範囲を一覧にし、定期に見直しているか。
- 自己勘定から、これまで取引の無い送金先へ、短い時間に送金が続いたとき、実行の前に保留する仕組みがあるか。
- 不正な送金に気づいたとき、送金先の銀行への凍結の依頼と、該当する取引の抽出を、その日のうちにできるか。

## 5. 事実と時系列

- **当事者**: Crédit Mutuel Arkéa（フランス・ブレスト）。Crédit Mutuel de Bretagne と Crédit Mutuel du Sud-Ouest の連合会と、その地域の金庫、Fortuneo・Monext など約 40 の子会社から成る協同組合の銀行グループで、顧客と組合員は 580 万を超える（同行）。委託先は名前が公表されていない。
- **起きたこと**: 同行によれば、攻撃で不正な取引が行われた。攻撃者は同行の自己勘定を使って他の銀行への取引を行い、その資金は専門のプラットフォームで暗号資産に替えられた可能性がある。攻撃者は委託先の 1 社のプラットフォームを経て同行に直接達し、Fortuneo からの入口は無かった。同行は、人の操作の誤りではなく外部からの高度な攻撃だとした。
- **顧客への影響**: 同行によれば、顧客の口座は使われておらず、顧客の資産に影響は無い。一部の振込の実行が遅れた。同行は、攻撃に乗じたフィッシングに注意するよう呼びかけた。
- **額**: 同行は、報道の 1 億 1,800 万ユーロ（1 億 3,300 万ドル）について「確認はしない。桁だけを認める」とし、資金の一部は止められ、取り戻す手続きを進めているとした。確定した額は公表されていない。AFP は、同行が 11 月 4 日の夜に、暫定の見積もりで約 1 億ユーロとしたと伝えた。
- **暗号資産の動き**: Silicon.fr によれば、ブロックチェーンの調査者 ZachXBT は 11 月 2 日、暗号資産の取引所に結びつく口座からの 1 億 600 万ドルを超える不審な引き出しを、被害者を名指しせずに指摘し、のちに推計を 1 億 3,300 万ドル超とした。Crédit Mutuel Arkéa を被害者としたのは推定の帰属である。同行はこの推計を取り上げていない。

### 時系列

- **2026-11-02**: ZachXBT が、暗号資産の取引所に結びつく口座からの不審な引き出しを、被害者を名指しせずに指摘する（Silicon.fr・CSO）。
- **2026-11-04**: 朝、パリ検察のサイバー犯罪の部門が同行の告訴を受け、組織的な情報システムへの侵害の疑いで捜査を始め、OFAC に任せる（検察が AFP に述べた）。
- **2026-11-04**: 13 時、同行が攻撃を公表する。検知のあと一部の取引を一時止め、監督の機関に知らせ、午前中に取引を順に再開したとする。
- **2026-11-04**: 同行が FAQ を出し、自己勘定からの送金、委託先のプラットフォーム、報道の額の桁を説明する。

> 本件の事実は、Crédit Mutuel Arkéa の発表と FAQ（いずれも 11 月 4 日・一次）と、AFP・Silicon.fr・CSO・FrenchWeb の報道に拠る。捜査の開始は、パリ検察が AFP に述べた内容に拠る。同行は「監督の機関に知らせた」としているが、機関の名前は挙げておらず、Banque de France と ACPR の発表は確認できていない。Fortuneo と Crédit Mutuel de Bretagne の顧客向けの案内は確認できていない。攻撃が始まった日時、委託先の名前とプラットフォームの種類、委託先から自己勘定の送金にどう達したか、送金の件数と送金先、確定した額は公表されていない。暗号資産の動きの推計は ZachXBT のもので、同行の推計ではない。公表されていないことは、対策が無かったことを意味しない。本 Brief は、同行と委託先の対応を評価するものではない。11 月 12 日時点の記述。

### 公表後の対応

- **Crédit Mutuel Arkéa**: 一部の取引を一時止め、確認と安全の対策を強めたあと、11 月 4 日の午前にほぼすべての取引を再開した。攻撃の出どころと手口を、司法と警察の当局と調べている。資金の一部を止め、取り戻す手続きを進めている。顧客にフィッシングへの注意を呼びかけた。
- **パリ検察**: サイバー犯罪の部門が、組織的な情報システムへの侵害の疑いで捜査を始め、OFAC に任せた（AFP）。
- **監督の機関**: 同行は、検知のあと監督の機関に知らせたとしている。

## 6. Sources

- **Crédit Mutuel Arkéa（一次・当事者の発表）**: 「Crédit Mutuel Arkéa annonce avoir été victime d'une attaque」（2026-11-04・フランス語） — [cm-arkea.com/…/04112026_-_communique_….pdf](https://www.cm-arkea.com/arkea/banque/upload/docs/application/pdf/2026-11/04112026_-_communique_-_le_credit_mutuel_arkea_annonce_avoir_ete_victime_dune_cyberattaque__2026-11-04_15-40-19_385.pdf)
- **Crédit Mutuel Arkéa（一次・当事者の FAQ）**: 「Informations complémentaires suite à l'attaque dont le Crédit Mutuel Arkéa a été victime」（2026-11-04・フランス語） — <https://www.cm-arkea.com/arkea/banque/assurances/pa_38386/fr/informations-complementaires-suite-a-l-attaque-dont-le-credit-mutuel-arkea-a-ete-victime>
- **AFP（Yahoo Finance France・報道）**: 「Crédit Mutuel Arkéa: cyberattaque pour près de 100 millions d'euros, enquête ouverte」（2026-11-05） — <https://fr.finance.yahoo.com/actualites/cr%C3%A9dit-mutuel-ark%C3%A9a-victime-d-104933480.html>
- **AFP（DH・報道）**: 「Crédit Mutuel Arkéa : les questions en suspens après la cyberattaque」（2026-11-05） — <https://www.dhnet.be/dernieres-depeches/2026/11/05/credit-mutuel-arkea-les-questions-en-suspens-apres-la-cyberattaque-67MPJWJ2UZBBHIKE46XTENGMGQ/>
- **Silicon.fr（報道）**: 「Crédit Mutuel Arkéa victime d'une cyberattaque : ce que l'on sait」（2026-11-04） — <https://www.silicon.fr/cybersecurite-1371/credit-mutuel-arkea-victime-dune-cyberattaque-ce-que-lon-sait-du-detournement-presume-de-118-millions-e-230100>
- **Silicon.fr（報道）**: 「Ce que le Crédit Mutuel Arkéa confirme sur la cyberattaque dont il a été victime」（2026-11-05） — <https://www.silicon.fr/cybersecurite-1371/ce-que-le-credit-mutuel-arkea-confirme-et-ne-confirme-pas-sur-la-cyberattaque-dont-il-a-ete-victime-230129>
- **CSO（報道）**: "French banking group hit by supply chain cyberattack"（2026-11-05） — <https://www.csoonline.com/article/4245357/french-banking-group-hit-by-supply-chain-cyberattack.html>
- **FrenchWeb（報道）**: 「Crédit Mutuel Arkéa confirme une cyberattaque, le montant du détournement reste à établir」（2026-11-04） — <https://www.frenchweb.fr/credit-mutuel-arkea-confirme-une-cyberattaque-le-montant-du-detournement-reste-a-etablir/900000019>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
