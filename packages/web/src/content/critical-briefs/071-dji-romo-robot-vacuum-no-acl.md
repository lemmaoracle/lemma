---
brief_no: 71
title: "DJI ROMO：1 つの認証済みの接続で、他人のロボット掃除機のカメラ・マイクに届いたと研究者が報告した(研究者の報告・Malwarebytes)"
title_en: "DJI ROMO: A researcher reported that one authenticated connection reached other people's robot vacuum cameras and microphones (researcher's report, Malwarebytes)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-02-17
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["070-unitree-shared-key-robot-identity", "068-universal-robots-polyscope-command-injection", "057-deepseek-clickhouse-exposed-db", "006-google-api-key-revocation-lag", "052-discord-age-verification-id-leak"]
status: published
gate: "permission-change"
version: "1.0"
og_lead_ja: "DJI ROMO：研究者の 1 つの接続に、約 7,000 台のロボット掃除機が応答したと報じられた"
og_lead_en: "DJI ROMO: about 7,000 robot vacuums reportedly responded to one researcher's connection"
layout: "report"
sections: "proof"
og_kicker_ja: "脆弱性の報告 · 家庭用ロボット"
og_kicker_en: "VULNERABILITY · HOME ROBOTS"
og_headline_ja: "研究者の 1 つの接続に\n他人の機体が応答したと報告\n<accent>約 7,000 台・24 か国以上</accent>"
og_headline_en: "One login reached\nothers' robot vacuums,\na researcher reports.\n<accent>~7,000 units, 24+ countries</accent>"
key_figures:
  - value: "約 7,000"
    unit: "台"
    label: "研究者の 1 つの接続に応答したと報じられた ROMO の数（Malwarebytes ほか）"
    tone: "alert"
  - value: "24"
    unit: "か国以上"
    label: "応答した機体のある国の数（Malwarebytes）"
  - value: "02-08 → 02-10"
    label: "報道によると、DJI が初期の修正を展開してから、追加の修正を終えるまで"
glossary:
  - term: "MQTT ブローカー"
    desc: "機器とアプリのあいだでメッセージを中継するサーバー。機器は「トピック」という宛先ごとにデータを送り、アプリはトピックを購読して受け取る。"
  - term: "ACL（アクセス制御リスト）"
    desc: "どの相手が、どのトピックを購読・送信してよいかを決める一覧。"
  - term: "認証と認可"
    desc: "認証は、つないできた相手が誰かを確認すること。認可は、その相手に、どの機体の何を許すかを決めること。"
insight:
  slug: "authenticated-not-authorized-per-device"
  label: "認証は通るが、機体ごとの認可が無い"
  quote: "接続を認証しても、どの 1 台を見てよいかを照合しなければ、1 つの接続がすべての機体に届く。"
industries: ["manufacturing"]
operations: ["data-access"]
controls:
  - slug: "ownership-check"
    item: "映像を見ようとする人が、その機体の持ち主か確認する"
search_title: "DJI ROMO の脆弱性：他人のカメラに届いた報告と対策"
search_description: "DJI のロボット掃除機 ROMO で、研究者の 1 つの接続に約 7,000 台が応答し、カメラ・マイク・間取りに届いたと報じられた。何が通ったか、何を照合するか、対策を整理。"
takeaway: "認証を通った 1 つの接続が、他の機体の映像・音声まで購読できたと報じられた。データを渡す前に、相手がその機体の許可を持つかを照合する。"
self_check: "カメラやマイクのある機器について、クラウドが、ほかの利用者の機体のデータを渡さない作りかを、提供元に確認しているか。"
countries: ["global"]
---

## 1. 要点

研究者は、自分の機体を動かすために作ったアプリで、利用者としてクラウドにつないだだけだったと報じられた。認証は通っていたが、どの機体のデータを受け取ってよいかは、機体ごとに分けられていなかったと解説されている。修正は展開されたが、一部の指摘は報道の時点で未修正と伝えられた。<strong>接続を認証しても、どの 1 台を見てよいかを照合しなければ、1 つの接続がすべての機体に届く。</strong>

## 2. 通った操作

