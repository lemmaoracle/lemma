---
brief_no: 56
title: "McHire（Paradox.ai）：採用 AI の管理画面から、応募記録に手が届いたと研究者が報告(Ian Carroll・Sam Curry)"
title_en: "McHire (Paradox.ai): Researchers report reaching applicant records through the hiring AI's admin console (Ian Carroll, Sam Curry)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["attribute-proof-bypass", "data-provenance", "ai-bias-harm"]
incident_date: 2025-06-30
published: 2026-06-15
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["057-deepseek-clickhouse-exposed-db", "013-coinbase-kyc-insider-breach", "022-onlyfake-ai-id-kyc-bypass"]
status: published
gate: "identity"
version: "1.0"
search_title: "McHire の採用 AI：管理画面から応募記録に届いた報告"
search_description: "研究者が、McHire（Paradox.ai）の管理画面に放置された試験用アカウントで入り、最大 6,400 万件の応募記録に手が届いたと報告した。何が通ったか、何を照合するか、対策を整理。"
og_lead_ja: "研究者が、McHire（Paradox.ai）の管理画面に試験用アカウントで入り、最大 6,400 万件の応募記録に手が届いたと報告"
og_lead_en: "Researchers report entering McHire's (Paradox.ai) admin console with a test account and reaching up to 64 million applicant records"
layout: "report"
sections: "proof"
og_kicker_ja: "AI の事例 · 採用 AI の権限"
og_kicker_en: "AI CASE · HIRING AI ACCESS"
og_headline_ja: "採用 AI の管理画面から\n応募記録に手が届いたと\n研究者が報告。\n<accent>最大 6,400 万件</accent>"
og_headline_en: "An admin login opened\napplicant records,\nresearchers report.\n<accent>Up to 64 million.</accent>"
key_figures:
  - value: "6,400"
    unit: "万件"
    label: "手が届いたと研究者が報告した応募記録の上限。氏名・連絡先・チャットの記録などを含む"
    tone: "alert"
  - value: "123456"
    label: "ユーザー名・パスワードともにこの値で入れた、2019 年から残っていたとされる試験用アカウント"
  - value: "同日"
    label: "通報の当日（2025-06-30）に、Paradox.ai が該当アカウントを無効化し、修正した"
glossary:
  - term: "IDOR"
    desc: "直接オブジェクト参照の不備。記録の ID を差し替えたとき、その記録を読む権限があるかを確認しないまま返してしまう弱点。"
  - term: "責任ある開示"
    desc: "見つけた弱点を公にする前に、当事者へ先に知らせ、直す時間を渡すやり方。"
insight:
  slug: "login-is-not-record-authority"
  label: "入れたことが、記録を読む権限になる"
  quote: "記録を開く前に、その主体がその記録を読む権限を持つかを、ログインとは別に照合しなければ、ひとつの弱い資格情報と ID の差し替えだけで、他人の記録に手が届く。"
industries: ["ai"]
operations: ["account-admin", "data-access"]
controls:
  - slug: "verify-entry"
    item: "管理画面への入口で、推測できない資格情報と、記録ごとの権限を確認する"
  - slug: "limit-and-revoke"
    item: "放置された試験用アカウントを残さず、参照 ID に権限を結びつける"
impact: "最大 6,400 万件の応募記録に手が届いたと研究者が報告"
takeaway: "研究者の報告では、放置された試験用アカウントで管理画面に入り、応募者 ID を差し替えるだけで他人の記録に届いた。記録を開く前に、主体がその記録の権限を持つかを照合する。"
self_check: "管理画面で記録を開く前に、その主体がその記録を読む権限を持つかを、ログインとは別に照合しているか。"
countries: ["us"]
---

## 1. 要点

研究者の報告によれば、採用 AI の管理画面には、何年も使われていない試験用アカウントが有効なまま残り、入った後は、応募者 ID を差し替えるだけで他の応募者の記録が返った。弱点は外部の研究者が見つけて通報し、会社は当日に直した。Paradox.ai は、アクセスしたのは研究者だけだと説明している。<strong>記録を開く前に、その主体がその記録を読む権限を持つかを、ログインとは別に照合しなければ、ひとつの弱い資格情報と ID の差し替えだけで、他人の記録に手が届く。</strong>

