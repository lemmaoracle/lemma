---
brief_no: 156
title: "ASOS：公式アプリの通知で、攻撃者の文面が顧客に届いた(同社の開示) — 顧客への一斉通知を、送る前に承認済みの配信と照合する層が見えない"
title_en: "ASOS: The attacker's message reached customers as an official app notification (company disclosure) — No layer is visible that checks a mass notification against an approved send before it goes out"
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
og_lead_ja: "英 ASOS、公式アプリに「Asos hacked」の不正な通知。社員のログイン情報も取られていた"
og_lead_en: "ASOS: a rogue \"Asos hacked\" app notification, and an employee login later disclosed as stolen"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 不正な通知"
og_kicker_en: "CYBERATTACK · ROGUE NOTIFICATION"
og_headline_ja: "公式アプリの通知で、\n攻撃者の文面が顧客に届いた。\n<accent>「Asos hacked」</accent>"
og_headline_en: "The attacker's message reached customers\nas an official app notification.\n<accent>\"Asos hacked\"</accent>"
summary_labels: ["何が起きたか", "何が分かっているか", "欠けていた層"]
key_figures:
  - value: "全顧客"
    unit: "が対象と想定"
    label: "英国の国家サイバーセキュリティセンター（NCSC）が、通知を受け取っていなくても影響を受けたと想定するよう呼びかけた範囲。受け取った人数と、影響を受けた人数は公表されていない"
    tone: "alert"
  - value: "10:00 ごろ"
    label: "10 月 6 日、不正な通知が顧客に送られた時刻（ASOS の開示）"
  - value: "10-06 → 10-08"
    label: "不正な通知から、ASOS が顧客への説明で侵入の経路を明かすまで（報道による）"
glossary:
  - term: "ASOS"
    desc: "英国のオンラインの衣料品販売の会社。ロンドン証券取引所に上場している。"
  - term: "プッシュ通知"
    desc: "アプリを入れたスマートフォンに、アプリの名前で届く短いお知らせ。送るのは通常、外部の配信サービスを通して行う。"
  - term: "外部の配信サービス"
    desc: "会社が、顧客へのメールやアプリの通知を送るために使う外部のサービス。ASOS は、どのサービスかを公表していない。"
insight:
  slug: "mass-notification-not-tied-to-approved-send"
  label: "一斉通知が、承認済みの配信に結びつかない"
  quote: "顧客への連絡に使う外部の配信サービスから、公式アプリの名前で一斉に通知が送られた。それを送る前に承認済みの配信と照合する手順は、公表からは見えない。"
industries: ["retail"]
operations: ["delivery", "account-admin"]
controls:
  - slug: "separate-approval"
    item: "顧客への一斉通知は、作った人とは別の人が別の方法で確認する"
  - slug: "hold-unverified"
    item: "承認済みの配信と照合できない一斉通知は送らない"
attack_method: "impersonation"
impact: "攻撃者の文面が公式アプリの通知で顧客に届き、氏名・連絡先などにアクセスされた（NCSC・報道）"
takeaway: "公式アプリの名前で一斉通知が送られた。送る前に承認済みの配信と照合する手順は、公表からは見えない。"
self_check: "顧客全員に通知を送れるアカウントと、その持ち主を把握しているか。"
countries: ["gb"]
---

## 1. TL;DR

英国の衣料品の EC、ASOS は 2026 年 10 月 6 日、同日午前 10 時ごろに、不正な通知が顧客に送られたと開示した。顧客への連絡に使う外部の配信サービスでの不正な活動を調べているとし、氏名や連絡先にアクセスされた可能性があるとした。通知は「Asos hacked」と題し、メッセージアプリ Telegram へのリンクを載せていた（報道）。

10 月 8 日、ASOS は顧客への説明で、攻撃者が信頼できる相手を装って社員のアカウントのログイン情報を得て、それで ASOS が使う外部のサービスの情報に入ったと明かした（報道）。そのログイン情報と通知の送信がどう結びつくかは、公表されていない。

ASOS は直ちに通知のサービスへのアクセスを制限したとしたが、通知はすでに顧客に届いていた。効かなかったのは、顧客への一斉通知を、送る前に承認済みの配信と照合する層である。

## 2. 何が起きたか

