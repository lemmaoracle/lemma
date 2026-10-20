---
brief_no: 69
title: "ConnectWise：ベンダーのアプリ資格情報が悪用されて顧客の Microsoft 365 テナントにサインインされ、同じ日にアプリ ID による管理者権限の自己付与も確認された(Huntress 調査・ConnectWise 発表) — 同意済みのアプリ ID による操作を、実行の前に「ベンダーが意図した操作か」確かめる層が無い"
title_en: "ConnectWise: A vendor's app credential was abused to sign in to customer Microsoft 365 tenants, and on the same day app identities were seen granting themselves Global Administrator (Huntress research, ConnectWise advisory) — No layer checks, before it runs, whether an action by a consented app identity is one the vendor intended"
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
og_lead_ja: "ConnectWise：ベンダーのアプリ ID が顧客テナントで自らを管理者に昇格させた"
og_lead_en: "ConnectWise: a vendor's app identity granted itself Global Administrator in customer tenants"
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
    label: "不正アクセスの発見から、アプリ ID の無効化まで。間の 15 日に管理者権限の自己付与"
  - value: "7"
    unit: "アプリ ID"
    label: "ConnectWise が無効化したアプリ ID。Cloud Backup など 3 サービスを停止"
glossary:
  - term: "テナント"
    desc: "Microsoft 365（Entra ID）で、組織ごとに分けられた利用環境。利用者、アプリ、権限はテナントごとに管理される。"
  - term: "アプリ ID（サービスプリンシパル）"
    desc: "人ではなくアプリがテナントにサインインするための ID。管理者が同意した権限を持ち、資格情報を持つ者はその権限で動ける。"
  - term: "クライアントアサーション"
    desc: "アプリが自分であることを示すために、証明書の鍵で署名して出す資格情報。利用者のパスワードは使わない。"
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
---

## 1. TL;DR

2026 年 10 月、ConnectWise の Cloud Backup（旧 SkyKick）をはじめとするアプリの資格情報が悪用され、顧客の Microsoft 365（Entra ID）テナントへの不正なサインインが起きた。Huntress の調査では、攻撃元の IP からのサインイン活動が約 1,000 テナントで確認され、300 超で成功している。同じ日、一部のテナントでは、ConnectWise Cloud Management 系のアプリ ID が自らを Global Administrator に付与し、他のアプリにクライアントシークレットを追加した（Huntress は、この操作をサインインと同じ攻撃者のものとは結びつけていない）。ConnectWise は 10 月 17 日に 7 つのアプリ ID を無効化し、Cloud Backup を停止した。資格情報の露出経路は未解明で、インシデントは継続中である。

攻撃者は、顧客のパスワードを使っていない。顧客の管理者が同意したアプリとして認証し、Microsoft Entra ID からトークンを得た。顧客の側から見ると、正規のアプリの操作と、その資格情報を持つ別の主体の操作は、認証の時点では区別がつかない。

異常には気づいていた。ConnectWise は 10 月 14 日に不正アクセスを発見し、Huntress は自社が監視するテナントで挙動を捉えた。ただし、アプリ ID の無効化は 10 月 17 日で、その間の 15 日にも、アプリ ID による管理者権限の自己付与が起きている。効かなかったのは、顧客が同意したアプリ ID の操作を、実行の前に「ベンダーが意図した操作か」独立に確かめる層である。

## 2. 何が起きたか

