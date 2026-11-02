---
brief_no: 77
title: "IDMerit：本人確認に使われたとみられる約 10 億件がパスワードの無い DB で見つかったと報じられたが、IDMerit は否認し、帰属は確定しないまま(Cybernews 報道・IDMerit 否認)"
title_en: "IDMerit: about a billion records apparently used for identity checks were reported found in a password-less database, IDMerit denied it, and whose data it was remains unsettled (Cybernews report, IDMerit denial)"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2026-02-18
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["086-sumsub-support-environment-breach", "013-coinbase-kyc-insider-breach", "052-discord-age-verification-id-leak"]
status: published
version: "3.1"
og_lead_ja: "IDMerit 10 億件露出の係争 — 誰のデータかを誰も記録で示せない"
og_lead_en: "IDMerit's disputed billion-record exposure — no one can show whose data it was"
layout: "report"
sections: "proof"
gate: "disclosure"
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
  quote: "公開された DB が見つかっても、それが誰の管理下のデータかを記録で示せなければ、通知も責任の所在も決まらない。"
industries: ["finance"]
operations: ["data-access"]
controls:
  - slug: "audit-trail"
    item: "どのデータを、誰の管理下で、どこに置いているかを記録する"
impact: "約 10 億件の露出が報じられ、帰属は係争（件数は未検証）"
takeaway: "預けたデータが、誰の管理下で、どの契約で置かれているかを、置く前に記録し、指摘を受けたときに記録で答えられる形にする。"
self_check: "自社の利用者のデータが見つかったと指摘されたとき、自社の管理下のものかどうかを記録で答えられるか。"
countries: ["us"]
---

> **改訂（v3.1 / 2026-11-02）**: 章立てを「通った操作」から始まる並びに組み直し、題から「欠けている層」の後半を外した。事実と出典は変えていない。

> **改訂（v3.0 / 2026-10-21）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。Cybernews の記事（アーカイブ）と IDMerit の声明を読み直し、IDMerit が「独立したデータソースに関わるポートが開いていた可能性」は認めていたこと、Cybernews の注記（発見者は外部の協力者で、報酬をめぐるやり取りを後から知った）、米国の集団訴訟の提訴と取り下げを加えた。AI 生成が疑われる媒体と、出所の分からない KYC ブログ群を出典から外した。v2.0（2026-07-03）では、確定した露出としていた初版を、係争として書き直している。

## 1. 要点

IDMerit は、顧客データも独立したデータソースのデータも所有・管理・保存しておらず、自社の環境に露出は無かったと否認している。一方で、独立したデータソースに関わる一部のポートが開いていた可能性は認めている。Cybernews が帰属の根拠として示したのは、コレクションの名前などの手がかりと「当チームはそう考える」という判断で、DB の持ち主を示す記録は、どちらの側からも公開されていない。<strong>見つかったデータが誰の管理下にあるかを記録で示せなければ、DB を閉じても、誰が通知し、誰が責任を負うかは決まらない。</strong>

## 2. 通った操作

- **通った操作**: 本人確認に使われたとみられる個人データの、パスワードの無い MongoDB への配置と、インターネットから読める状態での保持（Cybernews の報道）。置いた主体が IDMerit かデータソースかは、争われている。
- **止まった操作**: DB は、研究者の通知の翌日（2025 年 11 月 12 日）に閉じられた。
- **受け付けた側に届くもの**: 一般に、本人確認のデータは、事業者、データソース、その間の連携をまたいで流れる。公開された DB があっても、それが誰の管理下にあるかは、DB の見た目からは分からない。
- **公表されていないこと**: DB の持ち主を直接示すホスト名などの記録、IDMerit が開いていた可能性を認めたポートと、見つかった DB との関係、監督当局の判断。件数と中身は Cybernews の主張で、独立に確認されていない。

## 3. 何を照合するか

経路を問わず区別できる条件は、データを置く側が、置く前に、そのデータが誰の管理下で、どの契約で預かったものかを、預けた側の台帳と照合し、置いた場所とともに記録に残すことである。

