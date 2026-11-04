---
brief_no: 146
title: "Hugging Face Transformers：同意の確認より前に、リモートの Python コードがディスクへ書き込まれうると判明(CERT/CC 公表、CVE-2026-80047)"
title_en: "Hugging Face Transformers: remote Python code could be written to disk before the consent check (CERT/CC, CVE-2026-80047)"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth, model-supply-chain]
incident_date: 2026-09-01
published: 2026-09-11
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["121-hugging-face-diffusers-toctou"]
status: published
gate: "intake"
version: "1.0"
og_lead_ja: "Transformers の load_custom_generate() が、同意の確認より前にリモートのコードを取得し、ディスクへ書き込んでいた（CVE-2026-80047）"
og_lead_en: "Transformers' load_custom_generate() fetched remote code and wrote it to disk before the consent check (CVE-2026-80047)"
search_title: "Transformers：同意の前にリモートコードを書き込み"
search_description: "Transformers で、利用者が同意する前にリモートの Python コードがディスクへ書き込まれうると CERT/CC が公表（CVE-2026-80047）。通った操作と、何を照合するかを整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "AI ライブラリの脆弱性 · 同意の前に書き込み"
og_kicker_en: "AI LIBRARY FLAW · PRE-CONSENT WRITE"
og_headline_ja: "同意を確認するより前に、\nコードがディスクに残る。\n<accent>CERT/CC が公表</accent>"
og_headline_en: "Remote code hit disk\nbefore the consent check.\n<accent>Per CERT/CC</accent>"
key_figures:
  - value: "1"
    unit: "経路"
    label: "同意の確認より先に取得・書き込みをしていた読み込み経路（load_custom_generate()）。ほかの経路は同意を先に確認していた（CERT/CC）"
    tone: "alert"
  - value: "08-04 → 09-08"
    label: "CERT/CC 経由で Hugging Face に通知されてから、修正がマージされるまで（35 日）"
  - value: "4.49.0 → 5.16.1"
    label: "本稿がソースで見た、順序が直っていない版の範囲。CVE の記載は 5.8.1 まで"
glossary:
  - term: "trust_remote_code"
    desc: "モデルリポジトリに含まれるカスタムの Python コードを実行してよいかを、利用者に確認する仕組み。"
  - term: "モジュールキャッシュ"
    desc: "取得したリモートのコードを置いておくローカルの場所（~/.cache/huggingface/modules）。後の読み込みで使い回される。"
insight:
  slug: "consent-after-write"
  label: "同意の確認より先に済む書き込み"
  quote: "同意の確認は、その同意で止めたい操作より前に置かなければ、拒否しても操作の結果が残る。"
industries: ["ai", "developers"]
controls:
  - slug: "check-origin"
    item: "モデルリポジトリ由来のリモートコードは、取得して書き込む前に出どころを確認する"
  - slug: "hold-unverified"
    item: "同意の確認が済む前の取得と書き込みを、すべての読み込み経路で止める"
attack_method: "supply-chain"
takeaway: "同意の仕組み trust_remote_code はコードの実行だけを止めており、load_custom_generate() では、取得とディスクへの書き込みが同意の確認より先に済んでいた（CERT/CC）。"
self_check: "リモートのコードを取得してディスクへ書き込む前に、その出どころと利用者の同意の確認が済んでいるか。"
countries: ["global"]
---

## 1. 要点

モデルリポジトリに含まれるリモートのコードは、利用者が `trust_remote_code` で同意してから取得・実行する設計だった。ところが `load_custom_generate()` だけは、取得とキャッシュへの書き込みを同意の確認より先に無条件で済ませており、利用者が拒否しても、書き込まれたファイルはディスクに残った（CERT/CC）。同意が止めていたのは、実行だけだった。<strong>同意の確認は、その同意で止めたい操作より前に置かなければ、拒否しても操作の結果が残る。</strong>

## 2. 通った操作

- **通った操作**: `GenerativePreTrainedModel.load_custom_generate()` による、モデルリポジトリの `custom_generate/generate.py` の取得と、ローカルのモジュールキャッシュへの書き込み。`resolve_trust_remote_code()` による同意の確認より先に、無条件で行われていた（CERT/CC）。
- **止まった操作**: コードの実行。実行は同意の確認で正しく止められていた（CERT/CC）。ただし、取得と書き込みは同意の有無にかかわらず起き、元に戻されなかった。
- **ほかの経路**: AutoConfig・AutoModel・AutoTokenizer・AutoImageProcessor は、いずれも取得・書き込みより先に `trust_remote_code` を確認していた。順序から外れていたのは `load_custom_generate()` だけだった（CERT/CC）。
- **受け付けた側に届くもの**: 一般に、モデルを読み込む側に届くのは、モデルの参照名と、取得したファイルである。どの経路が同意の前に書き込むかは、利用者からは見分けにくい。CERT/CC は、悪意あるコードを含むリポジトリを、利用者がふだんどおり読み込むだけで書き込みが起き、特権の昇格や追加の操作は要らないとしている。
- **後に残る危険**: キャッシュの場所が使い回される環境では、以前に書き込まれたファイルが、後に信頼できるモデルを読み込むときに読み出され、意図しない実行につながりうると CERT/CC は指摘している。
- **公表されていないこと**: 本脆弱性が実際に悪用された事例の有無。本稿執筆時点で、そのような報告は確認されていない。

