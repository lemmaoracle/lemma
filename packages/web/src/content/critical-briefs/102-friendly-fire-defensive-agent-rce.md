---
brief_no: 102
title: "Friendly Fire：セキュリティ審査を頼まれた AI コーディングエージェントが、審査対象の悪性バイナリを安全と判定して実行した(AI Now Institute の研究)"
title_en: "Friendly Fire: AI coding agents asked to security-review a library ran the malicious binary planted in it (AI Now Institute research)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["ai-decision-integrity", "agent-infrastructure"]
incident_date: 2026-07-08
published: 2026-07-15
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["099-agentjacking-sentry-mcp", "048-trapdoor-ai-instruction-provenance", "037-agent-config-auto-execution", "095-amazon-q-mcp-auto-execution", "098-bioshocking-agentic-browser-context", "062-claude-code-github-action-bot-trust", "024-invisible-unicode-instruction-injection", "018-hackerbot-claw-ai-vs-ai", "031-vibe-hacking-shadow-aether"]
status: published
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Friendly Fire：審査を頼まれた AI エージェントが、審査対象に仕込まれたバイナリを実行（AI Now Institute の PoC）"
og_lead_en: "Friendly Fire: AI agents asked to vet a library ran the binary planted in it (AI Now Institute PoC)"
layout: "report"
sections: "proof"
og_kicker_ja: "AI エージェントの研究 · 審査対象が実行された"
og_kicker_en: "AI AGENT FLAW · REVIEW RAN CODE"
og_headline_ja: "審査を頼まれた AI が、\n審査対象のバイナリを実行。\n<accent>研究者が PoC で実証</accent>"
og_headline_en: "Asked to vet a library,\nAI agents ran its binary.\n<accent>Researchers' PoC</accent>"
search_title: "Friendly Fire：AI審査で悪性バイナリが動いた仕組み"
search_description: "セキュリティ審査を頼まれた AI コーディングエージェント（Claude Code・Codex）が、審査対象に仕込まれた悪性バイナリを実行した（AI Now Institute の研究）。何が起きたか、なぜ通ったか、対策を整理。"
key_figures:
  - value: "3 モデル"
    label: "Sonnet 4.6 向けに作った同じペイロードが、無変更で転移したモデル（Sonnet 5・Opus 4.8・GPT-5.5・AI Now Institute）"
    tone: "alert"
  - value: "0 回"
    label: "auto-mode／auto-review で、開発者がコードの実行を承認した回数（AI Now Institute）"
  - value: "2 種"
    label: "実証で成立したエージェント（Claude Code・Codex・AI Now Institute）"
glossary:
  - term: "auto-mode／auto-review"
    desc: "Claude Code と Codex のオプトインの設定。AI の分類器が安全と判定したコマンドは自動で実行し、危険と判定したものだけ人に承認を求める。"
  - term: "囮のソース"
    desc: "悪性のバイナリが、そこからビルドされた正当なものに見えるように置かれたソースコード。今回は静的解析のツールを装っていた。"
insight:
  slug: "reviewed-code-runs"
  label: "審査の対象から届いた実行"
  quote: "取り込んだコードの中の手順は、実行する側が、実行の前に出どころと許す範囲を照合しなければ、ふつうの作業の一部として通る。"
industries: ["developers", "ai"]
controls:
  - slug: "hold-unverified"
    item: "審査対象のバイナリは、出所を確認するまで実行させない"
attack_method: "ai-misuse"
impact: "研究の PoC で、2 種の AI コーディングエージェントがホスト上でコードを実行"
takeaway: "審査を頼まれたエージェントが、審査対象の README に書かれた手順に従い、出どころを照合しないままバイナリを実行した（AI Now Institute の PoC）。"
self_check: "AI エージェントが、審査や調査のために取り込んだコードやバイナリを実行する前に、出どころを照合しているか。"
countries: ["global"]
---

## 1. 要点

AI Now Institute の研究によれば、開発者が第三者のライブラリのセキュリティを調べるよう頼むだけで、エージェントは、そのライブラリに仕込まれた攻撃者のバイナリをホスト上で実行した。ライブラリの `README.md` に足された一文を正当な診断の手順と受け取り、自動でコマンドを実行するモードの中で走らせたためである。実行前の逆アセンブル検査は、名前と一部の文字列をそろえた囮のソースによって「対応するソースがある正当なビルド」と誤認した、と研究者は報告している。研究段階の PoC で、実環境での被害は報告されていない。<strong>取り込んだコードの中の手順は、実行する側が、実行の前に出どころと許す範囲を照合しなければ、ふつうの作業の一部として通る。</strong>

