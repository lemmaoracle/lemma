---
brief_no: 6
title: "Google の API キー：削除の後も、しばらく認証に通ったと報告された(Aikido)"
title_en: "Google API keys: Deleted keys kept authenticating for a while, a security firm reported (Aikido)"
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
og_lead_ja: "Google の API キーが、削除の後も最長約 23 分、認証に通ったと Aikido が報告した"
og_lead_en: "Aikido reported that Google API keys kept authenticating for up to about 23 minutes after deletion"
layout: "report"
sections: "proof"
gate: "permission-change"
og_kicker_ja: "研究者の計測 · API キー"
og_kicker_en: "RESEARCH · API KEYS"
og_headline_ja: "削除した API キーが、\n23 分ほど通ったと報告。\n<accent>Google の API キー</accent>"
og_headline_en: "Deleted Google API keys\nworked up to 23 minutes,\n<accent>Aikido reports.</accent>"
key_figures:
  - value: "23"
    unit: "分"
    label: "削除の後、最後に認証に通るまでの最長の時間（Aikido の 10 回の試験）"
    tone: "alert"
  - value: "16"
    unit: "分"
    label: "同じ試験の中央値。最短は約 8 分だった（Aikido の計測）"
  - value: "約 5"
    unit: "秒"
    label: "Google のサービスアカウントキーで、削除が反映されるまでの時間。新しい形式の Gemini API キーは約 1 分（Aikido の計測）"
glossary:
  - term: "API キー"
    desc: "サービスの API を呼び出すときに、呼び出し元を見分けるための文字列。持っている人は、持ち主と同じように API を使える。"
  - term: "鍵の削除（失効）"
    desc: "管理画面などで鍵を使えなくする操作。削除した鍵での呼び出しは、受け付ける側で断られる。"
  - term: "結果整合性（eventual consistency）"
    desc: "変更が、多くのサーバーに少しずつ広がり、時間をおいてそろう仕組み。そろうまでの間、サーバーによって答えが違う。"
insight:
  slug: "revocation-not-yet-propagated"
  label: "削除の操作と、届くまでの間"
  quote: "鍵を削除しても、受け付ける側のすべてに届くまでは、その鍵で呼び出しが通る。"
industries: ["developers"]
operations: ["account-admin"]
controls:
  - slug: "limit-and-revoke"
    item: "削除した API キーが、使用の前に失効済みと確認できるようにする"
search_title: "Google の API キーが削除後も通る問題：計測と対策"
search_description: "Google の API キーが、削除の後も最長約 23 分、認証に通り続けたと Aikido が報告した（10 回の試験）。何が通ったか、どこで照合するか、鍵を削除したあとの点検を整理。"
takeaway: "削除の操作が済んだあとも、受け付けるサーバーに届くまでの間、鍵は通り続けた（Aikido の計測）。"
self_check: "漏れた鍵を削除したあと、その鍵がもう通らなくなったことを、自分で確認しているか。"
countries: ["global"]
---

## 1. 要点

この件はセキュリティ企業の計測で、計測の結果は Aikido の報告に拠る。管理画面で鍵を削除しても、その情報は Google の多くのサーバーに段階的に広がり、まだ届いていないサーバーでは、削除した鍵がそのまま通った。鍵の種類によって、通り続けた時間は数秒から 20 分を超えるまで分かれた。<strong>鍵を削除しても、受け付ける側のすべてに届くまでは、その鍵で呼び出しが通る。</strong>

## 2. 通った操作

- **通った操作**: 管理画面で削除した Google API キーでの、API の呼び出し。Aikido の試験で、削除の後も認証に通った。
- **短く済んだ操作**: Aikido の計測では、Google のサービスアカウントキーは約 5 秒、新しい形式の Gemini API キーは約 1 分で通らなくなった。
- **受け付けた側に届くもの**: 一般に、削除の情報がまだ届いていないサーバーには、削除した鍵も、有効な鍵と同じ形で届く。Aikido は、遅れの原因を、削除の情報が段階的に広がる仕組み（結果整合性）によるものと説明している。
- **公表されていないこと**: 削除の後の時間に、漏れた鍵が実際に使われた事例があるか。Aikido が Google に報告した日。Google 側の、遅れの仕組みについての説明。

## 3. 実行前の照合

経路を問わず区別できる条件は、鍵を受け付ける側が、呼び出しを通す前に、その鍵がいま失効済みかを、削除の操作を記録した側の記録と照合することである。

- **誰が承認を出すか**: 鍵の持ち主（削除の操作をした開発者）と、鍵を発行した側。失効済みかを決めるのは、削除の操作を記録した側の記録で、受け付けるサーバーがそれぞれ持つ状態ではない。
- **どこで照合するか**: 鍵での呼び出しを受け付け、処理を実行する手前。削除の記録にある鍵は、どのサーバーで受け付けても通さない。
- **何が残るか**: どの鍵の呼び出しを、どの時点の失効の記録と照合して、通した・断ったかの記録。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝鍵での呼び出しを通す前に、その鍵が失効済みかを記録と照合し、記録に残すこと。検知＝漏れや、削除の後の遅れに、後から気づくこと。下は、鍵が漏れてから通るまでの一般の流れで、Aikido の試験の手順ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>呼び出しを通す前に、失効の記録と照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>削除した鍵が、<br>最長約 23 分通った</span></div>
<div class="rx-zone det"><b>検知 · 計測で見えた</b>Aikido の計測が、削除の後の遅れを示した</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>鍵が漏れる</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>漏れに気づき、削除する</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>削除が段階的に広がる</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>届いていないサーバーで通る</b></div>
</div>
</figure>

