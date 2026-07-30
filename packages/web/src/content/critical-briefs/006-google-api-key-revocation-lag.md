---
brief_no: 6
title: "Google API キー削除後 23 分有効 — 認証情報の失効属性の独立検証不在"
title_en: "Google API Keys Remain Usable for 23 Minutes After Deletion — Independent Verification Gap in Credential Revocation Attributes"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-21
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["003-starlette-badhost", "005-noroboto-lying-fonts", "019-construction-engineer-qualification-fraud", "020-type-designation-conformity-fraud", "021-wirecard-balance-attestation", "022-onlyfake-ai-id-kyc-bypass"]
version: "1.0"
status: published
og_lead_ja: "削除した API キーが 23 分間も有効、失効が独立検証されない — Google"
og_lead_en: "Deleted API keys stayed usable for 23 minutes — Google revocation lag"
gap_detected: "セキュリティ企業 Aikido が失効の遅れ（最長約 23 分）を 10 回 × 2 日かけて計測し、業界全体に可視化できた。"
gap_missing: "「削除済み」という表示を信じる限り、認証情報を使う前にそれが本当に全サーバーで失効したかを確かめる層が無く、最長 23 分の悪用の余地が残った。"
gap_fix: "認証情報を使う前に「この鍵は本当に失効済みである」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

Google API キーは削除後も最長約 23 分間そのまま認証に通ることが、Aikido の検証で示された。原因は eventual consistency による失効反映の遅延で、削除がまだ伝播していないサーバーに当たれば攻撃者は使い続けられる。Aikido は遅延を計測し可視化したが、検出は失効遅延の構造そのものを変えられない。

---

## 2. 何が起きたか

- **公開**: 2026-05、Aikido security の Joe Leon 氏、Aikido 公式 blog
- **公開先**: 「Google API keys keep working after you delete them long enough to be exploited」
- **影響範囲**: Google API キー全般(Gemini、BigQuery、Maps など Google Cloud API)
- **失効遅延の計測値**: 最短約 8 分、中央値約 16 分、最長約 23 分(10 回試験 × 2 日)
- **試験条件**: API キー作成・削除後、1 秒あたり 3-5 リクエストを送り続けて最後の認証成功時点を計測。米東部・西ヨーロッパ・東南アジアの 3 リージョンで追加 5 試験を実施
- **API 種別による失効速度の差**: 旧 Gemini API キー(最長約 23 分)、新 Gemini API キー形式(約 1 分)、Google サービスアカウントキー(約 5 秒)
- **Google の対応**: Aikido の報告を「修正しない」「想定通りの動作」「セキュリティ問題ではない」として終了

事象は次の連鎖で成立している。

1. **Initial state**: 開発者が Google API キーを意図せず漏洩(GitHub commit、log 出力、第三者ツール経由、画面共有等)
2. **Detection**: 開発者または自動検出ツールが漏洩を認知
3. **Revocation attempt**: 開発者が Google Cloud 管理画面から API キーを削除する操作を実行
4. **Eventual consistency window**: Google のインフラ全体に削除情報が段階的に反映される。この期間中、認証サーバーによっては削除済みキーをまだ「有効」と判定する状態が継続
5. **Continued exploitation**: 攻撃者は漏洩キーを使い続け、削除情報がまだ反映されていないサーバーにヒットすれば認証が成功する。試験では中央値約 16 分、最長約 23 分の悪用窓が確認された
6. **Impact realization**: Gemini プロジェクトの場合、アップロード済みファイルおよびキャッシュされた会話内容の外部送信が可能になる。データ持ち出し被害として計上される
7. **Billing escalation**: 課金面では、Google が 2026-04 に導入した利用上限段階制において一定条件で上限が自動引き上げされるため、短時間に数百万円規模の請求事例が複数報告されている

---

## 3. 時系列 — 公表と対応

- 2026-04: Google が課金ポリシーを改定、利用上限段階制を導入(ただし一定条件で 250 USD から 100K USD まで自動引き上げる仕様が併存)
- 2026-05-21: The Register が初報「Threat hunters find Google API keys still usable 23 minutes after deletion」
- 2026-05: Aikido 公式 blog で技術詳細と試験結果を公開、Google への報告と「修正しない」回答の経緯を含む
- 2026-05-22: GIGAZINE が日本語で続報

> 注: 固有名・計測値は一次（Aikido security 公式 blog の Joe Leon 氏による試験データ、The Register の初報）に基づき、各 API 種別・実装の失効挙動は時点により異なるため最新情報を参照のこと。本 Brief は研究者による失効遅延の計測結果として扱い、実環境での被害規模を誇張しない。

公表後の対応と業界の動きは次のとおり。

