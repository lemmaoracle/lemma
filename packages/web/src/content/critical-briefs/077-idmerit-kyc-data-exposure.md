---
brief_no: 77
title: "IDMerit：本人確認に使われたとみられる約 10 億件がパスワードの無い DB で見つかったと報じられたが、IDMerit は否認し、帰属は確定しないまま(Cybernews 報道・IDMerit 否認) — 見つかったデータが誰の管理下にあったかを、記録で示せる層が無い"
title_en: "IDMerit: about a billion records apparently used for identity checks were reported found in a password-less database, IDMerit denied it, and whose data it was remains unsettled (Cybernews report, IDMerit denial) — No layer can show, from records, whose custody the data was in"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2026-02-18
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["086-sumsub-support-environment-breach", "013-coinbase-kyc-insider-breach", "052-discord-age-verification-id-leak"]
status: published
version: "3.0"
og_lead_ja: "IDMerit 10 億件露出の係争 — 誰のデータかを誰も記録で示せない"
og_lead_en: "IDMerit's disputed billion-record exposure — no one can show whose data it was"
layout: "report"
og_kicker_ja: "情報漏えい事例 · 帰属の係争"
og_kicker_en: "DATA EXPOSURE · DISPUTED CUSTODY"
og_headline_ja: "本人確認のデータが\n公開の DB で見つかった。\n誰のものかは決まらない。\n<accent>約 10 億件（報道の主張）</accent>"
og_headline_en: "Identity-check data was found in an open database. Whose it was is unsettled.\n<accent>About 1 billion records (as claimed).</accent>"
key_figures:
  - value: "約 10 億"
    unit: "件"
    label: "機微な個人データを含むとされるレコード（Cybernews の主張・未検証）。総数は約 30 億件"
    tone: "alert"
  - value: "11-11 → 11-12"
    label: "パスワードの無い DB の発見から、閉じられるまで（2025 年）"
  - value: "取り下げ"
    label: "IDMerit を相手取った集団訴訟（2026-03 提訴）。判断が出ないまま 06-03 に終わった"
glossary:
  - term: "データソース"
    desc: "本人確認の事業者が照会する、通信会社や公的記録などの外部のデータの持ち主。本人確認の事業者は、多くのデータソースにつないで結果を返す。"
  - term: "帰属（カストディ）"
    desc: "そのデータが誰の管理下にあり、誰が守る責任を負うか。漏えいの通知や責任の所在は、帰属から決まる。"
  - term: "MongoDB"
    desc: "広く使われるデータベースの一種。設定によっては、パスワード無しでインターネットから読める状態になる。"
insight:
  slug: "custody-unprovable"
  label: "誰のデータかを示せない"
  quote: "公開された DB があったことは確かめられても、それが誰の管理下のデータかを、否認する側も指摘する側も記録で示せなかった。"
industries: ["finance"]
operations: ["data-access"]
controls:
  - slug: "audit-trail"
    item: "どのデータを、誰の管理下で、どこに置いているかを記録する"
impact: "約 10 億件の露出が報じられ、帰属は係争（件数は未検証）"
takeaway: "見つかったデータが誰の管理下にあり、どの契約で預かったものかを、記録で示す手順が無かった。"
self_check: "自社の利用者のデータが見つかったと指摘されたとき、自社の管理下のものかどうかを記録で答えられるか。"
---

> **改訂（v3.0 / 2026-10-21）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。Cybernews の記事（アーカイブ）と IDMerit の声明を読み直し、IDMerit が「独立したデータソースに関わるポートが開いていた可能性」は認めていたこと、Cybernews の注記（発見者は外部の協力者で、報酬をめぐるやり取りを後から知った）、米国の集団訴訟の提訴と取り下げを加えた。AI 生成が疑われる媒体と、出所の分からない KYC ブログ群を出典から外した。v2.0（2026-07-03）では、確定した露出としていた初版を、係争として書き直している。

## 1. TL;DR

セキュリティ媒体 Cybernews は 2026 年 2 月 18 日、パスワードの無い MongoDB で、本人確認（KYC）に使われたとみられる個人データ約 10 億件（総数約 30 億件、26 か国）が見つかり、IDMerit のものだと報じた。DB は 2025 年 11 月 11 日に見つかり、通知の翌日に閉じられた。IDMerit は、顧客データも独立したデータソースのデータも所有・管理・保存しておらず、自社の環境に露出は無かったと否認した。

一方で IDMerit は、独立したデータソースに関わる一部のポートが開いていた可能性は認めている。Cybernews が帰属の根拠として示したのは、コレクションの名前などの手がかりと「当チームはそう考える」という判断で、DB の持ち主を示す記録は、どちらの側からも公開されていない。

