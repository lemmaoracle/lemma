---
brief_no: 121
title: "Hugging Face Diffusers「FaceHugger」：モデルを読み込むだけで任意コードが実行された(Zafran の調査、CVE-2026-44827 他)"
title_en: "Hugging Face Diffusers \"FaceHugger\": loading a model was enough to run arbitrary code (Zafran research, CVE-2026-44827 et al.)"
pillar: "02-verifiable-ai"
primary_category: "model-supply-chain"
secondary_categories: ["code-provenance", "agent-infrastructure"]
incident_date: 2026-07-27
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["116-open-oss-privacy-filter-fake-model", "090-air-fake-agent-skill-toctou", "073-shadowmq-pickle-zmq-pattern", "072-lerobot-pickle-grpc-rce", "095-amazon-q-mcp-auto-execution"]
status: published
gate: "intake"
version: "1.0"
og_lead_ja: "Hugging Face Diffusers「FaceHugger」でモデル読込時にコード実行（CVE-2026-44827 他）"
og_lead_en: "\"FaceHugger\" flaws in Hugging Face Diffusers let a malicious model repo run code on load"
search_title: "Diffusers の FaceHugger：読込でコード実行"
search_description: "Hugging Face の Diffusers で、悪性のモデルリポジトリを読み込むだけで任意コードが実行される欠陥群 FaceHugger が公表された（Zafran）。何が起きたか、なぜ安全ガードを通ったか、対策を整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "AI ライブラリの脆弱性 · モデル読込で実行"
og_kicker_en: "AI LIBRARY FLAW · CODE RUNS ON LOAD"
og_headline_ja: "モデルを読み込むだけで、\n任意コードが実行された。\n<accent>CVE 3 件</accent>"
og_headline_en: "Just loading a model\nran arbitrary code.\n<accent>Three CVEs</accent>"
key_figures:
  - value: "3"
    unit: "件"
    label: "CVE として追跡される欠陥。CVSS は 8.8・7.5・8.8（CNA である GitHub の採点）"
    tone: "alert"
  - value: "約 700 万"
    label: "Diffusers の月間ダウンロード数。本番の AI パイプラインや CI/CD の内側で動く"
  - value: "03-19 → 05-01"
    label: "Zafran が最初の 2 件を報告してから、修正版 0.38.0 が公開されるまで"
glossary:
  - term: "trust_remote_code"
    desc: "未審査のカスタムコードの実行を止めるための安全ガード。既定では無効（False）で、カスタムコードを拒む。"
  - term: "TOCTOU"
    desc: "確認した時点と使う時点のずれ（time-of-check to time-of-use）。確認のあとに対象が入れ替わると、確認が意味を失う。"
insight:
  slug: "checked-is-not-what-runs"
  label: "確認した対象と実行される対象のずれ"
  quote: "確認したファイルと実行するファイルが同じものかを、実行の直前に照合しなければ、安全ガードを通った扱いのまま別のコードが動く。"
industries: ["ai", "developers"]
controls:
  - slug: "hold-unverified"
    item: "ガードが確認したファイルと実行されるファイルが同じと確認するまで実行しない"
attack_method: "supply-chain"
takeaway: "安全ガード trust_remote_code は設定の取得にしか働かず、その後にロードされるコードが食い違っても、ガードを通った扱いのまま実行された。"
self_check: "モデルを読み込むとき、ガードが確認したファイルと実行されるファイルが同じものかを照合しているか。"
countries: ["global"]
---

## 1. 要点

悪性のモデルリポジトリを読み込ませるだけで、利用者の端末で任意の Python コードが実行された。未審査コードの実行を止める安全ガード `trust_remote_code` は、既定でカスタムコードを拒む側に倒れていた。ただ、モデルのダウンロードは設定の取得と本体の取得という 2 回の非アトミックな HTTP リクエストに分かれており、ガードは最初の 1 回にしか働いていなかった（Zafran）。<strong>確認したファイルと実行するファイルが同じものかを、実行の直前に照合しなければ、安全ガードを通った扱いのまま別のコードが動く。</strong>

