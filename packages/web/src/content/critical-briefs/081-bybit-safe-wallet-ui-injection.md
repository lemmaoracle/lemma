---
brief_no: 81
title: "Bybit：Safe{Wallet} のフロントエンドに注入された JavaScript で、画面の表示と違う取引にマルチシグの承認が通った(Bybit の公表・Mandiant の調査)"
title_en: "Bybit: JavaScript injected into the Safe{Wallet} frontend got a multisig approval through for a transaction other than the one on screen (Bybit disclosure, Mandiant investigation)"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2025-02-21
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["087-polymarket-frontend-supply-chain", "045-humanity-protocol-multisig-key-custody", "016-verus-ethereum-bridge", "067-syscoin-bridge-spv-proof-parsing", "004-megalodon-github-supply-chain"]
status: published
gate: "signing"
version: "1.0"
og_lead_ja: "Bybit：Safe{Wallet} のフロントエンドへの JS 注入で、マルチシグの承認が通り、約 15 億ドル相当の ETH が流出"
og_lead_en: "Bybit: JS injected into the Safe{Wallet} frontend got a multisig approval through, and ~$1.5B in ETH was drained"
layout: "report"
sections: "proof"
og_kicker_ja: "サプライチェーン攻撃 · 署名画面の改ざん"
og_kicker_en: "SUPPLY CHAIN · SIGNING UI TAMPERING"
og_headline_ja: "画面は通常の送金、\n署名したのは別の取引。\n<accent>約 15 億ドルが流出</accent>"
og_headline_en: "The screen showed\na routine transfer.\nThe signed one differed.\n<accent>~$1.5B drained.</accent>"
key_figures:
  - value: "約 15 億"
    unit: "ドル"
    label: "流出した ETH の当時の価値（Bybit・FBI の公表と報道）"
    tone: "alert"
  - value: "約 401,347"
    unit: "ETH"
    label: "Bybit の ETH コールドウォレットから引き出された量"
  - value: "02-21 → 02-26"
    label: "流出から、Mandiant が Safe{Wallet} の開発者マシン経由の侵害を確認するまで"
glossary:
  - term: "マルチシグ"
    desc: "複数の鍵の持ち主のうち、決めた数（閾値）が署名したときに、取引を実行するウォレットの仕組み。Bybit は Safe{Wallet}（旧 Gnosis Safe）のマルチシグを使っていた。"
  - term: "実装コントラクト"
    desc: "Safe のウォレット（proxy）が処理を任せる先のコントラクト。これが差し替えられると、ウォレットの動き全体が差し替え先のロジックに置き換わる。"
  - term: "delegatecall"
    desc: "呼び出し元の権限と状態のまま、別のコントラクトのコードを動かす呼び出し。今回、署名させられた取引はこの形で、実装コントラクトを攻撃者が制御するアドレスに差し替えた。"
insight:
  slug: "screen-differs-from-signed"
  label: "画面の表示と違う中身への署名"
  quote: "署名する中身を画面とは別に照合しなければ、署名者の数がそろっても、画面に表示されたものとは違う取引が通る。"
industries: ["finance", "supply-chain"]
operations: ["approval"]
controls:
  - slug: "hold-unverified"
    item: "署名する中身が画面の表示と同じかを、UI とは別の方法で照合できるまで、署名しない"
attack_method: "supply-chain"
impact: "約 401,347 ETH（約 15 億ドル相当）が流出"
takeaway: "Safe{Wallet} のフロントエンドに注入された JavaScript で、署名者の画面には通常の送金が表示され、実際には実装を差し替える取引に署名させられた。署名の前に、署名する中身を画面とは別に照合する。"
self_check: "署名する取引の中身が画面の表示と同じかを、署名の前に、画面とは別の方法で照合しているか。"
search_title: "Bybit の約 15 億ドル流出：署名画面への注入と対策"
search_description: "2025 年 2 月、Safe{Wallet} のフロントエンドに JavaScript が注入され、Bybit の署名者は通常の送金に見える取引に署名し、約 401,347 ETH が流出した。何が起きたか、何を照合するかを整理。"
countries: ["global"]
---

## 1. 要点

暗号は破られていない。攻撃者は Safe{Wallet} の開発者のマシンを侵害して、フロントエンドに JavaScript を注入した。Bybit の署名者の画面には、ウォームウォレットへの通常の送金が表示された。実際に署名させられたのは、Safe の実装コントラクトを攻撃者が制御するアドレスに差し替える取引で、署名者はそれぞれ正規の手順で承認し、マルチシグの閾値は満たされた。<strong>署名する中身を画面とは別に照合しなければ、署名者の数がそろっても、画面に表示されたものとは違う取引が通る。</strong>

## 2. 通った操作

