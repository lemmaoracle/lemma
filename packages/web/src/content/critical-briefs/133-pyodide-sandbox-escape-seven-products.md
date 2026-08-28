---
brief_no: 133
title: "同じ Pyodide サンドボックス脱出が 7 製品で再現されうることが示された — 「隔離されている」という前提が、独立に検証されていない"
title_en: "One Pyodide sandbox escape was shown to reproduce across seven products — the premise 'it's isolated' was never independently verified"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth, code-provenance]
incident_date: 2026-08-07
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["073-shadowmq-pickle-zmq-pattern", "094-cursor-duneslide-sandbox-escape", "109-servicenow-ai-platform-preauth-rce", "039-semantic-kernel-prompt-injection-rce", "066-litellm-ai-gateway-privilege-escalation"]
status: published
version: "1.0"
og_lead_ja: "同一のPyodideサンドボックス脱出が7製品で再現、隔離の前提が未検証"
og_lead_en: "One Pyodide sandbox escape reproduced across seven products; isolation premise unverified"
gap_detected: "検出は効きうる。危険なモジュール呼び出しや異常なプロセス生成は、監視の層として捉えられる。"
gap_missing: "「サンドボックスで隔離されている」という前提が、実行の前に独立に検証されていなかった。"
gap_fix: "コードをホスト権限で実行へ移す前に、その隔離境界が実際に成り立っていることを独立に検証する。"
---

## 1. TL;DR

DEF CON 34（2026 年 8 月）で、研究者は Pyodide（WebAssembly 上の Python）を使う 7 製品が、**危険なモジュールを禁止しただけで、ホストへの脱出経路を残していた**ことを示した。`ctypes` と Emscripten の関数が到達可能だったためである。**効かなかったのは、「サンドボックスで隔離されている」という前提を、実行の前に独立に検証する層である。**

## 2. 何が起きたか

- Cyera の研究者 Vladimir Tokarev と Saar Pearl が、7 製品に共通する Pyodide サンドボックス脱出を報告した（発表「Sandcastles, not Sandboxes」）。各製品は `os` や `subprocess` などの危険なモジュールを禁止して隔離を装っていたが、`ctypes` と Emscripten が公開する関数を勘定に入れておらず、そこから CPython-in-WASM の外側の JS ホストへ越境できた。
- 開示は 4 件の CVE になった（CVSS 8.3〜9.9、いずれも発表元 Cyera の記載による）。
- ホスト環境が影響範囲を決める。Node.js ではファイルシステム・プロセス・環境変数へ、CI/CD では公開トークンや署名鍵・ソースへ、AI エージェント環境では API 認証情報・内部サービス・データベースへ届きうる。

主な対象は次のとおり。

1. **n8n**（ワークフロー自動化、CVE-2025-68668、CVSS 9.9）：Code ノードが Node.js 上の Pyodide で Python を実行。脱出で n8n のサービスプロセスに達し、連携先の認証情報へ届きうる。n8n は Python 実行を外部ランナーへ切り出した。
2. **Grist**（表計算・DB、CVE-2026-24002、CVSS 9.1）：Python 数式を支える実行環境。
3. **Cohere Terrarium**（AI 生成コードのサンドボックス実行環境、CVE-2026-61522、CVSS 9.3）。
4. **Hugging Face smolagents**（AI エージェント構築フレームワーク、CVE-2026-10613、CVSS 8.3）。
5. このほか langchain-sandbox・stlite・cibuildwheel でも同種の懸念が確認された。維持側の対応は分かれ、設計変更・アーカイブ化・「隔離は配備側で担保すべき」との立場が併存した。

## 3. 時系列 — 公表と対応

- 2026-08-07（DEF CON 34）：Cyera が 7 製品横断の Pyodide サンドボックス脱出を発表。4 件の CVE を伴う。
- 開示後：n8n は Python 実行を外部ランナーへ分離。他製品は設計変更・アーカイブ化・配備側対応など対応が分かれた。

> 本 Brief は、実地の被害でなく研究者による実証を扱う。「7 製品で再現しうる」は Cyera の発表と 4 件の CVE に基づく構造的所見であり、各製品での実被害を主張するものではない。n8n の CVE は 2025 年採番だが、7 製品横断の像が示されたのは DEF CON 34（2026-08-07）である。本文の CVSS 値は発表元 Cyera の記載による。CVE-2026-24002 については NVD が 9.6、CNA（GitHub）が 9.0 を割り当てており、出典によって値が異なる。CVE-2026-61522 と CVE-2026-10613 は本 Brief 執筆時点で NVD・GitHub Advisory のいずれにも未収載である。

対応と論点は次のとおり。