## 3. 実行前の照合

経路を問わず区別できる条件は、リモートのコードがディスクへ書き込まれる前に、その出どころと利用者の同意が照合済みであることと、後で読み出されるときに、いま読み出すファイルが照合済みのものと同じであることである。

- **誰が承認を出すか**: どのモデルリポジトリのコードを取得・実行してよいかを決める利用者・組織。リポジトリの名前や、取得できたという事実は承認にならない。
- **どこで照合するか**: リモートのコードを取得し、キャッシュへ書き込む前。加えて、キャッシュに残ったファイルを後日読み出して実行する前。書き込み時点の同意の状態だけに頼らない。照合が済まないものは、書き込まずに保留する。
- **何が残るか**: どのリポジトリのどのコードを、誰の同意で、いつ取得・書き込み・実行した（または止めた）かの記録。同意が無いまま書き込もうとしたこと自体も、記録に残る。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝リモートのコードを取得・書き込み・実行する前に、出どころと利用者の同意を照合し、記録に残すこと。検知＝報告者と CERT/CC が欠陥を見つけて公表すること。日付は、各主体が通知・公表した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>取得・書き込みの前と、キャッシュから読み出して実行する前に、出どころと同意を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>同意の確認は、コードの実行だけを止めていた<br>利用者が拒否しても、取得したコードはディスクに残った</span></div>
<div class="rx-zone det"><b>検知 · 報告者と CERT/CC が見つけた</b>報告者が CERT/CC 経由で通知し、v5.17.0 で順序が入れ替わった</div>
<div class="rx-g g1"><div class="t">2026-08-04</div><b>Hugging Face に通知</b></div>
<div class="rx-g g2"><div class="t">2026-09-01</div><b>CERT/CC が公表</b></div>
<div class="rx-g g3"><div class="t">2026-09-08</div><b>修正がマージ</b></div>
<div class="rx-g g4"><div class="t">2026-09-09</div><b>v5.17.0 を公開</b></div>
</div>
</figure>

