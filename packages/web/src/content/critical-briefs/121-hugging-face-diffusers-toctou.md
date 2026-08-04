---
brief_no: 121
title: "Hugging Face Diffusers：モデルを読み込むだけで任意コードが実行された — 安全ガードは最初の1回しか確かめていなかった（Zafran / CVE-2026-44827 他）"
title_en: "Hugging Face Diffusers: loading a model ran arbitrary code — the safeguard only checked the first fetch (Zafran / CVE-2026-44827 et al.)"
pillar: "02-verifiable-ai"
primary_category: "model-supply-chain"
secondary_categories: ["code-provenance", "agent-infrastructure"]
incident_date: 2026-08-03
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["116-open-oss-privacy-filter-fake-model", "090-air-fake-agent-skill-toctou", "073-shadowmq-pickle-zmq-pattern", "072-lerobot-pickle-grpc-rce", "095-amazon-q-mcp-auto-execution"]
status: published
version: "1.0"
og_lead_ja: "Hugging Face Diffusers のTOCTOU欠陥でモデル読込時にコード実行（CVE-2026-44827 他）"
og_lead_en: "Hugging Face Diffusers TOCTOU flaws let a malicious model repo run code on load"
gap_detected: "未審査コードの実行を止める安全ガード trust_remote_code が用意され、既定で有効だった。"
gap_missing: "ガードは設定取得時の1回しか確認せず、実際にロードされる成果物が入れ替わっても再検証されなかった。"
gap_fix: "実行される成果物そのものの来歴と完全性を独立検証可能な証明として要求し、証明と一致しない読み込みを実行の前に遮断する。"
---

## 1. TL;DR

2026 年 8 月 3 日、セキュリティ企業 **Zafran** は、Hugging Face の画像生成ライブラリ **Diffusers** に、悪性のモデルリポジトリを読み込ませるだけで利用者の端末で任意の Python コードが実行される欠陥群を公表した。原因は、未審査コードの実行を止めるはずの安全ガード `trust_remote_code` を、時間差（TOCTOU）で回避できたことにある。モデルのダウンロードは設定取得と本体取得という 2 回の非アトミックな HTTP リクエストに分かれており、ガードは最初の 1 回にしか働いていなかった。ガードは動いていた。**効かなかったのは、ガードが確認した対象と、実際に実行される対象が同一だと確かめる層である。**

## 2. 何が起きたか

- 対象は Hugging Face の Diffusers（拡散モデル用ライブラリ）。`DiffusionPipeline.from_pretrained` でカスタムパイプラインを読み込む利用者が影響を受け、悪性のモデルリポジトリを読み込んだ端末で任意コードが静かに実行される。
- 3 つの CVE として追跡される。**CVE-2026-44827**（CVSS 8.8）＝既定で解決されるファイル名 `None.py` をカスタムパイプラインコードとして読ませるコードインジェクション。**CVE-2026-45804**（CVSS 7.5）＝`hf_hub_download` と `snapshot_download` の 2 回の呼び出しのあいだに設定を書き換える競合状態。**CVE-2026-44513**（CVSS 8.8）＝クロスリポジトリのパイプライン読込・ローカルスナップショットからの読込・悪性カスタムコンポーネントを含む、同じ根を持つ 3 変種を束ねたもの。
- いずれも `trust_remote_code`——未審査のカスタムコード実行を止めるために設けられ、既定では無効（`False`）側に倒れている安全ガード——を回避する。

回避は次の連鎖で成立している。

1. モデルのダウンロードが「設定ファイルの取得」と「本体の取得」という、単一のアトミックな操作ではない 2 回の HTTP リクエストに分かれている。
2. `trust_remote_code` のチェックは、最初のリクエスト（設定）に対してしか働かない。
3. 攻撃者は、チェック後・本体取得前の窓で対象を差し替える。Zafran の実測でこの窓は約 0.3 秒であり、初回ダウンロードが未キャッシュであることを要する。ただし利用の多いリポジトリでは、悪性の設定を一瞬だけ置いて戻すことで統計的に成功しうると同社は指摘する。
4. 差し替えられたコードが、ガードを通過した「安全」な扱いのまま実行される。

## 3. 時系列 — 公表と対応

- 2026 年 3 月 19 日 — Zafran が最初の 2 件を Hugging Face へ報告する。
- 2026 年 5 月 1 日 — 修正版 Diffusers 0.38.0 が公開される。
- 2026 年 5 月 — 責任開示を経て CVE が公表される。
- 2026 年 8 月 3 日 — Zafran が技術詳細を公表し、報道が広がる。

> CVE 番号・CVSS 値は公開アドバイザリと報道に基づく。責任開示を経ての公表であり、本 Brief 公表時点で広範な実地悪用の報告は確認されていない。CVSS は当該アドバイザリの採点であり、NVD による独立評価の有無は別に確認を要する。

公表後の対応と業界の動きは次のとおり。