- 対応が製品ごとに割れた事実自体が論点である。「Python の import 制限＝完全な境界」という前提が、複数の独立した製品に共有されていた。
- 影響の重さはホスト環境で決まる。同じ脱出でも、CI/CD なら署名鍵、AI エージェント環境なら顧客データへ届きうる。

## 4. なぜ止まらなかったか

この事案の失敗は、どれか一つの製品が独自のバグを抱えていたことではない。**「サンドボックスで隔離されている」という前提が、コードを実行へ移す前に独立に検証されていなかった**ことにある。同じ思い込みが 7 製品に共有されていた。

危険なモジュールを禁止すれば、見かけ上は境界ができる。だが Pyodide が動く WASM は自分の線形メモリを守るだけで、埋め込み環境が意図的に公開した能力（`ctypes`・Emscripten の関数）までは塞がない。制限されたはずの Python は、その公開された能力を使ってホストへ越境した。危険なモジュール呼び出しや異常なプロセス生成を後から監視で捉えることはできる。効かなかったのはその手前——「この隔離境界は実際に成り立っているか」を、コードを実行へ移す前に確かめる層である。

> 隔離は、それが実際に成り立っているかで意味が変わる。「危険なモジュールを禁止した」という見かけと、「ホストへ越境できない」という事実は別物である。境界の成立は、見かけではなく独立の検証で初めて担保される。

これは、未認証 pickle を即実行する同じ危険実装が AI 推論基盤に次々コピーされていた [Brief 073](https://lemma.frame00.com/ja/critical/briefs/073-shadowmq-pickle-zmq-pattern/)、一つの指示でサンドボックスを外して任意コードを実行させた [Brief 094](https://lemma.frame00.com/ja/critical/briefs/094-cursor-duneslide-sandbox-escape/) と同じ構造を共有する。共通するのは、実行が「隔離境界の成立」に結び付いて認可されていないことである。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、コードをホスト権限で実行へ移す一段手前に、その隔離境界が実際に成り立っていることを確かめる層を挟む。「危険なモジュールを禁止したか」を見るのではない。「この実行は、意図した隔離境界の内側にあるか」を、実行が成立する前に、実行側が独立に確かめられる形にする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>隔離境界の行動前検証</strong>：untrusted なコードをホスト権限で走らせる直前に、その実行が意図した隔離境界の内側にあることの証明を要求する。「隔離されているはず」を見かけでなく検証で確かめる。</li>
<li><strong>能力スコープの固定</strong>：実行環境が到達できる能力（ファイルシステム・プロセス・認証情報）の範囲を、意図した用途に固定し、公開された副次機能がそのまま越境経路にならないようにする。</li>
<li><strong>秘密情報の選択的開示</strong>：CI/CD の署名鍵やエージェント環境の API 認証情報を、実行環境へ素通しさせず、必要な検証だけを提示する形にする。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>危険なモジュール呼び出しや異常なプロセス生成を検知するのは、監視とスキャナーの仕事である。この層はその手前で、隔離境界の成立を確かめられるようにする。</li>
<li>証明が示せるのは実行が意図した境界の内側にあったかまでで、そのコード自体の善悪までは示せない。</li>
<li>どの実行にどの境界を課すかを決めるのは運用者であり、この層が出せるのはその判断材料までである。</li>
</ul>

自社の実行ログとの違いはここにある。ログは実行の後に残るが、その実行が隔離境界の内側にあったかを、実行の前に確かめる材料にはならない。

検出の層と、この層は代替ではなく補完の関係にある。前者は危険な呼び出しを後から捉え、後者は「その実行が、意図した隔離境界の内側にあるか」を、実行が成立する前に確かめられるようにする。

## 6. Sources

- **Cyera Research（研究一次）**: "Sandcastles, not Sandboxes: How One Architectural Flaw Exposed Seven Products"（DEF CON 34、2026-08）— <https://www.cyera.com/research/sandcastles-not-sandboxes-how-one-architectural-flaw-exposed-seven-products>
- **NVD（一次・CVE）**: CVE-2025-68668（n8n）— <https://nvd.nist.gov/vuln/detail/CVE-2025-68668> / CVE-2026-24002（Grist）— <https://nvd.nist.gov/vuln/detail/CVE-2026-24002>
- **eSecurity Planet（独立報道）**: "DEF CON 34: One Pyodide Flaw Exposed Seven Products"（2026-08-10）— <https://www.esecurityplanet.com/threats/def-con-34-one-pyodide-flaw-exposed-seven-products/>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。エージェント権限の証明は[Pillar 03 — エージェント権限](https://lemma.frame00.com/ja/pillars/#authority)。

維持側の修正状況は製品ごとに異なります。