同意の仕組みは動いていて、実行は止めていた。効かなかったのは、同意で止めたい操作（取得と書き込み）より前に、同意と出どころを照合する層である。安全ガードが確認した対象と、実際に実行される対象が食い違った [Brief 121](https://lemma.frame00.com/ja/critical/briefs/121-hugging-face-diffusers-toctou/)（Hugging Face Diffusers の FaceHugger）と同じく、確認と操作の位置がそろっていなかった。

## 4. Lemma でできること

**Lemma は、03 の照合を、リモートのコードを取得して書き込む前と、それを実行する前に置く。** 悪意あるコードを見分けるのでも、コードの危険性を判定するのでもなく、取得・書き込み・実行しようとしているコードの出どころと、利用者の同意が照合済みかを、操作の前に照合する。

### 注意したい業界・業務

- **業界 · AI**: Hugging Face Hub などの公開リポジトリからモデルを取得し、カスタムのコードを含むモデルを読み込む組織。
- **業界 · 開発者・エージェント運用**: 開発端末や CI の中で、モデルを読み込み、キャッシュの場所を使い回す開発者と組織。

### いまの対策と Lemma の違い

今回の経路は、1 列目（取得とキャッシュへの書き込み）である。3 列目は、CERT/CC が指摘した、残ったファイルが後で読み出される危険である。

| 対策 | 取得とキャッシュへの書き込み | 書き込まれたコードの、その場での実行 | キャッシュに残ったファイルの、後日の読み出し |
| --- | --- | --- | --- |
| `trust_remote_code` の同意確認（v5.16.1 まで） | 効かない | 効く | 効かない |
| v5.17.0 への更新（同意の確認を取得の前へ移した） | 効く | 効く | 効かない |
| 信頼できないリポジトリに `load_custom_generate()` を呼ばない（CERT/CC の緩和策） | 一部 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く | 効く |

v5.16.1 までの同意確認は、実行は止めたが、`load_custom_generate()` の取得と書き込みには及ばなかった。v5.17.0 は、ダウンロードを伴わない存在確認に変え、同意の確認を取得の前へ移した。ただし、更新の前に書き込まれたファイルは消さないため、CERT/CC はキャッシュの定期的な点検・削除も推奨している。また修正が変えたのはこの呼び出しの順序で、`get_cached_module_file()` は呼ばれれば無条件に書き込む。信頼できないリポジトリを避ける運用は、何を信頼できるとするかの判断に頼る。Lemma は、取得・書き込み・実行の各操作の前に、出どころと同意を照合し、その記録を残す。

注：Lemma の照合が働くのは、モデルを取得・書き込み・読み出す処理に照合を組み込み、承認するリポジトリと、取得してよいコードのハッシュが、読み込む側の外で管理されている場合に限る。承認したリポジトリ自身が悪意あるコードを置いた場合は、通りうる。Lemma はキャッシュのファイルを消さず、Transformers 自体の実装も変えない。3 列目の状態語は、CERT/CC が指摘した危険に対する本稿の見立てである。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

モデルを読み込む組織で確認する 3 項目

- Transformers を v5.17.0 以降に更新しているか。
- 信頼できると決めたモデルリポジトリだけに `load_custom_generate()` を使う運用にしているか。
- モジュールキャッシュ（`~/.cache/huggingface/modules`）を定期的に点検し、同意していないコードを削除しているか。

## 5. 事実と時系列

- **対象**: Hugging Face の Transformers ライブラリ。NLP・画像・音声・マルチモーダルなどの機械学習モデルを定義・運用する主要なフレームワークで、Hugging Face Hub には 100 万を超えるモデルが公開されている。
- **脆弱性**: CVE-2026-80047（CERT/CC の VU#456290）。`load_custom_generate()` が、`custom_generate/generate.py` を `get_cached_module_file()` で取得してローカルキャッシュへ書き込む処理を、`resolve_trust_remote_code()` による同意の確認より先に、無条件で実行していた。
- **原因（CERT/CC）**: `dynamic_module_utils.py` の中の、同意の確認より前に実行される無条件のファイルコピー処理。
- **影響を受ける版**: CERT/CC の記載は 4.49.0〜5.8.1。本稿が v5.16.1（2026-08-26 公開）のソースを見たかぎり、同関数の順序は直っておらず、入れ替わるのは v5.17.0 からである。
- **報告者**: Prasanna Dabi（CERT/CC 経由で通知）。

### 時系列

- **2026-08-04**: 報告者 Prasanna Dabi が CERT/CC 経由で Hugging Face に通知。
- **2026-09-01**: CERT/CC が VU#456290 として公表。CVE-2026-80047 が割り当てられた。
- **2026-09-08**: Hugging Face が修正をマージ（[PR #48620](https://github.com/huggingface/transformers/pull/48620)「Avoid unconditionally downloading remote hub file」）。
- **2026-09-09**: 修正を収録した [v5.17.0](https://github.com/huggingface/transformers/releases/tag/v5.17.0) が公開。

> CERT/CC の公表（2026-09-01 時点）には、「ベンダーからの声明は受け取っていない」「執筆時点でベンダー提供のパッチ・勧告は存在しない」とある。これは公表時点の記載で、その後 2026-09-08 に修正がマージされた。Hugging Face からの本件に関する公式の声明は、本稿執筆時点（2026-09-11）で確認されていない。CVSS のスコアは同ノートに記載が無いため書かない。数値・経緯は CERT/CC の VU#456290 と、huggingface/transformers のリポジトリ（PR #48620、v5.17.0・v5.16.1 のソース）に拠る。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Hugging Face**: PR #48620 で、`has_file()` によるダウンロードを伴わない存在確認に変え、`resolve_trust_remote_code()` を `get_cached_module_file()` より前に移した。変更したのは `generation/utils.py` だけで、`dynamic_module_utils.py` はそのまま。
- **CERT/CC（緩和策）**: 信頼できないモデルリポジトリに対して `load_custom_generate()` を呼ばないこと、モジュールキャッシュ（`~/.cache/huggingface/modules`）を定期的に点検・削除することを推奨している。
- **CERT/CC（あるべき順序）**: `trust_remote_code` の確認を、リモートの内容の取得・ローカルへの書き込みより先に行うべきだとしている。ライブラリのほかの読み込み経路（AutoConfig など）が、すでにとっている順序である。

## 6. Sources

- **CERT/CC(一次・公式脆弱性ノート)**: "VU#456290 — Hugging Face Transformers library writes remote code to disk prior to consent check"(2026-09-01公開) — <https://kb.cert.org/vuls/id/456290>
- **Hugging Face / transformers(一次・修正コミット)**: "[`Generate`] Avoid unconditionally downloading remote hub file"(PR #48620、2026-09-08マージ) — <https://github.com/huggingface/transformers/pull/48620>
- **Hugging Face / transformers(一次・修正を収録したリリース)**: v5.17.0(2026-09-09) — <https://github.com/huggingface/transformers/releases/tag/v5.17.0>
- **Cybersecurity News(独立報道)**: "Hugging Face Flaw Lets Malicious AI Models Plant Python Code on User Systems" — <https://cybersecuritynews.com/hugging-face-flaw/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
