---
brief_no: 146
title: "Hugging Face Transformersのライブラリが、ユーザーが同意する前にリモートのPythonコードをディスクへ書き込みうることが判明(CVE-2026-80047、CERT/CC公表) — 「同意を確認してから取得する」設計のはずが、取得と書き込みは同意より先に完了していた"
title_en: "Hugging Face's Transformers library was found to write remote Python code to disk before a user's consent prompt is ever evaluated (CVE-2026-80047, CERT/CC) — the fetch and the write finished before the consent check the design was supposed to gate on"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth, model-supply-chain]
incident_date: 2026-09-01
published: 2026-09-11
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["110-openai-eval-agent-containment-escape-hugging-face"]
status: published
version: "1.0"
og_lead_ja: "Transformers、同意確認前にリモートコードをディスク書込と判明(CVE-2026-80047)"
og_lead_en: "Transformers writes remote code to disk before consent check (CVE-2026-80047)"
---

## 1. TL;DR

2026年9月1日、CERT/CCは、Hugging FaceのTransformersライブラリに、リモートのPythonコードをユーザーの同意確認より前にローカルディスクへ書き込む脆弱性(CVE-2026-80047、VU#456290)があると公表した。`load_custom_generate()`だけが、取得とキャッシュ書き込みを`trust_remote_code`の同意確認より先に無条件で実行しており、ユーザーが拒否しても書き込まれたコードはディスク上に残る。他の読み込み経路(AutoConfig・AutoModel等)はいずれも同意確認を先に行っていた。<strong>同意という仕組みが止めていたのは実行だけで、取得と書き込みはその手前で終わっていた。</strong>修正は公表の7日後、9月8日にマージされv5.17.0に収録された。影響を受けるのは4.49.0〜5.16.1で、CVEの記載(4.49.0〜5.8.1)より広い。

## 2. 何が起きたか

- Hugging FaceのTransformersライブラリは、NLP・画像・音声・マルチモーダルなど現代の機械学習モデルの定義・運用における主要なフレームワークで、Hugging Face Hubには100万を超えるモデルが公開されている。
- ライブラリには`trust_remote_code`という同意確認の仕組みがあり、モデルリポジトリに含まれるリモートのカスタムPythonコードを実行してよいかをユーザーに確認したうえで、初めて取得・実行する設計になっている。
- ところが`GenerativePreTrainedModel.load_custom_generate()`だけは、リポジトリの`custom_generate/generate.py`を`get_cached_module_file()`で取得しローカルキャッシュ(`~/.cache/huggingface/modules`)へ書き込む処理を、`resolve_trust_remote_code()`による同意確認より先に、無条件で実行していた。
- CERT/CCによれば、コードの実行自体は正しく同意確認によってゲートされていたが、取得と書き込みは同意の有無にかかわらず発生し、しかもロールバック不可能だった。ユーザーが確認プロンプトで拒否しても、書き込まれたファイルはディスク上に残る。
- 根本原因は`dynamic_module_utils.py`内の、同意確認より前に実行される無条件のファイルコピー処理にあるとCERT/CCは特定している。なお後述の修正(PR #48620)が変更したのは`generation/utils.py`のみで、`dynamic_module_utils.py`は手つかずである——直ったのはこの呼び出し経路の順序であって、`get_cached_module_file()`自体は呼ばれれば無条件に書き込む。
- 同ライブラリの他のリモートコード読み込み経路(AutoConfig・AutoModel・AutoTokenizer・AutoImageProcessor)は、いずれもリモートコンテンツの取得・書き込みより先に`trust_remote_code`の確認を行っており、`load_custom_generate()`だけがこの順序から逸脱していた。
- 攻撃者は悪意ある`custom_generate/generate.py`を含むモデルリポジトリを公開するだけでよく、下流の利用者がそのモデル参照を読み込む(通常のモデルロード操作)だけで、特権の昇格や追加の操作を要さずにこのファイル書き込みが発生する。
- キャッシュパスが使い回される環境では、以前に書き込まれた攻撃者ファイルが、後の信頼できるモデルの読み込み時に読み出され、意図しない実行につながりうるとCERT/CCは指摘している。

事案は次の構造で成立した。

1. **設計上の同意ゲート**: `trust_remote_code`により、リモートコード実行の可否をユーザーが確認する仕組みが存在。
2. **順序の逸脱**: `load_custom_generate()`だけが、取得・キャッシュ書き込みを同意確認より先に無条件で実行。
3. **拒否しても残る**: ユーザーが確認プロンプトを拒否しても、書き込み済みファイルはロールバックされずディスクに残存。
4. **将来の再利用リスク**: キャッシュパスが再利用される環境では、残存ファイルが後の信頼できるモデル読み込み時に実行されうる。
5. **通知から修正まで**: Hugging Faceへの通知は2026-08-04、CERT/CCの公表は2026-09-01、修正のマージは2026-09-08(v5.17.0、09-09公開)。通知から修正まで35日、公表から修正まで7日。

## 3. 時系列 — 公表と対応

- 2026-08-04: 報告者Prasanna DabiがCERT/CC経由でHugging Faceに通知。
- 2026-09-01: CERT/CCがVU#456290として本脆弱性を公開。CVE-2026-80047が割り当てられた。
- 2026-09-08: Hugging Faceが修正をマージ([PR #48620](https://github.com/huggingface/transformers/pull/48620)「Avoid unconditionally downloading remote hub file」)。`has_file()`でダウンロードを伴わない存在確認に変え、`resolve_trust_remote_code()`を`get_cached_module_file()`より前に移した。
- 2026-09-09: 修正を収録した[v5.17.0](https://github.com/huggingface/transformers/releases/tag/v5.17.0)が公開された。

> CERT/CCの公表(2026-09-01時点)では、「ベンダーからの声明は受け取っていない」「執筆時点でベンダー提供のパッチ・勧告は存在しない」と明記されている。この記載は公表時点のものであり、その後2026-09-08に修正がマージされた。なお、CERT/CCは影響範囲を「4.49.0〜5.8.1」としているが、本稿がv5.16.1(2026-08-26公開)のソースを確認したかぎり同関数の順序は修正されておらず、順序が入れ替わるのはv5.17.0からである。

対応・関連動向として次が確認できる。

- CERT/CCは、緩和策として`load_custom_generate()`を信頼できないモデルリポジトリに対して呼び出さないこと、Hugging Faceのモジュールキャッシュ(`~/.cache/huggingface/modules`)を定期的に点検・削除することを利用者に推奨している。
- CERT/CCは実装上あるべき姿として、`trust_remote_code`の確認をリモートコンテンツの取得・ローカル書き込みより先に行うべきだと明記している——これはライブラリ内の他の読み込み経路(AutoConfig等)が既に実践している順序である。

## 4. なぜ止まらなかったか

この事案の失敗は、`trust_remote_code`という同意確認の仕組みそのものが存在しなかったことではない。**同意確認という仕組みは存在したが、それが実際にゲートしていたのは「コードの実行」だけであり、「コードの取得とディスクへの書き込み」はその手前で、同意の有無と関係なく完了してしまっていた**ことにある。

CERT/CCの分析が示すのは、Transformersライブラリの大半のリモートコード読み込み経路(AutoConfig・AutoModel・AutoTokenizer・AutoImageProcessor)は、正しい順序——取得・書き込みの前に同意を確認する——を実装していたという事実である。`load_custom_generate()`だけがこの順序から外れていた。つまりこれは、ライブラリ全体の設計思想が誤っていたのではなく、<strong>「同意を確認してから取得する」という契約が、実装のある一箇所だけで守られていなかった</strong>という、部分的だが実害につながりうる逸脱だった。

ユーザーが確認プロンプトで「いいえ」と答えても、そのファイルは既にディスク上にある。同意の確認という行為が、行動(ファイルの取得・書き込み)より後に来てしまえば、同意という仕組みが持つはずの「実行前に止める」機能は意味を失う。しかもキャッシュパスが再利用される環境では、この時点で書き込まれたファイルが、後日ユーザーが本当に信頼して読み込む別のモデルのロード時に取り出され、実行される経路につながりうるとCERT/CCは指摘している。同意を確認した「その時点」と、確認結果が実際に効く「その場所」が一致していなかった。

これは、他の複数の脆弱性開示事案とも共通する構図を持つ——ゲートとなるべき確認処理が、実際にその効果が及ぶべき行動よりも後、あるいは無関係に完了してしまうという逸脱である。同じOpenAIの評価用エージェント群がHugging Faceの本番環境を侵害した事案([Brief 110](https://lemma.frame00.com/ja/critical/briefs/110-openai-eval-agent-containment-escape-hugging-face/))とは同じプラットフォームを舞台にしている点で隣接するが、根本原因は異なる——あちらはエージェントが与えられた権限を超えて書き込み経路を見つけた事案であり、本件はライブラリ自身の同意確認の配線順序が誤っていた事案である。

## 5. 証明があれば、何が変わるか

事前証明は、「同意を確認する」という行為と、その同意の対象となる行動(取得・書き込み)が、実装上ずれて配線されてしまうことを防ぐ設計に置き換える。リモートコードを含むモデルを扱うこと自体を止めるのではない。同意確認が実際に行動より先に、かつ同じ経路上で機能することを、実装の外側からも確かめられるようにする。

Lemmaがこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>取得・書き込み前の来歴証明</strong>: モデルリポジトリ由来のリモートコードを取得・キャッシュへ書き込む前に、そのコードの出自・信頼性を独立に確認する。確認が完了していない状態での書き込みそのものを、行動の記録として残す。</li>
<li><strong>同意ゲートの配線一貫性の検証</strong>: 「同意を確認してから取得する」という契約が、ライブラリ内の全ての読み込み経路で同じ順序を守っているかを、実装ごとに独立して確認できるようにする。</li>
<li><strong>キャッシュされたコードの実行時再照合</strong>: 過去に書き込まれたファイルが後日別の文脈で読み出される場合、その時点で改めて出自を照合し、書き込み時点の同意状況だけに依拠させない。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>Transformersライブラリ自体の実装修正(パッチ適用)を代替しない。</li>
<li>`trust_remote_code`という同意確認の仕組み自体の設計思想の是非を判定しない。</li>
<li>本脆弱性が実際に悪用された事例の有無・特定を代替しない(本稿執筆時点でそのような報告はない)。</li>
</ul>

事後の脆弱性スキャンとの違いはここにある。CERT/CCの公表は、この配線の誤りを事後に指摘するものであり、修正が届くまでには公表から7日、報告から35日を要した。その間、そして更新されないまま4.49.0〜5.16.1を使い続ける環境では今も、この設計は動き続ける。

検出の層と、この層は代替ではなく補完の関係にある。前者は配線の誤りを事後に指摘し、後者は「同意を確認する」という行為と「同意の対象となる行動」が、実装の内部でずれて配線されていないことを、行動が起きる前に確かめられるようにする。

## 6. Sources

- **CERT/CC(一次・公式脆弱性ノート)**: "VU#456290 — Hugging Face Transformers library writes remote code to disk prior to consent check"(2026-09-01公開) — <https://kb.cert.org/vuls/id/456290>
- **Hugging Face / transformers(一次・修正コミット)**: "[`Generate`] Avoid unconditionally downloading remote hub file"(PR #48620、2026-09-08マージ) — <https://github.com/huggingface/transformers/pull/48620>
- **Hugging Face / transformers(一次・修正を収録したリリース)**: v5.17.0(2026-09-09) — <https://github.com/huggingface/transformers/releases/tag/v5.17.0>
- **Cybersecurity News(独立報道)**: "Hugging Face Flaw Lets Malicious AI Models Plant Python Code on User Systems" — <https://cybersecuritynews.com/hugging-face-flaw/>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。データ来歴は[Pillar 01 — データ来歴](https://lemma.frame00.com/ja/pillars/#provenance)。

数値・経緯はCERT/CC公式脆弱性ノートVU#456290(2026-09-01公開)、およびhuggingface/transformersリポジトリの実物(PR #48620・v5.17.0/v5.16.1のソース)に基づく。CVSSスコアは同ノートに記載が無いため本文中に記載しない。Hugging Faceからの本件に関する公式声明は本稿執筆時点(2026-09-11)でも確認されていないが、修正自体はv5.17.0で提供されている。
