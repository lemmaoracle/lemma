---
brief_no: 79
title: "Common Crawl：LLM の学習に使われる公開コーパスに、約1.2万件の「生きた」認証情報が混入していた — 学習データの来歴が取り込みの前に検証されない構造（Truffle Security）"
title_en: "Common Crawl: about 12,000 live credentials embedded in a public corpus used to train LLMs — training-data provenance not verified before ingestion (Truffle Security)"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["code-provenance", "data-provenance"]
incident_date: 2025-02-01
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["036-commonpool-training-data-pii", "008-discord-scraping", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "Common Crawl の学習コーパスに約 1.2 万件の「生きた」認証情報が混入"
og_lead_en: "Common Crawl: ~12,000 live credentials embedded in an LLM training corpus"
gap_detected: "Truffle Security の走査で約 1.2 万件の生きた認証情報が検出され、影響ベンダーへの連絡と数千件の鍵の失効・ローテーションが進められた。"
gap_missing: "「このコーパスは何を含み、どの来歴・同意の下にあるか」を取り込みの前に証明する層が無く、事後のスキャン・失効では学習物への波及を取り消せなかった。"
gap_fix: "公開されているかではなく、コーパスの来歴・構成（出所・同意・既知の危険物の不在）を取り込みの前に Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

Truffle Security が、LLM の学習に広く使われる公開コーパス Common Crawl の 2024 年 12 月アーカイブ（2.67 億ページ・400TB）を走査したところ、約 1.2 万件（11,908 件）の「生きた」認証情報——実際に認証に成功する API キー・パスワード・トークン——を検出した。AWS・Mailchimp・Slack・GitHub などの鍵が含まれ、219 種類の secret が確認された。発見された secret の 63% は複数ページに重複し、ある WalkScore の API キーは 1,871 のサブドメインで 57,029 回出現していた。Common Crawl は OpenAI・Google・Meta・Anthropic・DeepSeek 等の学習に使われており、生きた認証情報や安全でないコードがそのまま学習対象になり得ることを示した。コーパスに何が含まれるか（来歴）が取り込みの前に検証されていなかった。事後のスキャン・失効は機能したが、学習データの来歴を取り込みの前に証明する層が無かった。

---

## 1. 事案概要

- **対象**: Common Crawl の 2024 年 12 月アーカイブ（2.67 億 Web ページ・400TB）。OpenAI・Google・Meta・Anthropic・DeepSeek など多数の LLM が学習に利用
- **発見**: Truffle Security が TruffleHog で走査し、約 1.2 万件（11,908 件）の「生きた」認証情報を検出。「生きた（live）」とは、自動検証で実際に認証に成功することが確認されたものだけを指す
- **内容**: AWS のルートキー、Mailchimp API キー、Slack の webhook、GitHub のトークンなど。219 種類の secret を確認、最多は Mailchimp API キー
- **重複の高さ**: 発見された secret の 63% が複数ページに重複。ある WalkScore の API キーは 1,871 のサブドメインで 57,029 回出現
- **核心**: 「技術的には公開されている」Web データを来歴検証なく学習コーパスに取り込む結果、(1) 生きた認証情報が混入し、(2) LLM が安全でないコード（認証情報のハードコード）を学習する素地になる。コーパスに何が含まれるかが、取り込みの前に検証されていなかった
- **対応**: Truffle Security が影響を受けたベンダーに連絡し、数千件の鍵の失効・ローテーションを支援
- **文脈**: 学習データの来歴・構成を取り込みの前に検証しない運用は、Brief 036（CommonPool に PII 混入）が示した「公開 ≠ 同意」「事後フィルタは網羅不能」と同じ構造を、認証情報の側から示した

---

## 2. タイムライン

- 2024-12: Common Crawl が当該アーカイブ（2.67 億ページ・400TB）を収集
- 2025-02: Truffle Security が走査結果を公表。約 1.2 万件の生きた認証情報・219 種類の secret・63% の重複を報告
- 2025-02 以降: Truffle Security が影響ベンダーに連絡し、数千件の鍵の失効・ローテーションを支援

> 注: 本 Brief の事実は Truffle Security の調査報告および確立メディア（BleepingComputer / The Hacker News / IT Pro 等）に基づく。件数・重複率は調査時点の値であり、出所を明示する。本 Brief は特定の学習データ利用者の断罪ではなく、学習データの来歴が取り込みの前に検証されないという構造に焦点を当てる。

---

## 3. 事象連鎖（失敗の分解）

1. **来歴未検証の取り込み**: 「技術的には公開されている」Web データを、何が含まれるか（来歴・構成）を取り込みの前に検証せずに学習コーパスへ収集する
2. **生きた認証情報の混入**: コーパスに、実際に認証に成功する API キー・パスワード・トークンが約 1.2 万件混入する。多くは複数ページに重複し、混入の密度を高める
3. **学習への波及**: コーパスを学習に使う LLM が、生きた認証情報や安全でないコード（認証情報のハードコード）をそのまま学習対象とし得る
4. **事後フィルタの限界**: 取り込み後にスキャン・除去を試みても、巨大なコーパスから網羅的に取り除くことは難しく、混入は学習物に残り得る
5. **是正の事後性**: 発見後に鍵の失効・ローテーションを行っても、すでに学習・配布された経路から完全には取り消せない

---

## 4. 構造的論点

本事案は Pillar 01（来歴証明）の `training-data-provenance` カテゴリに属する。中心的な**失敗 primitive は「学習データに何が含まれるか（来歴・構成）が、取り込みの前に検証されていないこと」**である。「公開されている」ことは「学習に使ってよい」ことや「危険なものを含まない」ことを意味しないが、来歴検証なく取り込まれた結果、生きた認証情報という明確に危険なものが混入した。secondary に、混入物が認証情報・安全でないコードである点で `code-provenance`、データの出所・同意が検証されない点で `data-provenance` を併記する。

Brief 036（CommonPool の学習データに ID・履歴書・顔が混入）と兄弟関係にあり、本事案はその認証情報版である。036 が「公開 ≠ 同意」をプライバシー（PII）の側から示したのに対し、本事案は同じ「来歴未検証の取り込み」をセキュリティ（生きた認証情報）の側から示した。Brief 008（公開 API 経由の Discord スクレイピング）とも、「公開されている」を根拠に来歴・同意を問わず大量取り込みする構造で同根。さらに、発見後の鍵失効が事後的にしか効かない点は、Brief 006（Google API キーの失効遅延）と、**是正のタイミングが取り消せない窓を残す**点で連なる。

本事案は攻撃 incident ではなく、AI 学習基盤の信頼層リスク事象である。学習データの来歴を取り込みの前に検証・証明する層がなければ、「公開されている」という理由だけで危険物（認証情報・無同意 PII・汚染コード）が学習物に取り込まれ、事後フィルタでは網羅できない。学習物の信頼は、コーパスの来歴を取り込みの前に証明できるかにかかる。

---

## 5. 検出と証明の落差

Truffle Security による走査・検出、影響ベンダーへの連絡、鍵の失効・ローテーション支援は、被害の把握と縮小に不可欠であり、本 Brief がその役割を否定するものではない。生きた認証情報は検出され、相当数が失効された。

一方で、事後のスキャン・失効は、学習データを「取り込む前に、来歴・構成を検証するか」という設計自体を変えない。本事案では、来歴検証なく取り込まれたコーパスに生きた認証情報が混入し、すでに学習・配布の経路に乗り得た。欠けていたのは「このコーパスは、何を含み、どの来歴・同意の下にあるか」を取り込みの前に証明する層であり、これは取り込み後のスキャンとは別系統の検証である。スキャンが取り込みの後であれば、それまでに学習物へ波及した可能性はローテーションでは取り消せない。学習データの監査・コンプライアンス（学習データ要約の公開等）で「この学習物は、危険物・無同意データを含まない来歴のコーパスに基づく」ことを立証する材料として、事後にスキャンしたという事実だけでは、取り込み前の来歴の証跡にならない。

事前証明（pre-execution attestation）は、コーパスを学習に取り込む前に、その来歴・構成（出所・同意・既知の危険物の不在）を独立検証可能な証明として確認する設計を採る。proof が「来歴不明」「同意なし」「既知の secret を含む」と告げれば、当該コーパスの取り込みを事前に保留・除外する。事後のスキャン（detection）と、取り込み前の来歴の事前証明（proof）は代替ではなく **補完** の関係にあり、両者が重なって初めて、学習物を業務・製品に安心して載せられる。

事後の検知が証明にならない論点は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、来歴を独立検証する設計は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) を参照。

