---
brief_no: 122
title: "Hugging Face の公開データセット：学習データに、いまも有効な認証情報が残っていたと報告された(Truffle Security 調査)"
title_en: "Hugging Face public datasets: Training data still held working credentials, researchers report (Truffle Security)"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["code-provenance", "data-provenance"]
incident_date: 2026-06-01
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["079-common-crawl-training-data-live-secrets", "036-commonpool-training-data-pii", "008-discord-scraping"]
status: published
gate: "permission-change"
version: "1.0"
search_title: "Hugging Face の学習データ：生きた鍵22万件の調査"
search_description: "Truffle Security が Hugging Face の公開データセット 7.6PB を走査し、いまも有効な認証情報 221,303 件を見つけたと報告した。何が起きたか、なぜ通知の後も鍵が残るか、対策を整理。"
og_lead_ja: "Truffle Security が Hugging Face の公開データセット 7.6PB を走査し、いまも有効な認証情報 221,303 件を見つけたと報告"
og_lead_en: "Truffle Security reports it scanned 7.6 PB of Hugging Face public datasets and found 221,303 still-valid credentials"
layout: "report"
sections: "proof"
og_kicker_ja: "AI の事例 · 学習データの認証情報"
og_kicker_en: "AI CASE · SECRETS IN TRAINING DATA"
og_headline_ja: "公開データセットに、\n有効な認証情報が\n残っていたと報告。\n<accent>221,303 件</accent>"
og_headline_en: "Public AI datasets\nheld working keys,\nresearchers report.\n<accent>221,303 still valid.</accent>"
key_figures:
  - value: "221,303"
    unit: "件"
    label: "いまも有効と検証された認証情報。6,003 のデータセットで見つかった（Truffle Security）"
    tone: "alert"
  - value: "7.6"
    unit: "PB"
    label: "走査した Hugging Face の公開データセット。約 81.5 万リポジトリ・1 億 8,690 万ファイル"
  - value: "44%"
    label: "複数のデータセットに現れた、有効な鍵の割合。19,380 件は 10 以上のデータセットに現れた"
glossary:
  - term: "TruffleHog"
    desc: "Truffle Security の、ファイルやリポジトリから認証情報を探す道具。検証モードでは、見つけた鍵が実際に認証に通るかを各サービスに照会する。"
  - term: "生きた認証情報"
    desc: "検証で、いまも認証に通ると確認された API キー・トークン・ログイン情報。"
  - term: "上流のコーパス"
    desc: "The Stack や Common Crawl など、Web やコードを広く集めた大きなデータ。多くのデータセットがここから派生する。"
insight:
  slug: "leaked-key-copied-downstream"
  label: "漏れた鍵は、派生のたびに再公開される"
  quote: "データセットを取り込み・再公開する前に、その出所と利用条件を照合しなければ、どこかで漏れた鍵は派生のたびに再公開され、元のデータから消しても複製に残る。"
industries: ["ai", "developers"]
operations: ["account-admin", "disclosure"]
controls:
  - slug: "hold-unverified"
    item: "データの出所と利用条件を確認するまで、学習に取り込まない"
impact: "有効な認証情報 221,303 件が公開データに残っていた"
takeaway: "Truffle Security の調査では、通知の後も失効されない鍵が、派生のデータセットに複製されていた。データセットを取り込み・再公開する前に、出所と利用条件を照合する。"
self_check: "データセットを学習に取り込む、または再公開する前に、その出所と利用条件を照合しているか。"
countries: ["global"]
---

## 1. 要点

Truffle Security の調査によれば、Hugging Face のプラットフォームは公開プッシュを走査し、見つけた鍵を作成者に通知していた。それでも、通知の後に失効されない鍵が多く残り、上流のコーパスから派生したデータセットに、同じ鍵がくり返し複製されていた。追跡できた鍵の多くは、持ち主自身ではなく、他人のコーパスから紛れ込んだものだった。調査は研究で、広範な悪用の報告ではない。<strong>データセットを取り込み・再公開する前に、その出所と利用条件を照合しなければ、どこかで漏れた鍵は派生のたびに再公開され、元のデータから消しても複製に残る。</strong>

## 2. 通った操作

- **通った操作**: 有効な認証情報を含むデータの、公開データセットへのアップロードと、派生・再アップロードによる再公開。Truffle Security によれば、鍵は GitHub・Web・チャットのログなどで漏れ、The Stack や Common Crawl などの上流のコーパスに入り、そこから派生したデータセットのたびに再公開されていた。
- **受け付けた側に届くもの**: 一般に、データセットを取り込む側には、ファイルと、データセットの名前やダウンロード数は届くが、中のデータがどこから来て、どの条件で公開されたかは届かない。鍵を受け付ける各サービスの側には、一般に、鍵そのものが届き、その鍵を誰が使っているかは届かない。
- **鍵の持ち主**: Truffle Security が追跡できた Hugging Face トークンのうち、約 700 件は他人のコーパスから紛れ込んだもので、持ち主自身の流出は 63 件だった。同社は、通知は誰かが行動して初めて意味を持ち、行動の割合は 100% に遠い、としている。
- **公表されていないこと**: 見つかった鍵が実際に悪用されたか（Truffle Security は、広範な悪用の報告ではないとしている）。個人・企業・データセットの名前。走査を完走しなかったリポジトリの中身。

