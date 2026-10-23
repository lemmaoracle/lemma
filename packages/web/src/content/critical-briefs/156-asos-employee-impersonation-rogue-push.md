---
brief_no: 156
title: "ASOS：信頼できる相手を装った攻撃者に社員のログイン情報を取られ、公式アプリの通知で攻撃者の文面が顧客に届いた(同社の開示と顧客へのメール) — 顧客への一斉の通知を、承認された配信と送る前に照合する層が無い"
title_en: "ASOS: An attacker posing as a trusted contact obtained an employee's login, and the attacker's message reached customers as an official app notification (company disclosure and customer email) — Nothing checks a mass customer notification against an approved send before it goes out"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: [identity-auth]
incident_date: 2026-10-06
published: 2026-10-23
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["154-yumirlink-cuenote-support-credential-db-export"]
status: published
version: "1.0"
og_lead_ja: "英 ASOS、社員のログイン情報を取られ公式アプリに「Asos hacked」の通知"
og_lead_en: "ASOS: a stolen employee login sent \"Asos hacked\" through the official app"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · なりすまし"
og_kicker_en: "CYBERATTACK · IMPERSONATION"
og_headline_ja: "公式アプリの通知で、\n攻撃者の文面が顧客に届いた。\n<accent>「Asos hacked」</accent>"
og_headline_en: "The attacker's message reached customers\nas an official app notification.\n<accent>\"Asos hacked\"</accent>"
summary_labels: ["何が起きたか", "なぜ見分けられないか", "欠けていた層"]
key_figures:
  - value: "全顧客"
    label: "英国の国家サイバーセキュリティセンター（NCSC）が、通知を受け取っていなくても影響を受けたと考えるべきだとした範囲。影響を受けた人数は公表されていない"
    tone: "alert"
  - value: "10:00 → 15:15"
    label: "10 月 6 日、不正な通知が送られてから、ASOS が適時開示するまで（英国時間）"
  - value: "10-06 → 10-08"
    label: "不正な通知から、ASOS が顧客へのメールで侵入の経路を説明するまで（報道による）"
glossary:
  - term: "ASOS"
    desc: "英国のオンラインの衣料品販売の会社。ロンドン証券取引所に上場している。"
  - term: "プッシュ通知"
    desc: "アプリを入れたスマートフォンに、アプリの名前で届く短いお知らせ。送るのは通常、外部の配信の基盤を通して行う。"
  - term: "顧客への連絡の基盤"
    desc: "会社が、顧客へのメールやアプリの通知を送るために使う外部のサービス。ASOS は、どの基盤かを公表していない。"
insight:
  slug: "mass-notification-not-tied-to-approved-send"
  label: "一斉の通知が、承認された配信に結びつかない"
  quote: "社員のログインで入れた基盤からは、公式アプリの名前で、顧客に一斉に通知が送れた。その通知が承認された配信かは、送る前に問われなかった。"
industries: ["retail"]
operations: ["delivery", "account-admin"]
controls:
  - slug: "separate-approval"
    item: "顧客への一斉の通知は、作った人とは別の人が別の方法で確認する"
  - slug: "hold-unverified"
    item: "承認された配信と照合できない一斉の通知は止める"
attack_method: "impersonation"
impact: "攻撃者の文面が公式アプリの通知で顧客に届き、氏名・連絡先などにもアクセスされた"
takeaway: "社員のログインがあれば、顧客への一斉の通知を、承認された配信かを問われずに送れた。"
self_check: "顧客に一斉に通知を送れるアカウントを、誰が持っているかを把握しているか。"
---

## 1. TL;DR

英国の衣料品の EC、ASOS は 2026 年 10 月 6 日、同日午前 10 時ごろに、権限の無い通知が顧客に送られたと適時開示した。顧客への連絡に使う外部の基盤で不正な活動があり、氏名や連絡先にアクセスされた可能性があるとした。届いた通知は「Asos hacked」と題し、メッセージアプリ Telegram へのリンクを載せていた（報道）。

10 月 8 日、ASOS は顧客へのメールで、攻撃者が信頼できる相手を装って社員のアカウントのログイン情報を得て、それで外部の基盤の情報に入ったと説明した（報道）。顧客から見れば、通知は公式アプリの名前で届き、本物と見分けられない。

ASOS は通知に気づいて、通知の基盤へのアクセスを制限した。効かなかったのは、顧客への一斉の通知を、承認された配信と、送る前に照合する層である。

## 2. 何が起きたか

