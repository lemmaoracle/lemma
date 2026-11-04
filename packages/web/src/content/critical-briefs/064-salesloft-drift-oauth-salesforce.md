---
brief_no: 64
title: "Salesloft Drift：連携アプリの OAuth トークンが盗まれ、各社の Salesforce 環境が照会された(UNC6395・Google 脅威インテリジェンス調査)"
title_en: "Salesloft Drift: Stolen OAuth tokens from a trusted integration were used to query companies' Salesforce environments (UNC6395, Google Threat Intelligence)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "attribute-proof-bypass"]
incident_date: 2025-08-08
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["059-vercel-contextai-oauth", "069-connectwise-cloud-backup-app-identity-credential-abuse", "075-klue-oauth-salesforce-credential-lifecycle", "029-github-dev-oauth-token", "033-f5-bigip-edge-pivot", "006-google-api-key-revocation-lag"]
status: published
layout: "report"
sections: "proof"
gate: "permission-change"
version: "1.0"
og_lead_ja: "Salesloft Drift：盗まれた連携の OAuth トークンで各社の Salesforce が照会された（GTIG：700 超の組織に影響の可能性）"
og_lead_en: "Salesloft Drift: stolen integration OAuth tokens used to query companies' Salesforce (GTIG: 700+ organizations possibly affected)"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン攻撃"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "連携アプリのトークンで、\n各社の Salesforce が\n照会された。\n<accent>700 超の組織に影響の可能性</accent>"
og_headline_en: "Stolen OAuth tokens\nfrom an integration\nqueried Salesforce.\n<accent>700+ orgs possibly hit.</accent>"
key_figures:
  - value: "700 超"
    unit: "組織"
    label: "GTIG が、影響を受けた可能性を指摘した組織の数"
    tone: "alert"
  - value: "08-08 → 08-20"
    label: "盗まれたトークンでの照会が始まってから、Salesloft が Drift のトークンを失効させるまで（照会は 08-18 まで）"
  - value: "3〜6"
    unit: "月"
    label: "2025 年、Salesloft の GitHub アカウントへの不正アクセスが続いた期間。その後 Drift の AWS 環境からトークンが取得された"
glossary:
  - term: "OAuth トークン"
    desc: "利用者に代わって、アプリが別のサービスへ接続するための通行証。有効なあいだは、持っている者が、付与された権限で操作できる。"
  - term: "連携アプリ"
    desc: "Drift のように、利用者の Salesforce に接続して動く外部のアプリ。導入した組織は、接続の権限を連携アプリに与える。"
  - term: "Case"
    desc: "Salesforce で、サポートの問い合わせを管理する記録。本文に、やり取りの中で貼り付けられた認証情報が残ることがある。"
insight:
  slug: "standing-integration-token"
  label: "有効な連携トークンだけで通る照会"
  quote: "連携アプリのトークンが有効であることだけでは、そのトークンでの照会が、連携の本来の用途の操作かどうかは、区別できない。"
industries: ["supply-chain"]
operations: ["data-access"]
controls:
  - slug: "limit-and-revoke"
    item: "連携アプリのトークンの範囲を操作ごとに絞り、失効が即時に反映されるようにする"
  - slug: "verify-entry"
    item: "連携アプリからの各操作を、付与者の認可の範囲と現在の有効性に照らして確認する"
attack_method: "supply-chain"
impact: "影響の可能性がある組織 700 超（GTIG）"
takeaway: "連携トークンでの照会が付与の範囲の操作かを、実行の前に照合する層が働かず、照会は正規の連携のアクセスとして通った。"
search_title: "Salesloft Drift の OAuth 窃取：経緯と対策"
search_description: "Salesloft Drift の OAuth トークンが盗まれ、各社の Salesforce 環境が照会された（Google 脅威インテリジェンス〔GTIG〕）。何が起きたか、なぜ見分けられないか、対策を整理。"
self_check: "連携アプリのトークンでの操作を、トークンが有効かとは別に、許した範囲の操作か照合できるか。"
countries: ["us"]
---

