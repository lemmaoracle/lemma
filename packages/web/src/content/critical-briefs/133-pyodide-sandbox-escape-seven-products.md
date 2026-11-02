---
brief_no: 133
title: "Pyodide のサンドボックス脱出：同じ経路が複数の製品で再現されうると示された(Cyera の研究、DEF CON 34)"
title_en: "Pyodide sandbox escape: the same path was shown to be reproducible across multiple products (Cyera research, DEF CON 34)"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth, code-provenance]
incident_date: 2026-08-07
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["073-shadowmq-pickle-zmq-pattern", "094-cursor-duneslide-sandbox-escape", "109-servicenow-ai-platform-preauth-rce", "039-semantic-kernel-prompt-injection-rce", "066-litellm-ai-gateway-privilege-escalation"]
status: published
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Pyodide を使う 7 製品で同じサンドボックス脱出が再現されうると Cyera が発表"
og_lead_en: "Cyera says one Pyodide sandbox escape is reproducible across seven products"
search_title: "Pyodide サンドボックス脱出：7製品・CVE4件の経緯"
search_description: "Pyodide を使う 7 製品で、危険なモジュールを禁止してもホストへ越境しうるサンドボックス脱出を、Cyera が DEF CON 34 で示した（CVE 4 件）。何が起きたか、なぜ隔離が見かけにとどまるか、対策を整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "実行環境の脆弱性 · サンドボックス脱出"
og_kicker_en: "RUNTIME FLAW · SANDBOX ESCAPE"
og_headline_ja: "モジュールを禁じても、\nホストへ抜けうると報告。\n<accent>7 製品・CVE 4 件</accent>"
og_headline_en: "Researchers: blocking\nmodules left a way out.\n<accent>7 products, 4 CVEs</accent>"
key_figures:
  - value: "7"
    unit: "製品"
    label: "同じサンドボックス脱出が再現されうると Cyera が示した、Pyodide を使う製品"
    tone: "alert"
  - value: "4"
    unit: "件"
    label: "開示で採番された CVE。CVSS は 8.3〜9.9（発表元 Cyera の記載）"
  - value: "9.9"
    label: "n8n の CVE-2025-68668 の CVSS（Cyera の記載）。Code ノードの Python 実行が対象"
glossary:
  - term: "Pyodide"
    desc: "CPython を WebAssembly（WASM）上で動かす実行環境。製品に組み込んで、利用者や AI が書いた Python を動かすのに使われる。"
  - term: "ctypes・Emscripten の関数"
    desc: "ctypes は、Python から C の関数やメモリを扱う標準モジュール。Emscripten は C/C++ を WebAssembly にするツール群で、埋め込み先の環境に関数を公開する。Cyera の報告では、この 2 つがホストへ越境する経路になった。"
insight:
  slug: "blocked-modules-not-a-boundary"
  label: "モジュールの禁止を境界とみなす前提"
  quote: "コードをホストの権限で動かす前に、実行環境が届く能力を、禁止した一覧ではなく決めた範囲と照合しなければ、隔離は見かけのまま通る。"
industries: ["developers", "ai"]
countries: ["global"]
controls:
  - slug: "limit-and-revoke"
    item: "実行環境が届く範囲（ファイル・プロセス・認証情報）を、意図した用途に固定する"
  - slug: "hold-unverified"
    item: "隔離境界の内側にあることが確認できない実行は、実行の前に止める"
impact: "Pyodide を使う 7 製品で再現されうると示され、CVE 4 件に"
takeaway: "危険なモジュールを禁止しただけの隔離では、ctypes と Emscripten の関数からホストへ越境しうると、Cyera が示した。"
self_check: "信頼できないコードを動かす前に、実行環境がホストのどの能力に届くかを照合しているか。"
---

## 1. 要点

Cyera の研究者によれば、Pyodide（WebAssembly 上の Python）を使う製品は、`os` や `subprocess` などの危険なモジュールを禁止して隔離としていたが、`ctypes` と Emscripten が公開する関数が到達可能なまま残っていた。制限されたはずの Python は、そこから CPython-in-WASM の外側の JS ホストへ越境しうる。これは各製品での実被害ではなく、研究者による実証である。<strong>コードをホストの権限で動かす前に、実行環境が届く能力を、禁止した一覧ではなく決めた範囲と照合しなければ、隔離は見かけのまま通る。</strong>

## 2. 通った操作

- **通った操作**: 制限された Python の中からの、`ctypes` と Emscripten が公開する関数の利用。各製品の禁止の一覧はこれらを勘定に入れておらず、そこから JS ホストへ越境できた（Cyera の研究者による報告）。
- **止まった操作**: 危険なモジュールの import。禁止は働いていたが、それだけでは境界にならなかった（Cyera）。
- **受け付けた側に届くもの**: 一般に、サンドボックスの内側のコードがホストに届くと、ホスト環境が持つ能力がそのまま影響範囲になる。Cyera は、Node.js ではファイルシステム・プロセス・環境変数、CI/CD では公開トークンや署名鍵・ソース、AI エージェント環境では API 認証情報・内部サービス・データベースに届きうるとする。
- **公表されていないこと**: 各製品で、この経路が実際に悪用された事例の有無。本 Brief は研究者による実証を扱い、各製品での実被害を主張するものではない。