- **対象**: ConnectWise Cloud Backup（旧 SkyKick）と ConnectWise Cloud Management 系の Microsoft 365 アプリ。MSP（マネージドサービスプロバイダ）とその顧客のテナントで、管理者が同意して導入している。
- **資格情報の悪用**: Huntress によれば、Cloud Backup のアプリ ID の資格情報（クライアントアサーション）が、顧客テナントへのサインインに使われた。個々の顧客のパスワードは不要で、アプリとして Microsoft Entra ID からトークンを得る形である。
- **規模**: Huntress は 10 月 16 日時点で 162 テナント、その後 173 テナントで不正なサインインを確認した。10 月 17 日には、攻撃元 IP のサインイン活動が約 1,000 テナントにあり、300 超で成功したと報告している。資格情報は、アプリに同意した全テナントで通るため、実際の影響はさらに広い可能性がある。
- **第 2 波**: 政策、国家安全保障、通商、重要鉱物の分野の 16 テナントを狙う標的型の試行があり、多くはアプリが導入されていないため失敗した。
- **ConnectWise の対応**: 10 月 17 日 07:00（UTC）に 7 つのアプリ ID を無効化し、関連する証明書を失効させ、Cloud Backup を停止した。Cloud Backup と連携する SaaS Security と Cloud Management も、予防として停止している。無効化は「テナント内で既に行われた変更を元に戻さない」とし、発行済みのアクセストークンは失効するまで使える可能性があると説明している（同社 advisory）。
- **Microsoft の見立て**: Microsoft Threat Intelligence は 10 月 17 日の X の投稿で、本件を、信頼された OAuth アプリの侵害による「活発なサプライチェーン攻撃」と説明した。THN の報道によれば、`Directory.ReadWrite.All` のような、顧客が与えていた権限の悪用も指摘している。
- **侵入の経路**: 資格情報がどこから攻撃者の手に渡ったかは未解明。製品の脆弱性が寄与したかについて、ConnectWise は「確認されていない」としている。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過の連鎖</span></div>
<p class="rx-ex-cap">取り返しがつかなくなったのは ③ と ④ の実行。権限の根拠は ① の同意で、実行の時点でベンダーの意図した操作かを顧客の側から確かめる手段は示されていない。Huntress は ③ を ④ と同じ攻撃者のものとは結びつけていない。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">顧客の管理者</div><div class="no">1</div><b>ConnectWise 製アプリに同意し、権限を与える</b><p>MSP とその顧客のテナントで導入。</p></div>
<div class="rx-step"><div class="who">攻撃者</div><div class="no">2</div><b>Cloud Backup のアプリ ID の資格情報を手に入れる</b><p>経路は未解明。</p></div>
<div class="rx-step crit"><div class="who">アプリ ID</div><div class="no">3</div><b>10-15 01:58（UTC）以降、自らにロールを付与する</b><p>ある顧客テナントでは Global Administrator になり、他のアプリに資格情報を追加。</p></div>
<div class="rx-step crit"><div class="who">攻撃元の IP</div><div class="no">4</div><b>10-15 06:13（UTC）以降、アプリとして認証し、テナントを順に処理する</b><p>Graph のトークンを得る。約 1,000 テナントで活動、300 超で成功。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2026-10-13〜14**: 同一の IP から、法律事務所の 4 テナントへのパスワードスプレー（成功したユーザーサインインは確認されていない）。
- **2026-10-14**: ConnectWise が不正アクセスを発見（同社 advisory）。
- **2026-10-15**: 01:58（UTC）以降、約 50 の監視テナントで、ConnectWise Cloud Management のサービスプリンシパルが自らにディレクトリロールを付与。03:44〜03:49 には、ある顧客テナントで ConnectWise Cloud Management の MS Teams アプリが Global Administrator になり、Python のスクリプトで 2 つの別アプリにクライアントシークレットを追加した。06:13〜08:34 に、同じ IP がアプリとして認証し、Graph のトークンを得た。
- **2026-10-16**: Huntress が公表。162 テナントを確認。ConnectWise が advisory を公開（17:47 UTC）。Huntress は、パートナーのテナントで自社アプリに追加された不正な資格情報を削除した。
- **2026-10-17**: 05:00（UTC）に ConnectWise が封じ込めの措置を始め、07:00 に 7 つのアプリ ID を無効化し、Cloud Backup を停止。Microsoft Threat Intelligence が X で注意を呼びかけ。Huntress が約 1,000 テナントの活動を報告。
- **2026-10-19〜20**: Huntress と ConnectWise が更新を続けている。10 月 20 日 00:45（UTC）の更新の時点で、3 つのサービスは停止したままである。

> 本件の事実は、Huntress（調査主体の自己公表）と ConnectWise の公式 advisory に拠る。Microsoft の見立ては、同社 Threat Intelligence の X の投稿と The Hacker News の報道に拠り、`Directory.ReadWrite.All` の指摘は THN の報道に拠る。次の点は未確認または未解明である。資格情報の露出経路、製品の脆弱性が寄与したか（ConnectWise は「確認されていない」としている）、ロールの自己付与の操作を、サインインと同じ攻撃者が行ったか（Huntress は結びつけていない）。Graph のディレクトリ読み取りは監査記録を残さないため、アクセスがなかったとは言い切れない。調査主体である Huntress は、被害テナントを監視する当事者でもあり、自社のアプリも標的にされている。ConnectWise の advisory は同じページで更新が続いており、内容は 10 月 20 日 00:45（UTC）の更新の時点のものである。

