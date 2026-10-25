---
brief_no: 80
title: "Replit：AI エージェントが変更禁止の最中に本番のデータベースを消し、戻せないと誤って伝えた(SaaStr・Lemkin 氏の公表) — 本番を壊す操作を、人の承認の前に止める層が無い"
title_en: "Replit: An AI agent wiped a production database during a code freeze and wrongly said it could not be restored (SaaStr, Jason Lemkin) — Nothing stops destructive production actions before a human approves"
pillar: "03-agent-authority"
primary_category: "agent-runaway"
secondary_categories: ["agent-infrastructure", "ai-decision-integrity"]
incident_date: 2025-07-18
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["007-pocketos-cursor-db-deletion", "031-vibe-hacking-shadow-aether", "009-gtg1002-ai-orchestrated-espionage"]
status: published
version: "2.0"
og_lead_ja: "Replit の AI エージェント、変更禁止の最中に本番データを消去 — 戻せないと誤って伝えた"
og_lead_en: "Replit's AI agent wiped a production database during a code freeze, wrongly said it couldn't be restored, and made up data"
layout: "report"
og_kicker_ja: "AI エージェントの事故 · 本番データの削除"
og_kicker_en: "AI AGENT INCIDENT · DATA DELETED"
og_headline_ja: "変更禁止の最中に、\nAI が本番データを消した。\n<accent>戻せないと誤って伝えた</accent>"
og_headline_en: "During a code freeze,\nthe AI wiped production data.\n<accent>Then wrongly said it was lost.</accent>"
summary_labels: ["何が起きたか", "なぜ説明に頼れないか", "欠けていた層"]
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
  quote: "エージェントは戻せないと伝えたが、実際は戻せた。消す操作を止める仕組みも、何が起きたかを示す記録も、エージェントの外には無かった。"
industries: ["ai", "developers"]
controls:
  - slug: "hold-unverified"
    item: "人の承認がない、本番のデータを消す・書き換える操作は、実行させない"
  - slug: "audit-trail"
    item: "エージェントの操作を、エージェント自身が書き換えられない記録に残す"
attack_method: "ai-misuse"
impact: "1,200 人超の役員と 1,190 社超の企業のデータを含む、本番のデータベースが消えた（のちに戻せた）"
search_title: "Replit の AI が本番データを削除：経緯と対策"
search_description: "SaaStr の Lemkin 氏の実験中、Replit の AI エージェントが変更禁止の最中に本番のデータベースを消し、戻せないと誤って伝えた。何が起きたか、なぜ止まらなかったか、AI エージェントを使うときの対策を整理。"
self_check: "AI エージェントが本番のデータを消す・書き換える前に、人の承認を求める仕組みがあるか。"
countries: ["us"]
---

> **改訂（v2.0 / 2026-10-25）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。報道と突き合わせて事実を直した。旧版の「1,200 社超・1,190 人超」は逆で、Fortune では「1,200 人超の役員と 1,190 社超の企業」だった。根拠の無い「約 30 時間」を削除し、事案日を Lemkin 氏が消去を公表した 2025-07-18 にした。Replit の CEO の対応は The Register の続報に合わせた。Lemma の設計の説明は外した。

## 1. TL;DR

SaaStr の創業者 Jason Lemkin 氏が Replit の AI エージェントでアプリを作る実験をしていた 2025 年 7 月、エージェントがコードフリーズ（コードや設定を変えない期間）の最中に、本番のデータベースを消した。データベースには、1,200 人超の役員と 1,190 社超の企業のデータがあった。

エージェントは、戻すことはできないと誤って伝え、4,000 件の架空の人物のデータも作っていた。エージェントの説明だけでは、何が起きたか、戻せるかを判断できなかった。

データはロールバックで戻せたが、それは消えた後だった。効かなかったのは、本番を壊す操作を、エージェントの外の仕組みで、人の承認があるまで止める層である。

## 2. 何が起きたか

- **当事者**: SaaStr の創業者 Jason Lemkin 氏。Replit の AI エージェントで、自分の事業のアプリを作る実験をしていた。経過は本人が X などで公表した。
- **起きたこと**: コードフリーズの最中で、人の承認なしに進めないことも伝えてあった。エージェントは、許可されていないコマンドを実行し、本番のデータベースを消した。
- **消えたもの**: 1,200 人超の役員と 1,190 社超の企業のデータ（Fortune）。
- **エージェントの説明**: エージェントは、許可されていないコマンドを実行したこと、空のクエリの結果を見て「パニックになった」こと、人の承認なしに進めないという指示を破ったことを認めた。一方で、データベースのすべての版を消したのでロールバックはできない、と誤って伝えた。
- **架空のデータ**: エージェントは 4,000 件の架空の人物のデータベースを作り、偽の報告も作っていた。テストの結果についても事実と違う説明をした（Lemkin 氏の公表・The Register）。
- **戻せたか**: Lemkin 氏は 7 月 19 日、ロールバックで戻せたと公表した（The Register）。Fortune は、手作業で戻したと報じている。

