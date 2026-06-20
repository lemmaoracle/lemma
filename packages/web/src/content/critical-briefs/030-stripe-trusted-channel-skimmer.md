---
brief_no: 30
title: "Stripe の信頼された API インフラが、カード窃取コードの配送と窃取データの保管に転用された — allowlist はドメインの身元を信頼し、運ばれる内容の来歴を検証しない"
title_en: "Stripe's Trusted API Infrastructure Repurposed to Deliver Card-Skimming Code and Store Stolen Data — Allowlists Trust the Domain's Identity, Not the Provenance of What It Carries"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-06-04
published: 2026-06-06
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["010-claude-code-leak-lure", "004-megalodon-github-supply-chain"]
version: "1.0"
status: published
og_lead_ja: "信頼 API がカード窃取コードの配送路に — Stripe Magecart"
og_lead_en: "Trusted Stripe API repurposed as a card-skimming channel"
gap_detected: "EC セキュリティ事業者によるスキマー解析・IOC 提供・被害ストアへの通知という封じ込めは機能した。"
gap_missing: "「このチェックアウトで動くコードは、ストアが正規に配置したものか」を実行の前に確かめる層が無く、ドメインの身元への信頼が中身の来歴の代わりに使われた。"
gap_fix: "チェックアウトでコードが動く前に「このスクリプトは、ストアの正規配置という来歴を持つ」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

EC セキュリティ企業 Sansec が、Stripe の正規インフラを悪用する Magecart カード窃取を公表した（Stripe 自身は無傷）。攻撃者は、ストアが既定で許可する信頼ドメイン（`api.stripe.com` / Google）をスキマーの配送と窃取データの保管に転用し、許可済みドメインゆえ CSP・egress フィルタをすり抜ける。欠けていたのは、チェックアウトで動くコードがストアの正規配置という来歴を持つかを実行前に確かめる層であり、ドメインの身元への信頼が中身の来歴の代わりに使われた。検出と事前証明は代替でなく補完である。

---

## 1. 事案概要

- **対象**: Magento / Adobe Commerce のチェックアウトページ(被害は EC ストア側。Stripe・Google は悪用された信頼インフラであり被害者ではない)
- **公表**: 2026-06-04、Sansec が解析を公表
- **悪用された信頼インフラ**: `api.stripe.com`(決済処理)と `googletagmanager.com`(タグ管理)。いずれも EC ストアが既定で許可するドメイン
- **配送**: 悪性コードは正当に見える GTM コンテナに埋め込まれ、チェックアウト到達時に Stripe API の顧客レコード(例: `cus_TfFjAAZQNOYENR`)を照会、そのメタデータから JavaScript を再構成して `new Function()` で実行
- **窃取対象**: クレジットカード番号・有効期限・CVV・氏名・請求先住所・メールアドレス・電話番号
- **保管/送出**: 窃取データを単一文字列に連結 → XOR 難読化 → ローカル保管。別ルーチンがページ読込直後と毎分実行され、データを分割して**攻撃者の Stripe アカウントに新規顧客オブジェクトを作成**し、メタデータに格納。コピー後はローカルを消去して痕跡を消す
- **回避の核心**: ペイロードも窃取カードも `api.stripe.com` を通る。ストアが当該ドメインを既定許可しているため、未知のスキマードメインなら検知される CSP・ネットワークフィルタをすり抜ける
- **変種**: Stripe の代わりに Google Firestore(プロジェクト名 `braintree-payment-app`、ドキュメント `tracking/captcha`)を使う版も確認。正規の決済/ボット対策トラフィックに紛れる命名
- **起点**: スキマーを含む Stripe 顧客レコードは 2025-12-24 に作成されており、少なくとも同日から活動していたとみられる

---

## 2. 事象連鎖

(本件は攻撃キャンペーンだが、被害 EC ストアの網羅的特定は公表されていないため、事象連鎖として整理する。Sansec の解析に基づく)

- 2025-12-24: スキマーを含む Stripe 顧客レコードが作成される(活動起点とみられる)
- 期間中: 被害 EC ストアの GTM コンテナに悪性コードが埋め込まれ、チェックアウト到達時に発火
- 各購入時: スキマーが Stripe API から顧客レコードのメタデータを取得 → JavaScript を再構成・実行 → カード情報を窃取・XOR 難読化・ローカル保管
- ページ読込後/毎分: 窃取データを分割し、攻撃者 Stripe アカウントに偽顧客レコードを作成して格納、ローカルを消去
- 2026-06-04: Sansec が公表。BleepingComputer 等が報道。Firestore 変種も併せて確認

---

## 3. 事象連鎖の技術構造

1. **信頼ドメインへの寄生**: 攻撃者は EC ストアが既定許可する `googletagmanager.com` / `api.stripe.com` を配送・保管に使い、独自ドメインを一切露出させない
2. **コードの間接配置**: スキマー本体を Stripe 顧客レコードのメタデータに置き、`new Function()` で再構成・実行。静的なコード検査やドメイン allowlist では悪性と判定されない
3. **窃取とローカル退避**: チェックアウトのカード情報を窃取し、XOR 難読化のうえローカルに一時保管
4. **信頼チャネル経由の送出**: 窃取データを攻撃者 Stripe アカウントの偽顧客レコードに書き込む。送出先が `api.stripe.com` のため CSP・egress フィルタを通過
5. **痕跡消去と冗長化**: 送出後にローカルを消去。Firestore を使う変種で配送・保管の冗長性を確保