- **通った操作**: Bybit の ETH コールドウォレットでの、マルチシグの承認（取引への署名）。署名者は通常の送金と信じて承認し、閾値を満たした署名で、Safe の proxy が指す実装コントラクトが差し替えられた。その後、ウォレット内の ETH が引き出された。
- **受け付けた側に届くもの**: 一般に、マルチシグのコントラクトが確認するのは、決めた数の正規の鍵が、その取引に署名したことである。署名者が画面で何を見て承認したかは、コントラクトには届かない。署名者の側では、画面の表示が、実際に署名するバイト列と同じかを、画面からは見分けられない。
- **公表されていないこと**: 開発者のマシンが侵害された具体的な経路。注入されたコードが、Bybit の画面にだけ動くよう作られていた（とされる）ことの詳細。流出した資金のうち、凍結できた額。

## 3. 実行前の照合

経路を問わず区別できる条件は、署名の前に、署名する取引の中身が、意図した承認の流れで作られたものかを、署名を求める画面とは別に照合することである。

- **誰が承認を出すか**: 取引を起こす側の業務（今回はウォームウォレットへの送金を決めた側）。どの宛先に、どの操作をするかを、署名を求める画面の外で登録する。
- **どこで照合するか**: 署名者が署名する前。署名するバイト列を、登録した中身と照合し、合わないとき（宛先が違う、実装の差し替えのような予定に無い操作が入る）は、署名を始めない。画面の表示を照合の根拠にしない。
- **何が残るか**: どの取引を、どの登録と照合して、誰が署名した（または止めた）かの記録。内部の業務の流れの全体を開示せずに、「この取引は正規の承認の流れで作られた」ことだけを示す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝署名者が署名する前に、署名する取引の中身を、画面とは別に意図した承認の流れと照合し、記録に残すこと。検知＝署名が通り、資金が引き出された後に気づくこと。日付は、各社が公表した日。開発者のマシンが侵害された日は推定。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>署名の前に、署名する中身を、画面とは別に照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>閾値を満たした署名で実装が差し替えられ<br>約 401,347 ETH が流出</span></div>
<div class="rx-zone det"><b>検知 · 流出の後に働いた</b>公表、フォレンジクス、資金の追跡、ブラックリスト化</div>
<div class="rx-g g1"><div class="t">02-21（推定）</div><b>開発者のマシンが侵害され、JavaScript が注入される</b></div>
<div class="rx-g g2"><div class="t">02-21</div><b>通常の送金に見える取引に、署名者が承認する</b></div>
<div class="rx-g g3"><div class="t">02-21</div><b>Bybit の CEO が侵害を公表する</b></div>
<div class="rx-g g4"><div class="t">02-26</div><b>Mandiant が、開発者のマシン経由の侵害を確認する</b></div>
</div>
</figure>

