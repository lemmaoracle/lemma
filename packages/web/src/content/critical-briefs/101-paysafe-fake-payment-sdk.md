---
brief_no: 101
title: "偽の Paysafe SDK：決済 SDK の名前を装うパッケージが、開発環境の鍵とトークンを持ち出す作りだった(Socket の調査)"
title_en: "Fake Paysafe SDKs: packages posing as payment SDKs were built to carry off developers' keys and tokens (Socket research)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["kyc-aml-disclosure", "attribute-proof-bypass"]
incident_date: 2026-07-07
published: 2026-07-10
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["028-npm-dependency-confusion-recon", "038-ironworm-npm-self-propagation", "090-air-fake-agent-skill-toctou", "077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach"]
status: published
gate: "intake"
version: "1.0"
og_lead_ja: "偽の Paysafe SDK：決済 SDK を装う 17 パッケージが、開発環境の鍵とトークンを送り出す作りだった（Socket）"
og_lead_en: "Fake Paysafe SDKs: 17 packages posing as payment SDKs were built to send out developers' keys and tokens (Socket)"
layout: "report"
sections: "proof"
og_kicker_ja: "サプライチェーン攻撃 · 偽の決済 SDK"
og_kicker_en: "SUPPLY CHAIN · FAKE PAYMENT SDKS"
og_headline_ja: "偽の決済 SDK が、\n鍵を送り出す作りだった。\n<accent>17 パッケージ</accent>"
og_headline_en: "Fake payment SDKs\nwere built to send out keys.\n<accent>17 packages</accent>"
key_figures:
  - value: "17"
    unit: "件"
    label: "決済 SDK を装ったパッケージの数。npm 13 件・PyPI 4 件（Socket）"
    tone: "alert"
  - value: "約 6"
    unit: "分"
    label: "npm 側で、公開からマルウェアと判定されるまで（Socket）"
  - value: "非公表"
    label: "パッケージを取り込んだ環境の数（Socket の公表に無い）"
glossary:
  - term: "SDK"
    desc: "あるサービスを自分のプログラムから使うための部品。決済の SDK は、支払いの処理を呼び出すために、開発者が依存として取り込む。"
  - term: "タイポスクワット"
    desc: "本物に似せた名前で、偽のパッケージを公開する手口。開発者が名前を打ち間違えたり、本物と思い込んだりして取り込む。"
insight:
  slug: "name-is-not-origin"
  label: "名前は出どころではない"
  quote: "取り込む部品は、名前や動きが本物らしくても、発行元を取り込みの前に照合しなければ、開発環境の中まで通る。"
industries: ["finance", "developers"]
controls:
  - slug: "ownership-check"
    item: "決済 SDK のパッケージが、本当に Paysafe の公式版か確認してから入れる"
attack_method: "supply-chain"
impact: "決済 SDK を装う悪性パッケージ 17 件"
takeaway: "決済 SDK の名前と API を装うパッケージが、偽の成功の応答を返しながら、開発環境の鍵とトークンを探して送り出す作りだった。"
self_check: "決済などの SDK を依存に取り込む前に、そのパッケージの発行元が公式のものかを照合しているか。"
countries: ["global"]
---

## 1. 要点

Paysafe・Skrill・Neteller の公式の SDK ではなく、その名前に似せて npm と PyPI に公開された別のパッケージだった。正規の SDK が備えるはずの API をそのまま見せ、呼び出しには偽の成功の応答を返し、裏で開発環境の鍵やトークンを探して外へ送る作りだった（Socket の解析）。<strong>取り込む部品は、名前や動きが本物らしくても、発行元を取り込みの前に照合しなければ、開発環境の中まで通る。</strong>

## 2. 通った操作

