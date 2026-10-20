---
brief_no: 69
title: "ConnectWise：ベンダーのアプリ資格情報が悪用され、顧客の Microsoft 365 テナントで自らに管理者権限が付与された(Huntress 調査・ConnectWise 発表) — 同意済みのアプリ ID による操作を、実行の前に「ベンダーが意図した操作か」確かめる層が無い"
title_en: "ConnectWise: A vendor's app credential was abused to sign in to customer Microsoft 365 tenants and grant itself Global Administrator (Huntress research, ConnectWise advisory) — No layer checks, before it runs, whether an action by a consented app identity is one the vendor intended"
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
industries: ["supply-chain"]
operations: ["account-admin"]
controls:
  - slug: "hold-unverified"
    item: "アプリ ID の操作を、許可された範囲かを確かめるまで通さない"
  - slug: "audit-trail"
    item: "どの許可でどの操作をしたかを、アプリとは別に記録する"
attack_method: "supply-chain"
impact: "約 1,000 テナントでサインイン活動、300 超で成功"
---

## 1. TL;DR

2026 年 10 月、ConnectWise の Cloud Backup（旧 SkyKick）をはじめとするアプリの資格情報が悪用され、顧客の Microsoft 365（Entra ID）テナントへの不正なサインインが起きた。Huntress の調査では、攻撃元の IP からのサインイン活動が約 1,000 テナントで確認され、300 超で成功している。一部のテナントでは、ConnectWise のアプリ ID が自らを Global Administrator に付与し、他のアプリにクライアントシークレットを追加した。ConnectWise は 10 月 17 日に 7 つのアプリ ID を無効化し、Cloud Backup を停止した。

異常には気づいていた。ConnectWise は 10 月 14 日に不正アクセスを発見し、Huntress は自社が監視するテナントで挙動を捉えた。ただし、アプリ ID の無効化は 10 月 17 日で、その間の 15 日にも、アプリによる管理者権限の付与が起きている。<strong>効かなかったのは、顧客が同意したアプリ ID の操作を、実行の前に「ベンダーが意図した操作か」独立に確かめる層である。</strong>資格情報の露出経路は未解明で、インシデントは継続中である。

## 2. 何が起きたか

- **対象**: ConnectWise Cloud Backup（旧 SkyKick）と ConnectWise Cloud Management 系の Microsoft 365 アプリ。MSP（マネージドサービスプロバイダ）とその顧客のテナントで、管理者が同意して導入している。
- **資格情報の悪用**: Huntress によれば、Cloud Backup のアプリ ID の資格情報（クライアントアサーション）が、顧客テナントへのサインインに使われた。個々の顧客のパスワードは不要で、アプリとして Microsoft Entra ID からトークンを得る形である。
- **規模**: Huntress は 10 月 16 日時点で 162 テナント、その後 173 テナントで不正なサインインを確認した。10 月 17 日には、攻撃元 IP のサインイン活動が約 1,000 テナントにあり、300 超で成功したと報告している。資格情報は、アプリに同意した全テナントで通るため、実際の影響はさらに広い可能性がある。
- **第 2 波**: 政策、国家安全保障、通商、重要鉱物の分野の 16 テナントを狙う標的型の試行があり、多くはアプリが導入されていないため失敗した。
- **ConnectWise の対応**: 10 月 17 日 07:00（UTC）に 7 つのアプリ ID を無効化し、関連する証明書を失効させ、Cloud Backup を停止した。Cloud Backup と連携する SaaS Security と Cloud Management も、予防として停止している。無効化は「テナント内で既に行われた変更を元に戻さない」とし、発行済みのアクセストークンは失効するまで使える可能性があると説明している（同社 advisory）。
- **Microsoft の見立て**: Microsoft Threat Intelligence は 10 月 17 日の X の投稿で、本件を、信頼された OAuth アプリの侵害による「活発なサプライチェーン攻撃」と説明した。THN の報道によれば、`Directory.ReadWrite.All` のような、顧客が与えていた権限の悪用も指摘している。