DB は通知の翌日に閉じられ、検出は働いた。米国で起こされた集団訴訟も、判断が出ないまま取り下げで終わった。効かなかったのは、見つかったデータが誰の管理下にあり、どの契約で預かったものかを、記録で示せる層である。

## 2. 何が起きたか

- **当事者**: IDMerit（米カリフォルニア州）。180 か国超・440 以上のデータソースにつなぎ、本人確認を API で提供する（同社）。
- **発見**: Cybernews と協力する外部の研究者が、パスワードの無い MongoDB を 2025 年 11 月 11 日に見つけた。通知の翌日、11 月 12 日に閉じられた。公表は 2026 年 2 月 18 日。
- **主張された規模（未検証）**: 約 30 億件。うち約 10 億件が国別に分かれ、機微な個人データを含むとされ、残りはログとみられる。約 1TB、26 か国。米国約 2.03 億件、メキシコ約 1.24 億件など。
- **データの種類（主張）**: 氏名、住所、生年月日、国民 ID 番号、電話番号、メールアドレス、性別、通信事業者のメタデータなど。
- **帰属の根拠**: Cybernews は「当チームは、この DB が IDMerit のものだと考える」とし、一部の国のコレクション名（idmtelco）などを挙げた。持ち主を直接示すホスト名などは公開していない。
- **IDMerit の否認**: 顧客データも、独立したデータソースが持つデータも、所有・管理・保存していない。精査の結果、IDMerit の環境に露出・脆弱性・不正アクセスは無かった。ただし、独立したデータソースに関わる一部のポートが開いていて、データベースが露出しうる状態だった可能性は認めた。報告書を求めたところ金銭を要求され、ランサム目的を疑ったとした。
- **Cybernews の注記**: 発見者は外部の協力者で、報酬をめぐる発見者と IDMerit のやり取りは 2 月 26 日まで知らなかった。社内の研究者が技術的な内容を確かめ、発見は正当だとした。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過</span></div>
<p class="rx-ex-cap">止めどころは ①。データを置くときに、誰の管理下で、どの契約によるものかを記録していれば、④ の争いは記録で決着できた。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">誰か（争われている）</div><div class="no">1</div><b>本人確認に使われたとみられるデータを、DB に置く</b><p>持ち主は IDMerit か、データソースか。</p></div>
<div class="rx-step crit"><div class="who">DB</div><div class="no">2</div><b>パスワード無しで、インターネットから読める状態になる</b><p>約 30 億件（主張）。</p></div>
<div class="rx-step"><div class="who">研究者</div><div class="no">3</div><b>見つけて通知し、翌日に DB が閉じられる</b><p>2025-11-11 → 11-12。</p></div>
<div class="rx-step crit"><div class="who">当事者</div><div class="no">4</div><b>帰属をめぐって主張が割れ、記録では決着しない</b><p>否認と反論。訴訟は取り下げ。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2025-11-11**: 研究者がパスワードの無い DB を見つけ、通知する。
- **2025-11-12**: DB が閉じられる。
- **2026-02-18**: Cybernews が公表。翌日、見出しを「IDMerit data breach」に改め、DB を「IDMerit が所有する」と書き改めた。
- **2026-02-20**: Biometric Update が、IDMerit の否認を掲載する。
- **2026-02-26**: Cybernews が、発見者と IDMerit の間に報酬をめぐるやり取りがあったことを知る（同社の注記）。
- **2026-03-11**: 米カリフォルニア州南部地区の連邦地裁に、IDMerit を相手取った集団訴訟が起こされる。
- **2026-06-03**: 原告が訴えを取り下げる。判断は出ていない。

> 件数と中身は Cybernews の主張で、独立に確かめられていない。IDMerit の否認も、外から確かめられる記録を伴っていない。2026 年 10 月の時点で、監督当局の判断や、DB の持ち主を特定した公表は無い。この Brief は、どちらの主張の真偽も認定しない。

### 公表後の対応

- **Cybernews**: 発見は正当だとする立場を保ち、修正の販売はしていないと注記した。
- **IDMerit**: 同じ時期に、データを保存しない設計を説明するブログを公開したが、事案には直接触れていない。

## 4. なぜ止まらなかったか

この事案の失敗は、どちらかの主張の誤りに帰着しない。本人確認のデータが、事業者、データソース、その間の連携をまたいで流れるなかで、見つかった DB が誰の管理下にあったかを、どの側も記録で示せなかった。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">証明はデータを置く時点で働き、検出は公開された DB が見つかった後に働く。検出は DB を閉じさせたが、誰のデータかは決めない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回なし</b>データを置くとき、誰の管理下で、どの契約かを記録する</div>
<div class="rx-zone gapz"><b>落差</b><span>DB は閉じたが、<br>誰のものかは決まらない</span></div>
<div class="rx-zone det"><b>検出の層 · 気づいた</b>研究者が見つけ、通知して閉じさせる</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>DB が公開される</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>研究者が見つける</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>DB が閉じられる</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>帰属で争う</b></div>
</div>
</figure>

