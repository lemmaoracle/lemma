---
brief_no: 69
title: "ConnectWise：ベンダーのアプリ資格情報が悪用されて顧客の Microsoft 365 テナントにサインインされ、同じ日にアプリ ID による管理者権限の自己付与も確認された(Huntress 調査・ConnectWise 発表) — 同意済みのアプリ ID による操作を、実行の前に「ベンダーが意図した操作か」確かめる層が無い"
title_en: "ConnectWise: A vendor's app credential was abused to sign in to customer Microsoft 365 tenants, and on the same day an app identity was seen granting itself Global Administrator in some tenants (Huntress research, ConnectWise advisory) — No layer checks, before it runs, whether an action by a consented app identity is one the vendor intended"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [agent-infrastructure]
incident_date: 2026-10-15
published: 2026-10-20
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["059-vercel-contextai-oauth", "064-salesloft-drift-oauth-salesforce", "075-klue-oauth-salesforce-credential-lifecycle"]
status: published
version: "1.0"
og_lead_ja: "ConnectWise：ベンダーのアプリ ID が一部の顧客テナントで自らを管理者に昇格させた"
og_lead_en: "ConnectWise: a vendor's app identity granted itself Global Administrator in some customer tenants"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン攻撃"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "ベンダーのアプリとして、\n顧客の Microsoft 365 に\nサインインされた。\n<accent>約 1,000 テナントで活動、300 超で成功</accent>"
og_headline_en: "Attackers signed in to customers' Microsoft 365 as a vendor's app.\n<accent>About 1,000 tenants, 300+ successful.</accent>"
key_figures:
  - value: "約 1,000"
    unit: "テナント"
    label: "攻撃元 IP のサインイン活動が確認された顧客テナント（300 超で成功）"
    tone: "alert"
  - value: "10-14 → 10-17"
    label: "不正アクセスの発見から、アプリ ID の無効化まで。間の 15 日に、一部のテナントで管理者権限の自己付与"
  - value: "7"
    unit: "アプリ ID"
    label: "ConnectWise が無効化したアプリ ID。Cloud Backup など 3 サービスを停止"
glossary:
  - term: "テナント"
    desc: "Microsoft 365（Entra ID）で、組織ごとに分けられた利用環境。利用者、アプリ、権限はテナントごとに管理される。"
  - term: "アプリ ID（サービスプリンシパル）"
    desc: "人ではなくアプリがテナントにサインインするための ID。管理者が同意した権限を持ち、資格情報を持つ者はその権限で動ける。"
  - term: "トークン"
    desc: "認証の後に発行される、一定時間有効な通行証。アプリを止めても、発行済みのものは失効するまで使えることがある。"
insight:
  slug: "consent-reused-for-every-action"
  label: "同意が毎回の操作の根拠になる"
  quote: "導入のときに一度与えた同意が、その後の管理操作の根拠として、実行のたびに確かめられないまま使われた。"
industries: ["supply-chain"]
operations: ["account-admin"]
controls:
  - slug: "hold-unverified"
    item: "アプリ ID の操作を、許可された範囲かを確かめるまで通さない"
  - slug: "audit-trail"
    item: "どの許可でどの操作をしたかを、アプリとは別に記録する"
attack_method: "supply-chain"
impact: "約 1,000 テナントでサインイン活動、300 超で成功"
takeaway: "同意済みのアプリ ID による管理操作を、実行の前に、ベンダーが意図した操作か確かめる手順が無かった。"
self_check: "導入したアプリと、それぞれに与えた権限を把握しているか。"
countries: ["us"]
---

## 1. TL;DR

2026 年 10 月、ConnectWise の Cloud Backup（旧 SkyKick）などのアプリの資格情報が悪用され、顧客の Microsoft 365 テナントに不正にサインインされた。Huntress の調査では、攻撃元の IP からのサインイン活動が約 1,000 テナントにあり、300 超で成功した。同じ日、2 つの顧客テナントでは、別の ConnectWise 系アプリの ID が自らを Global Administrator にしていた（Huntress は、サインインと同じ攻撃者の操作とは結びつけていない）。資格情報の露出経路は未解明で、インシデントは継続中である。

攻撃者は顧客のパスワードを使わず、顧客の管理者が同意したアプリとして認証した。正規のアプリの操作と、資格情報を持つ別の主体の操作は、認証の時点では区別がつかない。

ConnectWise は 10 月 14 日に不正アクセスを発見していたが、アプリ ID を無効化した 17 日までの間の 15 日に、管理者権限の自己付与は通った。効かなかったのは、同意済みのアプリ ID の操作を、実行の前に「ベンダーが意図した操作か」独立に確かめる層である。

## 2. 何が起きたか