- **通った操作**: 認証を通った 1 つの接続による、機体のトピックの購読。Malwarebytes は、MQTT ブローカーにトピックの ACL が無く、認証済みの接続が、特定の機体に結びつかないまま、他の機体のトピックも購読できたと解説した。
- **受け付けた側に届くもの**: 一般に、認証だけで購読を許すブローカーには、持ち主の購読も、無関係な利用者の購読も、同じ「認証済みの購読」として届く。研究者の報告では、無関係な利用者の接続に、各機のライブのカメラ映像・マイクの音声・間取りのデータが届く状態だった。
- **公表されていないこと**: 研究者のほかに、同じ経路で他人の機体のデータを受け取った者がいたかと、どの接続が何を受け取ったかの記録があるか（参照した報道では伝えられていない）。

## 3. 何を照合するか

経路を問わず区別できる条件は、機体のデータを渡す側が、受け取ろうとする相手を、その機体の持ち主が許可した相手かどうかで、渡す前に照合することである。

- **誰が承認を出すか**: 機体の持ち主（利用者）。自分の機体を、どのアカウントや端末が見てよいかを、機体ごとに許可する。提供元は、その許可を機体ごとに出せる仕組みを用意する。
- **どこで照合するか**: クラウドの、機体の映像・音声・間取りや操作を中継する処理（MQTT ブローカーなど）。購読や操作の前に、相手がその機体の許可を持つかを照合し、持たない購読は通さない。認証を通ったことだけでは通さない。
- **何が残るか**: どの相手が、どの機体の、どのデータを、どの許可で受け取ったかの記録。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝映像・音声を渡す前に、相手がその機体の許可を持つかを照合すること。検知＝他人の機体に届いていたことに、後から気づくこと。下の日付は、報じられた修正と報道の日で、他人の機体に届く状態が始まった日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>購読の前に、相手がその機体の許可を持つかを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>認証を通った 1 つの接続に<br>他の機体の映像・音声が届いた（研究者の報告）</span></div>
<div class="rx-zone det"><b>検知 · 一部</b>研究者が見つけ、DJI が修正を展開する</div>
<div class="rx-g g1"><div class="t">2026-02</div><b>研究者が見つけ、DJI に知らせる</b></div>
<div class="rx-g g2"><div class="t">02-08</div><b>DJI が初期の修正を展開</b></div>
<div class="rx-g g3"><div class="t">02-10</div><b>DJI が追加の修正を終える</b></div>
<div class="rx-g g4"><div class="t">02-17</div><b>報道が伝える</b></div>
</div>
</figure>