## 3. 何を照合するか

経路を問わず区別できる条件は、データセットを学習に取り込む、または再公開する前に、そのデータの出所と利用条件を照合することである。

- **誰が承認を出すか**: データの出所の持ち主。データセットの名前やダウンロード数は、出所と利用条件の代わりにならない。
- **どこで照合するか**: データセットを学習に取り込む手前と、派生として再公開する手前。出所と利用条件を照合できないデータは、取り込まず、再公開しない。
- **何が残るか**: どのデータが、どの出所と条件でデータセットに入ったかの記録。あとで鍵が見つかったとき、どの派生に複製されたかを辿れる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝データセットを取り込み・再公開する前に、データの出所と利用条件を照合し、記録に残すこと。検知＝公開された後に、データの中の鍵を見つけて知らせること。今回は、プラットフォームの走査と通知、Truffle Security の調査がそれに当たる。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>取り込み・再公開の前に、データの出所と利用条件を照合する</div>
<div class="rx-zone gapz"><b>Truffle Security が報告したこと</b><span>通知の後も失効されない鍵が<br>派生のデータセットに複製されていた</span></div>
<div class="rx-zone det"><b>検知 · 走査と通知が働いた</b>公開プッシュを走査し、作成者に知らせる</div>
<div class="rx-g g1"><div class="t">漏れる</div><b>鍵が GitHub・Web・チャットのログで漏れる</b></div>
<div class="rx-g g2"><div class="t">上流</div><b>The Stack や Common Crawl などのコーパスに入る</b></div>
<div class="rx-g g3"><div class="t">派生</div><b>派生・再アップロードのたびに、同じ鍵が再公開される</b></div>
<div class="rx-g g4"><div class="t">2026-06</div><b>Truffle Security が走査の結果を公表する</b></div>
</div>
</figure>