- **対象**: ConnectWise の Cloud Backup（旧 SkyKick）と Cloud Management 系の Microsoft 365 アプリ。MSP（マネージドサービスプロバイダ）とその顧客のテナントで、管理者が同意して導入している。
- **資格情報の悪用**: Cloud Backup のアプリ ID の資格情報で、顧客テナントにサインインされた（Huntress）。顧客のパスワードは要らず、アプリとしてトークンを得る形である。
- **規模**: Huntress は 10 月 17 日、攻撃元 IP のサインイン活動が約 1,000 テナントにあり、300 超で成功したと報告した（16 日時点の確認は 162 テナント）。資格情報はアプリに同意した全テナントで通るため、影響はさらに広い可能性がある。
- **管理者権限の自己付与**: 10 月 15 日、2 つの顧客テナントで、Cloud Management の Microsoft Teams 用アプリの ID が自らを Global Administrator にし、他のアプリに資格情報を追加した。
- **ConnectWise の対応**: 10 月 17 日に 7 つのアプリ ID を無効化し、関連する証明書を失効させ、Cloud Backup など 3 サービスを停止した。無効化は既に行われた変更を元に戻さず、発行済みのトークンは失効するまで使える可能性がある（同社 advisory）。
- **侵入の経路**: 資格情報がどこから渡ったかは未解明。製品の脆弱性の寄与は「確認されていない」（ConnectWise）。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過</span></div>
<p class="rx-ex-cap">③ と ④ は別のアプリの操作で、Huntress は同じ攻撃者のものとは結びつけていない。どちらも ① の同意を根拠に、確かめられないまま通った。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">顧客の管理者</div><div class="no">1</div><b>ConnectWise 製アプリに同意し、権限を与える</b><p>MSP とその顧客のテナントで導入。</p></div>
<div class="rx-step"><div class="who">攻撃者</div><div class="no">2</div><b>Cloud Backup のアプリ ID の資格情報を手に入れる</b><p>経路は未解明。</p></div>
<div class="rx-step crit"><div class="who">Cloud Management のアプリ ID</div><div class="no">3</div><b>10-15、自らを Global Administrator にする</b><p>2 つの顧客テナントで、他のアプリに資格情報を追加。</p></div>
<div class="rx-step crit"><div class="who">攻撃元の IP</div><div class="no">4</div><b>同じ日、Cloud Backup のアプリとして認証し、テナントを順に処理する</b><p>トークンを得る。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2026-10-14**: ConnectWise が不正アクセスを発見（同社 advisory）。
- **2026-10-15**: 03:44（UTC）ごろ、ある顧客テナントで Cloud Management の Teams 用アプリが自らを Global Administrator にし、2 つのアプリに資格情報を追加。06:13〜08:34（UTC）に、攻撃元の IP が Cloud Backup のアプリとして認証した。
- **2026-10-16**: Huntress が公表（162 テナント）。ConnectWise が advisory を公開。
- **2026-10-17**: ConnectWise が 7 つのアプリ ID を無効化し、Cloud Backup を停止。Microsoft Threat Intelligence が X で注意を呼びかけ。Huntress が約 1,000 テナントの活動を報告。
- **2026-10-19**: Huntress が、同じ手順の管理者権限の自己付与を 2 つ目の顧客テナントで確認。10-20 にかけて更新が続き、10 月 20 日 00:45（UTC）の時点で、3 つのサービスは停止したまま。

> 事実は Huntress（調査主体の自己公表）と ConnectWise の公式 advisory に拠る。資格情報の露出経路、製品の脆弱性の寄与、管理者権限の自己付与とサインインが同じ攻撃者かは未確認である。Huntress は被害テナントを監視する当事者でもあり、自社のアプリも標的にされた。

### 公表後の対応

- **Huntress**: アプリの無効化と、資格情報・ロール・監査ログの確認を推奨した。
- **Todyl**: アプリを無効化しても、発行済みのトークンは最長 90 分有効なままになりうると報告した。

## 4. なぜ止まらなかったか

この事案の失敗は、顧客のパスワードの弱さでも、操作の誤りでもない。アプリ ID の資格情報は持つ者にそのアプリの権限をそのまま与え、ロールの付与や資格情報の追加も、実行の前に「ベンダーが意図した操作か」を確かめられないまま通った。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">証明は操作が実行される前に働き、検出は異常が表に出た後に働く。その間、アプリ ID の操作は同意どおりの正規の操作として扱われる。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回なし</b>実行の前に、許可された範囲の操作かを確かめる</div>
<div class="rx-zone gapz"><b>落差</b><span>ロールの付与は通った。<br>アプリ ID はまだ有効</span></div>
<div class="rx-zone det"><b>検出の層 · 気づいた</b>挙動の違いに気づき、アプリを止める</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>アプリ ID が同意済みの権限を持つ</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>ロールの自己付与が通る</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>異常に気づく</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>アプリ ID を無効化</b></div>
</div>
</figure>

