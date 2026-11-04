---
brief_no: 175
title: "Storm-2657：米国の大学の職員のアカウントが乗っ取られ、人事システムで給与の振込先が書き換えられた(Microsoft の報告)"
title_en: "Storm-2657: Staff accounts at US universities were taken over and payroll deposits redirected in the HR system (Microsoft report)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2025-10-09
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering", "160-baltimore-workday-supplier-contact-bank-change", "164-capcom-id-password-change-ecommerce-mypage", "051-instagram-ai-support-takeover"]
status: draft
version: "1.0"
og_lead_ja: "米国の大学で職員のアカウントが乗っ取られ、Workday で給与の振込先が書き換えられた — Microsoft が Storm-2657 を報告"
og_lead_en: "Storm-2657: US university staff accounts taken over and payroll deposits redirected in Workday (Microsoft)"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "Microsoft の報告 · 給与の振込先"
og_kicker_en: "MICROSOFT REPORT · PAYROLL"
og_headline_ja: "大学の職員の人事の画面で、\n給与の振込先が変えられた。\n<accent>3 大学で 11 アカウント</accent>"
og_headline_en: "University staff payroll\nwas quietly redirected.\n<accent>11 accounts, 3 universities</accent>"
key_figures:
  - value: "11"
    unit: "アカウント"
    label: "2025 年 3 月から、乗っ取られたことを Microsoft が確認した職員のアカウント（3 大学）"
    tone: "alert"
  - value: "約 6,000"
    unit: "件"
    label: "乗っ取ったアカウントから、フィッシングのメールが送られた先のメールアカウント（25 大学）"
  - value: "非公表"
    label: "大学の名前、被害の額、振込先が実際に変えられた件数（Microsoft の報告に無い）"
glossary:
  - term: "Workday"
    desc: "人事・給与・調達などを扱うクラウドのサービス。職員は自分のプロフィールで、給与の振込先の口座を登録・変更できる。"
  - term: "payroll pirate"
    desc: "職員のアカウントを乗っ取り、人事のシステムで給与の振込先を自分の口座に変える手口の、業界での呼び名。"
  - term: "受信のルール"
    desc: "メールボックスで、届いたメールを条件に応じて自動で移したり消したりする設定。"
insight:
  slug: "payroll-change-not-tied-to-owner"
  stop: true
  label: "給与の振込先の変更が、本人に結びつかない"
  quote: "給与の振込先を変える前に、その操作が本人のものかを、新しく登録された機器ではなく変更の前からの本人の鍵で照合する。"