## 3. 何を照合するか

経路を問わず区別できる条件は、信頼できないコードをホストの権限で動かす前に、その実行環境がホストのどの能力（ファイル・プロセス・認証情報・公開された関数）に届くかを、禁止したモジュールの一覧ではなく、実行環境の外で決めた範囲と照合することである。

- **誰が承認を出すか**: 実行環境を組み込んで配備する運用者。どのコードに、どの範囲の能力を許すかを決める。「危険なモジュールを禁止した」という設定は承認にならない。
- **どこで照合するか**: コードがホストの権限で実行へ移る直前。照合の対象は、import の可否ではなく、実行環境がホストに公開している能力である。決めた範囲を超える能力が公開されていれば、実行を保留する。
- **何が残るか**: どのコードを、どの範囲の確認で、いつ実行した（または止めた）かの記録。あとから、どの実行環境で何が動いたかを示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝信頼できないコードをホストの権限で動かす前に、実行環境が届く能力を、決めた範囲と照合し、記録に残すこと。検知＝研究者が脱出の経路を見つけて報告すること。日付は、採番・発表・報道の日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>コードを実行へ移す前に、実行環境がホストのどの能力に届くかを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>危険なモジュールを禁止したまま、ホストへ越境しうると示された<br>4 件の CVE（CVSS 8.3〜9.9、Cyera の記載）</span></div>
<div class="rx-zone det"><b>検知 · 研究者が見つけた</b>Cyera が、7 製品に共通する経路として発表した</div>
<div class="rx-g g1"><div class="t">2025</div><b>n8n の CVE-2025-68668 が採番</b></div>
<div class="rx-g g2"><div class="t">2026-08-07</div><b>DEF CON 34 で Cyera が発表</b></div>
<div class="rx-g g3"><div class="t">2026-08-10</div><b>eSecurity Planet が報道</b></div>
<div class="rx-g g4"><div class="t">開示後</div><b>n8n が Python の実行を外部ランナーへ分離</b></div>
</div>
</figure>