- **誰が承認を出すか**: 預けた側（本人確認を委託する金融機関など）。委託先とその先のデータソースについて、どのデータを保存してよいか（しないか）、どこに置いてよいかを、契約で決めて台帳に持つ。委託先の「保存しない」という説明だけには頼らない。
- **どこで照合するか**: データを置く・保存する仕組み（DB の作成や複製の手続き）。台帳に無い管理主体や場所には、置かせない。
- **何が残るか**: データごとに、管理する主体、預けた根拠（契約）、置いた場所と期間の記録。後から第三者に示せる形で残し、指摘を受けたとき、自社のものかどうかを記録で答えられるようにする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝データを置く前に、誰の管理下で、どの契約かを台帳と照合し、記録に残すこと。検知＝公開された DB が見つかった後に気づくこと。下の日付は、研究者・Cybernews・裁判所が確認・公表した日で、DB にデータが置かれた日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>置く前に、誰の管理下で、どの契約かを台帳と照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>DB は閉じられたが、<br>誰のものかは決まらない</span></div>
<div class="rx-zone det"><b>検知 · 気づいた</b>研究者が見つけ、通知して閉じさせる</div>
<div class="rx-g g1"><div class="t">2025-11-11</div><b>研究者が DB を見つける</b></div>
<div class="rx-g g2"><div class="t">11-12</div><b>DB が閉じられる</b></div>
<div class="rx-g g3"><div class="t">2026-02-18</div><b>Cybernews が公表</b></div>
<div class="rx-g g4"><div class="t">06-03</div><b>集団訴訟が取り下げられる</b></div>
</div>
</figure>