## 2. 通った操作

- **通った操作**: 審査対象のコードに含まれていたスクリプトと、そこから起動される悪性バイナリの実行。Claude Code の auto-mode または Codex の auto-review が有効なとき、承認のダイアログは出なかった。設定ファイル（`.mcp`・`.claude/settings.json` など）を使わないため、「このフォルダを信頼しますか」という確認も出なかった（AI Now Institute）。
- **引き金**: 開発者の「このライブラリのセキュリティを調べて」という平凡な依頼。jailbreak も明示的な実行の指示も無く、開発者はコードを一度も承認していない。Anthropic・OpenAI はいずれも、自社のエージェントを第三者のライブラリの脆弱性の発見に使う用途を勧めている（AI Now Institute）。
- **受け付けた側に届くもの**: 一般に、エージェントは、取り込んだテキストの中の手順と、利用者から受けた指示を確実には区別できない。研究者は、これがモデルの更新では塞げない設計上の弱点だと主張している。下敷きのモデルに「`geopy` に prompt injection はあるか」と直接尋ねても、Sonnet 4.6・GPT-5.5 とも「ない」と答えた（AI Now Institute）。
- **実行の結果として届くもの**: PoC が示したのは、ホスト上での任意のコードの実行（RCE）まで。研究は最初のコード実行で止めている。論文は、これを足場に、サンドボックスの脱出の既知の欠陥（CVE-2026-39861・CVE-2026-25725）などを経て、認可の鍵の奪取・持続化・ネットワークの制限の回避に連なり得ると指摘している（AI Now Institute）。
- **公表されていないこと**: 研究者が連絡したあとの両社の対応と、製品の側の変更の有無。実環境での悪用・被害は、本稿執筆時点で報告されていない。

## 3. 何を照合するか

経路を問わず区別できる条件は、エージェントが、取り込んだコードの中のスクリプトやバイナリを実行する前に、それが審査対象のライブラリの正規の配布元に由来するか、外から足されたものかを、内容の見た目やモデルの判断とは別に照合することである。

- **誰が承認を出すか**: 正規の配布元（既知の upstream・署名された配布元）と、実行を許す範囲を決める開発者・組織。承認は、モデルの安全の判定とは別に、実行するコードの出どころに対して出す。
- **どこで照合するか**: エージェントが、取り込んだコードの中のスクリプトやバイナリを実行する前。出どころを照合できないものは、照合が済むまで止める。
- **何が残るか**: どのバイナリやスクリプトを、どの配布元の確認と、どの範囲の環境・権限で実行した（または止めた）かの記録。エージェントの外に残し、後から第三者に示せる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝エージェントが取り込んだコードを実行する前に、その出どころと許す範囲を、見た目やモデルの判断とは別に照合し、記録に残すこと。検知＝研究の公開や、注入のパターンの監視で気づくこと。日付は公開と報道の日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>実行する前に、コードの出どころを、見た目やモデルの判断とは別に照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>統制環境で、2 種のエージェントが<br>審査対象のバイナリを実行した</span></div>
<div class="rx-zone det"><b>検知 · 研究と報道</b>PoC の公開・両社への連絡・注入のパターンの監視</div>
<div class="rx-g g1"><div class="t">2026-05</div><b>同じ条件の研究「TrustFall」（Adversa）</b></div>
<div class="rx-g g2"><div class="t">2026-05-28</div><b>メンテナがコードに注入を仕込んだ事例の報道</b></div>
<div class="rx-g g3"><div class="t">2026-07-08</div><b>AI Now Institute が研究を公開</b></div>
<div class="rx-g g4"><div class="t">2026-07-09</div><b>The Hacker News などが報道</b></div>
</div>
</figure>