検出は働いた。DB は通知の翌日に閉じられている。ただ、「公開された DB があった」ことは確かめられても、「それが誰の管理下のデータか」は別の事実で、記録が無いため、否認する側も指摘する側も示せなかった。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[Sumsub](https://lemma.frame00.com/ja/critical/briefs/086-sumsub-support-environment-breach/)（本人確認の委託先で、取引先の利用者の連絡先が中心の外に残っていた）にも現れている。

## 5. 対策するには

**本人確認のデータが、誰の管理下で、どこに置かれているかを、記録で示せるようにする。** 本人確認の事業者は多くのデータソースにつなぎ、データは組織をまたいで流れる。委託する側は、委託先とその先のデータソースが、預けたデータを保存するのか、どこに置くのかを契約で決め、記録を求める。漏えいを指摘されたとき、自社のものかどうかを記録で答えられる。

### 注意したい業界・業務

- **業界 · 金融・FinTech**: 本人確認を API で外部に任せる金融機関、決済、暗号資産の事業者。利用者のデータは、委託先の先のデータソースにも渡る。
- **業務 · 照会・参照**: 本人確認のために、外部のデータソースに利用者の情報を照会する業務。照会のたびに、データが組織をまたいで動く。

### いまの対策で埋まるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 委託先の「保存しない」という説明 | 一部 | 委託先自身の環境は説明できても、その先のデータソースまでは示さない。 |
| データ処理の契約（保存の有無・場所） | 一部 | 決めていても、守られたことを外から確かめる記録が無ければ、争いは決着しない。 |
| データベースの公開設定の点検 | 一部 | 開いた DB は見つけられるが、見つけた後に誰のものかは示さない。 |
| 研究者による発見と通知 | 一部 | DB は翌日に閉じられたが、誰のものかは決まらなかった。 |

### 必要になるもの

1. **データの流れを、委託先の先まで把握する。** どのデータソースに照会し、どこに保存されるか（されないか）を、委託先に一覧で出してもらう。
2. **保存と場所を契約で決め、記録で確かめる。** 保存しないなら、保存していないことを示す記録を求める。保存するなら、場所と期間を決める。
3. **誰の管理下で、どの契約によるかを残す。** データごとに、管理する主体と預けた根拠を、後から第三者に示せる形、つまり証明として残す。指摘を受けたとき、自社のものかどうかをすぐに答えられる。

### 点検チェックリスト

本人確認を外部に任せている組織で確かめる 3 項目

- 委託先が照会するデータソースと、データが保存される場所を言えるか。
- 委託先の「保存しない」という説明を、説明以外の記録で確かめているか。
- 自社の利用者のデータが見つかったと指摘されたとき、自社の管理下のものかを記録で答えられるか。

注：記録を残しても、記録そのものを偽れば争いは決着しない。記録は、当事者から独立して確かめられる形で残す必要がある。また、委託先の先のデータソースまで記録を求めると、契約の交渉は重くなる。

## 6. Sources

- **Cybernews（一次・発見者側の報道）**: 「IDMerit data breach: 1 billion records of personal data exposed in KYC data leak」（2026-02-18） — 現在は閲覧制限。2026-02-22 のアーカイブ · <https://web.archive.org/web/20260222075348/https://cybernews.com/security/global-data-leak-exposes-billion-records/>
- **米国連邦地裁（一次・裁判記録）**: Andrizzi v. IDMerit LLC, No. 3:26-cv-01527（S.D. Cal.、2026-03-11 提訴・06-03 取り下げ） — <https://www.courtlistener.com/docket/72421353/andrizzi-v-idmerit-llc/>
- **米国連邦地裁（一次・訴状）**: Andrizzi v. IDMerit LLC の訴状（2026-03-11） — <https://storage.courtlistener.com/recap/gov.uscourts.casd.847125/gov.uscourts.casd.847125.1.0.pdf>
- **Biometric Update（報道・IDMerit の声明を掲載）**: 「IDMerit disputes report of 1B records exposed in unsecured ID verification database」（2026-02-20） — 02-26 更新 · <https://www.biometricupdate.com/202602/idmerit-disputes-report-of-1b-records-exposed-in-unsecured-id-verification-database>
- **Fox News（報道・IDMerit の声明を掲載）**: 「1 billion identity records exposed in ID verification data leak」（2026-03-11） — <https://www.foxnews.com/tech/1-billion-identity-records-exposed-id-verification-data-leak>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)

本件は当事者の間で事実関係が争われており、この Brief はいずれの主張の真偽も認定しない。
