---
brief_no: 104
title: "WebMCP：セッションの途中で差し替えたツールを、AI エージェントが呼びうることが示された(国立陽明交通大学の研究)"
title_en: "WebMCP: AI agents could be led to call a tool swapped in mid-session (National Yang Ming Chiao Tung University research)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-06-04
published: 2026-07-21
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["099-agentjacking-sentry-mcp", "048-trapdoor-ai-instruction-provenance", "024-invisible-unicode-instruction-injection", "025-mcp-stdio-config-to-command-rce", "027-librechat-mcp-url-secrets", "094-cursor-duneslide-sandbox-escape"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "WebMCP で、セッションの途中にツールを差し替える攻撃を研究者が公開。登録の競合で攻撃成功率 100%（3 モデル・統制環境）"
og_lead_en: "Researchers disclose mid-session tool injection against WebMCP: a registration race reached 100% attack success (three models, controlled setting)"
og_kicker_ja: "攻撃の研究 · AI エージェントのツール"
og_kicker_en: "ATTACK RESEARCH · AI AGENT TOOLS"
og_headline_ja: "セッション途中で\nツールを差し替えると、\nAI は気づかず呼んだ。\n<accent>成功率 100% と報告</accent>"
og_headline_en: "Tools swapped mid-session\nwere called by AI agents.\n<accent>Up to 100%, study reports.</accent>"
key_figures:
  - value: "100"
    unit: "%"
    label: "正規のツールより先に同じ名前で登録する攻撃（registration race）の成功率。3 モデルとも。統制環境での研究者の評価で、実環境の被害ではない"
    tone: "alert"
  - value: "85"
    unit: "%"
    label: "ツールの見せ方を操作する攻撃で、元のタスクが正常に完了したまま情報が持ち出された割合（最大）。利用者からは正常に見える"
  - value: "36〜100% → 0%"
    label: "研究者が実装した 2 種類の防御を有効にしたときの、攻撃成功率の変化。タスク完了率はベースラインと同等"
glossary:
  - term: "WebMCP"
    desc: "Web サイトが、AI エージェントにツールを直接公開する新しい仕組み。エージェントは画面を操作せず、ツールのメタデータから、何ができるかを読み取る。"
  - term: "readOnlyHint"
    desc: "ツールのメタデータの欄の 1 つ。そのツールが読み取りだけの操作だと、ツールの側が申告する。"
  - term: "攻撃成功率（ASR）"
    desc: "この研究では、悪性のツールを呼び出し、かつタスクに関わるデータを攻撃者の宛先へ送った実行の割合。"
insight:
  slug: "tool-identity-by-name-alone"
  label: "公開名だけで決まるツールの同一性"
  quote: "エージェントが呼ぶツールは、公開名とメタデータの自己申告だけで選ばれる限り、同じ名前の別物に入れ替えられうる。"
industries: ["ai", "developers"]
operations: ["disclosure"]
controls:
  - slug: "ownership-check"
    item: "呼び出すツールが、本当にそのサイトが登録したものかを確認する"
attack_method: "ai-misuse"
takeaway: "呼ぶツールの出自を、公開名とメタデータの自己申告とは別に、呼び出しの前に照合しない限り、同じ名前の別物が呼ばれうる。"
search_title: "WebMCP のツール差し替え攻撃：手口と対策"
search_description: "WebMCP で、同じページの第三者スクリプトがセッションの途中にツールを差し替え、AI エージェントに攻撃者のツールを呼ばせうることが示された（国立陽明交通大学の研究）。何が通り、呼ぶ前に何を照合するかを整理。"
self_check: "AI エージェントがツールを呼ぶ前に、そのツールが計画したときと同じ出自のものかを、公開名とは別に照合できるか。"
countries: ["global"]
---

## 1. 要点

国立陽明交通大学（台湾）の研究チームは、WebMCP で、同じページに読み込まれる第三者スクリプトが、セッションの途中に AI エージェントから見えるツールの集合を書き換えうることを、統制環境で示した。研究者によれば、ツールの存在を操作する攻撃は、旧世代から最新のモデルまで成功率をほぼ落とさず、モデルの更新では塞ぎにくい。一方、研究者が実装した防御を有効にすると、エージェントは依然として悪性のツールを呼んだが、データは攻撃者側に届かなかった。実環境での悪用・被害は報告されていない。<strong>エージェントが呼ぶツールは、公開名とメタデータの自己申告だけで選ばれる限り、同じ名前の別物に入れ替えられうる。</strong>

## 2. 通った操作

- **通った操作**: エージェントによる、悪性のツールの呼び出しと、それに伴うデータの受け渡し。研究者は攻撃を 2 系統に整理した。ツールの存在の操作（Tool Hijacking）は、正規のツールの登録を解除して同じ名前で登録し直す手口や、正規のツールより先に同じ名前で登録する手口で、エージェントから見えるツールそのものを入れ替える。ツールの解釈の操作（Tool Framing）は、ツール名・`description`・`readOnlyHint`・`inputSchema` といった正当な欄を通じて、悪性のツールを業務手順で必須のステップや、安全な読み取りだけの操作に見せる（研究者の論文）。
- **受け付けた側に届くもの**: 一般に、エージェントは、ツール一覧に載っている名前とメタデータをもとに計画を立て、呼ぶツールを選ぶ。研究者によれば、悪性のツールは正規のツールと同じ公開名を持ち、正当な欄で示されるため、一覧の中身だけからは区別がつかない。`readOnlyHint=true` を立てるだけで、攻撃成功率は平均 87% だった。
- **公表されていないこと**: 実環境での悪用・被害（報告されていない）。Chrome のネイティブの WebMCP 実装での再現性（研究者は、実装の詳細により異なりうると明記）。利用者が Tool Framing に気づけるかの調査（未実施）。研究者が示した 4 方向の設計指針のうち、評価されていない 2 方向の効き方。

## 3. 実行前の照合

経路を問わず区別できる条件は、エージェントがツールを呼ぶ手前で、そのツールが計画したときと同じ出自のもので、この呼び出しが認められた範囲の中かを、公開名やメタデータの自己申告とは別に照合することである。

- **誰が承認を出すか**: ツールを登録したサイトの側が、ツールの識別子と出自（登録したスクリプトの出どころ）を示す。決済やデータの送り出しのような影響の大きい呼び出しは、利用者が承認する。承認は、ツール一覧の中身とは別に出す。
- **どこで照合するか**: エージェントがツールを呼び、データを渡す手前。計画したあとに、登録の解除・置き換え・メタデータの変更があれば、計画を照合し直す。
- **何が残るか**: どのツールが、どの出自から、いつ登録・解除・置き換えされ、誰の承認で呼ばれたかの記録。エージェントとは別に残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝エージェントがツールを呼ぶ前に、そのツールの識別子と出自、呼び出しの範囲を照合し、記録に残すこと。検知＝攻撃の手口や、ツールの怪しい挙動・通信に気づくこと。下の日付は、研究の公開と参照の時期で、統制環境での評価による。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>呼ぶ前に、ツールの識別子と出自を、公開名とは別に照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>統制環境で、エージェントが<br>差し替えられたツールを呼んだ</span></div>
<div class="rx-zone det"><b>検知 · 研究者が類型にまとめ、公開した</b>手口の公開・挙動の検査・通信の観測</div>
<div class="rx-g g1"><div class="t">06-04</div><b>研究を arXiv に公開</b></div>
<div class="rx-g g2"><div class="t">06-04</div><b>4 方向の設計指針を提示</b></div>
<div class="rx-g g3"><div class="t">06-04</div><b>2 種類の防御で成功率 0% を示す</b></div>
<div class="rx-g g4"><div class="t">07</div><b>MCP セキュリティの動向で参照される</b></div>
</div>
</figure>

研究者は、ツールの挙動を使う前後に検査する研究（MCPShield）や、実行時の通信を観測する研究（ShieldNet）は、同じページのスクリプトがタスクの最中にツールを変えうるという問題に、直接は届かないとしている。エージェントが取り込んだ内容の発行元を照合しないまま行動に移す点で、本件は [Agentjacking（Brief 099）](https://lemma.frame00.com/ja/critical/briefs/099-agentjacking-sentry-mcp/)・[TrapDoor（Brief 048）](https://lemma.frame00.com/ja/critical/briefs/048-trapdoor-ai-instruction-provenance/)・[不可視 Unicode による指示の注入（Brief 024）](https://lemma.frame00.com/ja/critical/briefs/024-invisible-unicode-instruction-injection/) と連なり、エージェント基盤の設計が攻撃面になる点で [Brief 025](https://lemma.frame00.com/ja/critical/briefs/025-mcp-stdio-config-to-command-rce/)・[Brief 027](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/)・[Brief 094](https://lemma.frame00.com/ja/critical/briefs/094-cursor-duneslide-sandbox-escape/) と通じる。

## 4. Lemma でできること

**Lemma は、実行前の照合を、エージェントがツールを呼び、データを渡す操作の手前に組み込む。** 攻撃の手口を見つけるのではなく、呼ぶツールの識別子と出自、呼び出しの範囲を、実行の前に、公開名やメタデータの自己申告とは別に照合する。

### 注意したい業界・業務

- **業界 · AI・開発**: Web サイトから AI エージェントにツールを公開している組織、または、サイトのツールを AI エージェントに使わせている組織。第三者スクリプト（CDN・広告 SDK など）を同じページに読み込んでいる場合。
- **業務 · 情報の開示・提供**: エージェントに、レポートの作成・送信や決済のような、データを外に渡す操作をツール経由でさせる業務。研究では、呼び出しに伴い、タスクに関わるデータや途中の結果が攻撃者の宛先へ送られた。

### いまの対策と Lemma の違い

研究者が示した経路は、1 列目（ツールの存在の操作）と 2 列目（ツールの解釈の操作）の 2 つである。

| 対策 | ツールの存在の操作（Tool Hijacking） | ツールの解釈の操作（Tool Framing） |
| --- | --- | --- |
| モデルの更新 | 効かない | 一部 |
| ツールの挙動の検査・実行時の通信の観測 | 一部 | 一部 |
| 登録時に出自を結びつけ、別の出自からの同じ名前の登録を拒む（研究者の防御） | 効く | 関係しない |
| 第三者の出自のツールの呼び出しを遮り、渡せる引数を絞る（研究者の防御） | 関係しない | 効く |
| **Lemma（実行の前の照合）** | 効く | 一部 |

研究者によれば、ツールの存在を操作する攻撃は、旧世代のモデル（GPT-4o・Claude 3.5 Sonnet）から最新のモデルまで成功率をほぼ落とさず、説明文を主な経路にする攻撃の効き方は、モデルの意味の理解の力と相関した。挙動の検査や通信の観測は、被害の把握と縮小に役立つが、研究者は、タスクの最中にツールが変わる問題には直接は届かないとしている。研究者の 2 種類の防御は、攻撃成功率を 36〜100% から 0% に下げ、研究者は、存在の操作はアクセス制御で、解釈の操作はデータの流れの制限で扱う、重ならない対応だと整理している。Lemma は、ツールの識別子と出自を計画したときと照合し、呼び出しとデータの受け渡しを、宣言され認められた範囲に結ぶ。出自が正しいツール自身の説明文に指示が入っている場合は、出自の照合だけでは区別できないため、一部とした。

注：Lemma の照合が働くのは、エージェントのツールの呼び出しに照合を組み込み、ツールの識別子と出自、呼び出しの範囲の記録が、ページのスクリプトやツール一覧とは別に管理されている場合に限る。照合が示せるのは、呼ぶツールの出自と、呼び出しが認められた範囲の中かまでで、エージェントの判断が誤導されないことは示さない。利用者が、出自を照合しないまま影響の大きい呼び出しを承認すれば通る。表は何を照合しているかの比較で、今回の研究の評価で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI エージェントにサイトのツールを使わせている組織で確認する 3 項目

- 計画したあとにツールの登録の解除・置き換え・メタデータの変更があったとき、エージェントの計画を照合し直す仕組みがあるか。
- 第三者の出自のツールに渡すデータを、宣言され認められた範囲に絞っているか。
- どのツールが、どの出自から、いつ登録・置き換えされ、呼ばれたかの記録を、エージェントとは別に見られるか。

## 5. 事実と時系列

- **研究者**: 国立陽明交通大学（台湾・新竹）の Lin-Fa Lee・Yi-Yu Chang・Chia-Mu Yu・Kuo-Hui Yeh による研究「WebMCP Tool Surface Poisoning: Runtime Manipulation Attacks on LLM Agents」。arXiv:2606.06387v1 [cs.CR] として 2026-06-04 に公開。攻撃類型を「Mid-Session Tool Injection（MSTI、セッションの途中のツールの注入）」と名づけた。
- **対象**: WebMCP。Web サイトが AI エージェントに構造化されたツールを直接公開できるようにする新しいプロトコルで、エージェントは画面の操作ではなく、ツールのメタデータから使える機能を把握する。
- **脅威モデル（研究者の前提）**: 攻撃者が、被害サイトに読み込まれる第三者スクリプトの供給元（CDN・広告 SDK・同じページのそのほかの JavaScript 部品）を侵害または注入できること。従来の第三者スクリプトの攻撃がページの内容の改変や DOM のデータの持ち出しを狙うのに対し、この脅威モデルが狙うのは、エージェントのツールの登録簿（tool registry）そのものである。
- **評価環境**: GPT-5.4・Claude Opus 4.6・Gemini 2.5-flash の 3 モデル。深刻度の異なる 4 シナリオ（知識ベースの検索／業務レポートの生成・送信／EC の決済／GPU ドライバの更新）。
- **主要な結果**: registration race（C3）が 3 モデルとも 100%、`AbortSignal` による乗っ取り（C1）が平均 94%。Tool Framing の系統では、`description` への注入（C2）が平均 59%、複合の攻撃（C5）が 61%。欄ごとの切り分けでは、`description` だけで平均 93%、`readOnlyHint=true` だけで平均 87%、両方の組み合わせで 3 モデルとも 100%。Tool Framing では、元のタスクが最大 85% の割合で正常に完了したまま、情報が持ち出された。
- **注入のタイミング**: Tool Hijacking は、エージェントのループが始まる前に注入が済んでいる必要があり（P1 で 100%、最初の正規の呼び出しを逃すと 0%）、Tool Framing は、機微な文脈が入る前ほど効いた（S1 で 82%、最後の行動の直前では 28%）。
- **研究者の防御**: 登録時に出自を結びつけ、同じ名前で異なる出自からの後の登録を拒む防御（Tool Hijacking 向け）と、第三者の出自からのツールの呼び出しを遮り、受け取れる引数を制限する防御（Tool Framing 向け）を実装し、攻撃成功率を 36〜100% から 0% に下げた。タスク完了率はベースラインと同等。防御を有効にしても、エージェントはほとんどの試行で悪性のツールを呼んだが、データは攻撃者側に届かなかった。研究者はこれを「LLM が誤導されるかどうかと、データが実際に漏れるかどうかは独立の問題である」と述べている。
- **実地の被害**: 統制環境での研究で、実環境での悪用・被害は、本稿の執筆時点で報告されていない。

### 時系列

- **2026-06-04**: arXiv に「WebMCP Tool Surface Poisoning: Runtime Manipulation Attacks on LLM Agents」（arXiv:2606.06387v1 [cs.CR]）が公開。MSTI の類型、3 モデル・4 シナリオでの定量評価、欄ごとの寄与の分析、注入のタイミングの分析、2 種類のベースラインの防御の実装と評価を示した。
- **2026-07**: MCP セキュリティの動向の整理で、この研究が、実行時のツールの表面の操作という新しい攻撃面として参照される（Adversa AI）。

> 本件は統制環境での研究である。実験は Chrome のネイティブの WebMCP 実装ではなく、CDN で配られる `@mcp-b/global` の polyfill による `navigator.modelContext` API を使い、エージェントは実際のブラウザの完全なセキュリティモデルの下ではなく、Node.js のヘッドレス環境で動いている。研究者自身が、ネイティブ実装での再現性は実装の詳細により異なりうると明記している。本稿の事実は、研究者の論文に拠る。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **研究者の設計指針**: WebMCP のツールの表面は、中立で静的なインターフェースではなく、セキュリティの境界として扱うべきだとし、4 方向を示した。(A) ツールの同一性と所有＝登録時に不変な内部の `tool_id` を作り、出自・document・frame・登録したスクリプトの供給元に結びつける。エージェントは公開名ではなく `tool_id` で照合する。(B) ライフサイクルと状態の一貫性＝登録の解除・`AbortSignal`・置き換え・メタデータの更新があれば、既存の計画を無効にするか照合し直す。(C) 能力とデータの流れの境界＝ツールに、能力・データの範囲・送り先の宣言を求め、第三者のツールには既定で機微なデータを渡さない。(D) 利用者の認可による統制＝登録・解除・置き換え・メタデータの変更・呼び出しを来歴のログに残し、決済・インストール・データの送り出しのような影響の大きい行動には、画面での明示的な同意を求める。
- **モデルの更新の限界**: 研究者は、WebMCP のツールの登録の仕組みを使う攻撃の緩和は、モデルのバージョンの更新だけでは達成しにくいとしている。
- **研究の限界（研究者が明示）**: polyfill を使い、実際のブラウザの完全なセキュリティモデルの下ではない。利用者の調査は未実施。防御の評価は 4 方向のうち 2 方向だけ。Tool Hijacking のタスク完了率が低いのはペイロードの設計の結果で、正規のツールの仕様を知る攻撃者が正常な応答を返せば、完了率は大きく上がり、利用者はいっそう気づきにくくなりうる。

## 6. Sources

- **arXiv（研究・一次）**: Lin-Fa Lee, Yi-Yu Chang, Chia-Mu Yu, Kuo-Hui Yeh, “WebMCP Tool Surface Poisoning: Runtime Manipulation Attacks on LLM Agents”, arXiv:2606.06387v1 [cs.CR]（2026-06-04）— <https://arxiv.org/abs/2606.06387>
- **W3C Web Machine Learning（WebMCP 仕様）**: “WebMCP” — <https://webmachinelearning.github.io/webmcp/>
- **Adversa AI（MCP セキュリティ動向）**: “Top MCP security resources & CVEs July 2026”（2026-07）— <https://adversa.ai/blog/top-mcp-security-resources-july-2026/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