研究者が見つけて知らせ、DJI は修正を展開した。ただ、修正は見つかった後の対応で、一度届いた映像・音声は取り消せない。到達できればそのまま読めた事案に [DeepSeek のデータベース](https://lemma.frame00.com/ja/critical/briefs/057-deepseek-clickhouse-exposed-db/)（認証のないデータベースが公開されていた）、機体ごとの鍵が無かった事案に [Unitree のロボット](https://lemma.frame00.com/ja/critical/briefs/070-unitree-shared-key-robot-identity/)（全機が同じ鍵を使っていた）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、機体の映像・音声・操作を中継するクラウドの側に組み込む。** 侵入を見つけるのではなく、購読しようとする相手が、その機体の持ち主から許可を受けているかを、データを渡す前に照合する。

### 注意したい業界・業務

- **業界 · 製造・基幹インフラ**: カメラ・マイクを持つ家電やロボットを作り、クラウドを通して利用者に映像・音声を渡す組織。
- **業務 · 照会・参照**: 機体の映像・音声・間取りのデータを、利用者のアプリから見られるようにする業務。認証を通った相手に、どの機体のデータまで渡すかが分かれ目になる。

### いまの対策と Lemma の違い

今回の経路は、2 列目（他の機体の映像・音声・間取りの購読）である。1 列目のクラウドへの接続は、研究者が自分の機体のために通したもので、認証は通っていた。

| 対策 | クラウドへの接続 | 他の機体の映像・音声・間取りの購読 |
| --- | --- | --- |
| 利用者の認証 | 効く | 効かない |
| ブローカーのトピックの ACL | 関係しない | 効く |
| 事後のログの解析 | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 関係しない | 効く |

利用者の認証は、つないできた相手が誰かは確認するが、その相手がどの機体を見てよいかは決めない。ブローカーのトピックの ACL は、相手ごとに購読できるトピックを絞るもので、Malwarebytes は、これが無かったと解説した。事後のログの解析は、一般に、どの接続がどのトピックを購読したかを後から組み立てられるが、届いた映像・音声は取り消せない。Lemma は、購読の前に、相手がその機体の持ち主から出た許可を持つかを照合し、照合したことを記録に残す。

注：Lemma の照合が働くのは、提供元が、機体の映像・音声を中継する処理に照合を組み込み、持ち主の許可を機体ごとに出せる形にした場合に限る。持ち主の端末やアカウント、許可そのものを盗まれた場合は通ってしまう。カメラの PIN の回避など、別の経路の指摘には、それぞれの修正が要る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

ネットにつながる機器を作る・導入する組織で確認する 3 項目

- 自社の製品のクラウドで、接続した相手が購読・操作できる機体を、その相手に許可された機体だけに絞っているか。
- どの相手が、どの機体の映像・音声を受け取ったかを記録しているか。
- 外部の研究者からの脆弱性の報告を受け付ける窓口と、修正を配る手順があるか。

## 5. 事実と時系列

- **対象**: DJI のロボット掃除機 ROMO と、その機体・スマートフォンのアプリ・クラウドの基盤。家庭に置かれ、カメラ・マイク・間取り図を扱う。
- **発見**: 研究者の Sammy Azdoufal 氏。自分の ROMO を PS5 のコントローラーで動かすために、AI のコーディングツールを使ってアプリの通信を解析していたところ、自作のアプリが DJI の基盤につながったときに、多数の他の機体が応答したことに気づいたとされる。The Verge を通じて DJI に知らせた。
- **確認されたこと（研究者の報告）**: 約 7,000 台の ROMO（少なくとも 24 か国）が応答し、ライブのカメラ映像・マイクの音声・間取りのデータに、無関係な利用者が届く状態だった。
- **必要だったもの**: 個々の機体を持っていることではなく、基盤に「認証済みのクライアント」としてつなげること。
- **原因の解説**: Malwarebytes は、MQTT ブローカーにトピックの ACL が無く、認証済みの接続が、特定の機体に結びつかないまま、あらゆる機体のトピックを購読できたと解説した。

### 時系列

- **2026-02**: 研究者が、自作のアプリの接続に多数の他の機体が応答することに気づき、The Verge を通じて DJI に知らせる。
- **2026-02-08**: 報道によると、DJI が初期の修正を展開する。
- **2026-02-10**: 報道によると、DJI が追加の修正を終える。
- **2026-02-17**: Malwarebytes と DroneXL が報じる。
- **2026-02-24**: PetaPixel が報じる。
- **2026-03-10**: DroneDJ が、修正と報奨金を報じる。

> 本件の事実は、Malwarebytes の技術解説と、PetaPixel・DroneXL・DroneDJ の報道に拠る。本件は研究者による発見と開示で、悪用した主体を責めるものではなく、製造者を責めるものでもない。規模と修正の日付は、報じられた範囲で書いている。AI のコーディングツールの利用は解析の手段としての事実で、本 Brief の論点は、機体ごとの認可の分け方にある。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **DJI**: 報道によると、ROMO の MQTT ブローカーの権限の検証の問題を、2026-02-08 の初期の修正と 02-10 の追加の修正で解消し、発見者に $30,000 の報奨金（1 件の発見に対するもの）を支払った。
- **残った指摘**: カメラ映像の PIN の回避など、一部の指摘は、報道の時点で未修正と伝えられた（Malwarebytes・DroneXL）。

## 6. Sources

- **Malwarebytes（技術解説）**: “Hobby coder accidentally creates vacuum robot army”（2026-02-17、MQTT のトピック ACL 不在＝認証済みで他機を購読、約 7,000 台・24 か国、一部未修正）— <https://www.malwarebytes.com/blog/news/2026/02/hobby-coder-accidentally-creates-vacuum-robot-army>
- **PetaPixel**: “Someone Remotely Accessed the Cameras in 7,000 DJI Robot Vacuums”（2026-02-24） — <https://petapixel.com/2026/02/24/someone-remotely-accessed-the-cameras-in-7000-dji-robot-vacuums/>
- **DroneXL**: “DJI ROMO Security Breach: Researcher Remotely Accessed 7,000 Home Cameras”（2026-02-17） — <https://dronexl.co/2026/02/17/dji-romo-security-breach/>
- **DroneDJ**: “DJI fixes ROMO security bug that exposed thousands of homes”（2026-03-10、修正・報奨金） — <https://dronedj.com/2026/03/10/dji-romo-security-bug-bounty/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
