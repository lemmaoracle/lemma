---
brief_no: 138
title: "ServiceNow AI Platform で、未認証の 1 リクエストがコード実行・権限昇格・SQL 注入に届く脆弱性が 4 件開示された — 3 度目の開示でも、行動の前に認可を確かめる層が無い"
title_en: "Four unauthenticated flaws reaching code execution, privilege escalation, and SQL injection were disclosed in ServiceNow AI Platform — a third disclosure, still with no layer that checks authorization before the action"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth]
incident_date: 2026-08-27
published: 2026-09-01
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["046-servicenow-unauthenticated-api", "109-servicenow-ai-platform-preauth-rce"]
status: published
version: "1.0"
og_lead_ja: "ServiceNow AI Platform、未認証で届く脆弱性が 4 件同時開示"
og_lead_en: "ServiceNow AI Platform: four unauthenticated flaws disclosed at once"
---

## 1. TL;DR

ServiceNow は 2026 年 8 月 27 日、AI Platform の未認証で悪用可能な脆弱性 4 件を一括公表した。GraphQL API のコード注入・画像アップロード処理のアクセス制御不備・動的スキーマ経由の SQL 注入の 3 件を同社自身が CVSS 10.0 と採点し、残る 1 件のサンドボックス脱出を 8.7 としている。10.0 の 3 件は認証も利用者の操作も要らない。検出と修正は速かった。**効かなかったのは、未認証のリクエストがコード実行やデータ変更に届く前に、その認可を独立に確かめる層である。**

## 2. 何が起きたか

- ServiceNow は AI Platform（旧 Now Platform）の複数リリースに影響する脆弱性 4 件を、2026 年 8 月 27 日付のセキュリティ速報（KB3152242）で CVE-2026-18885・CVE-2026-18886・CVE-2026-74820・CVE-2026-6876 として一括開示した。
- CVSS 10.0 の 3 件は認証も利用者の操作も必要とせず、ネットワーク越しに到達可能である。8.7 の 1 件は説明文では「未認証の利用者が任意コードを実行しうる」とされる一方、ServiceNow が同じ脆弱性に付けたベクタは `PR:L`（低い権限が必要）であり、記述とベクタが食い違っている。
- 10.0 の 3 件は共通のベクタ `CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H` を持つ。ネットワーク到達・低い攻撃複雑度・権限不要・利用者操作不要で、脆弱なコンポーネントとその先の接続先の双方に高い影響が及ぶという評価である。8.7 のサンドボックス脱出はこれと 2 点で異なる。権限が `PR:L` であることと、コンポーネントの外への影響が記録されていない（`SC:N/SI:N/SA:N`）ことである。
- ServiceNow はホスト型インスタンスに修正を適用済みで、自己ホスト型・パートナー向けには Xanadu・Yokohama・Zurich・Australia の各リリース系列でホットフィックスを提供した。
- CVSS を付けているのは ServiceNow 自身である。同社は自社製品の CNA（CVE 採番機関）である。NIST は 2026 年 4 月 15 日以降、CISA の KEV カタログ掲載・連邦政府調達ソフトウェア・大統領令 14028 の重要指定に当たるものを優先してエンリッチし、該当しないものは最低優先として即時のエンリッチ対象から外している。本 Brief に出る数値は、いずれも第三者の独立採点ではない。

攻撃は次の連鎖で成立しうる。

1. 攻撃者が認証済みセッションを持たないまま、GraphQL Composite Data API へ細工したリクエストを送る（CVE-2026-18885、ServiceNow 採点 10.0）。入力の取り扱いが不十分なため、注入したコードがインスタンス上でそのまま実行され、インスタンスデータへの到達・改変に至る。
2. 並行して、システム設定の画像アップロード処理は権限チェックが不適切なため、未認証の利用者でもインスタンスデータの作成・変更に届き、権限昇格に至りうる（CVE-2026-18886、同 10.0）。
3. 動的に組み立てられるスキーマの ORDER BY 句に利用者由来の入力がサニタイズなしで組み込まれており、HTTP(S) 経由で背後のデータベースに対する SQL 注入が成立する（CVE-2026-74820、同 10.0）。
4. 別経路では、サンドボックスの境界を越えられる欠陥がコード実行につながる（CVE-2026-6876、同 8.7）。ServiceNow の説明文は未認証で到達しうるとするが、ベクタは低い権限を要求しており、前提が一致しない。

## 3. 時系列 — 公表と対応

- 2026-04-01：Searchlight Cyber が、同じプラットフォームの未認証サンドボックス脱出 CVE-2026-6875 を ServiceNow に報告。
- 2026-07-13：ServiceNow が CVE-2026-6875 の速報を公開（ServiceNow 採点 9.5。攻撃複雑度だけが今回の 3 件と異なり「高」）。
- 2026-07（速報の数日後）：脅威インテリジェンス企業 Defused が CVE-2026-6875 の実地悪用を観測したと表明。**同社はのちに訂正し、捕捉したペイロードは Searchlight Cyber の公開 PoC と一致すると述べた。**
- 2026-08-27：ServiceNow が KB3152242 で今回の 4 件を一括公表し、ホットフィックスを配布。

> 本 Brief の時系列は ServiceNow 公式速報（KB3152242）を一次とし、技術的な原因説明は同速報および独立解析（IONIX）の記述に基づく。CVSS は前述のとおり ServiceNow 自身の採点であり、NVD による独立採点は付いていない。悪用の有無についての「現時点で確認していない」は ServiceNow 自身の表明であり、第三者による独立確認は本稿執筆時点で得られていない。The Hacker News は 2026 年 8 月 28 日時点で、10.0 の 3 件について公開された exploit コードを確認できなかったと報じている。

