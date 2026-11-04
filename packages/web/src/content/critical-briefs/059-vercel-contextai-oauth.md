---
brief_no: 59
title: "Vercel：従業員が AI ツール Context.ai に渡した OAuth が、ベンダーの侵害を経て社内への入口になった(Vercel 開示)"
title_en: "Vercel: An employee's OAuth grant to the AI tool Context.ai became a way into internal systems after the vendor was breached (Vercel disclosure)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "attribute-proof-bypass"]
incident_date: 2026-04-19
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["064-salesloft-drift-oauth-salesforce", "029-github-dev-oauth-token", "033-f5-bigip-edge-pivot", "047-openclaw-agent-phishing", "006-google-api-key-revocation-lag"]
status: published
layout: "report"
sections: "proof"
gate: "permission-change"
version: "1.0"
og_lead_ja: "Vercel：従業員が AI ツール Context.ai に「すべて許可」で渡した OAuth が、Context.ai の侵害を経て社内システムへの入口になったと開示"
og_lead_en: "Vercel: an employee's \"Allow all\" OAuth grant to the AI tool Context.ai became a way into internal systems after Context.ai was breached, Vercel disclosed"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン攻撃"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "AI ツールに渡した\nOAuth が、ベンダーの\n侵害を経て入口に。\n<accent>Vercel が 4 月に開示</accent>"
og_headline_en: "An OAuth grant to\nan AI tool became\na way in via its vendor.\n<accent>Vercel disclosed it.</accent>"
key_figures:
  - value: "02 → 04-19"
    label: "Context.ai の従業員が infostealer に感染してから（Hudson Rock）、Vercel が公表するまで（2026 年）"
  - value: "1 か月以上"
    label: "Hudson Rock が、公表より前に、感染した従業員の認証情報を自社のフィードで特定していた期間"
  - value: "40 以上"
    unit: "ツール"
    label: "Context.ai が OAuth・API で接続する企業ツールの数"
glossary:
  - term: "OAuth トークン"
    desc: "利用者に代わって、アプリが別のサービスへ接続するための通行証。有効なあいだは、パスワードを入れ直さなくても、付与された権限で操作できる。"
  - term: "infostealer"
    desc: "感染した端末から、保存された認証情報やセッションを抜き取るマルウェア。今回は Lumma Stealer（Hudson Rock）。"
  - term: "sensitive 環境変数"
    desc: "Vercel で、値を画面から取り出せないよう暗号化する指定。指定は任意で、指定しない値は読み取れる形で保存される。"
insight:
  slug: "standing-ai-tool-oauth"
  label: "同意済みの OAuth だけで通るアクセス"
  quote: "AI ツールに一度広く許した OAuth は、トークンが有効なかぎり、誰が使っても、許した本人のアクセスとして届く。"
industries: ["ai", "developers"]
operations: ["account-admin"]
controls:
  - slug: "verify-entry"
    item: "操作の前に、その認可が現に有効かを確認する"
  - slug: "limit-and-revoke"
    item: "OAuth の許可は操作の範囲に絞り、失効したトークンが通らないようにする"
attack_method: "supply-chain"
impact: "社内システムと、一部の顧客の認証情報に不正アクセス（Vercel の開示）"
takeaway: "AI ツールに渡した OAuth のトークンでのアクセスが、許した範囲の操作かを実行の前に照合する層が働かず、アクセスは正規のものとして通った。"
search_title: "Vercel／Context.ai の OAuth 侵害と対策"
search_description: "Vercel は、従業員が AI ツール Context.ai に渡した OAuth が、Context.ai の侵害を経て社内への入口になったと開示した。何が通ったか、何を照合するか、対策を整理。"
self_check: "従業員が AI ツールに個別に許した OAuth の範囲を、組織で把握しているか。"
countries: ["us"]
---

## 1. 要点

攻撃者は、Vercel の従業員のパスワードではなく、従業員が AI ツールに企業の Google Workspace を「すべて許可」で接続したときの OAuth を使った。トークンは AI ツールのベンダーの側から手に入れられ、従業員の Workspace の ID を経て、Vercel の社内システムとプロジェクトの環境変数の画面に届いた（Vercel の開示と CSA の分析）。<strong>AI ツールに一度広く許した OAuth は、トークンが有効なかぎり、誰が使っても、許した本人のアクセスとして届く。</strong>

## 2. 通った操作

