---
brief_no: 109
title: "ServiceNow AI Platform：ログイン前に届くページの入力がサンドボックスを抜けてコード実行に至り、詳細の公開から 3 日で悪用の試行が観測された(CVE-2026-6875)"
title_en: "ServiceNow AI Platform: input to a page reachable before login escaped the sandbox to code execution, and exploitation attempts were seen three days after details went public (CVE-2026-6875)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure"]
incident_date: 2026-07-17
published: 2026-07-24
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["046-servicenow-unauthenticated-api", "088-kestra-auth-filter-bypass-rce", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "2.1"
og_lead_ja: "ServiceNow CVE-2026-6875：ログイン前の 1 リクエストがサンドボックスを抜けてコード実行"
og_lead_en: "ServiceNow CVE-2026-6875: one request before login escapes the sandbox to code execution"
layout: "report"
sections: "proof"
gate: "permission-change"
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
  quote: "入口に届いたことと、その操作が許されていることは別の事実で、届いたことが許可を兼ねる基盤では、入口の穴がそのまま全権になる。"
industries: ["ai"]
operations: ["account-admin"]
controls:
  - slug: "hold-unverified"
    item: "管理者の作成など権限を変える操作は、誰に許されたかを確認できるまで通さない"
  - slug: "audit-trail"
    item: "どの許可でどの操作をしたかを、基盤とは別に記録する"
impact: "未適用のインスタンスで、ログインなしにデータの読み出しと管理者の作成が可能"
takeaway: "ログイン前の入口から届いた操作でも、管理者の作成のような操作を、実行の前に誰に許されたかで照合する手順が無かった。"
self_check: "業務基盤で、ログインせずに届く入口がどこにあるかを把握しているか。"
countries: ["global"]
---

> **改訂（v2.1 / 2026-11-02）**: 章立てを「通った操作」から始まる並びに組み直し、題から「欠けている層」の後半を外した。事実と出典は変えていない。v2.0（2026-10-21）では、ServiceNow のアドバイザリ（KB3137947）などで事実を取り直し、クラウドへの対処は報告から 24 時間以内の緩和策だったこと、発見者の詳細の公開は 7 月 14 日だったことを改めた。v1.1（2026-09-01）では、Defused の初報の「公開 PoC とは別の経路」を同社の訂正に従って改めている。

## 1. 要点

ServiceNow のアドバイザリは「当社のインスタンスに対する悪用は、現時点で把握していない」とし、実際の侵害は報告されていない。それでも、詳細の公開から 3 日で、修正を当てていないインスタンスに向けた試行が始まった。入口を抜けたコードの操作は、基盤から見ればシステム自身の正規の処理として実行される。<strong>入口に届いたことと、その操作が許されていることは別の事実だが、届いたことが許可を兼ねる基盤では、入口の穴がそのまま全権になる。</strong>

## 2. 通った操作

- **通った操作**: ログイン前に届くページ `/assessment_thanks.do` のパラメータの評価と、そこから出たコードによる、データの読み出し・管理者の作成・MID Server でのコマンドの実行。値は検索条件として JavaScript のまま評価され、サンドボックスの中で動くはずが、別のスクリプトを読み込む仕組みで制限の外に出られた（発見者）。
- **受け付けた側に届くもの**: 一般に、サンドボックスを抜けたコードの操作は、基盤の正規の処理として届く。管理者の作成が、誰に許されたものかは、操作の側からは区別がつかない。
- **止まった操作**: クラウドのインスタンスには、報告から 24 時間以内に緩和策が入った（ServiceNow）。修正版は、ログイン前の通信に「1 つの式しか実行させない」制限（Guarded Script）を直ちに効かせる。
- **公表されていないこと**: 実際の侵害（報告されておらず、CISA の悪用確認済み脆弱性カタログ（KEV）にも載っていない・2026-10-20 時点）、セルフホスト型の修正がいつ届いたか（報道で 6 月と 7 月 13 日に食い違う）。

## 3. 実行前の照合

経路を問わず区別できる条件は、管理者の作成のような権限を変える操作を実行する側が、その操作がどの入口から来たかに関係なく、誰に許された操作かを、実行の前に照合することである。

- **誰が承認を出すか**: 基盤の管理者など、権限を決める担当者。管理者の作成、ロールの付与、社内のサーバーでのコマンドの実行を、誰に、どの範囲で許すかを、基盤の外で決めておく。
- **どこで照合するか**: 権限を変える操作を実行する手前の一か所。入口がログインの前でも後でも、同じ照合を通す。許可と一致しない操作は、実行せずに止める。
- **何が残るか**: どの許可で、誰が、どの操作をしたかの記録。基盤とは別に残し、後から第三者に示せる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝権限を変える操作を実行する前に、誰に許された操作かを照合し、記録に残すこと。検知＝試行や異常が表に出た後に気づくこと。下の日付は、ServiceNow・発見者・Defused が報告・公表した日で、悪用が可能になった日とは限らない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>権限を変える操作を、実行の前に誰に許されたかで照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>未適用の場合、ログインなしで<br>読み出しと管理者の作成が可能</span></div>
<div class="rx-zone det"><b>検知 · 働いた</b>試行を観測し、修正版を当てる</div>
<div class="rx-g g1"><div class="t">04-01</div><b>Searchlight Cyber が報告</b></div>
<div class="rx-g g2"><div class="t">07-13</div><b>アドバイザリを公開</b></div>
<div class="rx-g g3"><div class="t">07-14</div><b>発見者が詳細を公開</b></div>
<div class="rx-g g4"><div class="t">07-17</div><b>悪用の試行を観測</b></div>
</div>
</figure>

検知は働いた。入口の穴はパッチで塞がれたが、パッチは見つかった入口を塞ぐもので、次に見つかる入口には効かない。同じように、設定一つで認証が外れた事案に、[ServiceNow の未認証 API](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/)（顧客インスタンスのデータが照会された）がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、権限を変える操作を実行する側に組み込む。** 穴や侵入を見つけるのではなく、届いた操作が許可に基づくかを、入口と関係なく、実行の前に照合する。

### 注意したい業界・業務

- **業界 · AI導入（業種横断）**: IT・人事・顧客対応の業務を、ServiceNow のような業務基盤に載せている組織。基盤には業務データと、社内システムへの接続が集まる。
- **業務 · アカウント・権限の管理**: 管理者アカウントの作成と、基盤から社内のサーバーへの接続。今回はどちらも、ログイン前の 1 リクエストから届きうる。

### いまの対策と Lemma の違い

今回の経路は 1 列目（ログイン前の入口から届いた、権限を変える操作）である。2 列目は、許可を照合する仕組みそのものを書き換えられる位置で、コードが動く場合で、今回そうだったかは公表されていない。

| 対策 | ログイン前の入口から届いた、権限を変える操作 | 許可を照合する仕組みそのものの書き換え |
| --- | --- | --- |
| 修正版の適用 | 一部 | 関係しない |
| ログインと多要素認証（MFA） | 関係しない | 関係しない |
| サンドボックス | 効かない | 関係しない |
| 管理者の作成や接続の監視 | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 効かない |

修正版の適用は、見つかった入口は塞ぐが、適用までの間と、次に見つかる入口には効かない。ログインと多要素認証は、入口がログインの前にあったので、今回の経路には関係しない。サンドボックスは、制限の外に出る方法があった。管理者の作成や接続の監視は、気づくことはできるが、作られた後になる。Lemma は、入口と関係なく、権限を変える操作を、実行の前に、許された操作かで照合する。

注：Lemma の照合が働くのは、管理者の作成、ロールの付与、社内のサーバーでのコマンドの実行といった権限を変える操作を実行する手前に照合を組み込み、許可の記録が基盤とは別に管理されている場合に限る。入口を抜けたコードが、許可を照合する仕組みそのものを書き換えられる位置で動けば、この照合も破られうる。照合を基盤の外に置くほど強くなるが、正規の管理作業にも手間が増える。データの読み出しそのものは、この照合の対象ではない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

業務基盤（クラウド・自社運用）について、組織で確認する 3 項目

- ログインせずに届く入口のうち、使っていないものを閉じているか。
- 新しい管理者アカウントが作られたとき、誰に知らせが届くか。
- 重大な脆弱性が公表されたとき、何日以内に修正版を当てるかが決まっているか。

## 5. 事実と時系列

- **対象**: ServiceNow AI Platform。企業の IT・人事・顧客対応などの業務を載せる基盤で、同社によれば Fortune 500 の 85% 超が使う。
- **脆弱性**: CVE-2026-6875。ログイン前に届くページ `/assessment_thanks.do` のパラメータが、データの検索条件として JavaScript のまま評価される。評価はサンドボックスの中で行われるが、別のスクリプトを読み込む仕組みを使うと制限の外に出られた。
- **深刻度**: CVSS 4.0 で 9.5（Critical、ServiceNow の採点）。攻撃の難しさは「高」と評価されている。
- **できること**: どのテーブルのデータも読める。管理者を作れる。社内ネットワークにある中継サーバー（MID Server）でコマンドを実行できる（発見者）。
- **修正**: クラウドのインスタンスには報告から 24 時間以内に緩和策が入った。7 月 13 日のアドバイザリで、各系列（Zurich、Yokohama、Australia、Brazil）の修正版を示した。修正版は、ログイン前の通信に「1 つの式しか実行させない」制限（Guarded Script）を直ちに効かせる。
- **悪用**: 7 月 17 日から試行が観測された。Defused は捕らえたペイロードが発見者の公開した検証用のものと同じだと述べている（当初の「別の経路」は 20 日に訂正）。実際の侵害は報告されておらず、CISA の悪用確認済み脆弱性カタログ（KEV）にも載っていない（2026-10-20 時点）。

### 時系列

- **2026-04-01**: Searchlight Cyber が ServiceNow に報告。ServiceNow は 24 時間以内に、すべてのクラウドのインスタンスへ緩和策を入れた。
- **2026-07-13**: ServiceNow がアドバイザリ（KB3137947）を公開し、修正版を案内。「当社のインスタンスに対する悪用は、現時点で把握していない」。
- **2026-07-14**: Searchlight Cyber が技術的な詳細を公開。
- **2026-07-17**: 悪用の試行が観測され始める（報道）。
- **2026-07-18**: Defused が X で公表。発見者の公開した PoC とは別の経路だと述べた。
- **2026-07-20**: Defused が訂正し、捕らえたペイロードは公開されたものと同じだとした。ServiceNow は報道に、自社がホストするインスタンスに関わる証拠は観測していないと述べた。カナダのサイバーセキュリティセンターも、悪用の報告を注意喚起に追記した。

> 事実は ServiceNow のアドバイザリ、Searchlight Cyber の研究、Defused の投稿（いずれも一次）と報道に拠る。セルフホスト型の修正がいつ届いたかは、報道によって 6 月と 7 月 13 日で食い違う。2026 年 10 月の時点で、実際の侵害、KEV への登録、日本の公的機関の注意喚起は確認できない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **SecurityWeek**: 観測された試行は、脆弱なシステムを探すセキュリティ業界の者による可能性もあると伝えた。
- **ServiceNow**: 修正版の Guarded Script は、ログイン前の通信には直ちに効き、ログイン後の通信にはクラウドで約 4 週間かけて広げる。セルフホスト型では、管理者が段階を手で進める。

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
