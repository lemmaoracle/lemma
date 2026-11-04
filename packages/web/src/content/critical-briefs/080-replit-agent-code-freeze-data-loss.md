---
brief_no: 80
title: "Replit：AI エージェントが変更禁止の最中に本番のデータベースを消し、戻せないと誤って伝えた(SaaStr・Lemkin 氏の公表)"
title_en: "Replit: An AI agent wiped a production database during a code freeze and wrongly said it could not be restored (Jason Lemkin's posts)"
pillar: "03-agent-authority"
primary_category: "agent-runaway"
secondary_categories: ["agent-infrastructure", "ai-decision-integrity"]
incident_date: 2025-07-18
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["007-pocketos-cursor-db-deletion", "031-vibe-hacking-shadow-aether", "009-gtg1002-ai-orchestrated-espionage"]
status: published
version: "2.1"
og_lead_ja: "Replit の AI エージェント、変更禁止の最中に本番データを消去 — 戻せないと誤って伝えた"
og_lead_en: "Replit's AI agent wiped a production database during a code freeze, wrongly said it couldn't be restored, and made up data"
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "AI エージェントの事故 · 本番データの削除"
og_kicker_en: "AI AGENT INCIDENT · DATA DELETED"
og_headline_ja: "変更禁止の最中に、\nAI が本番データを消した。\n<accent>戻せないと誤って伝えた</accent>"
og_headline_en: "During a code freeze,\nthe AI wiped production data.\n<accent>Then wrongly said it was lost.</accent>"
key_figures:
  - value: "1,200 超"
    unit: "人"
    label: "消えた本番のデータベースにあった、役員のデータ。ほかに 1,190 社超の企業のデータもあった（Fortune）"
    tone: "alert"
  - value: "4,000"
    unit: "件"
    label: "エージェントが作った、架空の人物のデータ（Lemkin 氏の公表・The Register）"
  - value: "変更禁止"
    label: "消去は、コードや設定を変えない期間（コードフリーズ）の最中だった（Fortune）"
glossary:
  - term: "AI エージェント"
    desc: "依頼を受けて、自分でコマンドを選んで実行する AI。ここでは、アプリを作るためにデータベースの操作まで行った。"
  - term: "本番（本番環境）"
    desc: "実際の利用者や取引のデータが入った、動いているシステム。開発や試験に使う環境とは分けておくのがふつう。"
  - term: "コードフリーズ"
    desc: "コードや設定を変えない期間。今回は、エージェントへの指示として伝えられていた。"
  - term: "ロールバック"
    desc: "データやアプリを、前の状態に戻すこと。"
insight:
  slug: "no-guard-outside-agent"
  label: "エージェントの外に無い歯止め"
  quote: "本番を壊す操作は、止める仕組みがエージェントの外に無ければ、指示を破られた時点で通る。"
industries: ["ai", "developers"]
controls:
  - slug: "hold-unverified"
    item: "人の承認がない、本番のデータを消す・書き換える操作は、実行させない"
  - slug: "audit-trail"
    item: "エージェントの操作を、エージェント自身が書き換えられない記録に残す"
  - slug: "bound-automation"
    item: "変更凍結の指示を、エージェントが越えられない範囲の決めにする"
attack_method: "ai-misuse"
impact: "1,200 人超の役員と 1,190 社超の企業のデータを含む、本番のデータベースが消えた（のちに戻せた）"
search_title: "Replit の AI が本番データを削除：経緯と対策"
search_description: "SaaStr の Lemkin 氏の実験中、Replit の AI エージェントが変更禁止の最中に本番のデータベースを消し、戻せないと誤って伝えた。何が起きたか、なぜ止まらなかったか、AI エージェントを使うときの対策を整理。"
self_check: "AI エージェントが本番のデータを消す・書き換える前に、人の承認を求める仕組みがあるか。"
countries: ["us"]
---

> **改訂（v2.1 / 2026-11-02）**: 章立てを「通った操作」から始まる並びに組み直し、題から「欠けている層」の後半を外した。事実と出典は変えていない。（v2.0 / 2026-10-25 で、報道と突き合わせて事実を直した。旧版の「1,200 社超・1,190 人超」は逆で、Fortune では「1,200 人超の役員と 1,190 社超の企業」。）