- **通った操作**: 決済 SDK の名前を装うパッケージの公開と、それを依存として取り込む操作。パッケージは、`paysafe-checkout`・`paysafe-vault`・`paysafe-api`・`paysafe-node`・`paysafe-payments`・`paysafe-sdk`・`paysafe-kyc`・`skrill`・`skrill-sdk`・`skrill-payments`・`neteller` などの名前だった（Socket）。
- **止まった操作**: npm 側の各パッケージは、公開から約 6 分でマルウェアと判定された（Socket）。
- **受け付けた側に届くもの**: 一般に、パッケージを取り込む側に届くのは、名前と版と中身で、発行元が公式のものかは、名前からは分からない。今回のパッケージは、Paysafe のバックエンドと通信せず、偽の成功の応答を返したので、連携は動いているように見えた（Socket）。
- **送り出される対象**: Paysafe の API 鍵・AWS の鍵・GitHub のトークン・npm のトークン、ホスト名・ユーザー名、API の利用に関するデータ（Socket）。
- **公表されていないこと**: パッケージを取り込んだ環境の数と、鍵が実際に悪用されたか。

## 3. 何を照合するか

経路を問わず区別できる条件は、開発者や CI が依存を取り込む前に、そのパッケージが公式の発行元のものかを照合することである。

- **誰が承認を出すか**: パッケージの発行元（決済サービスの公式の発行者）と、どの発行元の部品を取り込んでよいかを決める組織。名前が似ていることは、承認にならない。
- **どこで照合するか**: 依存を取り込む前（インストールの前、CI でのビルドの前）。発行元を照合できないパッケージは、取り込まずに保留にする。
- **何が残るか**: どのパッケージを、どの発行元の確認で取り込んだかの記録。あとから、どの環境が何を取り込んだかを示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝依存を取り込む前に、パッケージの発行元が公式のものかを照合し、記録に残すこと。検知＝公開の後に、スキャナーや研究者が悪性と判定すること。日付は Socket が観測・公表した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>取り込む前に、パッケージの発行元が公式のものかを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>決済 SDK を装う 17 件が公開された<br>取り込んだ環境の数は非公表</span></div>
<div class="rx-zone det"><b>検知 · 公開の後に働いた</b>npm 側は公開から約 6 分で判定</div>
<div class="rx-g g1"><div class="t">公開</div><b>npm・PyPI にほぼ同時に公開</b></div>
<div class="rx-g g2"><div class="t">約 6 分後</div><b>npm 側でマルウェアと判定</b></div>
<div class="rx-g g3"><div class="t">2026-07-07</div><b>Socket が 17 件のまとまりを検出</b></div>
<div class="rx-g g4"><div class="t">2026-07</div><b>Socket が手口と点検の方法を公開</b></div>
</div>
</figure>