- **Aikido security**(Joe Leon 氏): 公式 blog で技術詳細と試験結果を公開、業界に問題を提示。Google Cloud コンソールの「有効なAPIとサービス」から認証情報別のリクエスト状況を確認するモニタリング推奨も併載。「漏洩した Google API キーの削除を『即時完了』ではなく『30 分程度かかる作業』として扱うべき」を業界横断の運用要件として提案
- **Google**: Aikido の報告に対して「修正しない」「想定通りの動作」「セキュリティ問題ではない」として終了。修正の予定なし。The Register のコメント要求にも記事作成時点で回答なし

API 種別による失効速度の差が示すこと:

- 旧 Gemini API キー: 最長約 23 分
- 新 Gemini API キー形式: 約 1 分
- Google サービスアカウントキー: 約 5 秒

これは「より高速な失効処理は技術的に可能」を示唆しており、Aikido はこの点を業界の論点として提示している。サービスプロバイダー側の credential lifecycle 設計が事業者ごとに異なるため、利用者側で属性の確実性を独立検証する層の必要性が、業界横断の運用課題として浮上している。

---

## 4. なぜ止まらなかったか

本事案は、credential の **「失効属性」(有効 / 失効)が独立検証されないまま運用される** という構造の代表事例である。Google API キーの「削除済み」という属性主張が、すべてのサーバーで同時に有効ではないにも関わらず、開発者・ユーザー・規制報告に対しては「失効済み」として presented される。属性の主張と実態の乖離が、検証層なしには可視化できない構造になっている。

Brief 003(Starlette/BadHost)とは別の primitive(本事案では「失効済み」という属性、[Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/) では「path-based authn」)だが、共通する構造は同じ:**信頼の assertion が、それを検証する layer と切り離されている**。Brief 005(Noroboto)とも同様の構造を共有し、[Brief 001](https://lemma.frame00.com/ja/critical/briefs/001-kelpdao-rseth/) / 002 / 004 が扱う「メッセージ origin / commit origin の独立検証不在」とは credential lifecycle の横断 layer で隣接する。

本事案では Aikido が約 1 分から 23 分の失効遅延を 10 回試験 × 2 日にわたって計測し、業界横断で問題を可視化した。これは検出企業による threat hunting の典型的成功であり、検出企業の役割を本 Brief が否定するものではない。検出は事象の輪郭把握、業界横断の論点提起、組織横断の運用見直しに不可欠な層として引き続き重要である。

一方で、検出は eventual consistency による失効遅延の構造そのものを変更できない。Google が「修正しない」とした立場である以上、開発者・ユーザーは漏洩 API キーを「削除済み」として扱う限り、最長 23 分間の悪用窓を放置することになる。これは検出層の射程外にある、構造的に独立した層の gap である。

規制報告・行政手続き・訴訟で「credential を確実に失効させた」と立証する材料として、本事案のような「削除しても 23 分有効」事例では、検出スコアと失効証明の間に独立した層が必要となる。事前証明(pre-execution attestation)は、検出に対する代替ではなく **補完** の関係にあり、両層の組み合わせで credential lifecycle の trust boundary が確立される。

---

## 5. 証明があれば、何が変わるか

Lemma の設計は、credential の失効属性が独立検証されず eventual consistency の遅延窓が残るという本事案の gap に対し、属性を各サーバーの local state から切り離して proof として固定する点で対置される。

- **属性の来歴バインド**: credential（API キー、アクセストークン、認証情報）の属性（有効・失効・スコープ・有効期限など）を独立検証可能な暗号証明として commit する。
- **使用前の認可証明(proof-as-auth)**: credential を使う前に proof を検証する設計であり、各サーバーの「有効」判定に依存せず、失効状態を使用の前段で確定する。
- **選択的開示**: 属性を proof として固定することで、規制報告者・監査人が鍵そのものを露出させずに「失効済み」という事実だけを独立検証できる。
- **検出との補完**: Aikido が計測・可視化した失効遅延と、属性を proof として固定する層は、対立軸ではなく二段構成として機能する。

これは local state ではなく proof として固定された属性を verifier が検証する設計思想であり、検出層を置き換えるものではなく補完する。

---

## 6. Sources

- **Aikido security technical analysis**: "Google API keys keep working after you delete them long enough to be exploited" by Joe Leon(2026-05、Aikido 公式 blog、10 回試験 × 2 日の計測データと技術詳細、Google への報告経緯を含む)— https://www.aikido.dev/blog/google-api-keys-deletion
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 04 — 規制属性証明](https://lemma.frame00.com/ja/pillars/regulatory-attribute-proof/)、[Trust402](https://lemma.frame00.com/ja/trust402/)