- **当事者**: ASOS。英国のオンラインの衣料品販売の会社。
- **起きたこと**: 10 月 6 日午前 10 時ごろ、不正な通知が ASOS の顧客に送られた。ASOS は、顧客への連絡に使う外部のサービスでの不正な活動を調べているとした（ASOS の開示）。英国の国家サイバーセキュリティセンター（NCSC）は、一部の顧客が ASOS のアプリからプッシュ通知を受け取ったとし、受け取っていなくても、ASOS の顧客は影響を受けたと想定するよう呼びかけた。
- **通知の中身**: 「Asos hacked」と題し、Telegram へのリンクを載せていた（報道）。受け取った人数は公表されていない。報道では、数千人が受け取ったとされる。
- **経路**: 10 月 8 日の ASOS の説明では、攻撃者は信頼できる相手を装ってログイン情報を得て、社員のアカウントに入り、そのログイン情報で ASOS が使う外部のサービスの情報に入った（報道が引用した ASOS の顧客への説明）。
- **公表されていないこと**: そのサービスが通知を送ったサービスと同じか。ログイン情報が通知の送信に使われたか。どの社員のどの権限か、多要素認証の有無、いつから入られていたか、何人の顧客の情報か。ASOS はサービスを名指ししていない。
- **アクセスされた情報**: 6 日の開示では、氏名や連絡先などの基本的な個人情報にアクセスされた可能性があり、支払いカードの情報とパスワードは影響を受けていないとみるとした。NCSC は、氏名と連絡先にアクセスされたと ASOS が述べたとしている。8 日の ASOS の説明では、氏名、配送先とメールの住所、電話番号と、個人情報ではないアカウントの情報にアクセスされた（報道）。後者には検索の履歴が含まれるとみられる（報道）。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過</span></div>
<p class="rx-ex-cap">止めどころは ②。顧客への一斉通知を、送る前に承認済みの配信と照合していれば、承認の無い通知は顧客に届かない。① のログイン情報が ② の送信に使われたかと、② と ③ の順は公表されていない。</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">攻撃者</div><div class="no">1</div><b>社員のログイン情報を得て、外部のサービスの情報に入る</b><p>信頼できる相手を装った（8 日の ASOS の説明・報道）。通知のサービスと同じかは非公表。</p></div>
<div class="rx-step crit"><div class="who">攻撃者</div><div class="no">2</div><b>公式アプリの通知で、攻撃者の文面が顧客に送られる</b><p>10 月 6 日 10 時ごろ。</p></div>
<div class="rx-step"><div class="who">攻撃者</div><div class="no">3</div><b>氏名や連絡先などにアクセスする</b><p>支払いカードとパスワードは対象外とされる。</p></div>
<div class="rx-step"><div class="who">ASOS</div><div class="no">4</div><b>通知のサービスへのアクセスを制限する</b><p>気づいた時刻は非公表。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2026-10-06**: 10 時ごろ、不正な通知が顧客に送られる。ASOS が開示する。NCSC が顧客向けの注意を出す。その後、ASOS が顧客に直接謝罪し、通知のリンクを開かないよう求める（報道）。
- **2026-10-07**: 英国の情報コミッショナー事務局（ICO）が、こうしたメッセージのリンクに注意するよう呼びかける声明を出す。
- **2026-10-08**: ASOS が、48 時間の調査の結果として、顧客に侵入の経路とアクセスされた情報を説明する（報道）。

> 不正な通知、外部のサービスでの不正な活動、アクセスされた可能性のある情報は、ASOS の開示と NCSC の注意（いずれも一次）に拠る。侵入の経路と、8 日に説明された情報の範囲は、ASOS の顧客への説明を報道が伝えたもので、ASOS の開示には無い。

### 公表後の対応

- **ASOS**: 通知のサービスへのアクセスを直ちに制限し、社内外の専門家と当局と協力しているとした。サイバー保険と事業継続の保険に入っており、業績への影響を見積もるには早いとした。8 日の説明では、影響を受けたサービスは直ちに封じ、セキュリティの管理をさらに強めたとした（報道）。
- **NCSC・ICO**: 顧客に、届いた通知やメールのリンクを開かないよう呼びかけた。ICO は、パスワードを変えるなら公式のサイトやアプリから変えるよう求めた。

## 4. なぜ止まらなかったか