危険なモジュールの禁止は働いていた。ただ、Pyodide が動く WASM は自分の線形メモリを守るだけで、埋め込み環境が意図的に公開した能力までは塞がない（Cyera）。危険な呼び出しや異常なプロセス生成は、監視で後から捉えうる。効かなかったのは、その手前で、実行環境が届く範囲を照合する層である。Cyera の報告からは、「Python の import 制限＝境界」という前提が、複数の独立した製品に共有されていたことがうかがえる。同じ危険な実装が AI 推論基盤に次々コピーされていた [Brief 073](https://lemma.frame00.com/ja/critical/briefs/073-shadowmq-pickle-zmq-pattern/)（ShadowMQ）、一つの指示でサンドボックスが外された [Brief 094](https://lemma.frame00.com/ja/critical/briefs/094-cursor-duneslide-sandbox-escape/)（Cursor）と同じ形で、実行が、隔離の範囲の照合に結び付いていない。

## 4. Lemma でできること

**Lemma は、03 の照合を、信頼できないコードがホストの権限で実行へ移る直前に置く。** サンドボックスを作るのでも、コードの危険性を判定するのでもなく、その実行環境がホストに公開している能力が、運用者の決めた範囲に収まるかを、実行の前に照合する。

### 注意したい業界・業務

- **業界 · 開発者・エージェント運用**: Pyodide などの WebAssembly 上の実行環境で、利用者が書いたコードを動かすワークフロー自動化・表計算や、CI/CD の開発者と組織。
- **業界 · AI**: AI が生成したコードを、サンドボックスの内側で動かすエージェントの基盤を運用する組織。実行環境の外に、API 認証情報や内部サービスへの経路を持つ。

### いまの対策と Lemma の違い

今回の経路は、1 列目の、制限された Python からホストへの越境である。2 列目は、越境した後に届く範囲を比べる。

| 対策 | 制限された Python からホストへの越境（`ctypes`・Emscripten の関数） | 越境の後に届く範囲（ファイル・プロセス・認証情報） |
| --- | --- | --- |
| 危険なモジュールの禁止（`os`・`subprocess` など） | 効かない | 関係しない |
| 危険な呼び出し・異常なプロセス生成の監視 | 一部 | 一部 |
| 維持側の設計変更（n8n は Python の実行を外部ランナーへ分離） | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 |

危険なモジュールの禁止は、`ctypes` と Emscripten の関数を勘定に入れていなかった（Cyera）。越境の後に何へ届くかは、禁止の一覧では変わらない。監視は、危険な呼び出しや異常なプロセス生成を後から捉える層で、越境の前には働かない。維持側の対応は製品ごとに分かれ、n8n は Python の実行を外部ランナーへ切り出したが、アーカイブ化や「隔離は配備側で担保すべき」との立場もあり、配備の側に残る範囲がある。Lemma は、import の可否ではなく、実行環境がホストに公開する能力を、実行の前に照合する。署名鍵や API 認証情報は実行環境へ素通しにせず、必要な範囲だけを渡す形にできる。実行の記録も残るので、どの実行環境で何が動いたかを、あとから確認できる。

注：Lemma の照合が働くのは、実行環境を起動する処理に照合を組み込み、許す能力の範囲が実行環境の外で管理されている場合に限る。実行環境が公開する能力を漏れなく挙げられない場合や、許した範囲の中で悪性のコードが動く場合は、通りうる。Pyodide や各製品の実装は変えず、コード自体の善悪も判定しない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

信頼できないコードを実行環境で動かす組織で確認する 3 項目

- 実行環境の隔離を、危険なモジュールの禁止とは別の仕組み（別のプロセスやランナーへの分離など）でも担っているか。
- その実行環境に、署名鍵や API 認証情報を、必要な分だけ渡しているか。
- 使っている製品の維持側の対応（修正・設計変更・アーカイブ化）を確認し、配備の側で担う範囲を決めているか。

## 5. 事実と時系列

- **対象**: Pyodide（WebAssembly 上の Python）を使う 7 製品。主な対象は、**n8n**（ワークフロー自動化、CVE-2025-68668、CVSS 9.9）、**Grist**（表計算・DB、CVE-2026-24002、CVSS 9.1）、**Cohere Terrarium**（AI 生成コードのサンドボックス実行環境、CVE-2026-61522、CVSS 9.3）、**Hugging Face smolagents**（AI エージェント構築フレームワーク、CVE-2026-10613、CVSS 8.3）。このほか langchain-sandbox・stlite・cibuildwheel でも同種の懸念が確認された（Cyera）。
- **発表者**: Cyera の研究者 Vladimir Tokarev と Saar Pearl。DEF CON 34 での発表「Sandcastles, not Sandboxes」。
- **研究者の報告**: 各製品は `os` や `subprocess` などの危険なモジュールを禁止して隔離としていたが、`ctypes` と Emscripten が公開する関数を勘定に入れておらず、そこから CPython-in-WASM の外側の JS ホストへ越境できた。
- **n8n の場合（Cyera）**: Code ノードが Node.js 上の Pyodide で Python を実行する。脱出で n8n のサービスプロセスに達し、連携先の認証情報へ届きうる。
- **影響の範囲（Cyera）**: ホスト環境が影響範囲を決める。Node.js ではファイルシステム・プロセス・環境変数へ、CI/CD では公開トークンや署名鍵・ソースへ、AI エージェント環境では API 認証情報・内部サービス・データベースへ届きうる。

### 時系列

- **2025**: n8n の脆弱性に CVE-2025-68668 が採番。
- **2026-08-07**: DEF CON 34 で、Cyera が 7 製品に共通する Pyodide サンドボックス脱出を発表。4 件の CVE を伴う。
- **2026-08-10**: eSecurity Planet が報道。
- **開示後**: n8n が Python の実行を外部ランナーへ分離。ほかの製品の対応は分かれた。

> 本 Brief は、実地の被害でなく研究者による実証を扱う。「7 製品で再現されうる」は Cyera の発表と 4 件の CVE に基づく研究者の所見であり、各製品での実被害を主張するものではない。n8n の CVE は 2025 年採番だが、7 製品に共通する像が示されたのは DEF CON 34（2026-08-07）である。本文の CVSS 値は発表元 Cyera の記載による。CVE-2026-24002 については NVD が 9.6、CNA（GitHub）が 9.0 を割り当てており、出典によって値が異なる。CVE-2026-61522 と CVE-2026-10613 は本 Brief 執筆時点で NVD・GitHub Advisory のいずれにも未収載である。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **n8n**: Python の実行を外部ランナーへ切り出した。
- **ほかの維持側**: 対応は製品ごとに分かれ、設計変更・アーカイブ化・「隔離は配備側で担保すべき」との立場が併存した。維持側の修正状況は製品ごとに異なる。

## 6. Sources

- **Cyera Research（研究一次）**: "Sandcastles, not Sandboxes: How One Architectural Flaw Exposed Seven Products"（DEF CON 34、2026-08）— <https://www.cyera.com/research/sandcastles-not-sandboxes-how-one-architectural-flaw-exposed-seven-products>
- **NVD（一次・CVE）**: CVE-2025-68668（n8n）— <https://nvd.nist.gov/vuln/detail/CVE-2025-68668> / CVE-2026-24002（Grist）— <https://nvd.nist.gov/vuln/detail/CVE-2026-24002>
- **eSecurity Planet（独立報道）**: "DEF CON 34: One Pyodide Flaw Exposed Seven Products"（2026-08-10）— <https://www.esecurityplanet.com/threats/def-con-34-one-pyodide-flaw-exposed-seven-products/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