計測は、削除の後の遅れを見えるようにしたが、遅れそのものは変えない。同じように、使えなくなったはずのものが、しばらく通った事案に、[Visa の期限切れのカード](https://lemma.frame00.com/ja/critical/briefs/135-zombie-cards-visa-contactless-expiry/)がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、鍵での呼び出しを受け付ける側の、実行の手前に組み込む。** 漏れや不正な呼び出しを見つけるのではなく、届いた鍵が、削除の記録にある鍵でないかを、呼び出しを通す前に照合する。

### 注意したい業界・業務

- **業界 · 開発者・エージェント運用**: Gemini・BigQuery・Maps などの Google Cloud の API を、API キーで呼び出す開発者と組織。鍵は、コードやログ、画面の共有などから漏れることがある。
- **業務 · アカウント・権限の管理**: 漏れた鍵の削除と、削除の後の扱い。削除の操作が済んだ時点を、使えなくなった時点として扱いやすい。

### いまの対策と Lemma の違い

今回の経路は 1 列目（削除した鍵での呼び出し）である。2 列目は、その前の段の、鍵が漏れる入口である。

| 対策 | 削除した鍵での呼び出し | 鍵が漏れる入口 |
| --- | --- | --- |
| 管理画面での鍵の削除 | 一部 | 関係しない |
| 削除が速く反映される種類の鍵（サービスアカウントキーなど） | 一部 | 関係しない |
| 認証情報ごとのリクエストの確認 | 一部 | 関係しない |
| 漏れの検出（自動の検出ツールなど） | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 関係しない |

鍵の削除は、いずれ通らなくなるが、Aikido の計測では、旧い Gemini API キーで最長約 23 分かかった。サービスアカウントキーなどは数秒から 1 分ほどで通らなくなったが、その間は通る。認証情報ごとのリクエストの確認は、Aikido が勧めるもので、使われたことに気づけるが、通った呼び出しは止めない。漏れの検出は、漏れに早く気づくためのもので、削除の後の遅れとは関係しない。Lemma は、呼び出しを通す前に、その鍵を失効の記録と照合する。

注：Lemma の照合が働くのは、鍵を受け付ける側（API を提供する事業者や、自社で鍵を発行して受け付けるサービス）が、呼び出しを通す前に照合を組み込み、失効の記録を、受け付けるサーバーとは別に管理している場合に限る。Google の API を呼び出す側だけでは、Google のサーバーに組み込めない。失効の記録そのものが遅れて更新される場合は、通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

API キーを発行・利用する組織で確認する 3 項目

- 漏れた鍵の削除を、すぐ済むものではなく、しばらく通りうる作業として手順に書いているか。
- 削除の後の時間に、その鍵でのリクエストが来ていないかを見ているか。
- 自社で鍵を発行して受け付けるサービスで、削除した鍵を、どのサーバーでも通さない形にしているか。

## 5. 事実と時系列

- **計測した主体**: セキュリティ企業 Aikido security の Joe Leon 氏。結果を Aikido の公式ブログ「Google API keys keep working after you delete them long enough to be exploited」で公表した。実地の被害ではなく、研究者による計測である。
- **対象**: Google API キー全般（Gemini、BigQuery、Maps などの Google Cloud の API）。
- **計測の結果**: 削除の後、最後に認証に通るまでの時間は、最短約 8 分、中央値約 16 分、最長約 23 分（10 回の試験 × 2 日）。
- **試験の条件**: 鍵を作って削除したあと、1 秒あたり 3〜5 回の呼び出しを続け、最後に認証に通った時点を計った。米国東部・西ヨーロッパ・東南アジアの 3 つの地域で、さらに 5 回の試験をした。
- **鍵の種類による違い**: 旧い Gemini API キーは最長約 23 分、新しい形式の Gemini API キーは約 1 分、Google のサービスアカウントキーは約 5 秒。
- **影響**: Gemini のプロジェクトでは、アップロード済みのファイルや、キャッシュされた会話の内容を外に持ち出せる、とされている。
- **課金**: Google は 2026-04 に課金の方針を改め、利用上限の段階制を入れた。一定の条件で、上限が 250 USD から 100K USD まで自動で引き上げられる仕様がある。

### 時系列

- **2026-04**: Google が課金の方針を改め、利用上限の段階制を入れる。
- **2026-05**: Aikido が公式ブログで、技術の詳細と試験の結果を公表する。Google への報告と、その回答の経緯を含む。
- **2026-05-21**: The Register が「Threat hunters find Google API keys still usable 23 minutes after deletion」と報じる。
- **2026-05-22**: GIGAZINE が日本語で報じる。

> 本件の固有名と計測の値は、Aikido security の公式ブログ（Joe Leon 氏の試験のデータ）と The Register の報道に拠る。鍵の種類や実装ごとの失効の動きは、時点によって変わるため、最新の情報を参照のこと。研究者による計測として扱い、実地の被害の規模は主張しない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Aikido security**: 公式ブログで技術の詳細と試験の結果を公表した。Google Cloud のコンソールの「有効な API とサービス」で、認証情報ごとのリクエストの状況を確認するよう勧めた。漏れた Google API キーの削除は、「すぐ済むもの」ではなく「30 分ほどかかる作業」として扱うべきだとしている。鍵の種類によって速さが違うことから、より速い失効は技術的にできる、と論点に挙げた。
- **Google**: Aikido によれば、Google は報告を「修正しない」「想定どおりの動作」「セキュリティの問題ではない」として閉じた。The Register によれば、記事の時点で、同紙のコメントの求めにも答えていない。

## 6. Sources

- **Aikido security technical analysis**: "Google API keys keep working after you delete them long enough to be exploited" by Joe Leon(2026-05、Aikido 公式 blog、10 回試験 × 2 日の計測データと技術詳細、Google への報告経緯を含む)— https://www.aikido.dev/blog/google-api-keys-deletion
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
