---
brief_no: 109
title: "ServiceNow AI Platform：ログイン前に届くページの入力がサンドボックスを抜けてコード実行に至り、詳細の公開から 3 日で悪用の試行が観測された(CVE-2026-6875) — 入口がどこであれ、管理者の作成のような操作を、実行の前に誰に許されたかで確かめる層が無い"
title_en: "ServiceNow AI Platform: input to a page reachable before login escaped the sandbox to code execution, and exploitation attempts were seen three days after details went public (CVE-2026-6875) — No layer checks, before it runs, who authorised an action like creating an admin, whatever the entry point"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure"]
incident_date: 2026-07-17
published: 2026-07-24
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["046-servicenow-unauthenticated-api", "088-kestra-auth-filter-bypass-rce", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "2.0"
og_lead_ja: "ServiceNow CVE-2026-6875：ログイン前の 1 リクエストがサンドボックスを抜けてコード実行"
og_lead_en: "ServiceNow CVE-2026-6875: one request before login escapes the sandbox to code execution"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 脆弱性の悪用"
og_kicker_en: "CYBERATTACK · VULNERABILITY EXPLOIT"
og_headline_ja: "ログインの前に、\n管理者を作れる穴が\n業務基盤にあった。\n<accent>公開の 3 日後に悪用の試行</accent>"
og_headline_en: "A hole let anyone create an admin before logging in.\n<accent>Exploit attempts three days after disclosure.</accent>"
key_figures:
  - value: "9.5"
    unit: "CVSS 4.0"
    label: "深刻度（ServiceNow の採点・Critical）。ログインは要らない"
    tone: "alert"
  - value: "04-01 → 07-13"
    label: "発見者の報告から、アドバイザリの公開まで。クラウドには報告から 24 時間以内に緩和策"
  - value: "07-14 → 07-17"
    label: "発見者が詳細を公開してから、悪用の試行が観測されるまで"
glossary:
  - term: "サンドボックス"
    desc: "外から受け取ったコードを、できることを制限した環境で動かす仕組み。制限の外に出られると、システムの権限で何でもできる。"
  - term: "ログイン前の入口（pre-auth）"
    desc: "ログインしていない人でも届くページや API。ここに穴があると、誰でも攻撃を試せる。"
  - term: "MID Server"
    desc: "ServiceNow が社内ネットワークのサーバーとやり取りするために、利用企業の中に置く中継サーバー。"
insight:
  slug: "reachability-as-permission"
  label: "届けば実行できる"
  quote: "ログイン前の入口に入った値がサンドボックスを抜けると、その後の操作は、誰に許されたかを問われないまま正規の処理として通った。"
industries: ["ai"]
operations: ["account-admin"]
controls:
  - slug: "hold-unverified"
    item: "管理者の作成など権限を変える操作は、誰に許されたかを確かめるまで通さない"
  - slug: "audit-trail"
    item: "どの許可でどの操作をしたかを、基盤とは別に記録する"
impact: "未適用のインスタンスで、ログインなしにデータの読み出しと管理者の作成が可能"
takeaway: "ログイン前の入口から届いた操作でも、管理者の作成のような操作を、実行の前に誰に許されたかで確かめる手順が無かった。"
self_check: "業務基盤で、ログインせずに届く入口がどこにあるかを把握しているか。"
countries: ["global"]
---

> **改訂（v2.0 / 2026-10-21）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。ServiceNow のアドバイザリ（KB3137947）、発見者の研究、Defused の投稿で事実を取り直した。クラウドへの対処は「4 月から順次」ではなく報告から 24 時間以内の緩和策だったこと、発見者の詳細の公開は 7 月 14 日だったこと、アドバイザリの表現（「当社のインスタンスに対する悪用は把握していない」）と報道向けの声明を分けて書いた。v1.1（2026-09-01）では、Defused の初報の「公開 PoC とは別の経路」を同社の訂正に従って改めている。

## 1. TL;DR

ServiceNow AI Platform に、ログインせずに届くページ（`/assessment_thanks.do`）の入力を JavaScript として評価させ、サンドボックスを抜けて任意のコードを動かせる脆弱性 CVE-2026-6875（CVSS 4.0 で 9.5）があった。Searchlight Cyber が 4 月 1 日に報告し、ServiceNow は 24 時間以内にクラウドへ緩和策を入れ、7 月 13 日にアドバイザリを公開した。発見者が 14 日に詳細を公開すると、17 日には悪用の試行が観測された。

抜けたコードは、どのテーブルのデータも読み、管理者を作り、社内ネットワークに置かれた中継サーバー（MID Server）でコマンドを動かせる。どれも、基盤から見ればシステム自身の正規の処理として実行される。

実際の侵害は報告されていないが、詳細の公開から 3 日で、修正を当てていないインスタンスに向けた試行は始まった。効かなかったのは、どの入口から来たかに関係なく、管理者の作成のような権限を変える操作を、実行の前に誰に許されたかで確かめる層である。

## 2. 何が起きたか

- **対象**: ServiceNow AI Platform。企業の IT・人事・顧客対応などの業務を載せる基盤で、同社によれば Fortune 500 の 85% 超が使う。
- **脆弱性**: CVE-2026-6875。ログイン前に届くページ `/assessment_thanks.do` のパラメータが、データの検索条件として JavaScript のまま評価される。評価はサンドボックスの中で行われるが、別のスクリプトを読み込む仕組みを使うと制限の外に出られた。
- **深刻度**: CVSS 4.0 で 9.5（Critical、ServiceNow の採点）。攻撃の難しさは「高」と評価されている。
- **できること**: どのテーブルのデータも読める。管理者を作れる。社内ネットワークにある中継サーバー（MID Server）でコマンドを実行できる（発見者）。
- **修正**: クラウドのインスタンスには報告から 24 時間以内に緩和策が入った。7 月 13 日のアドバイザリで、各系列（Zurich、Yokohama、Australia、Brazil）の修正版を示した。修正版は、ログイン前の通信に「1 つの式しか実行させない」制限（Guarded Script）を直ちに効かせる。
- **悪用**: 7 月 17 日から試行が観測された。Defused は捕らえたペイロードが発見者の公開した検証用のものと同じだと述べている（当初の「別の経路」は 20 日に訂正）。実際の侵害は報告されておらず、CISA の悪用確認済み脆弱性カタログ（KEV）にも載っていない（2026-10-20 時点）。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">発見者が示した攻撃の流れ</span></div>
<p class="rx-ex-cap">入口の穴はパッチで塞ぐ。止めどころは ④ にもあり、権限を変える操作を実行の前に誰に許されたかで確かめれば、穴を抜けても全権にはならない。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">攻撃者</div><div class="no">1</div><b>ログイン前に届くページに、細工した値を送る</b><p><code>/assessment_thanks.do</code></p></div>
<div class="rx-step"><div class="who">基盤</div><div class="no">2</div><b>値を JavaScript として評価する</b><p>サンドボックスの中で。</p></div>
<div class="rx-step crit"><div class="who">攻撃者のコード</div><div class="no">3</div><b>別のスクリプトの読み込みを使い、サンドボックスの外に出る</b><p>制限の無い環境で動く。</p></div>
<div class="rx-step crit"><div class="who">攻撃者のコード</div><div class="no">4</div><b>データを読み、管理者を作り、MID Server でコマンドを動かす</b><p>正規の処理として実行される。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2026-04-01**: Searchlight Cyber が ServiceNow に報告。ServiceNow は 24 時間以内に、すべてのクラウドのインスタンスへ緩和策を入れた。
- **2026-07-13**: ServiceNow がアドバイザリ（KB3137947）を公開し、修正版を案内。「当社のインスタンスに対する悪用は、現時点で把握していない」。
- **2026-07-14**: Searchlight Cyber が技術的な詳細を公開。
- **2026-07-17**: 悪用の試行が観測され始める（報道）。
- **2026-07-18**: Defused が X で公表。発見者の公開した PoC とは別の経路だと述べた。
- **2026-07-20**: Defused が訂正し、捕らえたペイロードは公開されたものと同じだとした。ServiceNow は報道に、自社がホストするインスタンスに関わる証拠は観測していないと述べた。カナダのサイバーセキュリティセンターも、悪用の報告を注意喚起に追記した。

> 事実は ServiceNow のアドバイザリ、Searchlight Cyber の研究、Defused の投稿（いずれも一次）と報道に拠る。セルフホスト型の修正がいつ届いたかは、報道によって 6 月と 7 月 13 日で食い違う。2026 年 10 月の時点で、実際の侵害、KEV への登録、日本の公的機関の注意喚起は確認できない。

### 公表後の対応

- **SecurityWeek**: 観測された試行は、脆弱なシステムを探すセキュリティ業界の者による可能性もあると伝えた。
- **ServiceNow**: 修正版の Guarded Script は、ログイン前の通信には直ちに効き、ログイン後の通信にはクラウドで約 4 週間かけて広げる。セルフホスト型では、管理者が段階を手で進める。

## 4. なぜ止まらなかったか

この事案の失敗は、利用企業の不注意でも、パッチの遅れだけでもない。ログイン前の入口に入った値がサンドボックスを抜けると、データの読み出しも管理者の作成も、誰に許されたかを問われないまま、基盤の正規の処理として通る作りだった。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">証明は操作が実行される前に働き、検出は試行や異常が表に出た後に働く。その間、入口を抜けたコードの操作は正規の処理として扱われる。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回なし</b>権限を変える操作を、実行の前に誰に許されたかで確かめる</div>
<div class="rx-zone gapz"><b>落差</b><span>未適用なら管理者が作られる。<br>公開から試行まで 3 日</span></div>
<div class="rx-zone det"><b>検出の層 · 気づいた</b>試行を観測し、修正版を当てる</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>入口に細工した値が届く</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>管理者の作成が通る</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>試行に気づく</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>修正版を当てる</b></div>
</div>
</figure>

検出は働いた。ServiceNow は報告から 24 時間でクラウドに緩和策を入れ、Defused は詳細の公開から 3 日で試行を捕らえている。ただ、パッチは見つかった入口を塞ぐもので、「入口に届いた」と「この操作が許されている」は別々の事実なのに、この基盤では前者が後者を兼ねていた。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[ServiceNow の未認証 API](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/)（設定一つで認証が外れ、顧客インスタンスのデータが照会された）にも現れている。

## 5. 対策するには

**入口の穴は塞ぎ、抜けた後の操作は権限で止める。** 修正版を当て、ログイン前に届く入口を減らす。そのうえで、管理者の作成や社内のサーバーでのコマンドのように権限を変える操作は、どの入口から来たかに関係なく、実行の前に誰に許された操作かを確かめる。次の穴が見つかっても、全権には届かない。

### 注意したい業界・業務

- **業界 · AI導入（業種横断）**: IT・人事・顧客対応の業務を、ServiceNow のような業務基盤に載せている組織。基盤には業務データと、社内システムへの接続が集まる。
- **業務 · アカウント・権限の管理**: 管理者アカウントの作成と、基盤から社内のサーバーへの接続。今回はどちらも、ログイン前の 1 リクエストから届きうる。

### いまの対策で埋まるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 修正版の適用 | 一部 | 見つかった入口は塞がる。適用までの間と、次に見つかる入口には効かない。 |
| ログインと多要素認証（MFA） | 関係しない | 入口はログインの前にあった。 |
| サンドボックス | 効かない | 制限の外に出る方法があった。 |
| 管理者の作成や接続の監視 | 一部 | 気づくことはできるが、作られた後になる。 |

### 必要になるもの

1. **修正版を当て、ログイン前に届く入口を減らす。** セルフホスト型では、Guarded Script の段階も自分で進める。使っていない公開ページやゲストの通信は止める。
2. **権限を変える操作は、入口と関係なく、実行の前に確かめる。** 管理者の作成、ロールの付与、社内のサーバーでのコマンドは、誰がどの許可で行うのかを照合し、照合できなければ通さない。
3. **どの許可でどの操作をしたかを、基盤とは別に残す。** 止めた操作と通した操作を、後から第三者に示せる形、つまり証明として残す。

### 点検チェックリスト

業務基盤（クラウド・自社運用）について、組織で確かめる 3 項目

- ログインせずに届く入口のうち、使っていないものを閉じているか。
- 新しい管理者アカウントが作られたとき、誰に知らせが届くか。
- 重大な脆弱性が公表されたとき、何日以内に修正版を当てるかが決まっているか。

注：入口を抜けたコードが、許可を照合する仕組みそのものを書き換えられる位置で動けば、この確認も破られうる。照合を基盤の外に置くほど強くなるが、正規の管理作業にも手間が増える。

## 6. Sources

- **ServiceNow（一次・ベンダーのアドバイザリ）**: 「CVE-2026-6875 - Sandbox Escape in ServiceNow AI Platform」（2026-07-13） — <https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB3137947>
- **Searchlight Cyber（一次・発見者の研究）**: 「Smashing the ServiceNow Sandbox: Pre-Authentication RCE」（2026-07-14） — <https://slcyber.io/research-center/smashing-the-servicenow-sandbox-pre-authentication-rce/>
- **Defused（一次・X の投稿）**: 悪用の試行の観測（2026-07-18） — <https://x.com/DefusedCyber/status/2078418391321219448>
- **Defused（一次・X の投稿）**: ペイロードが公開 PoC と同じだったとする訂正（2026-07-20） — <https://x.com/DefusedCyber/status/2079231498109235248>
- **NVD（一次・脆弱性データベース）**: CVE-2026-6875（2026-07-13） — <https://nvd.nist.gov/vuln/detail/CVE-2026-6875>
- **カナダ サイバーセキュリティセンター（一次・注意喚起）**: 「ServiceNow security advisory (AV26-693)」（2026-07-14） — 07-20 更新 · <https://cyber.gc.ca/en/alerts-advisories/servicenow-security-advisory-av26-693>
- **BleepingComputer（報道）**: 「Critical ServiceNow code execution flaw now exploited in attacks」（2026-07-20） — <https://www.bleepingcomputer.com/news/security/critical-servicenow-code-execution-flaw-now-exploited-in-attacks/>
- **Help Net Security（報道）**: 「ServiceNow pre-auth RCE exploited in the wild (CVE-2026-6875)」（2026-07-20） — <https://www.helpnetsecurity.com/2026/07/20/servicenow-cve-2026-6875-exploited/>
- **SecurityWeek（報道）**: 「Exploitation of ServiceNow Vulnerability Seen Days After Disclosure」（2026-07-21） — <https://www.securityweek.com/exploitation-of-servicenow-vulnerability-seen-days-after-disclosure/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)
