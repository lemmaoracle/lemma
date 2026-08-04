---
brief_no: 122
title: "Hugging Face の学習データ 7.6PB に、生きた認証情報が 22 万件超あった — 検出も通知も届いていたのに、鍵は失効されなかった（Truffle Security 調査）"
title_en: "7.6 petabytes of Hugging Face training data held 221,303 live secrets — detected and notified, never revoked (Truffle Security)"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["code-provenance", "data-provenance"]
incident_date: 2026-06-01
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["079-common-crawl-training-data-live-secrets", "036-commonpool-training-data-pii", "008-discord-scraping"]
status: published
version: "1.0"
og_lead_ja: "Truffle Security が Hugging Face 公開データセット7.6PBを走査、生きた認証情報221,303件を検出"
og_lead_en: "Truffle Security scanned 7.6PB of Hugging Face datasets, found 221,303 live secrets"
gap_detected: "Hugging Face は公開プッシュを TruffleHog で走査し、検出時に作成者へ通知する（Enterprise 組織では自動失効も）。"
gap_missing: "通知は届いても失効されず、鍵は生きたまま残る。学習データに入った時点で無数の派生へ複製され、元を取り消しても複製が残る。"
gap_fix: "データの出所と利用条件を独立検証可能な証明として要求し、証明を欠くデータの取り込みと再公開を事前に遮断する。"
---

## 1. TL;DR

2026 年 6 月 1 日、**Truffle Security** は Hugging Face の全公開データセット——7.6 ペタバイト、1 億 8,690 万ファイル——を走査し、いまも有効な認証情報を **221,303 件**、6,003 のデータセットから検出したと公表した。うち 1 件は約 393 ギガバイトの個人情報（同社推定で世界人口の約 3.7%）に到達できた。プラットフォームは検出も通知もしていた。**効かなかったのは、通知の後に鍵を失効させ、そして取り込む前にデータの来歴を確かめる層である。**

## 2. 何が起きたか

- Truffle Security が Hugging Face の公開データセットを端から端まで走査した。Parquet・Arrow・JSONL・アーカイブ・バイナリを走査可能なテキストへ展開し、TruffleHog を検証モードで実行——約 81.5 万リポジトリ、1 億 8,690 万ファイル、7.6PB。同社の従来最大の走査（約 400TB）の約 19 倍にあたる。
- 検出は 221,303 件・6,003 データセット。内訳にはコードを他者の環境へ送り込める鍵が多数含まれる（GitHub PAT 349 件——full repo write 223／CI 書換 130／`admin:org` 112／パッケージ公開 110、Docker Hub 318、Hugging Face write 237・org-admin 70）。なお npm と PyPI は個別に確認され、生きた鍵はゼロだった。
- クラウド乗っ取り級も出た。GCP サービスアカウント鍵 8,557 件（3,811 プロジェクト）、稼働中のデータベースログイン 8,594 件、AI プロバイダ鍵 11,496 件（1,210 データセット、OpenAI・Azure OpenAI・Anthropic・Gemini・Groq 等）。漏洩鍵で盗まれ得る推論は年約 92 万ドルが下限と見積もられている。

この露出は次の連鎖で永続化する。

1. 認証情報がどこか（GitHub・Web・チャットログ）で漏れる。
2. それが The Stack や Common Crawl などの上流コーパスに吸い上げられる。
3. コーパスの派生・再アップロードのたびに同じ鍵が再公開される。生きた鍵の 44% が複数データセットに現れ、19,380 件は 10 以上のデータセットに現れる。
4. 学習に取り込まれ、モデルの重みに畳み込まれる。git のように履歴を書き換えて消すことができない。

## 3. 時系列 — 公表と対応

- 2026 年 6 月 1 日 — Truffle Security（Dylan Ayrey ほか同社リサーチチーム）が調査結果を公表。
- 公表前 — 最も影響の大きい発見（約 393GB の個人情報に至る露出を含む）を、当事者とプロバイダへ先行通知し、重大なものの受領確認を待って公表を保留した。

> 本調査は研究であり、広範な悪用の報告ではない。個人・企業・データセット名は非開示。生きた鍵の検証は各プロバイダに対して行われ、参照する数値は検証済みである。到達範囲の確認はメタデータのみで、データの読み取り・複製・改変は行われていない。走査対象 約 81.5 万リポジトリのうち完走したのは約 67 万で、数値はその範囲での下限にあたる。

公表後の対応と業界の動きは次のとおり。