## 1. 要点

攻撃者は、各社の利用者のパスワードではなく、各社が導入していた連携アプリ Drift の OAuth トークンを使った。トークンは連携アプリの側（Drift の AWS 環境）から取得され、同じ連携を入れていた多くの組織の Salesforce に、正規の連携として接続された。狙われたのは CRM の記録だけでなく、サポートの Case 本文に貼られていた AWS のアクセスキーや VPN の認証情報である（GTIG）。<strong>連携アプリのトークンが有効であることだけでは、そのトークンでの照会が、連携の本来の用途の操作かどうかは、区別できない。</strong>

## 2. 通った操作

- **通った操作**: 盗まれた Drift の OAuth トークンでの、各社の Salesforce への照会（2025 年 8 月 8〜18 日）。Account・User・Opportunity に加え、Case 本文に貼られた AWS アクセスキー・Snowflake トークン・VPN 認証情報・パスワードが探索された。顧客の連絡先・Case 本文・アカウントの記録も持ち出された（GTIG）。
- **止まった操作**: 8 月 20 日に Salesloft が Salesforce と連携して有効な Drift トークンを失効させ、Drift 連携を Salesforce マーケットプレイスから撤去してからの照会。
- **受け付けた側に届くもの**: 一般に、有効な OAuth トークンでの照会は、利用者に代わる正規の連携のアクセスとして届く。トークンを使っているのが連携アプリか、トークンを持つ別の主体かは、受け付けた時点では区別がつかない。
- **公表されていないこと**: 持ち出されたレコードの確かな件数（ShinyHunters を名乗る恐喝グループの「760 社・15 億レコード」は恐喝上の主張で、独立に確認されていない）。Case から得られた認証情報が、ほかのシステムで使われたか。

## 3. 実行前の照合

経路を問わず区別できる条件は、連携アプリからの操作を受け付ける側が、その操作が付与された範囲の種類の操作か、トークンがいまも有効かを、実行する前に、トークンを持っていることとは別に照合することである。

- **誰が承認を出すか**: 連携を導入する組織の管理者（付与者）。導入のときに、連携アプリに許す操作を、種類で決める。連携の機能に要る記録の読み書きは可、それ以外のオブジェクトの一括の照会は不可、のように。同意した権限の広さだけでは、この区別はつかない。
- **どこで照合するか**: Salesforce が連携アプリからの照会を受け付ける処理。決めた範囲に入るか、トークンが失効していないかを照合し、入らなければ通さない。
- **何が残るか**: どの許可で、どの照会をしたかの記録。止めた照会と通した照会を、連携アプリとは別の場所に、後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝連携アプリからの照会を実行する前に、許した範囲に入るか、トークンが有効かを照合し、記録に残すこと。検知＝照会の後に、照会された記録を調べ、トークンを失効させること。下の日付は、GTIG と報道にある日付である。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>実行の前に、許した範囲の照会か、トークンが有効かを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>700 超の組織に影響の可能性（GTIG）<br>Case 本文の認証情報が探索された</span></div>
<div class="rx-zone det"><b>検知 · 失効と調査</b>トークンを失効させ、照会された記録を調べる</div>
<div class="rx-g g1"><div class="t">03〜06</div><b>Salesloft の GitHub アカウントに不正アクセス</b></div>
<div class="rx-g g2"><div class="t">08-08</div><b>盗まれたトークンで照会が始まる</b></div>
<div class="rx-g g3"><div class="t">08-18</div><b>照会が続いた最後の日</b></div>
<div class="rx-g g4"><div class="t">08-20</div><b>Drift のトークンを失効・連携を撤去</b></div>
</div>
</figure>