検知は働き、DB は通知の翌日に閉じられた。ただ、「公開された DB があった」ことと、「それが誰の管理下のデータか」は別の事実で、記録が無いため、否認する側も指摘する側も示せなかった。同じように、中心の外に個人データが残っていた事案に、[Sumsub](https://lemma.frame00.com/ja/critical/briefs/086-sumsub-support-environment-breach/)がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、データを置く・保存する側に組み込む。** 侵入を見つけるのではなく、置く前に、データの管理主体と契約を台帳と照合し、その記録を第三者に示せる形で残す。

### 注意したい業界・業務

- **業界 · 金融・FinTech**: 本人確認を API で外部に任せる金融機関、決済、暗号資産の事業者。利用者のデータは、委託先の先のデータソースにも渡る。
- **業務 · 照会・参照**: 本人確認のために、外部のデータソースに利用者の情報を照会する業務。照会のたびに、データが組織をまたいで動く。

### いまの対策と Lemma の違い

今回の経路は 1 列目（データを置く・保存する）だが、置いた主体は公表されていない。2 列目は、公開された DB が見つかった後に、持ち主を決める場面で、今回の争いの中心である。3 列目は、委託先の先のデータソースが保存する場合で、IDMerit が開いていた可能性を認めたポートに近いが、見つかった DB との関係は公表されていない。

| 対策 | データを置く・保存する | 公開された DB の発見後の、持ち主の特定 | 委託先の先のデータソースでの保存 |
| --- | --- | --- | --- |
| 委託先の「保存しない」という説明 | 一部 | 関係しない | 効かない |
| データ処理の契約（保存の有無・場所） | 一部 | 効かない | 一部 |
| データベースの公開設定の点検 | 関係しない | 効かない | 関係しない |
| 研究者による発見と通知 | 関係しない | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 効く | 一部 |

委託先の説明は、委託先自身の環境は説明できても、その先のデータソースまでは示さない。契約は、決めていても、守られたことを外から確認する記録が無ければ、争いは決着しない。公開設定の点検は、開いた DB を見つけられるが、見つけた後に誰のものかは示さない。研究者の発見と通知で、DB は翌日に閉じられたが、誰のものかは決まらなかった。Lemma は、置く前に管理主体と契約を台帳と照合して記録に残し、指摘を受けたときに、記録で答えられるようにする。

注：Lemma の照合が働くのは、データを置く・保存する仕組みに照合を組み込み、台帳が、置く側とは別に管理されている場合に限る。記録を残しても、記録そのものを偽れば争いは決着しないので、記録は、当事者から独立して確認できる形で残す必要がある。委託先の先のデータソースまで記録を求めると、契約の交渉は重くなる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

本人確認を外部に任せている組織で確認する 3 項目

- 委託先が照会するデータソースと、データが保存される場所を言えるか。
- 委託先の「保存しない」という説明を、説明以外の記録で確認しているか。
- 自社の利用者のデータが見つかったと指摘されたとき、自社の管理下のものかを記録で答えられるか。

## 5. 事実と時系列

- **当事者**: IDMerit（米カリフォルニア州）。180 か国超・440 以上のデータソースにつなぎ、本人確認を API で提供する（同社）。
- **発見**: Cybernews と協力する外部の研究者が、パスワードの無い MongoDB を 2025 年 11 月 11 日に見つけた。通知の翌日、11 月 12 日に閉じられた。公表は 2026 年 2 月 18 日。
- **主張された規模（未検証）**: 約 30 億件。うち約 10 億件が国別に分かれ、機微な個人データを含むとされ、残りはログとみられる。約 1TB、26 か国。米国約 2.03 億件、メキシコ約 1.24 億件など。
- **データの種類（主張）**: 氏名、住所、生年月日、国民 ID 番号、電話番号、メールアドレス、性別、通信事業者のメタデータなど。
- **帰属の根拠**: Cybernews は「当チームは、この DB が IDMerit のものだと考える」とし、一部の国のコレクション名（idmtelco）などを挙げた。持ち主を直接示すホスト名などは公開していない。
- **IDMerit の否認**: 顧客データも、独立したデータソースが持つデータも、所有・管理・保存していない。精査の結果、IDMerit の環境に露出・脆弱性・不正アクセスは無かった。ただし、独立したデータソースに関わる一部のポートが開いていて、データベースが露出しうる状態だった可能性は認めた。報告書を求めたところ金銭を要求され、ランサム目的を疑ったとした。
- **Cybernews の注記**: 発見者は外部の協力者で、報酬をめぐる発見者と IDMerit のやり取りは 2 月 26 日まで知らなかった。社内の研究者が技術的な内容を確認し、発見は正当だとした。

### 時系列

- **2025-11-11**: 研究者がパスワードの無い DB を見つけ、通知する。
- **2025-11-12**: DB が閉じられる。
- **2026-02-18**: Cybernews が公表。翌日、見出しを「IDMerit data breach」に改め、DB を「IDMerit が所有する」と書き改めた。
- **2026-02-20**: Biometric Update が、IDMerit の否認を掲載する。
- **2026-02-26**: Cybernews が、発見者と IDMerit の間に報酬をめぐるやり取りがあったことを知る（同社の注記）。
- **2026-03-11**: 米カリフォルニア州南部地区の連邦地裁に、IDMerit を相手取った集団訴訟が起こされる。
- **2026-06-03**: 原告が訴えを取り下げる。判断は出ていない。

> 件数と中身は Cybernews の主張で、独立に確認されていない。IDMerit の否認も、外から確認できる記録を伴っていない。2026 年 10 月の時点で、監督当局の判断や、DB の持ち主を特定した公表は無い。この Brief は、どちらの主張の真偽も認定しない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Cybernews**: 発見は正当だとする立場を保ち、修正の販売はしていないと注記した。
- **IDMerit**: 同じ時期に、データを保存しない設計を説明するブログを公開したが、事案には直接触れていない。

## 6. Sources

- **Cybernews（一次・発見者側の報道）**: 「IDMerit data breach: 1 billion records of personal data exposed in KYC data leak」（2026-02-18） — 現在は閲覧制限。2026-02-22 のアーカイブ · <https://web.archive.org/web/20260222075348/https://cybernews.com/security/global-data-leak-exposes-billion-records/>
- **米国連邦地裁（一次・裁判記録）**: Andrizzi v. IDMerit LLC, No. 3:26-cv-01527（S.D. Cal.、2026-03-11 提訴・06-03 取り下げ） — <https://www.courtlistener.com/docket/72421353/andrizzi-v-idmerit-llc/>
- **米国連邦地裁（一次・訴状）**: Andrizzi v. IDMerit LLC の訴状（2026-03-11） — <https://storage.courtlistener.com/recap/gov.uscourts.casd.847125/gov.uscourts.casd.847125.1.0.pdf>
- **Biometric Update（報道・IDMerit の声明を掲載）**: 「IDMerit disputes report of 1B records exposed in unsecured ID verification database」（2026-02-20） — 02-26 更新 · <https://www.biometricupdate.com/202602/idmerit-disputes-report-of-1b-records-exposed-in-unsecured-id-verification-database>
- **Fox News（報道・IDMerit の声明を掲載）**: 「1 billion identity records exposed in ID verification data leak」（2026-03-11） — <https://www.foxnews.com/tech/1-billion-identity-records-exposed-id-verification-data-leak>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)

本件は当事者の間で事実関係が争われており、この Brief はいずれの主張の真偽も認定しない。
