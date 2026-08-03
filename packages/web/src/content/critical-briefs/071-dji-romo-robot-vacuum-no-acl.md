---
brief_no: 71
title: "DJI ROMO：1 つの認証で 7,000 台のロボット掃除機のカメラ・マイクに届いた — クラウド基盤が機体ごとの認可を分離せず、認証済みなら全機の映像・音声を購読できた構造（The Verge）"
title_en: "DJI ROMO: one authenticated client reached 7,000 robot vacuums' cameras — the cloud didn't separate per-device authorization (No Broker ACL)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-02-17
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["070-unitree-shared-key-robot-identity", "068-universal-robots-polyscope-command-injection", "057-deepseek-clickhouse-exposed-db", "006-google-api-key-revocation-lag", "052-discord-age-verification-id-leak"]
status: draft
version: "1.0"
og_lead_ja: "1 つの認証で 7,000 台のロボット掃除機のカメラ・マイクに到達 — DJI ROMO"
og_lead_en: "One authenticated client reached 7,000 robot vacuums' cameras — DJI ROMO"
gap_detected: "研究者の責任ある開示、メディア経由の通報、DJI の迅速な修正と報奨金、どの接続が何を購読したかの事後ログは実施・記録できた。"
gap_missing: "「いま購読しようとする主体は、この機体に対する権限を持つか」をアクセスの前に確かめる層が無く、認証を通った 1 接続が全機に素通りした。"
gap_fix: "アクセスの前に「この主体は、この機体に対する正当な権限を持つ」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

DJI ROMO 掃除ロボットで、研究者が自作のクライアントをクラウドにつなぐと、約 7,000 台（24 か国以上）の他人の機体が応答し、ライブのカメラ映像・マイク音声・間取りに届いた。MQTT ブローカーに ACL が無く、認証を通った 1 接続が機体に紐づかず全機のトピックを購読できた。責任ある開示・修正・事後ログでは、購読しようとする主体がこの機体に対する権限を持つかをアクセスの前に確かめられない。認証と機体ごとの認可が分離されず、独立検証されていなかった。

---

## 2. 何が起きたか

- **対象**: DJI のロボット掃除機 ROMO と、その機体・スマホアプリ・クラウド基盤。家庭に置かれ、カメラ・マイク・間取り図を扱う消費者向けの実体エージェント
- **発見・公表**: 研究者 Sammy Azdoufal が発見。自分の ROMO を PS5 コントローラーで操作するため、AI コーディングツールを用いて DJI アプリの通信プロトコルを解析中、自作のリモコンアプリが DJI 基盤に接続した際に多数の他機が応答することに気づいた。The Verge 経由で DJI へ通報
- **規模**: 約 7,000 台の ROMO が応答（少なくとも 24 か国）。ライブのカメラ映像・マイク音声・間取り（home mapping）データに、無関係な利用者からアクセスできる状態だった
- **必要だったもの**: 個々の機体の所有権ではなく、基盤に「認証済みクライアント」として接続できること。認証は通るが、機体ごとの認可が分離されていなかった
- **対応**: DJI が 2026-02-08 に初期修正、02-10 に追補を完了。発見者へ $30,000 の報奨金を支払い（一件の発見に対するもの）。なお、カメラ映像の PIN バイパス等、一部の指摘は報告時点で未修正と報じられた

本事象は、クラウド基盤が認証と認可を分離せず、機体ごとの認可を検証しなかったために、1 つの認証済み接続が機体群全体のセンサーに届く構造を示す。外部攻撃ではなく研究者の発見であるため、事象の連鎖として記述する。

1. **正規の接続**: 研究者が、自分の機体を操作するため、自作アプリを DJI のクラウド基盤（MQTT ブローカー）に認証済みクライアントとして接続する
2. **ACL の不在**: ブローカーに ACL が無く、認証済みクライアントが特定機体に紐づかず、あらゆる機体のトピックを購読できる
3. **機体群への到達**: 接続に対し、約 7,000 台（24 か国以上）の他機が応答する。各機のライブ映像・音声・間取りデータが、無関係な利用者の接続に届く状態だった
4. **認可検証の欠落**: 「この利用者は、この 1 台に対して権限を持つか」をブローカーが検証していなかった。認証は通るが、機体ごとの認可は存在しなかった
5. **通報と修正**: 研究者が The Verge 経由で DJI に通報。DJI が 2 月 8 日・10 日の更新で修正（到達範囲を断つ事後の系列）