検知と失効は働いた。調査で、どの記録が照会されたかがたどられ、トークンの失効で以後の照会は止まった。ただ、それは照会の後で、トークンが有効なあいだ、照会は正規の連携のアクセスとして通った。同じように、同意済みの連携や OAuth トークンが入口になった事案に、[Vercel/Context.ai](https://lemma.frame00.com/ja/critical/briefs/059-vercel-contextai-oauth/)（AI ツールへの「全許可」の OAuth が入口）と [ConnectWise](https://lemma.frame00.com/ja/critical/briefs/069-connectwise-cloud-backup-app-identity-credential-abuse/)（ベンダーのアプリ資格情報で顧客テナントにサインイン）があり、失効の遅れでは [Google API キー](https://lemma.frame00.com/ja/critical/briefs/006-google-api-key-revocation-lag/)（削除の後も有効だった）とつながる。

## 4. Lemma でできること

**Lemma は、03 の照合を、連携アプリからの照会を受け付ける側に組み込む。** 侵入を見つけるのではなく、連携アプリの照会が、導入のときに許した種類に入るか、トークンがいまも有効かを、実行する前に照合する。

### 注意したい業界・業務

- **業界 · 調達・サプライチェーン**: チャット・営業支援などの SaaS を、Salesforce などの CRM に連携させている組織。同じ連携を入れた多くの組織が、ベンダー側の侵害ひとつで同時に影響を受けうる。
- **業務 · 照会・参照**: 連携アプリに、CRM の記録を読ませる業務。今回の照会は、利用者ではなく、連携のトークンから行われた。

### いまの対策と Lemma の違い

今回の経路は、失効の前の、有効なトークンでの照会（1 列目と 2 列目）である。3 列目は今回の経路ではない（照会は 8 月 18 日まで、失効は 8 月 20 日）。

| 対策 | 有効なトークンでの、連携の用途の範囲の照会 | 有効なトークンでの、連携の用途を超える照会 | 失効させたトークンでの照会 |
| --- | --- | --- | --- |
| 利用者の多要素認証（MFA） | 関係しない | 関係しない | 関係しない |
| 連携に与えた OAuth の範囲の棚卸し・絞り込み | 効かない | 一部 | 関係しない |
| 照会の記録の監視・事後の解析 | 一部 | 一部 | 一部 |
| トークンの失効・連携の撤去 | 一部 | 一部 | 効く |
| **Lemma（実行の前の照合）** | 効かない | 効く | 効く |

多要素認証は、照会がトークンで行われ、利用者のログインを経ないので、この経路に関係しない。範囲の棚卸しは、連携が持つ権限の広さを絞れるが、絞った範囲の中の照会は、トークンを持つ者なら誰が実行しても通る。記録の監視と解析は、どの記録が照会されたかをたどれるが、気づくのは照会の後になる。失効は以後の照会を止めるが、失効までの照会は止めず、持ち出された記録や認証情報は戻らない。Lemma は、連携の用途を超える照会と、失効したトークンでの照会を、実行の前に照合して止める。

注：Lemma の照合が働くのは、連携アプリに許す照会を種類で決め、CRM が連携からの照会を受け付ける処理に照合を組み込み、トークンの有効性を照会の時点で確認できる場合に限る。決めた範囲の中の照会が悪用された場合は、通ってしまう。許す範囲の決め方が緩ければ、緩いまま通る。Lemma は、CRM に残った認証情報を消したり入れ替えたりはしない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

CRM に連携させたアプリについて、組織で確認する 3 項目

- 連携アプリごとに与えた OAuth の範囲を定期的に見直し、使っていない連携を外しているか。
- サポートの Case などに認証情報を貼り付けない決まりがあり、貼られたものを見つけて無効にする手順があるか。
- 連携先のベンダーが侵害を公表したとき、その連携のトークンを失効させ、CRM に残っていた認証情報を入れ替える手順と担当が決まっているか。

## 5. 事実と時系列

- **対象**: Salesloft の Drift（チャットボットの連携）と、Drift を Salesforce に接続していた顧客の組織。攻撃者は、Drift が保持する OAuth トークンで各社の Salesforce を照会した。
- **攻撃主体**: UNC6395（Google Threat Intelligence Group〔GTIG〕／Mandiant の追跡名）。GTIG は、2025 年 6 月の別の Salesforce 関連の攻撃に結びつく ShinyHunters（UNC6040）とは区別している。
- **規模**: GTIG は、700 超の組織が影響を受けた可能性を指摘した。ShinyHunters を名乗る恐喝グループは、侵害した Drift の OAuth トークンで 760 社から 15 億レコードを盗んだと主張している（恐喝上の主張で、独立に確認されていない）。
- **標的データ**: Account・User・Opportunity に加え、Case 本文に埋め込まれた秘密情報（AWS アクセスキー、Snowflake トークン、VPN 認証情報、パスワード）。顧客の連絡先・Case 本文・アカウントの記録も持ち出された。
- **侵入の経路**: 2025 年 3〜6 月に Salesloft の GitHub アカウントが不正アクセスを受け、その後 Drift の AWS 環境から、顧客連携用の OAuth トークンが取得された（The Hacker News の報道）。

### 時系列

- **2025-03〜06**: UNC6395 が Salesloft の GitHub アカウントに不正アクセス（リポジトリの取得・ゲストユーザーの追加・ワークフローの設定）。さらに Drift の AWS 環境に到達し、顧客連携用の OAuth トークンを取得した。
- **2025-08-08**: UNC6395 が、盗んだ Drift の OAuth トークンで、各社の Salesforce 環境の照会を始めた（18 日まで）。Case などから秘密情報を探索した。
- **2025-08-20**: Salesloft が Salesforce と連携して有効な Drift トークンを失効させ、Drift 連携を Salesforce マーケットプレイスから撤去。Drift を一時オフラインにした。
- **その後**: GTIG / Mandiant が UNC6395 として公表。影響を受けた組織の特定と、流出した可能性のある認証情報の入れ替えが進んだ。

> 影響を受けた組織の数は、GTIG の「700 超が影響を受けた可能性」に拠る。「760 社・15 億レコード」は ShinyHunters を名乗る側の恐喝上の主張で、独立に確認されていない。攻撃主体の名前（UNC6395）と、UNC6040 との区別は GTIG / Mandiant の見立てである。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Salesloft / Salesforce**: Salesloft は 8 月 20 日に有効な Drift トークンを失効させ、Drift 連携を Salesforce マーケットプレイスから撤去し、Drift を一時オフラインにした。
- **GTIG / Mandiant**: UNC6395 として調査し、公表した。
- **OAuth 連携の棚卸し**: 信頼された SaaS 連携に与えた OAuth の範囲を棚卸しし、広く永続する付与を、操作ごとに範囲を絞った、失効できる認可へ移すことが推奨されている。
- **CRM の中の秘密情報**: サポートの Case などに秘密情報を貼り付けない運用と、その検知、保管された認証情報の出どころと有効期限の管理が論点になった。

## 6. Sources

- **Google Cloud / GTIG（一次・調査）**: "Data Theft from Salesforce Instances via Salesloft Drift"（UNC6395、OAuth トークン窃取・影響範囲）— <https://cloud.google.com/blog/topics/threat-intelligence/data-theft-salesforce-instances-via-salesloft-drift>
- **The Hacker News**: "GitHub Account Compromise Led to Salesloft Drift Breach"（2025-09、根本原因＝GitHub 侵害）— <https://thehackernews.com/2025/09/github-account-compromise-led-to.html>
- **The Hacker News**: "Salesloft Takes Drift Offline After OAuth Token Theft Hits Hundreds of Organizations"（2025-09）— <https://thehackernews.com/2025/09/salesloft-takes-drift-offline-after.html>
- **AppOmni**: "Salesloft Drift–Salesforce Breach (UNC6395): Why Salesforce OAuth Integrations are a Growing Risk" — <https://appomni.com/blog/drift-breach-salesforce-unc6395-saas-prevention/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