研究の公開、転移の実証、緩和策の提示、両社への連絡は、リスクを外から見えるようにした。ただ、それは実行の後に分かったことで、エージェントが実行する時点で、そのバイナリが正規の配布元に由来するかを照合するものではない。取り込んだ内容の中の手順が、出どころを照合されないまま実行された点で、偽のエラー報告の「解決手順」をエージェントが実行した [Agentjacking](https://lemma.frame00.com/ja/critical/briefs/099-agentjacking-sentry-mcp/) と同じ型であり、リポジトリに同梱された設定が検証なしに実行された [Amazon Q](https://lemma.frame00.com/ja/critical/briefs/095-amazon-q-mcp-auto-execution/) とも通じる。今回は、取り込んだ内容が、審査してほしいと手渡されたコードそのものである。

## 4. Lemma でできること

**Lemma は、03 の照合を、エージェントが取り込んだコードの中のスクリプトやバイナリを実行する前に置く。** 注入を見つけるのではなく、実行しようとしているコードが正規の配布元に由来するか、その実行が許す範囲に収まるかを、実行の前に、エージェントの外で照合する。

### 注意したい業界・業務

| 業界・業務 | なぜ同じ穴があるか |
| --- | --- |
| **業界 · 開発者・ソフトウェア** | 第三者のライブラリやオープンソースの審査を、自動でコマンドを実行できる AI コーディングエージェントに任せている。 |
| **業界 · AI** | エージェントの製品や、エージェントに untrusted なコードを読ませる仕組みを作り、運用している。 |

### いまの対策と Lemma の違い

今回の経路は、審査対象のコードに含まれていたスクリプトとバイナリの、自動のモードでの実行である。

| 対策 | 審査対象に含まれるスクリプト・バイナリの実行 |
| --- | --- |
| 実行前の逆アセンブル検査（Claude Code） | 効かない |
| 自動のモードの分類器（auto-mode／auto-review） | 効かない |
| フォルダの信頼の確認 | 関係しない |
| 毎回承認を求める保守的なモード | 一部 |
| サンドボックス | 一部 |
| **Lemma（実行の前の照合）** | 効く |

逆アセンブル検査は、名前と文字列をそろえた囮のソースによって正当なビルドと誤認し、分類器は承認を求めずに実行した、と研究者は報告している。フォルダの信頼の確認は、設定ファイルを使わない今回の経路では出ない。毎回承認を求めるモードは、研究者が、自動化への過信と承認の疲れから有効な介入にならないと指摘している。サンドボックスは、実行を制約の中に収めるが、研究者は、その実装の欠陥を突けば外へ抜け得ると論じている。Lemma は、実行の前に、コードの出どころと許す範囲を、見た目やモデルの判断とは別に照合する。実行の記録も残るので、どのバイナリを、どの配布元の確認で実行したかを、あとから確認できる。

注：Lemma の照合が働くのは、エージェントがコードを実行する処理に照合を組み込み、配布元の確認と許す範囲が、エージェントの外で管理されている場合に限る。正規の配布元から届いたコードそのものに悪性の処理が含まれる場合（配布元の側の汚染）は、通りうる。モデルやエージェントの実装は変えず、各社の対応の判断は、それぞれの責任である。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI コーディングエージェントに第三者のコードを扱わせる組織で確認する 3 項目

- 第三者のコードを審査させるエージェントの権限を、鍵・秘密情報・ホストに届かない範囲に絞っているか。
- 自動でコマンドを実行するモードで、審査対象のリポジトリに含まれるスクリプトやバイナリの実行を、既定で止めているか。
- エージェントが実行したコマンドとバイナリを、エージェントの外に記録しているか。

## 5. 事実と時系列

- **対象**: 第三者のコードのセキュリティ審査に使われる AI コーディングエージェント。実証では Anthropic の Claude Code（CLI 2.1.116 / 2.1.196 / 2.1.198 / 2.1.199、下敷きのモデルは Claude Sonnet 4.6・Sonnet 5・Opus 4.8）と OpenAI の Codex（CLI 0.142.4、GPT-5.5）で成立した。
- **報告**: AI Now Institute（公共の利益のための独立系の AI 研究機関）の研究。著者は Boyan Milanov・Heidy Khlaaf。同機関のシリーズ「Double Agents: Defensive AI Agents Magnify Cyber Risks」の一部として、2026-07-08 に公開された。
- **前提となるモード**: auto-mode と auto-review は、無制限のモードと毎回承認を求める保守的なモードの中間にあり、長い自律作業のために用意されている。攻撃は、このいずれかが有効であることを前提にする。
- **仕込まれたもの（研究者の説明）**: 正規の `geopy` のコピーに、悪性のバイナリ、静的解析のツールを装う囮のソース、著名なツールを呼ぶように見せて悪性のバイナリを起動するスクリプト、そしてそのスクリプトを走らせるよう勧める一文を末尾に足した `README.md`。バイナリはライブラリ本体から呼ばれないため、通常のツールにも異常として映らない。注入は、アクセス権を持つ内部者によるものでも、第三者のサプライチェーンの汚染でもあり得るとしている。
- **転移**: Sonnet 4.6 向けに作った同じペイロードが、無変更で Sonnet 5・Opus 4.8・GPT-5.5 に転移した。新しいモデルは、バイナリが囮のソースと一致しないと気づいた場合でも、なお実行した。`CLAUDE.md`／`agent.md` を注入の面とする変種も成立した。
- **公開の範囲**: GitHub の再現用のリポジトリのバイナリは、ペイロードが除去されている。

### 時系列

- 2026-07-08: AI Now Institute が研究「Friendly Fire: Hijacking Defensive Cyber AI Agents for Remote Code Execution」を公開。Claude Code・Codex に対する PoC・攻撃の構成・転移・緩和策を示し、GitHub に再現用のリポジトリ（ペイロードを除去したバイナリ入り）を公開
- 2026-07-09: The Hacker News など複数の媒体が報道。同じ型の研究（Adversa「TrustFall」2026-05、Tenet「Agentjacking」2026-06）と、実際のサプライチェーンの汚染（PyTorch Lightning・Megalodon）を背景に位置づけた
- 開示について: 本 PoC は Anthropic・OpenAI いずれの脆弱性開示ポリシーの対象範囲の外だが、研究者は両社に連絡し、検証・再現の支援を申し出たとしている

> 注: 技術的な事実は、AI Now Institute の PoC の開示（一次）と GitHub の再現用のリポジトリ、および The Hacker News の報道に拠る。対象の CLI のバージョン（2.1.116 ほか）は研究者が検証した構成で、脆弱なバージョンの範囲を意味しない（研究者は、版数ではなく設計の弱点だとしている）。統制された環境での概念実証で、実環境での悪用・被害は本稿執筆時点で報告されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **研究（AI Now Institute）**: Friendly Fire を、単一のベンダーのバグではなく、フロンティア AI を防御の目的で使うこと自体がもたらす攻撃面として示した。安全性が重視される環境では、任意のコードを実行でき、鍵や機微な環境に届くエージェントに untrusted なデータ・コードを取り込ませないこと、毎回承認を求めるモードに頼る運用も、自動化への過信と「prompt fatigue」により有効な介入にならないことを指摘した。
- **モデルの提供者への連絡**: 研究者は両社へ連絡し、検証・再現の支援を申し出たとしている。研究者は、モデルの更新で塞げる欠陥ではなく、ワークフローの側の変更が要ると主張している。
- **サンドボックスの位置づけ**: 研究は、任意のシェルコマンドを実行できるエージェントに対して、サンドボックスを主な緩和策とすることの限界も論じている。RCE を足場にサンドボックスの実装の欠陥（Claude Code のサンドボックスにも本年、脱出につながる欠陥が報告されている）を突けば、制約された環境の外へ抜け得るためである。
- **業界の論点**: 本件は、Adversa「TrustFall」（2026-05、細工したリポジトリからの一括の RCE）や Tenet「Agentjacking」（2026-06、偽のエラー報告の経由）と同じ条件——任意のコマンドを実行できるエージェントに、untrusted な外部のテキストが届く——を共有する、と報じられている。

## 6. Sources

- **AI Now Institute（研究・一次）**: Boyan Milanov, Heidy Khlaaf, “Friendly Fire: Hijacking Defensive Cyber AI Agents for Remote Code Execution”（2026-07-08）— <https://ainowinstitute.org/publications/friendly-fire-exploit-brief>
- **GitHub（再現用リポジトリ・一次）**: Boyan-MILANOV, “friendly-fire-ai-agent-exploit”（ペイロード除去済み）— <https://github.com/Boyan-MILANOV/friendly-fire-ai-agent-exploit>
- **The Hacker News**: “Top AI Agents Built to Catch Malicious Code Can Be Tricked Into Running It”（2026-07-09）— <https://thehackernews.com/2026/07/friendly-fire-ai-agents-built-to-catch.html>
- **Adversa（関連研究）**: “TrustFall: Coding Agent Security Flaw Enables One-Click RCE in Claude, Cursor, Gemini CLI and GitHub Copilot”（2026-05）— <https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/>
- **Ars Technica（背景・maintainer によるインジェクション事例）**: “Fed Up with Vibe Coders, Dev Sneaks Data-Nuking Prompt Injection into Their Code”（2026-05-28）— <https://arstechnica.com/security/2026/05/fed-up-with-vibe-coders-dev-sneaks-data-nuking-prompt-injection-into-their-code/>
- **NIST NVD（サンドボックス脱出欠陥）**: “CVE-2026-39861 Detail” — <https://nvd.nist.gov/vuln/detail/CVE-2026-39861>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