事案は次の連鎖で成立している。

1. 顧客テナントの管理者が、ConnectWise 製アプリに同意し、権限を与えていた。
2. 何らかの経路で、そのアプリ ID の資格情報が攻撃者の手に渡った（経路は未解明）。
3. 攻撃者がアプリとして認証し、Graph のトークンを得て、テナントを順に処理した。
4. 一部のテナントで、アプリが自らに Global Administrator を付与し、他のアプリに資格情報を追加した。

この連鎖のうち、取り返しがつかなくなった実行は、3 と 4 の操作である。権限の根拠は、管理者がアプリに与えた同意であり、その操作がベンダーの意図したものか、誰が実行しているかは、実行の時点で顧客側から確かめる手段が示されていない。

## 3. 時系列 — 公表と対応

- **2026-10-13〜14**: 同一の IP から、法律事務所の 4 テナントへのパスワードスプレー（成功したユーザーサインインは確認されていない）。
- **2026-10-14**: ConnectWise が不正アクセスを発見（同社 advisory）。
- **2026-10-15**: 01:58（UTC）以降、約 50 の監視テナントで、ConnectWise Cloud Management のサービスプリンシパルが自らにディレクトリロールを付与。03:44〜03:49 には、ある顧客テナントで Teams アプリが Global Administrator になり、Python のスクリプトで 2 つの別アプリにクライアントシークレットを追加した。06:13〜08:34 に、同じ IP がアプリとして認証し、Graph のトークンを得た。
- **2026-10-16**: Huntress が公表。162 テナントを確認。ConnectWise が advisory を公開（17:47 UTC）。Huntress は、パートナーのテナントで自社アプリに追加された不正な資格情報を削除した。
- **2026-10-17**: 05:00（UTC）に ConnectWise が封じ込めの措置を始め、07:00 に 7 つのアプリ ID を無効化し、Cloud Backup を停止。Microsoft Threat Intelligence が X で注意を呼びかけ。Huntress が約 1,000 テナントの活動を報告。
- **2026-10-19〜20**: Huntress と ConnectWise が更新を続けている。10 月 20 日 00:45（UTC）の更新の時点で、3 つのサービスは停止したままである。

> 本件の事実は、Huntress（調査主体の自己公表）と ConnectWise の公式 advisory に拠る。Microsoft の見立ては、同社 Threat Intelligence の X の投稿と The Hacker News の報道に拠る。次の点は未確認または未解明である。資格情報の露出経路、製品の脆弱性が寄与したか（ConnectWise は「確認されていない」としている）、第 2 段階の操作を第 1 段階と同じ攻撃者が行ったか（Huntress は結びつけていない）。Graph のディレクトリ読み取りは監査記録を残さないため、アクセスがなかったとは言い切れない。

## 4. なぜ止まらなかったか

この事案の失敗は、顧客のパスワードの弱さでも、顧客の操作の誤りでもない。顧客が同意したアプリ ID が、アプリとして認証し、ロールの付与や資格情報の追加という管理操作を、実行の前に「ベンダーの意図した操作か」を確かめられないまま通したことにある。

**検出と証明の落差**は、ここにある。異常には気づいていた。ConnectWise は 10 月 14 日に不正アクセスを発見し、Huntress は、アプリが自らを昇格させた操作を、User-Agent の違い（ベンダーの .NET SDK ではなく Python-urllib）などから見分けている。ただし、気づいた後も、無効化までの間に管理者権限の付与は通っている。効かなかったのは、その手前である。アプリ ID の資格情報は、持つ者にそのアプリの権限をそのまま与える。顧客側から見ると、正規のアプリの操作と、資格情報を持つ別の主体の操作は、認証の時点では区別がつかない。

対応も、後から働く。ConnectWise のアプリ無効化、Huntress の推奨（アプリの無効化、資格情報の確認、ロールの確認、監査ログの確認）は必要だが、いずれも操作が実行された後の対処である。Todyl の報告によれば、アプリを無効化しても、発行済みのトークンは最長 90 分有効なままになりうる。ConnectWise も、発行済みのトークンは失効するまで使える可能性があるとしている。