## 2. 通った操作

- **通った操作**: `DiffusionPipeline.from_pretrained` によるカスタムパイプラインの読み込み。ガードが見た対象と実際にロードされる対象を食い違わせると、差し替えられたコードが、ガードを通過した「安全」な扱いのまま実行された（Zafran）。
- **止まった操作**: 無い。`trust_remote_code` の確認は働いていたが、最初のリクエスト（設定）にしか及ばなかった（Zafran）。
- **食い違いの作り方**: 競合状態の変種（CVE-2026-45804）では、チェックのあと、本体を取得する前の窓で設定を差し替える。ほかの変種は時間差を要さず、既定で解決されるファイル名 `None.py`、クロスリポジトリのパイプライン読込、ローカルスナップショットからの読込、悪性のカスタムコンポーネントを通じて、同じ食い違いを作る（Zafran）。
- **受け付けた側に届くもの**: 一般に、モデルを読み込む側に届くのは、名前・モデルカード・ダウンロード数と、取得したファイルである。それらは、いま実行されようとしているコードの来歴を示さない。差し替えは、リポジトリという信頼された配布経路の内側で起きる。
- **公表されていないこと**: 悪性のリポジトリが実際に読み込まれた環境の有無と数。本 Brief 公表時点で、広範な実地悪用の報告は確認されていない。

## 3. 実行前の照合

経路を問わず区別できる条件は、モデルを読み込む側が、取得の完了後・実行の直前に、実際にロードされるコードと重みが、確認したものと同じで、主張どおりの発行者が発行した改ざんされていないものかを照合することである。

- **誰が承認を出すか**: モデルの発行者と、どの発行者のモデルを読み込んでよいかを決める利用者・組織。リポジトリの所在や名声、ダウンロード数は承認にならない。
- **どこで照合するか**: 取得が完了したあと、コードが実行される直前。照合の対象は、モデルカードや名前ではなく、実際にロードされるコードと重みのハッシュである。一致しないものは読み込まずに保留する。
- **何が残るか**: どのコードと重みを、どの発行者の確認で、いつ読み込んだ（または止めた）かの記録。あとから、どの環境が何を実行したかを示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝モデルのコードが実行される前に、ロードされるコードと重みが確認したものと同じで、発行者が主張どおりかを照合し、記録に残すこと。検知＝研究者が欠陥を見つけて報告すること。日付は、各社が報告・公表した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>取得のあと・実行の直前に、ロードされるコードと重みが確認したものと同じかを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>差し替えたコードが、ガードを通った扱いのまま実行された<br>3 つの CVE がすべて trust_remote_code を回避する</span></div>
<div class="rx-zone det"><b>検知 · 研究者が見つけた</b>Zafran が報告し、0.38.0 で既知の回避経路が塞がれた</div>
<div class="rx-g g1"><div class="t">2026-03-19</div><b>Zafran が最初の 2 件を報告</b></div>
<div class="rx-g g2"><div class="t">2026-05-01</div><b>修正版 Diffusers 0.38.0</b></div>
<div class="rx-g g3"><div class="t">2026-07-27</div><b>Zafran が技術詳細を公表</b></div>
<div class="rx-g g4"><div class="t">2026-08-03</div><b>報道が広がる</b></div>
</div>
</figure>