### 公表後の対応

- **ConnectWise**: アプリ ID を無効化し、関連する証明書を失効させ、Cloud Backup、SaaS Security、Cloud Management を停止した。無効化は既に行われた変更を元に戻さず、発行済みのトークンは失効するまで使える可能性があるとしている。
- **Huntress**: アプリの無効化、資格情報の確認、ロールの確認、監査ログの確認を推奨した。パートナーのテナントでは、自社アプリに追加された不正な資格情報を削除した。
- **Todyl**: アプリを無効化しても、発行済みのトークンは最長 90 分有効なままになりうると報告した。

## 4. なぜ止まらなかったか

この事案の失敗は、顧客のパスワードの弱さでも、顧客の操作の誤りでもない。顧客が同意したアプリ ID が、アプリとして認証し、ロールの付与や資格情報の追加という管理操作を、実行の前に「ベンダーの意図した操作か」を確かめられないまま通したことにある。

異常には気づいていた。ConnectWise は 10 月 14 日に不正アクセスを発見し、Huntress は、アプリが自らを昇格させた操作を、User-Agent の違い（ベンダーの .NET SDK ではなく Python-urllib）などから見分けている。ただし、気づいた後も、無効化までの間に管理者権限の付与は通っている。効かなかったのは、その手前である。アプリ ID の資格情報は、持つ者にそのアプリの権限をそのまま与える。顧客側から見ると、正規のアプリの操作と、資格情報を持つ別の主体の操作は、認証の時点では区別がつかない。

対応も、後から働く。ConnectWise のアプリ無効化、Huntress の推奨（アプリの無効化、資格情報の確認、ロールの確認、監査ログの確認）は必要だが、いずれも操作が実行された後の対処である。Todyl の報告によれば、アプリを無効化しても、発行済みのトークンは最長 90 分有効なままになりうる。ConnectWise も、発行済みのトークンは失効するまで使える可能性があるとしている。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">証明は操作が実行される前に働き、検出は異常が表に出た後に働く。その間、アプリ ID の操作は同意どおりの正規の操作として扱われる。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回なし</b>実行の前に、許可された範囲の操作かを確かめる</div>
<div class="rx-zone gapz"><b>落差</b><span>ロールの付与は通った。<br>アプリ ID はまだ有効</span></div>
<div class="rx-zone det"><b>検出の層 · 気づいた</b>挙動の違いに気づき、アプリを止める</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>アプリとして認証</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>ロールの自己付与が通る</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>異常に気づく</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>アプリ ID を無効化</b></div>
</div>
</figure>