検知は流出の後に働き、資金の追跡と、取引所をまたぐブラックリスト化、一部の凍結を進めたが、署名が通った時点の引き出しは止めない。同じように、承認の画面の表示と実際に承認する対象が食い違った事案に、[Polymarket](https://lemma.frame00.com/ja/critical/briefs/087-polymarket-frontend-supply-chain/)（第三者ベンダーの依存から JavaScript が注入された）がある。マルチシグの鍵の持ち方が論点になった事案に、[Humanity Protocol](https://lemma.frame00.com/ja/critical/briefs/045-humanity-protocol-multisig-key-custody/)がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、署名者が署名する段に組み込む。** マルチシグの閾値や署名者による画面の確認の代わりではなく、その上で、署名するバイト列が意図した承認の流れで作られたものかを、署名を求める画面とは別に照合する。

### 注意したい業界・業務

- **業界 · 金融**: 暗号資産の取引所や資産の管理者など、マルチシグのウォレットで、大きな額の移動を承認するサービス。
- **業界 · サプライチェーン**: 署名や承認の画面を、第三者のサービスのフロントエンドに頼っている組織。
- **業務 · 承認・決裁**: 複数の担当者が、画面に表示された取引を見て、署名や承認をする操作。

### いまの対策と Lemma の違い

今回の経路は、1 列目（画面の表示と違う中身への、マルチシグの署名）である。2 列目は、流出の後の被害の把握で、今回は資金の追跡とブラックリスト化が働いた。

| 対策 | 画面の表示と違う中身への署名 | 流出の後の被害の把握 |
| --- | --- | --- |
| マルチシグの閾値（複数の署名者） | 効かない | 関係しない |
| 署名者による画面の確認 | 効かない | 関係しない |
| 資金の追跡・ブラックリスト化 | 効かない | 効く |
| **Lemma（実行の前の照合）** | 効く | 一部 |

マルチシグの閾値は、正規の鍵の持ち主が決めた数だけ署名したことを示すが、署名した中身が、署名者の意図したものかは示さない。署名者は画面を確認したが、表示と署名するバイト列は、確認の外側で差し替えられた。資金の追跡とブラックリスト化は、被害の把握と封じ込めを進めたが、署名が通った時点の引き出しは止めない。Lemma は、署名の前に、署名するバイト列が意図した承認の流れで作られたものかを照合する。どの取引を、どの登録と照合したかの記録が残るので、流出の後の把握にも使える。

注：Lemma の照合が働くのは、署名の手順に照合を組み込み、取引の登録と照合を、署名を求める画面とは別の経路で行う場合に限る。登録そのものが侵害されている場合や、照合の結果を表示する経路も同じ攻撃者に差し替えられている場合は、この照合を通りうる。開発者のマシンがどう侵害されたかは公表されていない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

マルチシグのウォレットで、大きな額の移動を承認する組織で確認する 3 項目

- 署名させる取引が、正規の承認の流れで登録された宛先と操作だけかを、署名の前に照合しているか。
- 署名の画面を配信するコード（第三者のサービスを含む）が認めた版のままかを、変わったときに分かるようにしているか。
- どの取引に、誰が、どの登録と照合して署名したかを、後から辿れる記録に残しているか。

## 5. 事実と時系列

- **サービス**: Bybit（暗号資産の取引所）の ETH コールドウォレット。Safe{Wallet}（旧 Gnosis Safe）のマルチシグを使っていた。
- **被害の規模**: 約 401,347 ETH（当時のレートで約 14〜15 億ドル）。単一の事案の暗号資産の流出として、過去最大とされる。
- **侵害の起点**: Safe{Wallet} の開発者のマシンが侵害され、フロントエンドのコードに JavaScript が注入された（Safe{Wallet} と Mandiant の調査、報道）。
- **手口**: 署名者が Safe の画面で承認するとき、画面には通常の ETH の送金（ウォームウォレットへの定例の移動）が表示された。注入されたコードは、実際に署名させる中身を、Safe の実装コントラクトを攻撃者が制御するアドレスに差し替える `delegatecall` に変えていた。注入されたコードは、Bybit のウォレットの画面でだけ動くよう作られていたとされる。
- **確認されたこと**: 複数の署名者が、それぞれ正規の手順で承認し、閾値を満たした。暗号の署名の強さは、問題ではなかった。閾値を満たした署名で実装が差し替えられ、ウォレット内の ETH が引き出され、送金先は多段に分散された。
- **帰属**: FBI は、北朝鮮の Lazarus グループ（別称 TraderTraitor）によるものと発表した。

### 時系列

- **2025-02-21（推定、攻撃の直前）**: Safe{Wallet} の開発者のマシンが侵害され、フロントエンドに JavaScript が注入される。
- **2025-02-21**: Bybit の署名者が、ウォームウォレットへの通常の移動に見えた取引を承認する。攻撃者が ETH を引き出す。
- **2025-02-21（当日）**: Bybit の CEO Ben Zhou が X（旧 Twitter）で侵害を公表する。Bybit は、自社の資産で顧客を補償すると表明する。
- **2025-02-21〜22**: Elliptic・Chainalysis が資金の追跡を始める。取引所とブロックチェーンの関係者が、アドレスのブラックリスト化を進める。
- **2025-02-26**: Mandiant が、開発者のマシンを経由した Safe{Wallet} のサプライチェーンの侵害を確認する。
- **2025-03 初旬**: FBI が、北朝鮮の Lazarus グループ（TraderTraitor）によるものと発表する。関連するアドレスへの制裁が進む。

> 固有名と帰属は、Mandiant・FBI・取引所の公表を一次として記す。本 Brief は、調査の時点で確認できた値に基づき、規模と手口は出所を明示する。最新の一次情報も参照されたい。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Bybit**: CEO の Ben Zhou が即日に声明を出し、自社の資産で全顧客を補償すると表明して、補填を実行した。
- **Safe{Wallet}（Gnosis Safe）**: サービスを一時停止し、フロントエンドの侵害された箇所を特定して除いた。関連するインフラの監査を行った。
- **Mandiant（Google Cloud）**: フォレンジクスを担い、開発者のマシンからフロントエンドへの JavaScript の注入という侵害の経路を確認した。
- **FBI**: 北朝鮮の Lazarus グループ（TraderTraitor）によるものと発表した。
- **業界の横断**: Elliptic・Chainalysis による資金の追跡、主要な取引所でのアドレスのブラックリスト化、米財務省 OFAC による関連アドレスの制裁が進み、流出した資金の一部の凍結が図られた。
- **業界の論点**: マルチシグのウォレットの画面を、サプライチェーンの攻撃の対象にした大きな事案として、ハードウェアウォレットでの取引の直接の表示や、署名する中身を画面とは別に照合することが、論点として挙がった。

## 6. Sources

- **Bybit 公式声明**: CEO Ben Zhou による X（旧 Twitter）投稿（2025-02-21）および Bybit 公式ブログ
- **Mandiant（Google Cloud）**: Safe{Wallet} サプライチェーン侵害の技術解析レポート（2025-02-26 前後公表）。Mandiant のフォレンジクス結果を報じた報道 — https://thehackernews.com/2025/03/safewallet-confirms-north-korean.html
- **FBI 公式声明**: "North Korea Responsible for $1.5 Billion Bybit Hack"（2025-03）— https://www.fbi.gov/investigate/cyber/alerts/2025/north-korea-responsible-for-1-5-billion-bybit-hack
- **Elliptic**: 資金追跡レポート（2025-02〜03）
- **Chainalysis**: ブロックチェーン分析レポート（2025-02〜03）
- **Unchained / The Block / CoinDesk 等**: 事案経緯の報道（2025-02-21〜）

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