## 2. 通った操作

- **通った操作**: 管理者向けのログインと、その後の応募記録の参照。Ian Carroll と Sam Curry によれば、ユーザー名・パスワードともに推測できる値の試験用アカウントで管理画面に入れ、応募者 ID を連番で差し替えると、他の応募者の記録が返った（IDOR）。
- **受け付けた側に届くもの**: 一般に、管理画面には、ログインに通ったセッションと、開きたい記録の ID が届く。その主体が、その応募者の記録を読む権限を持つかは、ID だけからは分からない。正規の経路を使った参照は、ふだんのアクセスと同じ形で記録される。
- **届いた情報**: 研究者の報告では、氏名、メールアドレス、電話番号、面接（チャット）の記録、IP アドレスなど。
- **公表されていないこと**: 研究者のほかに、記録にアクセスした者がいたか（Paradox.ai は研究者だけだと説明している）。試験用アカウントが残っていた経緯。記録ごとの権限が、どこでどう判断される設計だったか。

## 3. 実行前の照合

経路を問わず区別できる条件は、記録を開く前に、その主体がその記録を読む権限を持つかを、ログインに通ったかどうかとは別に照合することである。

- **誰が承認を出すか**: 記録の持ち主（採用を行う組織）。どのアカウントが、どの応募者の記録を読めるかを、あらかじめ決めておく。試験用やシステムのアカウントも同じに扱う。
- **どこで照合するか**: 管理画面が記録を返す手前。ID を差し替えた参照でも、同じ一か所で照合する。権限と一致しない参照には、記録を返さない。
- **何が残るか**: どの主体が、どの権限で、どの記録を開いたかの記録。あとで、その参照が正当だったかを、応募者の個人データを開示せずに辿れる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝記録を開く前に、主体がその記録を読む権限を持つかを照合し、記録に残すこと。検知＝弱点が成立した後に見つけること。今回は、研究者の調査と通報がそれに当たる。下の日付は、公表に基づく経過である。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>記録を開く前に、主体の権限を照合する</div>
<div class="rx-zone gapz"><b>研究者が報告したこと</b><span>試験用アカウントで入り、ID の差し替えで<br>他の応募者の記録に届いた</span></div>
<div class="rx-zone det"><b>検知 · 研究者の調査と通報</b>研究者が見つけ、Paradox.ai と McDonald's に通報する</div>
<div class="rx-g g1"><div class="t">2019</div><b>試験用アカウントが作られ、残る</b></div>
<div class="rx-g g2"><div class="t">2025-06-30</div><b>研究者が管理画面に入る</b></div>
<div class="rx-g g3"><div class="t">06-30</div><b>記録に届くと確認し、通報する</b></div>
<div class="rx-g g4"><div class="t">06-30</div><b>Paradox.ai が無効化・修正する</b></div>
</div>
</figure>