検出は働いた。Huntress は、アプリが自らを昇格させた操作を、通信の特徴（User-Agent）の違いなども手がかりに見分けている。ただ、気づくのは操作の後で、無効化までの間に権限の付与は通った。「アプリに同意した」と「この操作はベンダーが意図した操作である」は別々の事実で、前者は導入の時点で記録され、後者は実行のたびに確かめなければならない。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[Vercel/Context.ai](https://lemma.frame00.com/ja/critical/briefs/059-vercel-contextai-oauth/)（AI ツールへの「全許可」の OAuth が入口）と [Salesloft Drift](https://lemma.frame00.com/ja/critical/briefs/064-salesloft-drift-oauth-salesforce/)（盗まれた OAuth トークンで 700 超の Salesforce 環境を参照）にも現れている。

## 5. 対策するには

**ベンダーのアプリの資格情報が渡っても、顧客の側で通る操作を狭めることはできる。** 露出経路が分からなくても、アプリ ID に許す操作を導入のときに絞り、ロールの付与や資格情報の追加のように権限を変える操作は、実行の前に止めて確かめる。止めた操作と通した操作は、アプリとは別の場所に残す。

### 注意したい業界・業務

- **業界 · 調達・サプライチェーン**: MSP と、Microsoft 365 のバックアップや管理を外部のサービスに任せる組織。バックアップや管理の SaaS は、テナント全体に及ぶ権限を求めることが多い。
- **業務 · アカウント・権限の管理**: テナントに導入したアプリと、アプリが持つ権限の管理。今回の操作は、利用者ではなく、同意済みのアプリ ID から行われた。

### いまの対策で防げるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 利用者の多要素認証（MFA） | 関係しない | 攻撃者は利用者のパスワードを使わず、アプリとして認証してトークンを得た。 |
| 導入時の同意の審査 | 一部 | アプリに与える権限の広さは絞れる。与えた権限の範囲内の操作は、資格情報を持つ者なら誰が実行しても通る。 |
| サインインと監査ログの監視 | 一部 | Huntress は通信の特徴（User-Agent）の違いを手がかりにしたが、それだけでは決め手にならない。気づくのは操作の後で、ディレクトリの読み取りは監査記録に残らない。 |
| ベンダーによるアプリ ID の無効化 | 一部 | 以後の認証は止まる。既に行われた変更は戻らず、発行済みのトークンは失効するまで使える可能性がある。 |

### 必要になるもの

1. **アプリ ID に許す操作を、導入のときに決める。** バックアップの読み取りは可、ディレクトリロールの自己付与と他のアプリへの資格情報の追加は不可、のように操作の種類で決める。同意した権限の広さだけでは、この区別はつかない。
2. **権限を変える操作は、実行の前に止めて確かめる。** アプリ ID からのロールの付与や資格情報の追加は、決めた範囲に入るかを照合し、入らなければ通さない。登録された実行環境から来たかも、資格情報とは別に確かめる。
3. **どの許可でどの操作をしたかを、アプリとは別に残す。** 止めた操作と通した操作を、後から第三者に示せる形、つまり証明として残す。

### 点検チェックリスト

テナントに同意したアプリについて、組織で確かめる 3 項目

- 使っていないアプリや、必要より広い権限が残っていないかを、定期的に見直しているか。
- アプリ ID が自らにロールを付けたり、他のアプリに資格情報を足したりしたとき、誰に知らせが届くか。
- ベンダーが侵害を公表したとき、そのアプリを止め、発行済みのトークン、追加された資格情報、付与されたロールを確かめる手順と担当が決まっているか。

注：正規の実行環境そのものが侵害された場合や、決めた範囲の中の操作が悪用された場合は、この仕組みでも通ってしまう。許す範囲の決め方が緩ければ、緩いまま通る。また、権限を変える操作を止めて確かめる運用にすると、ベンダーの正規の操作も遅れる。資格情報の露出経路はまだ公表されていない。続報で判明すれば、この Brief を改訂する。

## 6. Sources

- **ConnectWise（一次・企業公式）**: 「Cloud Backup (formerly known as SkyKick) Service Interruption」（2026-10-16） — 10-20 まで更新 · <https://www.connectwise.com/company/trust/advisories>
- **Microsoft Threat Intelligence（一次・X の投稿）**: ConnectWise Cloud Backup の OAuth アプリの侵害についての投稿（2026-10-17） — <https://x.com/MsftSecIntel/status/2111358888125878426>
- **Huntress（一次・調査主体の自己公表）**: 「Vendor credential enables unauthorized access」（2026-10-16） — 10-19 まで更新 · <https://www.huntress.com/blog/vendor-credential-enables-unauthorized-access>
- **The Hacker News（独立報道）**: 「Hackers Use Compromised ConnectWise Credential to Sign In to 173 Microsoft 365 Tenants」（2026-10-17） — <https://thehackernews.com/2026/10/hackers-use-compromised-connectwise.html>
- **The Hacker News（独立報道）**: 「ConnectWise Suspends Cloud Backup After Attackers Compromise Microsoft 365 Tenants」（2026-10-18） — <https://thehackernews.com/2026/10/connectwise-suspends-cloud-backup-after.html>
- **Todyl（独立解析）**: 「Investigation: Unauthorized Access Through the ConnectWise Cloud Backup Microsoft 365 App」（2026-10-16） — 10-19 更新 · <https://www.todyl.com/blog/investigation-unauthorized-access-through-the-connectwise-cloud-backup-microsoft-365-app>

参照: 事後の検知が証明にならない論点は[「AI時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。