- **通った操作**: 侵害されたトークンでの、Vercel の従業員の Google Workspace を経た社内システムへのアクセスと、「sensitive」に指定されていない環境変数（API 鍵・DB の認証情報など）の読み取り（2026 年 4 月）。到達はチームの範囲ごとで、プラットフォーム全体の一括の露出ではない（Vercel）。
- **通らなかったもの**: 「sensitive」に指定された環境変数。画面からの取得を防ぐ暗号化がかかっており、Vercel はそれらへのアクセスの証拠は無いとしている。
- **受け付けた側に届くもの**: 一般に、同意済みの OAuth トークンでのアクセスは、パスワードの入力を経ない、利用者に代わる正規のアクセスとして届く。トークンを使っているのが AI ツールか、トークンを手に入れた別の主体かは、受け付けた時点では区別がつかない。
- **公表されていないこと**: Context.ai の中での感染の経路とトークンの掌握の詳しい経緯。BreachForums での「内部 DB・API 鍵・ソースコードを含む」という主張の真偽と全体の範囲（Vercel は調査中で、独立に確認していない）。

## 3. 実行前の照合

経路を問わず区別できる条件は、AI ツールからのアクセスを受け付ける側が、その操作が許した種類の操作か、トークンがいまも有効かを、実行する前に、トークンを持っていることとは別に照合することである。

- **誰が承認を出すか**: AI ツールに企業の ID をつなぐことを許す組織の管理者。つなぐときに、AI ツールに許す操作を種類で決める。ツールの機能に要るメールや文書の読み取りは可、社内システムの設定や秘密の値の読み出しは不可、のように。同意画面で「すべて許可」を押した広さだけでは、この区別はつかない。
- **どこで照合するか**: Workspace や社内システムが、AI ツールのトークンからの操作を受け付ける処理。決めた種類に入るか、トークンが失効していないかを照合し、入らなければ通さない。
- **何が残るか**: どのトークンが、どの許可で、どの操作をしたかの記録。止めた操作と通した操作を、AI ツールとは別の場所に、後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝AI ツールのトークンからの操作を実行する前に、許した種類の操作か、トークンが有効かを照合し、記録に残すこと。検知＝漏えいした認証情報や侵害を後から見つけ、トークンを失効させ、値を入れ替えること。下の日付は、Vercel・Hudson Rock・CSA の公表と分析にある月日である。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>実行の前に、許した種類の操作か、トークンが有効かを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>社内システムと一部の顧客の認証情報に不正アクセス（Vercel）<br>「sensitive」でない環境変数が読まれた</span></div>
<div class="rx-zone det"><b>検知 · 特定と失効</b>漏えいした認証情報を特定し、トークンを失効させ、値を入れ替える</div>
<div class="rx-g g1"><div class="t">02</div><b>Context.ai の従業員が infostealer に感染</b></div>
<div class="rx-g g2"><div class="t">03</div><b>Context.ai の AWS 環境に不正アクセス</b></div>
<div class="rx-g g3"><div class="t">04</div><b>トークンで Vercel の社内へ</b></div>
<div class="rx-g g4"><div class="t">04-19</div><b>Vercel が公表</b></div>
</div>
</figure>