---

## 6. 対応経緯と業界動向

- **Truffle Security**: 走査結果を公表し、約 1.2 万件の生きた認証情報・219 種類の secret・63% の重複を可視化。影響ベンダーに連絡し、数千件の鍵の失効・ローテーションを支援
- **学習データ利用者**: Common Crawl を学習に使う事業者（OpenAI・Google・Meta・Anthropic・DeepSeek 等が利用元として挙げられる）にとって、来歴未検証の取り込みが安全でないコード・認証情報を学習に持ち込み得ることが論点に
- **規制動向**: EU AI Act の汎用 AI モデル向け枠組みは、学習データ要約の公開や著作権遵守方針へ向かい、2026 年に義務が段階適用。学習データの来歴・構成の説明可能性が制度的に求められつつある
- **業界横断の論点**: 「公開されている」を根拠に来歴・同意・安全性を問わず取り込む運用の限界が、PII（036）に続き認証情報の側からも示され、取り込み前の来歴検証が学習基盤の要件として議論が進む

「学習データの来歴・構成を、取り込みの前にどう検証・証明するか」は、本事案と Brief 036 を契機に AI 学習基盤設計の必須要件として議論が進む見込み。

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差（学習データの来歴・構成が、取り込みの前に検証・証明されていない）に対して、Lemma は、データを学習に取り込む前に来歴を独立検証可能な形で扱う設計を提示している。