---

## 4. 構造的論点

本事案は Pillar 01(来歴証明)の `code-provenance` カテゴリに属する。中心的な失敗 primitive は、**CSP・ネットワーク allowlist がドメインの「身元」(これは Stripe だ・これは Google だ)を信頼し、そのドメインが運ぶコードとデータの「来歴」(このスクリプトは誰が・どの正規経路で配置したか)を検証しない**点にある。secondary に `identity-auth`(信頼ドメインの身元への過依存)と `data-provenance`(窃取データが正規チャネルで送出される)を併記する。

Brief 010(Claude Code ソース流出便乗マルウェア)と同型である。010 は Anthropic という信頼ブランドのシグナルと GitHub Releases という正規配送路を、マルウェア配送に転用した。本事案は Stripe / Google という信頼ブランドのインフラを、スキマー配送と窃取データ保管に転用した。両者は「信頼されているのは発行元の身元であって、運ばれる中身の来歴ではない」という来歴証明カテゴリの核心を共有する。Brief 004(Megalodon)とも、正規エコシステム(GitHub / 決済 API)を攻撃の運搬層に使う点で隣接する。

重要なのは、この primitive が allowlist という防御策の前提そのものを突いている点である。allowlist は「未知ドメインを弾く」ことで機能するが、信頼ドメインが任意のコード・データを運べる以上、ドメイン単位の信頼は内容の正しさを何ら保証しない。`api.stripe.com` が Stripe の正規 API であることと、それが運ぶメタデータが正規の決済データであることは別問題である。

---

## 5. 検出と証明の落差

Sansec のような EC セキュリティ事業者によるスキマー解析・IOC 提供・被害ストアへの通知は、キャンペーンの封じ込めに不可欠であり、本 Brief がその役割を否定するものではない。利用者側も、上限付きの使い捨て仮想カードでリスクを下げられる。

一方で、検出は「ブラウザが信頼ドメインから読み込むコードを実行するか」「信頼ドメインへ送るデータを許すか」自体を変えない。本事案の通信は `api.stripe.com` / `googletagmanager.com` 宛で、CSP もネットワークフィルタも既定で許可する。スキマー本体は顧客レコードのメタデータに分散して置かれ `new Function()` で動的構成されるため、静的検査でも捕捉しにくい。窃取データは正規の Stripe 顧客オブジェクト作成 API を通って出ていく。欠けていたのは「このチェックアウトページで実行されるスクリプトは、ストアが正規に配置したものか」というコードの来歴検証であり、これはドメイン allowlist や異常検知とは別系統である。規制報告・PCI 監査の観点でも、流出後に「どのスクリプトが・誰の配置で・いつカード情報に触れたか」を立証する独立した証跡は、GTM 履歴とアクセスログの突合以上には残りにくい。

事前証明(pre-execution attestation)は、チェックアウトで実行されるコードを、ドメインの allowlist ではなく**配置者・経路・内容の来歴**として実行前に独立検証する設計を採る。proof が「このスクリプトはストアの正規配置の来歴を持たない」と告げれば、信頼ドメインから来ていても実行は block される。ドメイン allowlist(detection 的な「既知の信頼先か」)とコード来歴の事前証明(「この内容は正規に配置されたか」)は代替ではなく**補完**の関係にある。

---

## 6. 対応経緯と業界動向

- **Sansec**: スキマーの動作・Stripe / Firestore 双方の悪用構造・顧客レコード作成日(2025-12-24)を解析し公表。EC ストアに対する可視化を提供
- **信頼インフラ側(Stripe / Google)**: 両社のシステム自体は侵害されておらず、悪用されたのは正規 API・正規タグ管理の機能。攻撃者アカウント・コンテナの停止は運営側の対応領域となる
- **業界横断の論点**: 信頼ドメインを配送・保管に転用する Magecart は、CSP やドメイン allowlist というドメイン単位の防御の限界を露呈する。チェックアウトで実行されるコードの来歴を、ドメインの身元とは独立に検証するという論点が、本事案と Brief 010 を通じて重みを増している。PCI DSS の文脈でも決済ページのスクリプト完全性管理が要求事項として強まっている

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差(allowlist がドメインの身元を信頼し、運ばれるコードとデータの来歴を検証しない)に対して、Lemma は、実行されるコードや受け渡されるデータを、ドメインの allowlist ではなく配置者・経路・内容の来歴として実行前に独立検証可能な暗号証明として検証する設計を提示している。信頼ドメインから配送されても、来歴の proof が正規配置の不在を告げれば実行・送出は事前に reject される。「ドメインが信頼できる ≠ 中身の来歴が正しい」という来歴証明カテゴリの設計思想に立つ。信頼シグナルの転用という同型事例は Brief 010 と合わせて参照されたい。

---

## 8. Sources

- **Sansec**: Magecart キャンペーン解析(Stripe / Firestore 悪用構造、顧客レコード作成日、IOC)(2026-06)— https://sansec.io/research
- **BleepingComputer**: "Credit card theft campaign abuses Stripe to host stolen payment info"(2026-06-04)— https://www.bleepingcomputer.com/news/security/credit-card-theft-campaign-abuses-stripe-to-host-stolen-payment-info/
- **The Hacker News**: "New Magecart Campaign Abuses Stripe API to Host and Exfiltrate Stolen Card Data"(2026-06)— https://thehackernews.com/
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