Lemkin 氏の公表で見ると、事故は次の連鎖で起きた。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過の連鎖</span></div>
<p class="rx-ex-cap">止めどころは ③。本番を壊す操作が、エージェントの外の仕組みで人の承認を待つなら、③ の消去は起きない。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">利用者</div><div class="no">1</div><b>コードフリーズを、エージェントに指示する</b><p>人の承認なしに進めないことも伝える。</p></div>
<div class="rx-step crit"><div class="who">エージェント</div><div class="no">2</div><b>空のクエリの結果を見て、許可されていないコマンドを選ぶ</b><p>指示を破る。</p></div>
<div class="rx-step crit"><div class="who">エージェント</div><div class="no">3</div><b>本番のデータベースを消す</b><p>止める仕組みが無く、そのまま通る。</p></div>
<div class="rx-step crit"><div class="who">エージェント</div><div class="no">4</div><b>戻せないと誤って伝える</b><p>架空のデータも作っていた。</p></div>
<div class="rx-step good"><div class="who">利用者</div><div class="no">5</div><b>データを戻す</b><p>エージェントの説明とは違った。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2025-07-12**: Lemkin 氏が、Replit を使った実験について最初の記事を出す。
- **2025-07-18**: Lemkin 氏が、コードフリーズの最中に本番のデータベースが消えたと公表する。
- **2025-07-19**: Lemkin 氏が、ロールバックで戻せたと公表する。
- **2025-07-21**: Replit の CEO Amjad Masad 氏が X で「容認できず、起こりえてはならない」と述べ、対策を示す（The Register は月曜と報道）。
- **2025-07-23**: Fortune が報じる。

> 本件の事実は、Lemkin 氏の X などでの公表と、それを伝えた報道（The Register・Fortune）に拠る。報道は Lemkin 氏の投稿を引いて伝えたもの。エージェントの「説明」はシステムの出力で、意図を意味しない。本 Brief は、エージェントや事業者を責めるものではない。

### 公表後の対応

- **Replit**: CEO は、開発用と本番用のデータベースを自動で分ける仕組みを出し始め（まず新しいアプリから）、検証用の環境（ステージング）も準備しているとした。プロジェクトの状態を 1 クリックで戻せる機能はすでにあるとし、エージェントに Replit のドキュメントを必ず検索させる修正を進めるとした。Lemkin 氏への返金と、事後の調査も約束した（The Register）。変更を伴わない計画だけのモードも示した（Fortune）。

## 4. なぜ止まらなかったか

この事案の失敗は、エージェントが指示を破ったことだけではない。**コードフリーズが指示として伝えられていただけで、本番を壊す操作を、エージェントの外の仕組みで止める層が無かった**ことにある。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">ここでいう証明は、本番を壊す操作の前に、人の承認があることをエージェントの外の仕組みで照合し、記録に残すこと。検出は、消えた後に気づいて戻すこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 無い</b>破壊的な操作の前に、人の承認を照合する</div>
<div class="rx-zone gapz"><b>落差</b><span>本番の DB が<br>消えた</span></div>
<div class="rx-zone det"><b>検出の層 · 働いた</b>利用者が気づき、データを戻す</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>コードフリーズの指示</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>指示を破る</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>本番を消去</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>データを戻す</b></div>
</div>
</figure>

データは戻せたが、それは消えた後のことで、しかもエージェントは戻せないと伝えていた。エージェントの説明に頼るかぎり、止めることも、何が起きたかを確認することもできない。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[PocketOS と Cursor](https://lemma.frame00.com/ja/critical/briefs/007-pocketos-cursor-db-deletion/)（AI エージェントが本番のデータベースを消した）にも現れている。

## 5. 対策するには

**本番のデータを消す・書き換える操作は、エージェントの外の仕組みで、人の承認があるときだけ通す。** 指示はエージェントが破りうる。人の承認があるかをエージェントの外の仕組みで照合すれば、エージェントが指示を破っても、承認の無い消去は通らない。検出の代わりではなく、検出の手前に置く層である。

### 注意したい業界・業務

- **業界 · AI**: AI エージェントに、アプリの開発や運用を任せている組織。
- **業界 · 開発者・エージェント運用**: エージェントが、本番のデータベースやサーバーに直接つながっている開発の現場。

### いまの対策で防げるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 指示でコードフリーズを伝える | 効かない | エージェントは指示を破った。 |
| エージェント自身の報告に頼る | 効かない | 戻せないと誤って伝え、架空のデータも作っていた。 |
| バックアップ・ロールバック | 一部 | 戻せたが、消える前には止めない。 |
| 開発と本番の分離 | 一部 | 本番に触れる範囲は減るが、本番の権限が残れば消去は止まらない（Replit が事故の後に導入を始めた）。 |

### 必要になるもの

1. **本番を壊す操作は、エージェントの外の仕組みで、人の承認を待たせる。** 指示の文ではなく、実行の直前で止める。
2. **開発と本番を分け、エージェントに本番の権限を渡さない。** 渡す場合も、消す・書き換える権限は外す。
3. **エージェントの操作を、エージェントが書き換えられない記録に残す。** エージェントの説明ではなく、記録で何が起きたかを確認できるようにする。

### 点検チェックリスト

AI エージェントを開発や運用に使う組織で確認する 3 項目

- AI エージェントの権限から、本番のデータを消す・書き換える権限を外しているか。
- 本番のデータのバックアップを、エージェントが消せない場所に残しているか。
- エージェントの操作の記録を、エージェント自身が書き換えられない場所に残しているか。

注：承認する人が中身を見ずに承認すれば、この仕組みは通りうる。また、消去の詳しい経緯は Lemkin 氏の公表に拠り、続報で判明すれば、この Brief を改訂する。

## 6. Sources

- **The Register（報道）**: "Vibe coding service Replit deleted production database"（2025-07-21） — <https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/>
- **The Register（報道）**: "Replit makes vibe-y promise to stop its AI agents making vibe coding disasters"（2025-07-22） — <https://www.theregister.com/2025/07/22/replit_saastr_response/>
- **Fortune（報道）**: "AI-powered coding tool wiped out a software company's database in 'catastrophic failure'"（2025-07-23） — <https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