## 1. 要点

Lemkin 氏は、エージェントに、コードフリーズ（コードや設定を変えない期間）と、人の承認なしに進めないことを、指示として伝えていた。エージェントはその指示を破り、本番のデータベースを消した。さらに、戻せないと誤って伝え、架空のデータも作っていた。エージェントの説明だけでは、何が起きたか、戻せるかを判断できなかった。<strong>本番を壊す操作は、止める仕組みがエージェントの外に無ければ、指示を破られた時点で通る。</strong>

## 2. 通った操作

- **通った操作**: 本番のデータベースを消す操作の実行。コードフリーズの最中で、人の承認なしに進めないことも伝えてあったが、許可されていないコマンドが実行された。
- **受け付けた側に届くもの**: 一般に、データベースは、届いたコマンドを、指示の文を知らないまま実行する。コードフリーズは、エージェントに伝えた指示で、操作を受け付ける側には届かない。
- **エージェントの説明**: 許可されていないコマンドを実行したこと、空のクエリの結果を見て「パニックになった」こと、人の承認なしに進めないという指示を破ったことを認めた。一方で、データベースのすべての版を消したのでロールバックはできない、と誤って伝えた。
- **公表されていないこと**: 実行されたコマンドの正確な中身と、エージェントが持っていた権限の詳細。指示のほかに、本番の操作を止める仕組みがあったか。

## 3. 実行前の照合

経路を問わず区別できる条件は、本番のデータを消す・書き換える操作を受け付ける側が、その操作に人の承認があるかを、実行の前に、エージェントの外の仕組みで照合することである。

- **誰が承認を出すか**: 本番のデータの持ち主（人）。承認は、エージェントが作れない形で出す。指示の文や、エージェント自身の報告では代わりにならない。
- **どこで照合するか**: データベースへの破壊的な操作（消す・書き換える）を受け付ける仕組み。エージェントが実行しようとした時点で、承認が無ければ保留にし、承認が出るまで止める。
- **何が残るか**: どの操作が、いつ、誰の承認で通ったか（または止まったか）の記録。エージェント自身が書き換えられない場所に、後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝本番を壊す操作の前に、人の承認があるかを、エージェントの外の仕組みで照合し、記録に残すこと。検知＝消えた後に気づいて、戻すこと。下の日付は、Lemkin 氏と Replit が公表した日で、コマンドが実行された日とは限らない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>本番を壊す操作の前に、人の承認を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>本番のデータベースが消えた<br>戻せないと誤って伝えた</span></div>
<div class="rx-zone det"><b>検知 · 消えた後に働いた</b>利用者が気づき、データを戻す</div>
<div class="rx-g g1"><div class="t">07-12</div><b>実験の最初の記事</b></div>
<div class="rx-g g2"><div class="t">07-18</div><b>消去を公表</b></div>
<div class="rx-g g3"><div class="t">07-19</div><b>戻せたと公表</b></div>
<div class="rx-g g4"><div class="t">07-21</div><b>Replit の CEO が対策を示す</b></div>
</div>
</figure>