公表後の対応と業界の動きは次のとおり。

- ServiceNow はホスト型顧客への修正適用を完了済みと説明し、自己ホスト型・パートナー向けにパッチ版を提示した。自己ホスト型では、適用の判断と作業が顧客側に残る。
- The Hacker News が翌日（2026-08-28）、SecurityWeek が数日後（2026-08-31）に技術詳細を報じ、いずれも 10.0 の 3 件が「認証も利用者操作もなしで到達可能」である点を指摘した。The Hacker News は、8.7 の 1 件について説明文とベクタが食い違うことも併せて指摘している。

## 4. なぜ止まらなかったか

この事案の失敗は、パッチ適用が遅れたことでも、個々の CVE の技術的な難度が高かったことでもない。**未認証のリクエストがコード実行やデータ変更に届く前に、そのリクエストの認可状態を独立に確かめる層が、プラットフォームの複数の入口——GraphQL API・画像アップロード処理・動的クエリ生成・サンドボックス境界——のいずれにも一貫して存在しなかった**ことにある。

検出は効いていた。4 件はいずれも公表の前に見つかり、勧告と同時にホットフィックスが用意され、ホスト型には適用まで終わっている（今回の 4 件について発見者は公表されていない）。効かなかったのはその手前——リクエストが「認証済みか」「意図した権限の範囲内か」を、機能ごとに個別実装するのではなく、プラットフォームの境界として一貫して確かめる仕組みである。入口が増えるたびに検証実装が一つずつ増える構造では、一つの実装漏れがそのまま未認証の到達になる。

同じ AI Platform では、[Brief 046](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/) で設定不備による未認証アクセスが、[Brief 109](https://lemma.frame00.com/ja/critical/briefs/109-servicenow-ai-platform-preauth-rce/) で未認証のサンドボックス脱出からのコード実行（CVE-2026-6875）が、それぞれ別の入口・別の CVE として確認されている。今回の 4 件は 3 度目の開示である。個々の脆弱性は独立した欠陥だが、繰り返し現れる形は同じである——新しい機能が追加されるたびに、その機能への到達を認可の外から確かめる層がなく、個別の入力検証とアクセス制御の実装漏れが積み上がっていく。

> 実地悪用が観測されたかどうかは、この構図とは別の問いである。7 月の CVE-2026-6875 について報じられた悪用観測はのちに訂正され、捕捉されたペイロードは公開 PoC と一致するとされた。悪用の証拠が無いことは、未認証で到達できる入口が繰り返し見つかっているという事実を弱めない。

## 5. 証明があれば、何が変わるか

事前証明は、機能を実行してよいかの判断を「その入口の検証実装が正しく書かれているか」ではなく、「このリクエストが認可を持つことを独立に確かめられたか」に置き換える。入口ごとの実装を正しく書き切ることを求めるのではなく、書き切れていなくても行動の前に確かめられる一段を挟む。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>行動前の認可証明</strong>：リクエストがインスタンスの機能（API・アップロード処理・クエリ生成）に到達する前に、その認可状態を独立に検証・証明する。</li>
<li><strong>境界としての一貫適用</strong>：その証明を機能ごとの実装に委ねず、プラットフォームの境界として一貫して適用する。入口が増えても確認の数は増えない。</li>
<li><strong>来歴の束縛</strong>：コード実行やデータ変更という行動の来歴を、その根拠となった認可の証明とひもづけて記録する。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>個々の CVE の脆弱性そのものを検出・修正することはしない。それはベンダーとセキュリティ研究者の仕事である。</li>
<li>ServiceNow 内部の実装詳細を代替・保証するものではない。この層はその後段で、実装漏れが残っていても未認証の到達が行動に変わらないようにする。</li>
<li>証明が示せるのは、そのリクエストが認可されているかまでである。認可された利用者による不適切な操作までは示せない。</li>
</ul>

事後のアクセスログとの違いはここにある。ログはリクエストが処理された後に残るが、そのリクエストを処理してよかったかを、行動の時点で判断する材料にはならない。

検出の層と、この層は代替ではなく補完の関係にある。前者は脆弱性を見つけて入口の数を減らし、後者は「認可が確かめられるまで、機能は動かない」ことを、次の入口が見つかる前に確かめられるようにする。

## 6. Sources

- **ServiceNow（一次・公式発表）**: "August 2026 CVE Advisory Notification"（KB3152242、2026-08-27）— <https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB3152242>
- **The Hacker News（独立報道）**: "Three CVSS 10.0 ServiceNow Flaws Could Let Unauthenticated Attackers Execute Code and SQL"（2026-08）— <https://thehackernews.com/2026/08/three-cvss-100-servicenow-flaws-could.html>
- **SecurityWeek（独立報道）**: "ServiceNow Patches 3 Critical Code Injection Vulnerabilities" — <https://www.securityweek.com/servicenow-patches-3-critical-code-injection-vulnerabilities/>
- **IONIX Threat Center（独立解析）**: CVE-2026-18885 — <https://www.ionix.io/threat-center/cve-2026-18885/> / CVE-2026-74820 — <https://www.ionix.io/threat-center/cve-2026-74820/>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。エージェント権限の証明は[Pillar 03 — エージェント権限](https://lemma.frame00.com/ja/pillars/#authority)。

CVSS はいずれも ServiceNow 自身が CNA として付けた値であり、NVD による独立採点は付いていません。悪用の有無は同社の表明に基づきます。