約 6 分で判定されたが、その間に取り込んだ環境では、鍵の送り出しが先に起きうる。同じように、取り込む部品の出どころが、インストールや実行の前に照合されなかった事案に、[npm の依存の取り違え](https://lemma.frame00.com/ja/critical/briefs/028-npm-dependency-confusion-recon/)（Brief 028）、[盗んだ認証情報で自分を公開し直す npm ワーム](https://lemma.frame00.com/ja/critical/briefs/038-ironworm-npm-self-propagation/)（Brief 038）、[スキャナーを通った偽のエージェントスキル](https://lemma.frame00.com/ja/critical/briefs/090-air-fake-agent-skill-toctou/)（Brief 090）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、依存を取り込む手順に組み込む。** パッケージを見張るのではなく、取り込む前に、その発行元が公式のものかを照合し、照合できないものを取り込まない。

### 注意したい業界・業務

- **業界 · 金融**: 決済や本人確認のサービスとの連携を実装する組織。取り込む SDK と同じ環境に、決済の API 鍵がある。
- **業界 · 開発者・ソフトウェア**: npm や PyPI から依存を取り込み、CI・本番に流す開発者と組織。

### いまの対策と Lemma の違い

今回の経路は、決済 SDK の名前を装うパッケージを、依存として取り込む操作である。

| 対策 | 依存としてのパッケージの取り込み |
| --- | --- |
| 名前と動きでの判断 | 効かない |
| 公開の後のスキャナーとレジストリの判定 | 一部 |
| レジストリのプロキシでのパッケージ名の遮断 | 一部 |
| **Lemma（実行の前の照合）** | 効く |

名前と動きでの判断は、パッケージが正規の SDK の API を見せ、偽の成功の応答を返したため、本物と見分けにくい。公開の後の判定は、npm 側で約 6 分で働いたが、その前に取り込んだ環境では、鍵の送り出しが先に起きうる。パッケージ名の遮断は、Socket が推奨したもので、悪性と分かった名前にしか効かない。Lemma は、名前や動きではなく、パッケージの発行元を、取り込みの前に照合する。取り込みの記録も残るので、どの環境が何を取り込んだかを、あとから確認できる。

注：Lemma の照合が働くのは、依存を取り込む手順（インストールや CI のビルド）に照合を組み込み、取り込んでよい発行元が組織で管理されている場合に限る。公式の発行元のアカウントそのものが乗っ取られて公開された場合は、この照合を通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

決済などの SDK を使う開発の組織で確認する 3 項目

- 決済などの SDK を依存に取り込む前に、そのパッケージが公式の発行元のものか確認しているか。
- 発行元を確認できないパッケージを、取り込まずに止める手順があるか。
- どの環境が、どのパッケージを、いつ取り込んだかを記録しているか。

## 5. 事実と時系列

- **対象**: Paysafe・Skrill・Neteller（いずれも決済・電子マネーのサービス）の公式の SDK を装うパッケージ。標的は、これらの決済の連携を実装する開発者。3 社は名前を使われた側で、公式の SDK が書き換えられたのではない。
- **規模**: 計 17 件（npm 13 件・PyPI 4 件）。npm 側は 1.0.0〜1.0.3 の版を出していた（Socket）。
- **手口**: 正規の SDK が備えるはずの API を見せ、Paysafe のバックエンドと通信せずに偽の成功の応答を返し、裏で環境の中の秘密（トークン・パスワード・API 鍵）を探して外へ送る（Socket）。
- **解析を避ける作り**: よく使われるサンドボックスの兆候を見つけた場合や、CPU のコア数が 2 未満の場合は、早めに処理を止める。送り先は、XOR・文字のずらし・反転を重ねて隠され、ngrok 系の基盤の下のドメインに解決された（Socket）。
- **検知**: Socket の AI スキャナーが、npm と PyPI にほぼ同時に公開されたまとまりを検出した。npm 側は、各パッケージの公開から約 6 分でマルウェアと判定された（Socket）。

### 時系列

- **2026-07-07**: Socket の AI スキャナーが、npm・PyPI に公開された 17 件のまとまりを検出する。npm 側は、各パッケージの公開から約 6 分でマルウェアと判定される。
- **2026-07-07 以降**: Socket が、手口・送り出される対象・解析を避ける作り・送り先の隠し方を公開し、依存の点検を推奨する。

> 本件の技術的な事実は、Socket の解析と BleepingComputer の報道に拠る。パッケージの数（17）・約 6 分での判定・送り出される対象・解析を避ける作り・送り先の隠し方は、Socket の観測による。取り込んだ環境の数は、本稿の時点で公表されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Socket**: 開発者に、依存の一覧の点検、CI/CD のログの監査、レジストリのプロキシでの当該パッケージ名の遮断、CI のログの `PAYSAFE_API_KEY` と当該パッケージ名の突き合わせによる侵害の有無の確認を推奨した。

## 6. Sources

- **Socket（研究・一次）**: “Coordinated npm and PyPI Campaign Typosquats Popular Secure Payment Apps”（2026-07）— <https://socket.dev/blog/npm-pypi-campaign-typosquats-popular-secure-payment-apps>
- **BleepingComputer**: “Fake Paysafe, Skrill SDKs on npm and PyPI steal credentials”（2026-07）— <https://www.bleepingcomputer.com/news/security/fake-paysafe-skrill-sdks-on-npm-and-pypi-steal-credentials/>
- **Developer Tech**: “Socket: PyPI and npm payment SDK malware compromises CI/CD”（2026-07）— <https://www.developer-tech.com/news/socket-pypi-and-npm-payment-sdk-malware-compromises-ci-cd/>