同じ構造は、これまでの Brief にも現れている。[Vercel/Context.ai](https://lemma.frame00.com/ja/critical/briefs/059-vercel-contextai-oauth/) では、AI ツールへの「全許可」の OAuth が入口になった。[Salesloft Drift](https://lemma.frame00.com/ja/critical/briefs/064-salesloft-drift-oauth-salesforce/) では、盗まれた OAuth トークンで 700 超の Salesforce 環境が参照された。いずれも、同意された非人間の ID が、実行の直前に独立した確認を受けないまま使われている。

> 「アプリに同意した」と「この操作はそのアプリの意図した操作である」は、別々の事実である。前者は導入の時点で記録され、後者は実行のたびに確かめなければならない。

## 5. 証明があれば、何が変わるか

この事案で、アプリ ID の操作の直前に一段挟まるとすれば、「この操作が、このアプリに許可された範囲にあり、正規の実行主体から来ている」ことの確認である。Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">

- **操作の許可範囲の登録**：アプリ ID ごとに、実行してよい操作の種類（例：バックアップの読み取りは可、ディレクトリロールの自己付与と他アプリへの資格情報追加は不可）を、導入の時点で発行元名義の証明として登録し、実行の前に照合する。
- **実行主体の証明**：資格情報だけでなく、その操作が登録された実行環境から来たことを、操作ごとに証明で確かめられるようにする。
- **独立した記録**：どの許可に基づいて、どの操作が実行されたかを、アプリ側の操作とは別の記録として残し、後から監査できるようにする。

</ul>

事後の検知やアプリの無効化との違いはここにある。検出の層と、この層は代替ではなく補完の関係にある。前者は異常に気づき、後者は許可の範囲を超える操作を、実行の前に確かめられるようにする。

注：証明が示すのは、操作が登録された許可の範囲内にあり、登録された実行主体から来たことまでである。正規の実行環境そのものが侵害された場合や、登録された範囲内の操作が悪用された場合は、通ってしまう。許可の範囲の登録が緩ければ、緩いまま通る。

## 6. Sources

- **ConnectWise（一次・企業公式）**: Cloud Backup (formerly known as SkyKick) Service Interruption（2026-10-16 公開、10-20 まで更新） — <https://www.connectwise.com/company/trust/advisories>
- **Microsoft Threat Intelligence（一次・X の投稿）**: ConnectWise Cloud Backup の OAuth アプリの侵害についての投稿（2026-10-17） — <https://x.com/MsftSecIntel/status/2111358888125878426>
- **Huntress（一次・調査主体の自己公表）**: Vendor credential enables unauthorized access（2026-10-16 公開、10-19 まで更新） — <https://www.huntress.com/blog/vendor-credential-enables-unauthorized-access>
- **The Hacker News（独立報道）**: ConnectWise Suspends Cloud Backup After Attackers Compromise Microsoft 365 Tenants（2026-10-18） — <https://thehackernews.com/2026/10/connectwise-suspends-cloud-backup-after.html>
- **Todyl（独立解析）**: Investigation: Unauthorized Access Through the ConnectWise Cloud Backup Microsoft 365 App（2026-10-16 公開、10-19 更新） — <https://www.todyl.com/blog/investigation-unauthorized-access-through-the-connectwise-cloud-backup-microsoft-365-app>
- **The Hacker News（独立報道）**: Hackers Use Compromised ConnectWise Credential to Sign In to 173 Microsoft 365 Tenants（2026-10-17） — <https://thehackernews.com/2026/10/hackers-use-compromised-connectwise.html>

調査主体である Huntress は、被害テナントを監視する当事者でもあり、自社のアプリも標的にされている。ConnectWise の advisory は Trust Center の同じページで更新が続いており、内容は 10 月 20 日 00:45（UTC）の更新の時点のものである。Microsoft の `Directory.ReadWrite.All` の指摘は、THN の報道に拠る。

参照: 事後の検知が証明にならない論点は[「AI時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。