- **当事者**: ASOS。英国のオンラインの衣料品販売の会社。
- **起きたこと**: 10 月 6 日午前 10 時ごろ、権限の無い通知が ASOS の顧客に送られた。顧客への連絡に使う外部の基盤で、不正な活動があった（ASOS の適時開示）。英国の国家サイバーセキュリティセンター（NCSC）は、一部の顧客がアプリのプッシュ通知を受け取ったとし、受け取っていなくても、ASOS の顧客は影響を受けたと考えるべきだとした。
- **通知の中身**: 「Asos hacked」と題し、メッセージアプリ Telegram へのリンクを載せていた（報道）。受け取った人数は公表されていない。
- **経路**: ASOS は 10 月 8 日の顧客へのメールで、攻撃者が信頼できる相手を装ってログイン情報を得て、社員のアカウントに入り、そのログイン情報で ASOS が使う外部の基盤の情報に入ったと説明した（報道が引用したメール）。
- **公表されていないこと**: どの基盤か、どの社員のどの権限か、多要素認証の有無、いつから入られていたか、何人の顧客の情報か。ASOS は基盤を名指ししていない。
- **アクセスされた情報**: 6 日の開示では、氏名や連絡先などの基本的な個人情報にアクセスされた可能性があり、支払いカードの情報とパスワードは影響を受けていないとみるとした。8 日の顧客へのメールでは、氏名、配送先とメールの住所、電話番号と、個人を特定しないアカウントの情報にアクセスされたとした（報道）。後者には検索の履歴が含まれるとみられる（報道）。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過</span></div>
<p class="rx-ex-cap">止めどころは ③。顧客への一斉の通知を、承認された配信と送る前に照合していれば、社員のログインがあっても、承認の無い通知は顧客に届かない。② と ③ の間に何があったかと、③ と ④ の順は公表されていない。</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">攻撃者</div><div class="no">1</div><b>信頼できる相手を装い、社員のログイン情報を得る</b><p>ASOS の顧客へのメール（報道）。</p></div>
<div class="rx-step"><div class="who">攻撃者</div><div class="no">2</div><b>そのログイン情報で、顧客への連絡に使う外部の基盤に入る</b><p>基盤の名前は非公表。</p></div>
<div class="rx-step crit"><div class="who">攻撃者</div><div class="no">3</div><b>公式アプリの通知で、攻撃者の文面を顧客に送る</b><p>10 月 6 日 10 時ごろ。</p></div>
<div class="rx-step"><div class="who">攻撃者</div><div class="no">4</div><b>氏名や連絡先などにアクセスする</b><p>支払いカードとパスワードは対象外とされる。</p></div>
<div class="rx-step"><div class="who">ASOS</div><div class="no">5</div><b>通知の基盤へのアクセスを制限する</b><p>気づいた時刻は非公表。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2026-10-06**: 10 時ごろ、権限の無い通知が顧客に送られる。15 時 15 分、ASOS が適時開示する。NCSC が顧客向けの注意を出す。その後、ASOS が顧客に直接謝罪し、通知のリンクを開かないよう求める（報道）。
- **2026-10-07**: 英国の情報コミッショナー事務局（ICO）が、こうしたメッセージのリンクに注意するよう呼びかける声明を出す。
- **2026-10-08**: ASOS が、48 時間の調査の結果として、顧客へのメールで侵入の経路とアクセスされた情報を説明する（報道）。

> 権限の無い通知、顧客への連絡に使う外部の基盤での不正な活動、アクセスされた可能性のある情報は、ASOS の適時開示と NCSC の注意（いずれも一次）に拠る。侵入の経路と、8 日に説明された情報の範囲は、ASOS の顧客へのメールを報道が引用したもので、ASOS の適時開示には無い。10 月 23 日時点で、ASOS の追加の開示は出ていない。

### 公表後の対応

- **ASOS**: 通知の基盤へのアクセスを直ちに制限し、社内外の専門家と当局と協力しているとした。サイバー保険と事業継続の保険に入っており、業績への影響を見積もるには早いとした。8 日のメールでは、影響を受けた基盤は直ちに封じ、さらにセキュリティの管理を強めたとした（報道）。
- **NCSC・ICO**: 顧客に、届いた通知やメールのリンクを開かないこと、パスワードは公式のサイトやアプリから変えることなどを呼びかけた。

## 4. なぜ止まらなかったか