---

## 3. 時系列 — 公表と対応

- 2026-02（前段）: 研究者が自分の ROMO を PS5 コントローラーで操作するため、アプリの通信プロトコルを解析。自作アプリの接続時に多数の他機が応答することを発見
- 2026-02-08: DJI が初期修正を展開
- 2026-02-10: DJI が追補の修正を完了
- 2026-02 中旬以降: 研究者が The Verge に共有、The Verge が DJI に確認。確立メディアが報道。DJI が発見者へ $30,000 の報奨金を支払い

> 注: 本事案は研究者による発見と責任ある開示であり、悪用主体の断罪ではない。本 Brief は規模（約 7,000 台・24 か国以上）と修正日を報じられた範囲で記述し、断定を避ける。AI コーディングツールの利用は解析手段としての事実であり、本 Brief の論点は基盤側の認可分離の不在にある。

公表後の対応と業界の動きは次のとおり。

- **DJI**: ROMO の MQTT ブローカーの権限検証問題を、2026-02-08 の初期修正と 02-10 の追補で解消。発見者へ $30,000 の報奨金を支払い
- **研究者 / The Verge**: 発見を The Verge 経由で DJI へ通報し、責任ある開示の経路を確立。手口と影響範囲を可視化
- **消費者 IoT 運用・製造者への論点**: クラウド前提の機体群で、認証と認可を分離し、機体ごとの認可（どの利用者がどの 1 台に対して権限を持つか）を基盤で独立検証する設計の必要性が論点に。ブローカーの ACL・トピック分離は最低条件
- **業界横断の論点**: 家庭・生活空間に入る実体エージェント（掃除ロボット、見守り機器等）が増える中、[Brief 070](https://lemma.frame00.com/ja/critical/briefs/070-unitree-shared-key-robot-identity/)（機体 identity）と合わせ、per-device の identity と認可をどう独立検証するかが、プライバシーと安全の要件として共有されつつある

到達できること（reachability）を、その機体に対する正当な権限（authorization）と取り違える設計の不在は、特定メーカーの問題ではなく、クラウド連携の実体エージェントを社会に広げる産業横断の課題として共有されつつある。

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「クラウド基盤が認証済みかとこの機体に対する認可があるかを分離せず、機体ごとの認可を独立検証していなかった」</strong>点にある。MQTT ブローカーに ACL が無いとは、「認証を通った者は、どの機体のトピックでも購読できる」を意味し、到達（reachability）がそのまま全機のセンサーへのアクセスになっていた。

[Brief 070](https://lemma.frame00.com/ja/critical/briefs/070-unitree-shared-key-robot-identity/)（Unitree、全機が同一のハードコード鍵を共有し、機体ごとの identity が無い）の姉妹事例であり、対エージェントの実体クラスタを成す。070 が「機体ごとの本人性（identity）が無い」事例だったのに対し、本事案は **認証は機能していたが、機体ごとの認可（authorization）が分離されていなかった**点が異なる——両者は「per-device の identity と認可」という同じ問いの裏表である。[Brief 057](https://lemma.frame00.com/ja/critical/briefs/057-deepseek-clickhouse-exposed-db/)（認証のない AI バックエンドで、到達がそのまま全取得になった）とは、到達と認可が分離されない構造でほぼ同型。[Brief 006](https://lemma.frame00.com/ja/critical/briefs/006-google-api-key-revocation-lag/)（認証情報の失効属性が独立検証されなかった）とは、アクセス主体の属性が独立検証されない点で、[Brief 052](https://lemma.frame00.com/ja/critical/briefs/052-discord-age-verification-id-leak/)（年齢確認のために預けた生 ID が第三者保管で流出した）とは、消費者の機微データ（ここではカメラ・マイク・間取り）が分離・保護されないまま露出面に転じる点で連なる。

本事案が際立たせるのは、**家庭に入る実体エージェントの認可を、基盤がどう機体ごとに独立検証するか**だ。掃除ロボットはカメラ・マイク・間取りを持つ生活空間のセンサーであり、その機体ごとの認可が分離されていなければ、認証を通った 1 つの接続が他家庭のプライバシーに届く。到達できることと、その機体に対する正当な権限を持つことは別であり、機体ごとの認可が行動の前に独立検証されて初めて、家庭の実体エージェントを安心して使える。

研究者による責任ある開示、The Verge を介した通報、DJI の迅速な修正と報奨金は、露出の是正に不可欠であり、本 Brief がその役割を否定するものではない。修正の展開は、到達範囲を断つ重要な歯止めとなった。

一方で、サーバー側のログ監視やパッチは、基盤が「いま購読しようとしている主体は、この機体に対する権限を持つか」を、**アクセスの前に**機体ごとに独立検証する材料にはならない。本事案の中核は、ブローカーが認証と認可を分離せず、機体ごとの認可検証そのものを欠いていたことにある。トラフィックの事後解析は「どの接続がどのトピックを購読したか」を再構成するが、「その購読は、この機体に対する正当な権限に基づくか」を行動の前に独立検証する材料にはならない。ライブ映像・音声に一度届けば、その時点のプライバシー露出は遡って取り消せない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、機体のセンサー・トピックへのアクセスを「認証済みである」ことではなく「この機体に対する正当な権限を持つ主体による、独立検証可能な認可の証明」として扱う設計を採る。購読・操作・映像取得のような行動を、機体固有の識別と付与者の認可に対してアクセスの前に検証すれば、認証を通っただけでは他機のトピックには届かない。到達の検出（detection 的な「誰が接続したか」）と、機体ごとの認可の証明（「この機体に対する権限に基づくか」）は代替ではなく **補完** の関係にあり、両者が重なって初めて、家庭の実体エージェントを安心して使える（行為の時点で認可を独立検証する考え方は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、検出と事前証明の thesis は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）を参照）。

本事案で露呈した検出と証明の落差（クラウド基盤が認証と認可を分離せず、機体ごとの認可を独立検証していない）に対して、Lemma は、機体のセンサー・操作へのアクセスを、「認証済み」や「到達できた」ことではなく「この機体に対する正当な権限を持つ主体による、独立検証可能な認可の証明」として裏づける設計を提示している。

- **機体ごとの認可（proof-as-auth）**: 購読・操作・映像取得のような行動を、機体固有の識別と付与者の認可に対してアクセスの前に独立検証する。認証を通ったという事実では満たせない、機体ごと・行動ごとの証明に置き換える
- **到達と認可の分離**: 「基盤に到達できた＝アクセスしてよい」という前提を断ち、reachability と authorization を分離する（[Brief 057](https://lemma.frame00.com/ja/critical/briefs/057-deepseek-clickhouse-exposed-db/) の到達＝全取得構造と接続）
- **per-device identity との一体運用**: 機体ごとの固有の本人性（[Brief 070](https://lemma.frame00.com/ja/critical/briefs/070-unitree-shared-key-robot-identity/)）と、その機体に対する認可を一体で扱い、認証済みの 1 接続が機体群全体に届く経路を断つ
- **選択的開示**: 機体・利用者の内部データを出さずに、「この主体はこの機体に対する正当な権限を持つ」ことだけを最小開示し、独立検証とプライバシー保護を両立する

これにより、行為の時点で固定された証明が、「この購読・操作は、この機体に対する正当な権限に基づくか」を、事後のトラフィック解析に依存せず独立検証可能なトレイルとして機能させる。検出（事後の解析・修正）は露出の是正に、事前証明（機体ごとの認可の独立検証）は家庭の実体エージェントの信頼確立に、それぞれ相補的に働く。設計と適用範囲は、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/#authority) および [Trust402](https://lemma.frame00.com/ja/trust402/) を参照のこと。

---

## 6. Sources

- **Malwarebytes（技術解説）**: “Hobby coder accidentally creates vacuum robot army”（2026-02-17、MQTT のトピック ACL 不在＝認証済みで他機を購読、約 7,000 台・24 か国、一部未修正）— <https://www.malwarebytes.com/blog/news/2026/02/hobby-coder-accidentally-creates-vacuum-robot-army>
- **PetaPixel**: “Someone Remotely Accessed the Cameras in 7,000 DJI Robot Vacuums”（2026-02-24） — <https://petapixel.com/2026/02/24/someone-remotely-accessed-the-cameras-in-7000-dji-robot-vacuums/>
- **DroneXL**: “DJI ROMO Security Breach: Researcher Remotely Accessed 7,000 Home Cameras”（2026-02-17） — <https://dronexl.co/2026/02/17/dji-romo-security-breach/>
- **DroneDJ**: “DJI fixes ROMO security bug that exposed thousands of homes”（2026-03-10、修正・報奨金） — <https://dronedj.com/2026/03/10/dji-romo-security-bug-bounty/>