検知の材料はあった。Hudson Rock は、公表の 1 か月以上前に、感染した従業員の認証情報を自社のフィードで特定していた。ただ、それをトークンの失効につなぐのは後の対応で、トークンが有効なあいだ、アクセスは付与済みの広い範囲の内側の正規のアクセスとして通った。同じように、同意済みの連携の OAuth トークンが入口になった事案に [Salesloft Drift](https://lemma.frame00.com/ja/critical/briefs/064-salesloft-drift-oauth-salesforce/)（連携アプリのトークンで各社の Salesforce を照会）と [github.dev](https://lemma.frame00.com/ja/critical/briefs/029-github-dev-oauth-token/)（範囲の広すぎる OAuth トークンの窃取）があり、保存された認証情報での横展開では [F5 BIG-IP](https://lemma.frame00.com/ja/critical/briefs/033-f5-bigip-edge-pivot/)、失効の遅れでは [Google API キー](https://lemma.frame00.com/ja/critical/briefs/006-google-api-key-revocation-lag/)（削除の後も有効だった）とつながる。

## 4. Lemma でできること

**Lemma は、実行前の照合を、AI ツールのトークンからの操作を受け付ける側に組み込む。** 侵入を見つけるのではなく、AI ツールの操作が、つなぐときに許した種類に入るか、トークンがいまも有効かを、実行する前に照合する。

### 注意したい業界・業務

- **業界 · AI導入（業種横断）**: メール・文書・社内の知識を横断して読み書きする AI ツールを、企業の ID につないでいる組織。ツールの機能が広い OAuth の範囲を求めるので、ベンダー側の侵害ひとつで、つないだ組織の ID にまで届きうる。調達の評価が細かくても、同意画面は日々の導入の一手として通りやすい。
- **業界 · 開発者・エージェント運用**: デプロイの環境に、API 鍵や DB の認証情報を環境変数として置いている開発の組織。プロジェクトの権限を得た者に、読み取れる形の値が読まれる。
- **業務 · アカウント・権限の管理**: 従業員が IT の管理の外で、第三者の OAuth アプリに企業の ID への広い権限を与える場面。

### いまの対策と Lemma の違い

今回の経路は、付与済みの広い範囲の中で、有効なトークンで社内システムと環境変数に届いたアクセスである（AI ツールの用途を超える操作なので、主に 2 列目）。3 列目の、失効させたトークンでの操作は、今回の公表には出てこない。

| 対策 | 有効なトークンでの、AI ツールの用途の範囲の操作 | 有効なトークンでの、AI ツールの用途を超える操作（社内システム・秘密の値） | 失効させたトークンでの操作 |
| --- | --- | --- | --- |
| 従業員の多要素認証（MFA） | 関係しない | 関係しない | 関係しない |
| 第三者 OAuth アプリの棚卸し・範囲の絞り込み | 効かない | 一部 | 関係しない |
| 環境変数の「sensitive」指定 | 一部 | 一部 | 一部 |
| 漏えいした認証情報の特定と、トークンの失効 | 一部 | 一部 | 効く |
| **Lemma（実行の前の照合）** | 効かない | 効く | 効く |

多要素認証は、トークンでの操作がパスワードの入力を経ないので、この経路に関係しない。棚卸しは、AI ツールが持つ権限の広さを絞れるが、絞った範囲の中の操作は、トークンを持つ者なら誰が実行しても通る。「sensitive」指定は、指定した値を画面から読めなくするが、指定は任意で、指定していない値は守らない。漏えいの特定と失効は、以後の操作を止めるが、失効までの操作は止めず、読まれた値は戻らない。Lemma は、AI ツールの用途を超える操作と、失効したトークンでの操作を、実行の前に照合して止める。

注：Lemma の照合が働くのは、AI ツールに許す操作を種類で決め、Workspace や社内システムがトークンからの操作を受け付ける処理に照合を組み込み、トークンの有効性を操作の時点で確認できる場合に限る。決めた種類の中の操作が悪用された場合は、通ってしまう。許す種類の決め方が緩ければ、緩いまま通る。Lemma は、環境変数の値を暗号化したり、入れ替えたり、消したりはしない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI ツールにつないだ企業の ID について、組織で確認する 3 項目

- AI ツールに与えた OAuth の範囲を定期的に見直し、広すぎる付与を必要な範囲で付け直しているか。
- デプロイの環境の API 鍵や DB の認証情報は、画面から読めない形で保管し、期限や範囲の限られた認証情報に置き換えているか。
- つないだ AI ツールのベンダーが侵害を公表したとき、そのトークンを失効させ、読まれた可能性のある値を入れ替える手順と担当が決まっているか。

## 5. 事実と時系列

- **開示**: 2026 年 4 月 19 日、Vercel が社内システムと、限られた顧客の認証情報への不正アクセスを開示した。CEO の Guillermo Rauch が、同じ日に X で攻撃の連鎖を説明した。
- **Context.ai**: 40 以上の企業ツールに OAuth・API で接続し、組織のデータを処理してコンテンツを作るエンタープライズ向けの AI 基盤。機能そのものが、企業の ID 基盤への広いアクセスを前提にする。
- **到達した範囲**: Vercel のプロジェクトの設定と、環境変数の管理の画面。攻撃者は「sensitive」に指定されていない（読み取れる形で保存された）環境変数にアクセスした。到達はチームの範囲ごとで、プラットフォーム全体の一括の露出ではない（Vercel）。
- **侵入の経路**: Context.ai の従業員の infostealer 感染で、Google Workspace などの認証情報と、Context.ai の OAuth アプリの管理環境への管理者のアクセスが盗まれた。攻撃者は Context.ai の AWS 環境と OAuth の認可基盤を押さえ、「すべて許可」で同意した利用者に代わって有効なトークンを作り、再び使える状態になった。Vercel の従業員が企業の Workspace を Context.ai に広い OAuth でつないでいたため、そのトークンで従業員の Workspace の ID を経て Vercel の社内に届いた（Vercel・CSA・Hudson Rock の公表と分析）。
- **攻撃者の主張**: ShinyHunters を名乗る者が、2026 年 4 月 19 日ごろ BreachForums に投稿し、内部 DB・API 鍵・GitHub/NPM のトークン・ソースコードなどを含むとして、データを 200 万ドルで売ると主張した。証拠として、約 580 名分の Vercel の従業員の記録（氏名・メール・アカウントの状態・活動の時刻）を示した。ShinyHunters は関与を否定している（模倣か分派の可能性があり、技術的な裏付けは無い）。
- **環境変数の保管**: Vercel の「sensitive」指定は、ビルドの実行のときだけ読める暗号化をかけるが、指定は任意で、既定では値は読み取れる形で保存される。

### 時系列

- **2026-02**: Context.ai の従業員が Lumma Stealer に感染した（Hudson Rock によれば、従業員が個人で Roblox 関連のスクリプト・ツールをダウンロードしたのが経路）。Google Workspace・Supabase・Datadog・Authkit などの認証情報と、Context.ai の OAuth アプリの管理環境への管理者のアクセスが盗まれた。
- **2026-03**: Context.ai の AWS 環境に不正アクセスがあった。Context.ai は後に、これと一部の利用者の OAuth トークンが侵害された可能性を開示した。
- **2026-04**: 攻撃者が侵害されたトークンで Vercel の従業員の Google Workspace を経て、社内の環境変数の管理の画面に届いた。
- **2026-04-19**: Vercel が公表した。ShinyHunters を名乗る者が BreachForums に投稿し、200 万ドルでの販売を主張した。

> 経路の三段（ベンダーの端末の感染、OAuth の認可基盤の掌握、Vercel の社内への横展開）は、Vercel・CSA・Hudson Rock の公表と分析に拠る。感染の経路（Roblox 関連のダウンロード）と、公表の 1 か月以上前の認証情報の特定は Hudson Rock の見立てである。BreachForums のデータの主張は攻撃者側のもので、Vercel は全体の範囲を独立に確認していない。Context.ai の中での感染とトークンの掌握の詳しい経緯は、調査の進み具合による。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Vercel**: 4 月 19 日に開示し、調査を続けている。顧客に、活動の記録の確認、秘密の値の「sensitive」指定への移行、「sensitive」でない値の入れ替えを勧めた。本番・プレビュー環境の新しい変数を既定で「sensitive」にするチームの方針を用意した。
- **AI SaaS の OAuth の棚卸し**: Google Workspace の管理コンソールで、第三者 OAuth アプリへの広い範囲の付与を棚卸しし、IT の管理の外で従業員が個別に許したアプリを優先して見直すことが勧められている。広い付与は、失効させ、必要な範囲で付け直す対象になる。
- **認証情報の運用**: デプロイの環境の長く有効な静的な秘密の値を、AWS IAM ロール・GitHub OIDC の連携・実行時に取りに行くシークレットマネージャなど、時間と範囲の限られた認証情報に置き換える方向が示されている。
- **業界横断の論点**: infostealer 感染 → OAuth トークンの侵害 → 下流の顧客への横展開という、くり返し起こりうる型の一例とされ（2024 年の Snowflake のキャンペーンと同じ形）、AI の生産性ツールの広く長いアクセスを、従来のクラウド事業者と同じリスクの区分で扱うべきかが論点になっている。

## 6. Sources

- **Cloud Security Alliance（一次・分析）**: "AI SaaS as Enterprise Attack Vector: The Vercel–Context.ai Breach"（2026-04-20）— <https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-saas-supply-chain-vercel-contextai-2026/>
- **Vercel（一次・当事者）**: "Vercel April 2026 security incident"（Vercel Knowledge Base、2026-04-19）— <https://vercel.com/kb/bulletin/vercel-april-2026-security-incident>
- **The Hacker News**: "Vercel Breach Tied to Context AI Hack Exposes Limited Customer Credentials"（2026-04-20）— <https://thehackernews.com/2026/04/vercel-breach-tied-to-context-ai-hack.html>
- **BleepingComputer**: "Vercel confirms breach as hackers claim to be selling stolen data"（2026-04）— <https://www.bleepingcomputer.com/news/security/vercel-confirms-breach-as-hackers-claim-to-be-selling-stolen-data/>
- **InfoStealers.com（Hudson Rock）**: "Breaking: Vercel Breach Linked to Infostealer Infection at Context.ai"（2026-04）— <https://www.infostealers.com/article/breaking-vercel-breach-linked-to-infostealer-infection-at-context-ai/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