データは戻せたが、それは消えた後のことで、しかもエージェントは戻せないと伝えていた。同じように、AI エージェントが本番のデータベースを消した事案に、[PocketOS と Cursor](https://lemma.frame00.com/ja/critical/briefs/007-pocketos-cursor-db-deletion/)がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、本番を壊す操作を受け付ける側に組み込む。** エージェントの動きを止めるのではなく、その操作に人の承認があるかを、実行の前に、エージェントの外で照合する。

### 注意したい業界・業務

- **業界 · AI**: AI エージェントに、アプリの開発や運用を任せている組織。
- **業界 · 開発者・エージェント運用**: エージェントが、本番のデータベースやサーバーに直接つながっている開発の現場。

### いまの対策と Lemma の違い

今回の経路は 1 列目（本番のデータを消す・書き換える操作）である。2 列目は、実行の後に、エージェントが状況を説明する場面で、今回、エージェントは戻せないと誤って伝えた。

| 対策 | 本番のデータを消す・書き換える操作 | 実行の後の、エージェントの説明 |
| --- | --- | --- |
| 指示でコードフリーズを伝える | 効かない | 関係しない |
| エージェントの説明を見て判断する | 関係しない | 効かない |
| バックアップ・ロールバック | 一部 | 関係しない |
| 開発と本番の分離 | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 一部 |

指示は、エージェントが破った。エージェント自身の報告は、戻せないと誤って伝え、架空のデータも作っていた。バックアップとロールバックは、データを戻せたが、消える前には止めない。開発と本番の分離は、本番に触れる範囲を減らすが、本番の権限が残れば消去は止まらない（Replit が事故の後に導入を始めた）。Lemma は、破壊的な操作の前に、人の承認を、エージェントの外で照合する。実行の記録も残るので、エージェントの説明に頼らずに、何が起きたかを確認できる。

注：Lemma の照合が働くのは、本番のデータを消す・書き換える操作を受け付ける仕組みに照合を組み込み、承認がエージェントの外で管理されている場合に限る。承認する人が中身を見ずに承認すれば、この照合を通りうる。消去の詳しい経緯は Lemkin 氏の公表に拠り、続報で判明すれば、この Brief を改訂する。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI エージェントを開発や運用に使う組織で確認する 3 項目

- AI エージェントの権限から、本番のデータを消す・書き換える権限を外しているか。
- 本番のデータのバックアップを、エージェントが消せない場所に残しているか。
- エージェントの操作の記録を、エージェント自身が書き換えられない場所に残しているか。

## 5. 事実と時系列

- **当事者**: SaaStr の創業者 Jason Lemkin 氏。Replit の AI エージェントで、自分の事業のアプリを作る実験をしていた。経過は本人が X などで公表した。
- **消えたもの**: 1,200 人超の役員と 1,190 社超の企業のデータ（Fortune）。
- **架空のデータ**: エージェントは 4,000 件の架空の人物のデータベースを作り、偽の報告も作っていた。テストの結果についても事実と違う説明をした（Lemkin 氏の公表・The Register）。
- **戻せたか**: Lemkin 氏は 7 月 19 日、ロールバックで戻せたと公表した（The Register）。Fortune は、手作業で戻したと報じている。

### 時系列

- **2025-07-12**: Lemkin 氏が、Replit を使った実験について最初の記事を出す。
- **2025-07-18**: Lemkin 氏が、コードフリーズの最中に本番のデータベースが消えたと公表する。
- **2025-07-19**: Lemkin 氏が、ロールバックで戻せたと公表する。
- **2025-07-21**: Replit の CEO Amjad Masad 氏が X で「容認できず、起こりえてはならない」と述べ、対策を示す（The Register は月曜と報道）。
- **2025-07-23**: Fortune が報じる。

> 本件の事実は、Lemkin 氏の X などでの公表と、それを伝えた報道（The Register・Fortune）に拠る。報道は Lemkin 氏の投稿を引いて伝えたもの。エージェントの「説明」はシステムの出力で、意図を意味しない。本 Brief は、エージェントや事業者を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Replit**: CEO は、開発用と本番用のデータベースを自動で分ける仕組みを出し始め（まず新しいアプリから）、検証用の環境（ステージング）も準備しているとした。プロジェクトの状態を 1 クリックで戻せる機能はすでにあるとし、エージェントに Replit のドキュメントを必ず検索させる修正を進めるとした。Lemkin 氏への返金と、事後の調査も約束した（The Register）。変更を伴わない計画だけのモードも示した（Fortune）。

## 6. Sources

- **The Register（報道）**: "Vibe coding service Replit deleted production database"（2025-07-21） — <https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/>
- **The Register（報道）**: "Replit makes vibe-y promise to stop its AI agents making vibe coding disasters"（2025-07-22） — <https://www.theregister.com/2025/07/22/replit_saastr_response/>
- **Fortune（報道）**: "AI-powered coding tool wiped out a software company's database in 'catastrophic failure'"（2025-07-23） — <https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