プラットフォームの走査と Truffle Security の調査は、有効な鍵を具体的に数えたが、それはデータセットが公開され、複製された後に見つけたものだった。Truffle Security が公開コーパスの有効な認証情報を数えた事案に、[Common Crawl の生きた認証情報](https://lemma.frame00.com/ja/critical/briefs/079-common-crawl-training-data-live-secrets/) がある。公開されていることと学習に使ってよいことが分かれた点は、[学習データへの個人情報の混入](https://lemma.frame00.com/ja/critical/briefs/036-commonpool-training-data-pii/) と重なる。

## 4. Lemma でできること

**Lemma は、03 の照合を、データセットを取り込み・再公開する手前に組み込む。** データの中の鍵を探したり、鍵を失効させたりするのではなく、そのデータの出所と利用条件を、取り込む前に照合する。

### 注意したい業界・業務

- **業界 · AI**: 公開データセットでモデルを学習させる、またはデータセットを公開・再配布する事業者。
- **業界 · 開発者・エージェント運用**: API キーやトークンを発行・利用する開発者。漏れた鍵は、持ち主の知らないデータセットに複製されうる。
- **業務 · 情報の開示・提供**: 集めたデータを、データセットとして公開・再公開すること。
- **業務 · アカウント・権限の管理**: 鍵の発行と失効。

### いまの対策と Lemma の違い

1 列目は鍵を見つけて知らせること、2 列目は鍵を使えなくすること、3 列目はデータセットを取り込み・再公開することである。Truffle Security の報告では、1 列目は働いたが、多くの鍵は失効されないまま、3 列目で複製され続けた。

| 対策 | 鍵の発見と通知 | 鍵の失効 | データセットの取り込み・再公開（出所と利用条件） |
| --- | --- | --- | --- |
| 公開プッシュの秘密の走査と、作成者への通知 | 一部 | 一部 | 関係しない |
| Enterprise 組織での Hugging Face トークンの自動失効 | 一部 | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 関係しない | 関係しない | 効く |

走査と通知は、押し込まれた鍵を見つけて作成者に知らせるが、他人のコーパスから紛れ込んだ鍵では、作成者は鍵の持ち主ではない。失効は、知らせを受けた人が行動して初めて進む。自動失効は、Enterprise 組織の Hugging Face トークンに限られる。どちらも、データセットを取り込んでよいかは決めない。Lemma は、取り込み・再公開の前に、データの出所と利用条件を照合する。鍵を見つけたり、失効させたり、データを消したりするものではない。

注：Lemma の照合が働くのは、データセットを取り込み・再公開する手前に照合を組み込み、データの出所と利用条件が、集める側とは別に発行・管理されている場合に限る。出所と利用条件を持つデータは、中に鍵を含んでいても、この照合を通る。漏れた鍵を見つけて失効させるのは、秘密の走査と鍵の持ち主の手続きで、Lemma はそれに代わらない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

学習や配布に使うデータセットと、自社の鍵について、組織で確認する 3 項目

- 取り込むデータセットを、名前やダウンロード数とは別の基準で選んでいるか。
- どのデータが、どの出所と条件でデータセットに入ったかを記録しているか。
- 自社の鍵が公開のデータに見つかったと知らせを受けたとき、失効までを誰が行うかを決めているか。

## 5. 事実と時系列

- **対象**: Hugging Face の全公開データセット。約 81.5 万リポジトリ・1 億 8,690 万ファイル・7.6PB。Truffle Security の従来最大の走査（約 400TB）の約 19 倍にあたる。
- **調査の方法**: Parquet・Arrow・JSONL・アーカイブ・バイナリを走査できるテキストに展開し、TruffleHog を検証モードで実行した、と Truffle Security は報告している。
- **確認されたこと**: いまも有効な認証情報 221,303 件を、6,003 のデータセットで見つけた。うち 1 件は約 393GB の個人情報（同社の推定で世界人口の約 3.7%）に到達できた、と同社は報告している。
- **内訳**: GitHub の個人用アクセストークン 349 件（リポジトリの書き込み 223・CI の書き換え 130・`admin:org` 112・パッケージの公開 110）、Docker Hub 318 件、Hugging Face トークン 787 件（書き込み 237・組織の管理者 70）。GCP のサービスアカウントの鍵 8,557 件（3,811 プロジェクト）、稼働中のデータベースのログイン 8,594 件、AI プロバイダの鍵 11,496 件（1,210 データセット。OpenAI・Azure OpenAI・Anthropic・Gemini・Groq など）。npm と PyPI は個別に確認され、有効な鍵は無かった。
- **複製**: 有効な鍵の 44% が複数のデータセットに、19,380 件が 10 以上のデータセットに現れた。ChatGPT の会話に一度貼られた Infura の鍵が、WildChat のチャットログのデータセットを経て、1,131 のデータセット・10,162 のファイルの位置へ複製された例が報告された。
- **影響**: 漏れた AI プロバイダの鍵で使われうる推論は、年に約 92 万ドルが下限と見積もられている（Truffle Security）。
- **プラットフォームの対策**: Hugging Face は以前から公開プッシュを TruffleHog で走査し、検出したときに作成者へ通知する。Enterprise 組織では、公開のリポジトリやバケットに押し込まれた Hugging Face トークンを、その場で自動失効させる。

### 時系列

- **2024-09-04**: Hugging Face が、TruffleHog との提携による秘密の走査を公表する。
- **公表前**: Truffle Security が、最も影響の大きい発見（約 393GB の個人情報に至る露出を含む）を当事者とプロバイダへ先に知らせ、重大なものの受領の確認を待って公表を保留する。
- **2026-06-01**: Truffle Security（Dylan Ayrey ほか同社のリサーチチーム）が調査の結果を公表する。

> 本件は研究で、広範な悪用の報告ではない。個人・企業・データセットの名前は公表されていない。有効な鍵の検証は各プロバイダに対して行われ、数値は検証済みのものである。到達範囲の確認はメタデータだけで、データの読み取り・複製・改変は行われていない。走査の対象 約 81.5 万リポジトリのうち完走したのは約 67 万で、数値はその範囲での下限にあたる。件数と通知の状況は Truffle Security の報告に拠る。本 Brief は、鍵の持ち主やプラットフォームを責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Hugging Face**: 同社 CTO の Julien Chaumond が、TruffleHog へストレージバケットの走査のネイティブ対応のコードを寄贈した。
- **Truffle Security**: 寄贈の後の走査で新たに多くの鍵を見つけたとし、続報を予告している。

## 6. Sources

- **Truffle Security（一次・調査主体）**: Dylan Ayrey, “Scanning 7.6 Petabytes of HuggingFace Training Data for Secrets”（2026-06-01）— <https://trufflesecurity.com/blog/scanning-7-6-petabytes-of-ai-training-data-for-secrets>
- **Hugging Face（一次・対応）**: “Secrets Scanning”（Hub ドキュメント）— <https://huggingface.co/docs/hub/en/security-secrets>
- **Hugging Face（一次・提携）**: Luc Georges, “Hugging Face partners with TruffleHog to Scan for Secrets”（2024-09-04）— <https://huggingface.co/blog/trufflesecurity-partnership>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