研究者の調査と通報は、弱点を具体的に示して当日の修正につながったが、それは弱点が成立した後に見つけたものだった。権限の照合が無いまま読み取りに至った事案に、[DeepSeek のデータベース](https://lemma.frame00.com/ja/critical/briefs/057-deepseek-clickhouse-exposed-db/)（認証のない公開）がある。保存した個人データそのものが侵害の面になった点は、[Coinbase の KYC](https://lemma.frame00.com/ja/critical/briefs/013-coinbase-kyc-insider-breach/) と重なる。

## 4. Lemma でできること

**Lemma は、03 の照合を、管理画面が記録を返す手前に組み込む。** 侵入や弱点を見つけるのではなく、記録を開く主体がその記録の権限を持つかを、開く前に照合する。

### 注意したい業界・業務

- **業界 · AI**: 採用のチャットボットなど、応募者の個人データを大量に集める AI サービスと、それを導入する組織。
- **業務 · アカウント・権限の管理**: 管理画面のアカウントの発行と棚卸し。試験用やシステムのアカウントの資格情報。
- **業務 · 照会・参照**: 管理画面で、ID を指定して応募者の記録を開くこと。

### いまの対策と Lemma の違い

1 列目は管理画面に入ること、2 列目は入った後に ID を指定して記録を開くことである。研究者の報告では、今回は両方の列を通った。

| 対策 | 管理画面へのログイン | ID を指定した記録の参照 |
| --- | --- | --- |
| 外部の研究者の調査と通報、バグバウンティ | 一部 | 一部 |
| 管理画面のアカウントの棚卸しと、試験用アカウントの無効化 | 効く | 関係しない |
| アプリの中での、記録ごとの権限の確認 | 関係しない | 効く |
| **Lemma（実行の前の照合）** | 関係しない | 効く |

研究者の調査と通報は、弱点を見つけて修正を促すが、弱点が成立した後に働く。アカウントの棚卸しは、残っていた試験用アカウントを入口から外すが、ID の差し替えという別の弱点は残る。記録ごとの権限の確認は、研究者が報告した 2 つ目の弱点に当たる層で、働いていれば、権限の無い記録を返さない。Lemma は、記録を返す前に、主体の権限を、アプリとは別に照合する。参照が権限の範囲の内だったことだけを示す形にすれば、応募者の個人データを外に出さずに済む。

注：Lemma の照合が働くのは、記録を返す手前に照合を組み込み、どの主体がどの記録を読めるかが、アプリとは別に管理されている場合に限る。その記録の権限を持つアカウントの資格情報が推測・盗用された場合は、この照合を通りうる。弱い資格情報を見つけて無効にするのは、アカウントの棚卸しで、Lemma はそれに代わらない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

応募者などの個人データを持つ管理画面について、組織で確認する 3 項目

- 管理画面のアカウントを定期に棚卸しし、使われていない試験用アカウントを無効にしているか。
- ID を差し替えた参照に、権限の無い記録が返らないことを、公開の前に試験しているか。
- どの主体が、どの権限で、どの記録を開いたかを記録しているか。

## 5. 事実と時系列

- **対象**: McHire（McDonald's の採用応募のプラットフォーム）と、Paradox.ai の AI 採用チャットボット「Olivia」。
- **発見者**: Ian Carroll と Sam Curry（セキュリティ研究者）。
- **入口**: 研究者の報告では、管理者向けのログインに、ユーザー名・パスワードともに「123456」の有効なアカウントがあった。2019 年から残っていた試験用アカウントとされる。
- **記録の参照**: 管理画面に入った後、IDOR により、応募者 ID を連番で差し替えて記録を取得できた、と研究者は報告している。
- **規模**: 最大 6,400 万件の応募記録。氏名、メールアドレス、電話番号、面接（チャット）の記録、IP アドレスなどを含む（研究者の報告と CSO Online）。
- **会社の説明**: Paradox.ai は、実際にアクセスしたのは研究者だけで、研究者が確認した記録もごく少数だと説明している。

### 時系列

- **2019**: 試験用アカウントが作られ、その後も有効なまま残っていたとされる。
- **2025-06-30**: Ian Carroll と Sam Curry が、McHire の管理画面に入り、応募記録に届くことを確認し、Paradox.ai と McDonald's に通報する。
- **2025-06-30**: Paradox.ai が、同日に該当アカウントを無効化・修正し、バグバウンティを始める。
- **以降**: AI Incident Database に Incident #1179 として登録される。

> 手口と件数は、研究者の報告（Ian Carroll）と報道に拠る。6,400 万件は手が届いたとされる記録の上限で、取得された件数ではない。アクセスした者と確認した記録の範囲は、Paradox.ai の説明に拠る。本 Brief は実害の有無を断定せず、Paradox.ai や McDonald's を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Paradox.ai**: 通報の当日に該当アカウントを無効化・修正し、バグバウンティを始めた。アクセスしたのは研究者だけだと説明している。
- **記録**: AI Incident Database が、Incident #1179 として登録した。

## 6. Sources

- **Ian Carroll**: "Hacking McDonald's McHire / Paradox.ai"（研究者による発見・手口の原典、2025-06-30） — <https://ian.sh/mcdonalds>
- **AI Incident Database**: Incident #1179（McHire / Paradox.ai） — <https://incidentdatabase.ai/cite/1179/>
- **CSO Online**: "McDonald's AI hiring tool's password '123456' exposed data of 64M applicants"（規模・経緯の整理） — <https://www.csoonline.com/article/4020919/mcdonalds-ai-hiring-tools-password-123456-exposes-data-of-64m-applicants.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