ガードは動いていて、既定でカスタムコードを拒んでいた。効かなかったのは、チェックの瞬間に見た成果物と、実行の瞬間の成果物が同じものかを照合する層である。トレンドやダウンロード数が来歴の代わりにならないことを示した [Brief 116](https://lemma.frame00.com/ja/critical/briefs/116-open-oss-privacy-filter-fake-model/)（偽の OSS プライバシーフィルタ）、スキャナーを通過したあとに中身が変わる [Brief 090](https://lemma.frame00.com/ja/critical/briefs/090-air-fake-agent-skill-toctou/)（AIR の偽エージェントスキル）と同じ形で、今回は確認と実行のあいだで対象が入れ替わった。

## 4. Lemma でできること

**Lemma は、実行前の照合を、モデルのコードが実行される直前に置く。** 悪性のモデルを見分けるのでも、コードの危険性を判定するのでもなく、実際にロードされるコードと重みが、検証済みの発行者の発行したものと一致するかを、実行の前に照合する。

### 注意したい業界・業務

- **業界 · AI**: Hugging Face などの公開リポジトリからモデルを取得し、本番の AI パイプラインで読み込む組織。
- **業界 · 開発者・エージェント運用**: CI/CD の内側で、カスタムパイプラインを含むモデルを読み込む開発者と組織。

### いまの対策と Lemma の違い

今回の経路は、ガードの確認のあとにロードされる対象が食い違うことで、時間差を使う変種と、時間差を使わない変種がある。

| 対策 | 時間差で設定を差し替える（CVE-2026-45804） | 時間差を使わない食い違い（`None.py`・クロスリポジトリ・ローカルスナップショット） |
| --- | --- | --- |
| `trust_remote_code`（既定で無効） | 効かない | 効かない |
| 修正版 0.38.0 への更新（確認を動的モジュール読込の隘路へ移す） | 効く | 効く |
| リポジトリのリビジョン固定 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く |

`trust_remote_code` は、3 つの CVE のいずれでも回避された。0.38.0 は、セキュリティチェックを動的モジュール読込の隘路へ移し、確認の対象と実行の対象を同じ地点にそろえて、既知の回避経路を塞いだ。更新していない環境には届かない。リビジョン固定は推奨されているが、Zafran が並行して開示した `transformers` の欠陥では、固定したコミットハッシュが伝播せず、`trust_remote_code` の承認のあとに悪性コードへ差し替えられた。Lemma は、名前や所在ではなく、実際にロードされるコードと重みを、実行の前に照合する。読み込みの記録も残るので、どの環境が何を実行したかを、あとから確認できる。

注：Lemma の照合が働くのは、モデルを読み込む処理に照合を組み込み、承認する発行者と、実行してよいコード・重みのハッシュが、読み込む側の外で管理されている場合に限る。承認した発行者自身が悪性のコードを発行した場合は、通りうる。Diffusers 自体の実装は変えない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

モデルを読み込む組織で確認する 3 項目

- 読み込んでよいモデルの発行者を決め、その発行者が発行したものかを、名前やダウンロード数とは別に確認しているか。
- Diffusers を 0.38.0 以降に更新し、読み込むリポジトリのリビジョンを固定しているか。
- モデルを読み込む処理を、コードの実行を前提としない権限の範囲に閉じているか。

## 5. 事実と時系列

- **対象**: Hugging Face の Diffusers（拡散モデル用の画像生成ライブラリ）。`DiffusionPipeline.from_pretrained` でカスタムパイプラインを読み込む利用者が影響を受け、悪性のモデルリポジトリを読み込んだ端末で任意コードが静かに実行される。月間およそ 700 万ダウンロード（1 日約 20 万）。
- **発見者**: セキュリティ企業 Zafran（Zafran Labs の Gal Zaban、Ido Shani）。総称は FaceHugger。
- **脆弱性**: **CVE-2026-44827**（CVSS 8.8）＝既定で解決されるファイル名 `None.py` をカスタムパイプラインコードとして読ませるコードインジェクション。**CVE-2026-45804**（CVSS 7.5）＝`hf_hub_download` と `snapshot_download` の 2 回の呼び出しのあいだに設定を書き換える競合状態。**CVE-2026-44513**（CVSS 8.8）＝クロスリポジトリのパイプライン読込・ローカルスナップショットからの読込・悪性カスタムコンポーネントという、同じ根を持つ 3 変種を束ねたもの。
- **回避の連鎖（Zafran）**: ① モデルのダウンロードが「設定ファイルの取得」と「本体の取得」という 2 回の HTTP リクエストに分かれている。② `trust_remote_code` のチェックは、最初のリクエスト（設定）にしか働かない。③ ガードが見た対象と、実際にロードされる対象を食い違わせる。④ 差し替えられたコードが、ガードを通過した「安全」な扱いのまま実行される。
- **競合状態の条件（Zafran）**: 差し替えの窓は実測で約 0.3 秒で、初回のダウンロードが未キャッシュであることを要する。ただし利用の多いリポジトリでは、悪性の設定を一瞬だけ置いて戻すことで統計的に成功しうると同社は指摘する。

### 時系列

- **2026-03-19**: Zafran が最初の 2 件を Hugging Face へ報告。
- **2026-05-01**: 修正版 Diffusers 0.38.0 が公開。
- **2026-05**: 責任開示を経て CVE が公表。
- **2026-07-27**: Zafran Labs（Gal Zaban、Ido Shani）が技術詳細を公表。
- **2026-08-03**: The Hacker News、Cybersecurity News 等が報じ、報道が広がる。

> CVSS はいずれも CNA である GitHub の採点である。NVD 上の評価状態は CVE ごとに異なり、本 Brief 執筆時点で CVE-2026-44827 は Analyzed、CVE-2026-44513 は Modified、CVE-2026-45804 は Awaiting Analysis である。責任開示を経ての公表であり、本 Brief 公表時点で広範な実地悪用の報告は確認されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Diffusers**: 0.38.0 で、セキュリティチェックを動的モジュール読込の隘路へ移し、確認の対象と実行の対象を同じ地点にそろえることで既知の回避経路を塞いだ。利用者には 0.38.0 以降への更新と、リポジトリのリビジョン固定が推奨されている。
- **transformers**: Zafran は同時に Hugging Face の `transformers` にも並行する欠陥を開示した。固定したコミットハッシュが伝播せず、`trust_remote_code` の承認後に悪性コードへ差し替えられる。
- **先行する同種の事案**: 2026 年 3 月に vLLM の `trust_remote_code` 回避、4 月に InstructLab の `trust_remote_code=True` ハードコードが指摘されている。モデルを読み込むことがコードの実行になりうるのは、拡散モデルに限らない。

## 6. Sources

- **NVD（一次・脆弱性登録）**: CVE-2026-44827 — <https://nvd.nist.gov/vuln/detail/CVE-2026-44827> ／ CVE-2026-45804 — <https://nvd.nist.gov/vuln/detail/CVE-2026-45804> ／ CVE-2026-44513 — <https://nvd.nist.gov/vuln/detail/CVE-2026-44513>
- **Hugging Face / GitHub（一次・修正リリース）**: “Diffusers 0.38.0”（2026-05-01）— <https://github.com/huggingface/diffusers/releases/tag/v0.38.0>
- **The Hacker News（独立報道）**: Ravie Lakshmanan, “Hugging Face Diffusers Flaws Could Let Model Repositories Execute Arbitrary Code”（2026-08-03）— <https://thehackernews.com/2026/08/hugging-face-diffusers-flaws-could-let.html>
- **Infosecurity Magazine（独立報道・技術詳細）**: Alessandro Mascellino, “Bugs in Hugging Face Diffusers Bypass Custom Code Safeguard”（2026-07-28）— <https://www.infosecurity-magazine.com/news/hugging-face-diffusers-trust/>
- **Cybersecurity News（独立解析）**: Guru Baran, “Hugging Face Diffusers Vulnerabilities Enable Remote Code Execution Through Malicious AI Models”（2026-08-03）— <https://cybersecuritynews.com/hugging-face-diffusers-vulnerabilities/>
- **RAXE Labs（先行する兄弟事案・独立解析）**: “RAXE-2026-044: vLLM Hardcoded trust_remote_code Bypass”（CVE-2026-27893、2026-03-27）— <https://raxe.ai/labs/advisories/RAXE-2026-044>
- **TheHackerWire（先行する兄弟事案）**: “InstructLab RCE via Malicious HuggingFace Models”（CVE-2026-6859、2026-04-22）— <https://www.thehackerwire.com/instructlab-rce-via-malicious-huggingface-models-cve-2026-6859/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