- Diffusers は 0.38.0 で、セキュリティチェックを**動的モジュール読込の隘路**へ移し、確認の対象と実行の対象を同じ地点に揃えることで既知の回避経路を塞いだ。利用者には 0.38.0 以降への更新と、リポジトリのリビジョン固定が推奨されている。
- Zafran は同時に Hugging Face の `transformers` にも並行する欠陥を開示した。固定したコミットハッシュが伝播せず、`trust_remote_code` の承認後に悪性コードへ差し替えられる——同じ「確認と使用のあいだ」の問題である。
- 同時期に、モデル読込時の同種のコード実行が別のフレームワークでも相次いで指摘された（InstructLab の `trust_remote_code=True` ハードコード、vLLM の同種回避）。「モデルを読み込む＝コードを実行しうる」という前提が、拡散モデルに限らないことを示す。

## 4. なぜ止まらなかったか

この事案の失敗は、安全ガードが無かったことではない。ガードが確認した対象と、実際に実行される対象が同一だと確かめる層が無かったことにある。

`trust_remote_code` は、未審査コードの実行を止めるために設けられ、既定でカスタムコードを拒む側に倒れていた。検出は効いていた。効かなかったのは、その手前——チェックの瞬間に見た成果物と、数百ミリ秒後に実行される成果物が同じものだという保証——である。

> TOCTOU は、確認と使用のあいだに対象が変わりうるとき、確認そのものを無意味にする。ガードは嘘をつかない。ただ、確認した対象がもう存在しないだけである。

モデルは、名前とカードとダウンロード数をまとって配布される。だがそれらは、いま実行されようとしているコードの来歴を証明しない。差し替えは、リポジトリという「信頼された配布経路」の内側で起きる。[Brief 116](https://lemma.frame00.com/ja/critical/briefs/116-open-oss-privacy-filter-fake-model/) が示した「トレンドやダウンロード数は来歴の代用にならない」を、実行時点の完全性まで押し進めた事案であり、スキャナーを通過した後に中身が変わる [Brief 090](https://lemma.frame00.com/ja/critical/briefs/090-air-fake-agent-skill-toctou/) の時間差と地続きである。

## 5. 証明があれば、何が変わるか

事前証明は、モデルを読み込む経路のどこに一段挟まるか。差し替えの起きる「チェックと実行のあいだ」ではなく、「実行の直前」に、いま実行される成果物そのものを検証する。

- **実行される成果物への来歴バインド**：モデルカードや名前ではなく、実際にロードされるコード・重みのハッシュに、来歴と発行者の証明を結びつける。
- **読み込みの直前検証**：取得の完了後・実行の直前に、成果物が検証済みの来歴と一致することを確かめ、チェックと使用の間隙を閉じる。
- **発行者の独立検証**：リポジトリの所在ではなく、発行者の身元を独立に確かめる。
- **最小権限での実行**：モデル読込プロセスを、コード実行を前提としないスコープに閉じる。

Lemma は、悪性のモデルを見分ける製品でも、コードの危険性を判定するものでもない。射程は、実行される成果物の来歴を実行の前に独立検証し、証明と一致しない読み込みを分別可能にすることにある。スキャナーやガード（`trust_remote_code`、リビジョン固定、リポジトリの監視）と、事前証明（実行の直前に成果物の同一性を確かめる証跡）は、代替ではなく補完の関係にある。前者は既知の危険を弾き、後者は「確認した対象と実行される対象がずれる」という、検出が構造的に届かない一点を閉じる。補完の位置づけは [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、適用範囲は [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/#inference) を参照。

## 6. Sources

- **The Hacker News（独立報道）**: “Hugging Face Diffusers Flaws Could Let Model Repositories Execute Arbitrary Code”（2026-08-03）— <https://thehackernews.com/2026/08/hugging-face-diffusers-flaws-could-let.html>
- **Infosecurity Magazine（独立報道・技術詳細）**: “Bugs in Hugging Face Diffusers Bypass Custom Code Safeguard” — <https://www.infosecurity-magazine.com/news/hugging-face-diffusers-trust/>
- **Cybersecurity News（独立解析）**: “Hugging Face Diffusers Vulnerabilities Enable Remote Code Execution Through Malicious AI Models”（2026-08-03）— <https://cybersecuritynews.com/hugging-face-diffusers-vulnerabilities/>
- **TheHackerWire（兄弟事案）**: “InstructLab RCE via Malicious HuggingFace Models (CVE-2026-6859)” — <https://www.thehackerwire.com/instructlab-rce-via-malicious-huggingface-models-cve-2026-6859/>
- **RAXE Labs（兄弟事案・独立解析）**: “RAXE-2026-044: vLLM Hardcoded trust_remote_code Bypass Enables Remote Code Execution via Malicious Model Repositories (CVE-2026-27893)” — <https://raxe.ai/labs/advisories/RAXE-2026-044>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）。設計と適用範囲は [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/#inference) · [Brief 116（偽の OSS プライバシーフィルタ）](https://lemma.frame00.com/ja/critical/briefs/116-open-oss-privacy-filter-fake-model/) · [Brief 090（AIR 偽エージェントスキル）](https://lemma.frame00.com/ja/critical/briefs/090-air-fake-agent-skill-toctou/)