この事案の失敗は、社員がだまされたことだけではない。社員のログインで入れた基盤からは、公式アプリの名前で顧客に一斉に通知を送れ、その通知が承認された配信かは、送る前に問われなかった。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">ここでいう証明は、顧客への一斉の通知を送る前に「この配信は承認されたものか」を照合し、記録に残すこと。検出は、通知が届いた後に気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回なし</b>送る前に、承認された配信かを照合する</div>
<div class="rx-zone gapz"><b>落差</b><span>攻撃者の文面が<br>顧客に届いた</span></div>
<div class="rx-zone det"><b>検出の層 · 気づいた</b>通知の基盤へのアクセスを制限する</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>ログイン情報を取られる</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>10-06 通知が届く</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>アクセスを制限</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>15:15 適時開示</b></div>
</div>
</figure>

検出は働き、ASOS はその日のうちに基盤へのアクセスを制限して開示した。ただ、気づいたのは通知が顧客に届いた後だった。「社員のログインで基盤に入れる」と「この配信は承認されている」は別々の事実で、公表からは、前者を後者と照合する層は見えない。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[ユミルリンクの Cuenote FC](https://lemma.frame00.com/ja/critical/briefs/154-yumirlink-cuenote-support-credential-db-export/)（メール配信の運営会社の担当者の認証情報が取られた）にも現れている。

## 5. 対策するには

**顧客への一斉の通知は、送る前に、承認された配信かを照合してから送る。** そうすれば、社員のログイン情報を取られても、それだけでは承認の無い通知は顧客に届かない。検出の代わりではなく、検出の手前に置く層である。

### 注意したい業界・業務

- **業界 · サービス・小売**: アプリの通知やメールで顧客に直接届く EC や小売。公式の名前で届くので、顧客は本物と見分けられない。
- **業務 · 配信・送付**: マーケティングや顧客への連絡に使う外部の配信の基盤からの、一斉の通知やメール。
- **業務 · アカウント・権限の管理**: 配信の基盤に入れる社員のアカウントと、そのログインの守り方。

### いまの対策で埋まるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 社員の教育 | 一部 | 信頼できる相手を装う手口は、教育だけでは防ぎきれない。 |
| 多要素認証 | 一部 | ASOS は有無を公表していない。ログインの段は守れるが、入った後に何を送るかは問わない。 |
| アクセスの制限 | 一部 | 気づいた後には効いた。通知は、その前に届いていた。 |
| 顧客への注意喚起 | 一部 | 届いた後の被害を減らすが、届くこと自体は止めない。 |

### 必要になるもの

1. **一斉の通知を送る権限を、作る権限と分ける。** 通知の文面を作れる人が、そのまま全顧客に送れないようにする。
2. **送る前に、承認された配信かを照合してから送る。** 配信の予定と承認に結びつかない一斉の通知は、ログインが正しくても送らない。
3. **誰が、どの承認で、何を送ったかを、配信の基盤とは別に残す。** 後から照合できる形、つまり証明として残す。

### 点検チェックリスト

顧客への配信の基盤について、組織で確認する 3 項目

- 一斉の通知やメールを、作った人だけで送れる設定になっていないか。
- 配信の基盤へのログインに、フィッシングに強い多要素認証を求めているか。
- 社内の人や取引先を名乗る連絡でログイン情報を求められたとき、別の経路で確認する手順があるか。

注：承認する人のアカウントまで乗っ取られた場合は、この照合を通りうる。また、この照合は通知を止めるもので、基盤の中の顧客の情報が読まれることは止めない。経路の詳しいことは公表されていない。続報で判明すれば、この Brief を改訂する。

## 6. Sources

- **ASOS（一次・適時開示）**: "Update regarding cyber incident"（2026-10-06） — <https://www.investegate.co.uk/announcement/rns/asos--asc/update-regarding-cyber-incident-/9809595>
- **英国 NCSC（一次・公的機関の注意）**: "Incident affecting ASOS customers"（2026-10-06） — <https://www.ncsc.gov.uk/news/incident-affecting-asos-customers>
- **英国 ICO（一次・声明）**: "ASOS statement"（2026-10-07） — <https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/10/asos-statement/>
- **The Guardian（報道）**: "Asos warns customer data may be compromised after ‘unauthorised’ app access"（2026-10-06） — <https://www.theguardian.com/business/2026/oct/06/asos-hack-notification-website-app>
- **The Guardian（報道・顧客へのメールを引用）**: "Asos says customers' names, contact details and search histories hacked"（2026-10-08） — <https://www.theguardian.com/business/2026/oct/08/asos-customer-data-accessed-hacker-posing-impersonated>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