- Hugging Face は以前から公開プッシュを TruffleHog で走査し、検出時に作成者へ通知する。Enterprise 組織では、公開リポジトリやバケットへ押し込まれた HF トークンをその場で自動失効させる。
- 同社 CTO の Julien Chaumond は TruffleHog へ、ストレージバケット走査のネイティブ対応コードを寄贈した。Truffle は寄贈後の走査で新たな大量の鍵を見つけたとし、続報を予告している。
- ただし本調査が測ったのは、その通知の先にある落差——「検出され、通知されたのに、失効されなかった」鍵が生きたまま残る割合——である。Truffle が追跡できた 763 件の Hugging Face write／org-admin トークンのうち、700 件は他人のコーパスから紛れ込んだもので、自己流出は 63 件だった。

## 4. なぜ止まらなかったか

この事案の失敗は、検出が無かったことではない。検出も通知もあった。失敗は、通知の後に鍵が失効されず、そしてデータを取り込む前に来歴を確かめる層が無かったことにある。

Truffle 自身がこの落差を言葉にしている——通知は、誰かが行動して初めて意味を持つ。そして行動の割合は 100% に遠く及ばない。

> 「検出され、通知され、しかし失効されない」。これほど多くの鍵がいまも生きている理由の大半はここにある。

学習データは、最も取り消しの効かない漏洩である。git の履歴は force-push で消せる。学習セットに undo は無い。ChatGPT の会話に一度貼られた Infura の鍵が WildChat のチャットログデータセットに捕捉され、そこから 1,131 のデータセット・10,162 のファイル位置へ複製された例では、元を取り消しても残り 1,130 の複製には何の効果もない。漏洩は自走する。

これは [Brief 079](https://lemma.frame00.com/ja/critical/briefs/079-common-crawl-training-data-live-secrets/)（Common Crawl の生きた認証情報）が示した構造の Hugging Face データセット版であり、規模で上回る。公開は取り込みの同意ではない——[Brief 036](https://lemma.frame00.com/ja/critical/briefs/036-commonpool-training-data-pii/)（学習データへの個人情報混入）と同じ論点が、ここでは「複製が自走する」ことで一層深くなる。

## 5. 証明があれば、何が変わるか

事前証明は、データが学習パイプラインに入る手前に一段挟まる。取り込みの前に、そのデータの来歴——どこ由来で、公開・利用の条件は何か——を検証し、証明を欠くデータを下流へ流さない。

- **取り込み前の来歴証明**：コーパスを学習・再公開する前に、各データの出所と利用条件の証明を要求する。証明が無いものは取り込まない。
- **発行者・出所の独立検証**：データセットの名前やダウンロード数ではなく、出所を独立に確かめる。
- **汚染の下流遮断**：来歴を欠く、あるいは秘密を含むデータが派生へ複製される前に、経路上で弾く。複製が始まってからでは、取り消しは元の 1 件にしか効かない。
- **認証情報のライフサイクル**：漏れた鍵は隠すのでなく失効を前提に扱う。証明は失効の事実にも結びつく。

Lemma は秘密を走査する製品ではなく、漏洩を検知するものでもない。射程は、データが取り込まれる前に出所と利用条件を独立検証し、証明を欠くデータの取り込みと再公開を分別可能にすることにある。秘密のスキャンと通知（TruffleHog による走査、プラットフォームの自動失効、鍵のローテーション）と、事前証明（取り込みの前に来歴を確かめる証跡）は、代替ではなく補完の関係にある。前者は既に漏れた鍵を見つけ、後者は「検出され、通知されたのに残り続ける」——検出が構造的に閉じられない取り込みと複製の一点を閉じる。補完の位置づけは [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance) を参照。

## 6. Sources

- **Truffle Security（一次・調査主体）**: Dylan Ayrey, “Scanning 7.6 Petabytes of HuggingFace Training Data for Secrets”（2026-06-01）— <https://trufflesecurity.com/blog/scanning-7-6-petabytes-of-ai-training-data-for-secrets>
- **Hugging Face（一次・対応）**: “Security & secrets”（ドキュメント）— <https://huggingface.co/docs/hub/en/security-secrets>
- **Hugging Face（一次・提携）**: “Truffle Security × Hugging Face partnership” — <https://huggingface.co/blog/trufflesecurity-partnership>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）。設計と適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance) · [Brief 079（Common Crawl の生きた認証情報）](https://lemma.frame00.com/ja/critical/briefs/079-common-crawl-training-data-live-secrets/) · [Brief 036（学習データへの個人情報混入）](https://lemma.frame00.com/ja/critical/briefs/036-commonpool-training-data-pii/)