industries: ["public-sector"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "給与の振込先の変更を、変更の前から登録されていた本人の鍵や連絡先で承認する"
  - slug: "hold-unverified"
    item: "認証の機器が新しく登録された直後の振込先の変更は、本人に照合できるまで保留する"
  - slug: "audit-trail"
    item: "どの職員の振込先が、どの機器の承認で、いつ変わったかを記録する"
attack_method: "account-takeover"
impact: "3 大学で職員のアカウント 11 件が乗っ取られ、人事システムで給与の振込先が書き換えられた（変えられた件数と被害の額は非公表）"
takeaway: "職員のアカウントが乗っ取られ、給与の振込先が書き換えられた。振込先の変更は、変更の前から登録されていた本人の鍵で承認されてから確定する。"
self_check: "職員が給与の振込先を変えるとき、変更の前から登録されていた本人の鍵や連絡先で承認されてから確定しているか。"
countries: ["us"]
search_title: "大学の給与の振込先書き換え（Storm-2657）：経緯と対策"
search_description: "米国の大学で職員のアカウントが乗っ取られ、Workday で給与の振込先が書き換えられた（Microsoft の報告）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. 要点

書き換えられたのは、取引先への支払いではなく、職員自身の給与の振込先だった。Microsoft によれば、攻撃者は乗っ取ったアカウントに自分の電話を認証の機器として登録した。給与の振込先を変え、変更を知らせるメールは受信のルールで隠した。変更は、職員本人のアカウントから正規の画面を通って届いた。Microsoft は、これは Workday の製品の欠陥ではないとしている。大学の名前と被害の額は公表されていない。<strong>ログインが本人の名で通っても、変更の前から本人のものだった鍵で承認されない限り、給与の振込先の変更は本人の操作として確定できない。</strong>

## 2. 通った操作

- **通った操作**: 人事のシステム（Workday）での、職員の給与の振込先の変更。攻撃者は、乗っ取った職員のアカウントからシングルサインオンで Workday に入り、給与の振込先の口座の情報を変えた（Microsoft）。
- **同じアカウントで通った操作**: 攻撃者の電話番号を、多要素認証の機器として登録すること（Workday のプロフィールか、Duo の設定で）。Microsoft は、本人の承認を以後は求められずに入り続けるためとしている。振込先の変更を知らせる Workday のメールを隠したり消したりする受信のルールも作られた。
- **受け付けた側に届くもの**: 一般に、人事のシステムには、本人のアカウントでログインした状態からの、振込先の変更として届く。ログインが通ったことは、その変更を本人がしたことを示さない。
- **公表されていないこと**: 大学の名前。被害の額と、振込先が実際に変えられ給与が別の口座へ送られた件数。給与が戻ったか。振込先の変更のときに、ログインとは別の確認が求められていたか。認証の機器の登録と振込先の変更の順序と間隔。

## 3. 何を照合するか

経路を問わず区別できる条件は、給与の振込先の変更が本人の操作かを、変更の前から登録されていた本人の鍵や連絡先で、確定の前に照合することである。

- **誰が承認を出すか**: 職員本人。変更の前から登録されていた鍵（パスキーなど）か連絡先で、新しい振込先の口座を示した上で承認する。承認は、新しく登録された認証の機器や、変更を受け付けた画面では作れない形で出す。
- **どこで照合するか**: 給与の振込先の変更を確定する、人事・給与のシステム。認証の機器が新しく登録された直後の変更は、確定せずに保留する。承認と一致しない変更も同じく保留し、次の給与の締めの前に本人に照合する。
- **何が残るか**: どの職員の振込先が、どの手順から届き、どの機器の承認で、いつ確定したかの記録。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝給与の振込先の変更を確定する前に、その変更が本人の操作かを、変更の前から登録されていた本人の鍵で照合し、記録に残すこと。検知＝乗っ取りや変更の後に気づくこと。機器の登録と振込先の変更の日付は公表されていない。日付は Microsoft が示した時期と公表の日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>振込先の変更を確定する前に、前からの本人の鍵で照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>3 大学で 11 アカウントの乗っ取り<br>給与の振込先の書き換え（件数は非公表）</span></div>
<div class="rx-zone det"><b>検知 · 後から働いた</b>Microsoft が乗っ取りを調べ、手口と対策を公表する</div>
<div class="rx-g g1"><div class="t">2025-03〜</div><b>職員のアカウントの乗っ取り</b></div>
<div class="rx-g g2"><div class="t">時期は非公表</div><b>攻撃者の電話を認証の機器に登録</b></div>
<div class="rx-g g3"><div class="t">時期は非公表</div><b>振込先を変え、知らせのメールを隠す</b></div>
<div class="rx-g g4"><div class="t">10-09</div><b>Microsoft が公表する</b></div>
</div>
</figure>

変更の知らせのメールは、乗っ取られたメールボックスに届く。受信のルールで隠されると、本人には届かない。登録の情報が、持ち主かを照合しないまま正規の画面で変えられる点は、[Booking.com の受取口座の書き換え](https://lemma.frame00.com/ja/critical/briefs/032-booking-payout-account-tampering/)（ホテルの管理画面で受取口座が変えられた）や、[米ボルティモア市](https://lemma.frame00.com/ja/critical/briefs/160-baltimore-workday-supplier-contact-bank-change/)（Workday の取引先登録で振込先が変えられた）と共通する。今回は、取引先ではなく職員自身の給与が対象だった。

## 4. Lemma でできること

**Lemma は、03 の照合を、給与の振込先の変更を確定する側に組み込む。** 侵入を見つけるのではなく、届いた変更が、変更の前から登録されていた本人の鍵で承認されたものかを、確定の前に照合する。

### 注意したい業界・業務

- **業界 · 自治体・公共**: 大学や公的機関など、多くの職員がクラウドの人事のシステムで、自分の給与の振込先を変えられる組織。Microsoft は、人事や給与・口座の情報を持つ SaaS は、どれも同じ手口の標的になりうるとしている。
- **業務 · 振込先・口座の変更**: 職員の給与の振込先の登録と変更。
- **業務 · アカウント・権限の管理**: 職員のアカウントへの、多要素認証の機器の登録と変更。

### いまの対策と Lemma の違い

今回の経路は、1 列目（給与の振込先の変更）と 2 列目（認証の機器の登録）である。3 列目は、乗っ取ったアカウントからほかの職員や大学へ送られたフィッシングのメールに当たる。

| 対策 | 給与の振込先の変更 | 認証の機器の登録 | 乗っ取ったアカウントからのメールの送信 |
| --- | --- | --- | --- |
| フィッシングに強い多要素認証（Microsoft の推奨） | 一部 | 一部 | 一部 |
| 振込先の変更を知らせるメール | 一部 | 関係しない | 関係しない |
| 乗っ取りの検知と、変更の差し戻し | 一部 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 | 関係しない |

フィッシングに強い多要素認証はログインを守り、ログインが通った後の操作は見ない。知らせのメールは、本人が後から気づく手がかりで、届く先のメールボックスが乗っ取られると、受信のルールで隠されうる。検知と差し戻しは、気づいた後に効く。Lemma は、ログインではなく振込先の変更の操作そのものを、確定の前に、前からの本人の鍵と照合する。認証の機器の登録にも同じ照合を組み込めるが、前からの鍵を持たない職員の、最初の登録は通る。

注：Lemma の照合が働くのは、給与の振込先の変更を確定する人事・給与のシステムに照合を組み込む場合に限る。承認に使う鍵は、変更の前から登録され、変更を受け付ける画面や新しく足された認証の機器とは別にあることが要る。前からの鍵そのものを奪われた場合は、この照合を通りうる。人事の担当者が代わりに振込先を変える手順も、そこに照合を組み込まない限り通る。乗っ取りやフィッシングのメールの送信は、この照合では止まらない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

職員の給与の振込先の変更について、組織で確認する 3 項目

- 認証の機器が新しく登録された直後の、給与の振込先の変更を、確定の前に保留する手順があるか。
- 給与の振込先が変わったとき、本人のメールボックスとは別の経路にも知らせが届くか。
- 人事や給与の知らせを移す・消す受信のルールが作られたとき、気づける仕組みがあるか。

## 5. 事実と時系列

- **報告した主体**: Microsoft Threat Intelligence。金銭を目的とする攻撃者を Storm-2657 と呼んで追っている。
- **標的**: 米国の組織、特に大学など高等教育の機関。人事の SaaS（Workday など）のプロフィールを狙う。大学の名前は公表されていない。
- **確認されたこと**: 2025 年 3 月から、3 大学で 11 の職員のアカウントの乗っ取りを確認した。乗っ取ったアカウントから、25 大学の約 6,000 のメールアカウントにフィッシングのメールが送られた（Microsoft）。
- **入られ方**: Microsoft によれば、フィッシングのメールで認証の情報が取られた。多要素認証を使っていないアカウントもあれば、多要素認証のコードを横取りされたアカウントもあった。
- **人事のシステムで**: 攻撃者はシングルサインオンで Workday に入り、給与の振込先の口座の情報を変えた。自分の電話番号を多要素認証の機器として登録し、変更を知らせる Workday のメールを受信のルールで隠したり消したりした（Microsoft）。
- **Workday について**: Microsoft は、この攻撃は Workday の基盤や製品の脆弱性を示すものではないとしている。Workday は、顧客向けの手引きを同社のコミュニティに出した（Microsoft）。
- **被害**: 被害の額と、振込先が実際に変えられた件数は公表されていない。
- **同じ型の注意喚起**: 2024 年 7 月、ワシントン州立大学は、フィッシングで認証の情報を取られた職員の Workday で給与の振込先が変えられたとして、全職員に振込先を見直すよう呼びかけた（同大学の発表）。この件と Storm-2657 の関係は、どちらの発表にも書かれていない。

### 時系列

- **2024-07-01**: ワシントン州立大学が、職員の給与の振込先が変えられたとして、振込先の見直しを呼びかける（Storm-2657 との関係は書かれていない）。
- **2025-03**: Microsoft が、Storm-2657 による職員のアカウントの乗っ取りを確認し始める（3 大学で 11 アカウント）。
- **2025 年の前半**: Workday のプロフィールを狙う一連の攻撃が観測される（Microsoft）。
- **2025-10-09**: Microsoft が、Storm-2657 の報告を公表する。

> 事実は Microsoft Threat Intelligence の報告（一次）に拠る。報告は、乗っ取りを確認したアカウントの数と大学の数を書く。大学の名前、被害の額、振込先が実際に変えられた件数は書いていない。ワシントン州立大学の発表（一次）は、同じ型の別の事案である。Microsoft の報告とのつながりは示されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Microsoft**: パスワードを使わない、フィッシングに強い多要素認証（FIDO2 の鍵、パスキーなど）を勧めた。乗っ取られたアカウントには、認証の情報の再設定とセッションの取り消し、多要素認証の機器の見直しと登録のし直し、不正な振込先の変更の差し戻し、不正な受信のルールの削除を勧め、検知のための調べ方を示した。
- **Workday**: 顧客向けの手引きを、同社のコミュニティに出した（Microsoft）。

## 6. Sources

- **Microsoft Threat Intelligence（一次・調査報告）**: "Investigating targeted “payroll pirate” attacks affecting US universities"（2025-10-09） — <https://www.microsoft.com/en-us/security/blog/2025/10/09/investigating-targeted-payroll-pirate-attacks-affecting-us-universities/>
- **ワシントン州立大学（一次・大学の発表）**: "WSU employees urged to check direct deposit information"（2024-07-01） — 同じ型の別の事案 · <https://news.wsu.edu/news/2024/07/01/wsu-employees-urged-to-check-direct-deposit-information/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