- **取り込み前の来歴証明**: コーパスの出所・同意・既知の危険物の不在を、取り込みの前に独立検証可能な証明として確認し、確認できなければ取り込みを保留・除外する
- **来歴の改ざん耐性ある記録**: どのデータが、どの来歴・同意の下で学習に使われたかを、後から改ざんできない証跡として残し、学習物の構成を説明可能にする
- **「公開 ≠ 取り込み可」の設計化**: 「技術的に公開されている」ことを取り込みの根拠にせず、来歴・同意・安全性の証明を取り込みの前提に置く
- **是正の検証可能性**: 混入が判明した場合の失効・除外が確実に効いたことを検証可能にし、事後是正の空白を縮める

「公開 ≠ 来歴の証明」という来歴証明カテゴリの設計思想に対し、本事案はその想定する failure mode が、学習コーパスへの生きた認証情報の混入として顕在化した事例である。検出（事後のスキャン・失効）は被害の縮小に、取り込み前の来歴の事前証明（proof）は学習物の信頼確立に、それぞれ相補的に働く。

設計と適用範囲は、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) を参照のこと。

---

## 8. Sources

- **Truffle Security（調査元）**: “Research finds 12,000 'Live' API Keys and Passwords in DeepSeek's Training Data”（2025-02）— <https://trufflesecurity.com/blog/research-finds-12-000-live-api-keys-and-passwords-in-deepseek-s-training-data>
- **BleepingComputer**: “Nearly 12,000 API keys and passwords found in AI training dataset”（2025-02）— <https://www.bleepingcomputer.com/news/security/nearly-12-000-api-keys-and-passwords-found-in-ai-training-dataset/>
- **The Hacker News**: “12,000+ API Keys and Passwords Found in Public Datasets Used for LLM Training”（2025-02）— <https://thehackernews.com/2025/02/12000-api-keys-and-passwords-found-in.html>
- **IT Pro**: “12,000 API keys and passwords were found in a popular AI training dataset”（2025-02）— <https://www.itpro.com/security/12-000-api-keys-and-passwords-were-found-in-a-popular-ai-training-dataset-experts-say-the-issue-is-down-to-poor-identity-management>
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