この事案で問われるのは、社員のログインの守りだけではない。顧客への連絡に使う外部のサービスから、公式アプリの名前で一斉に通知が送られ、それを送る前に承認済みの配信と照合する手順は、公表からは見えない。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">ここでいう証明は、顧客への一斉通知を送る前に「この配信は、社内で承認された配信の予定にあるか」を照合し、記録に残すこと。検出は、不正な活動に気づいて止めること。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 公表に見えず</b>送る前に、承認済みの配信かを照合する</div>
<div class="rx-zone gapz"><b>落差</b><span>攻撃者の文面が<br>顧客に届いた</span></div>
<div class="rx-zone det"><b>検出の層 · 働いた</b>通知のサービスへのアクセスを制限する</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>ログイン情報を取られる</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>10-06 通知が届く</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>アクセスを制限</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>10-06 開示</b></div>
</div>
</figure>

検出は働き、ASOS はその日のうちにアクセスを制限して開示したが、通知はすでに顧客に届いていた。「外部の配信サービスから送れる」と「この配信は承認されている」は別々の事実で、公表からは、前者を後者と照合する層は見えない。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[ユミルリンクの Cuenote FC](https://lemma.frame00.com/ja/critical/briefs/154-yumirlink-cuenote-support-credential-db-export/)（メール配信の運営会社の担当者の認証情報が取られた）にも現れている。

## 5. 対策するには

**顧客への一斉通知は、社内で承認された配信の予定と照合できたものだけを送る。** そうすれば、配信サービスへのログインを取られても、それだけでは承認の無い通知は顧客に届かない。検出の代わりではなく、検出の手前に置く層である。

### 注意したい業界・業務

- **業界 · サービス・小売**: アプリの通知やメールで顧客に直接届く EC や小売。通知の送り主は公式の名前になる。
- **業務 · 配信・送付**: マーケティングや顧客への連絡に使う外部の配信サービスからの、一斉通知やメール。
- **業務 · アカウント・権限の管理**: 配信サービスに入れる社員のアカウントと、そのログインの守り方。

### いまの対策で埋まるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 社員の教育 | 一部 | 信頼できる相手を装う手口は、教育だけでは防ぎきれない。 |
| 多要素認証 | 一部 | ASOS は有無を公表していない。一般に、ログインの段は守れるが、入った後に何を送るかは問わない。 |
| アクセスの制限 | 一部 | 気づいた後には効いた。通知は、すでに届いていた。 |
| 顧客への注意喚起 | 一部 | 届いた後の被害を減らすが、届くこと自体は止めない。 |

### 必要になるもの

1. **一斉通知を送る権限を、作る権限と分ける。** 通知の文面を作れる人が、そのまま全顧客に送れないようにする。
2. **承認済みの配信と照合できたものだけを送る。** 配信の予定と承認に結びつかない一斉通知は、ログインが正しくても送らない。
3. **誰が、どの承認で、何を送ったかを、配信サービスとは別に残す。** 後から照合できる形、つまり証明として残す。

### 点検チェックリスト

顧客への配信サービスについて、組織で確認する 3 項目

- 一斉通知やメールを、作った人だけで送れる設定になっていないか。
- 配信サービスへのログインに、フィッシングに強い多要素認証を求めているか。
- 社内の人や取引先を名乗る連絡でログイン情報を求められたとき、別の経路で確認する手順があるか。

注：承認する人のアカウントまで乗っ取られた場合は、この照合を通りうる。また、この照合は通知を止めるもので、サービスの中の顧客の情報が読まれることは止めない。通知がどの経路で送られたかは公表されていない。続報で判明すれば、この Brief を改訂する。

## 6. Sources

- **ASOS（一次・開示）**: "Update regarding cyber incident"（2026-10-06） — <https://www.investegate.co.uk/announcement/rns/asos--asc/update-regarding-cyber-incident-/9809595>
- **英国 NCSC（一次・公的機関の注意）**: "Incident affecting ASOS customers"（2026-10-06） — <https://www.ncsc.gov.uk/news/incident-affecting-asos-customers>
- **英国 ICO（一次・声明）**: "ASOS statement"（2026-10-07） — <https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/10/asos-statement/>
- **The Guardian（報道）**: "Asos warns customer data may be compromised after ‘unauthorised’ app access"（2026-10-06） — <https://www.theguardian.com/business/2026/oct/06/asos-hack-notification-website-app>
- **The Guardian（報道・ASOS の顧客への説明を引用）**: "Asos says customers' names, contact details and search histories hacked"（2026-10-08） — <https://www.theguardian.com/business/2026/oct/08/asos-customer-data-accessed-hacker-posing-impersonated>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