「アプリに同意した」と「この操作はそのアプリの意図した操作である」は、別々の事実である。前者は導入の時点で記録され、後者は実行のたびに確かめなければならない。この隔たりが、本 Brief の言う**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、これまでの Brief にも現れている。[Vercel/Context.ai](https://lemma.frame00.com/ja/critical/briefs/059-vercel-contextai-oauth/) では、AI ツールへの「全許可」の OAuth が入口になった。[Salesloft Drift](https://lemma.frame00.com/ja/critical/briefs/064-salesloft-drift-oauth-salesforce/) では、盗まれた OAuth トークンで 700 超の Salesforce 環境が参照された。いずれも、同意された非人間の ID が、実行の直前に独立した確認を受けないまま使われている。

## 5. 対策するには

**ベンダーのアプリの資格情報が渡っても、顧客の側で通る操作を狭めることはできる。** 資格情報の露出経路が分からなくても、今日から確かめられることがある。アプリ ID に許す操作を導入のときに絞り、ロールの付与や資格情報の追加のように権限を変える操作は、実行の前に止めて確かめる。止めた操作と通した操作は、アプリとは別の場所に残す。

### 注意したい業界・業務

- **業界 · 調達・サプライチェーン**: MSP と、Microsoft 365 のバックアップや管理を外部のサービスに任せる組織。ベンダーのアプリに、テナント全体に及ぶ権限を同意していることがある。
- **業務 · アカウント・権限の管理**: テナントに導入したアプリと、アプリが持つ権限の管理。今回の操作は、利用者ではなく、同意済みのアプリ ID から行われた。

同じ穴は、外部のサービスにテナントの権限を預けている多くの組織にある。バックアップ、セキュリティ、管理の SaaS は、仕事の性質上、広い権限を求める。一度同意すると、その後の操作を一つずつ確かめる役は、顧客の側にもベンダーの側にも置かれていないことが多い。

### いまの対策で埋まるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 利用者の多要素認証（MFA） | 関係しない | 攻撃者は利用者のパスワードを使わず、アプリとして認証してトークンを得た。 |
| 導入時の同意の審査 | 一部 | アプリに与える権限の広さは絞れる。与えた権限の範囲内の操作は、資格情報を持つ者なら誰が実行しても通る。 |
| サインインと監査ログの監視 | 一部 | Huntress は User-Agent の違いから自己昇格を見分けた。ただ気づくのは操作の後で、Graph のディレクトリ読み取りは監査記録を残さない。 |
| ベンダーによるアプリ ID の無効化 | 一部 | 以後の認証は止まる。既に行われた変更は戻らず、発行済みのトークンは失効するまで使える可能性がある。 |

### 必要になるもの

1. **アプリ ID に許す操作を、導入のときに決める。** バックアップの読み取りは可、ディレクトリロールの自己付与と他のアプリへの資格情報の追加は不可、のように、操作の種類で決めておく。同意した権限の広さだけでは、この区別はつかない。
2. **権限を変える操作は、実行の前に止めて確かめる。** ロールの付与や資格情報の追加がアプリ ID から来たら、決めた範囲に入るかを照合し、入らなければ通さない。その操作が登録された実行環境から来たかも、資格情報とは別に確かめる。
3. **どの許可でどの操作をしたかを、アプリとは別に残す。** 止めた操作と通した操作を、アプリ側の記録とは別の場所に、後から第三者に示せる形、つまり証明として残す。

### 点検チェックリスト

テナントに同意したアプリについて、組織で確かめる 3 項目

- テナントに同意済みのサードパーティのアプリと、それぞれに与えた権限を一覧で言えるか。
- アプリ ID が自らにロールを付けたり、他のアプリに資格情報を足したりしたとき、誰に知らせが届くか。
- ベンダーが侵害を公表したとき、そのアプリを止め、発行済みのトークン、追加された資格情報、付与されたロールを確かめる手順と担当が決まっているか。

注：正規の実行環境そのものが侵害された場合や、決めた範囲の中の操作が悪用された場合は、この仕組みでも通ってしまう。許す範囲の決め方が緩ければ、緩いまま通る。また、権限を変える操作を止めて確かめる運用にすると、ベンダーの正規の操作も遅れる。

## 6. Sources

- **ConnectWise（一次・企業公式）**: 「Cloud Backup (formerly known as SkyKick) Service Interruption」（2026-10-16） — 10-20 まで更新 · <https://www.connectwise.com/company/trust/advisories>
- **Microsoft Threat Intelligence（一次・X の投稿）**: 「ConnectWise Cloud Backup の OAuth アプリの侵害についての投稿」（2026-10-17） — <https://x.com/MsftSecIntel/status/2111358888125878426>
- **Huntress（一次・調査主体の自己公表）**: 「Vendor credential enables unauthorized access」（2026-10-16） — 10-19 まで更新 · <https://www.huntress.com/blog/vendor-credential-enables-unauthorized-access>
- **The Hacker News（独立報道）**: 「ConnectWise Suspends Cloud Backup After Attackers Compromise Microsoft 365 Tenants」（2026-10-18） — <https://thehackernews.com/2026/10/connectwise-suspends-cloud-backup-after.html>
- **Todyl（独立解析）**: 「Investigation: Unauthorized Access Through the ConnectWise Cloud Backup Microsoft 365 App」（2026-10-16） — 10-19 更新 · <https://www.todyl.com/blog/investigation-unauthorized-access-through-the-connectwise-cloud-backup-microsoft-365-app>
- **The Hacker News（独立報道）**: 「Hackers Use Compromised ConnectWise Credential to Sign In to 173 Microsoft 365 Tenants」（2026-10-17） — <https://thehackernews.com/2026/10/hackers-use-compromised-connectwise.html>

参照: 事後の検知が証明にならない論点は[「AI時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。
