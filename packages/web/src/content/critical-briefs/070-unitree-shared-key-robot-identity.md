---
brief_no: 70
title: "Unitree：人型・四足ロボットを、Bluetooth の初期設定から最上位の権限で乗っ取れると示された(研究者の公表・NVD)"
title_en: "Unitree: Researchers showed its humanoid and quadruped robots could be taken over with root access via Bluetooth setup (researchers, NVD)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2025-09-20
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["068-universal-robots-polyscope-command-injection", "033-f5-bigip-edge-pivot", "003-starlette-badhost", "006-google-api-key-revocation-lag", "025-mcp-stdio-config-to-command-rce"]
status: published
version: "2.1"
og_lead_ja: "Unitree のロボット、全機共通の鍵で Bluetooth から乗っ取れた"
og_lead_en: "Every Unitree robot shared one encryption key, letting attackers take them over via Bluetooth — crack one, and the rest fall too"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "脆弱性の公表 · ロボット"
og_kicker_en: "VULNERABILITY · ROBOTS"
og_headline_ja: "全機が同じ鍵を使っていた。\n1 台の手口が全機に通じる\n<accent>人型と四足の 4 機種</accent>"
og_headline_en: "Every robot used the same key.\nCrack one, crack them all.\n<accent>Across four robot models.</accent>"
key_figures:
  - value: "1"
    unit: "本"
    label: "全機で共通の暗号の鍵。1 台から取り出せば、ほかの機体にも通じた（NVD・研究者）"
    tone: "alert"
  - value: "4"
    unit: "機種"
    label: "影響を受けた機種。人型の G1・H1、四足の Go2・B2（NVD）"
  - value: "2025-05 → 09-20"
    label: "研究者が Unitree に連絡してから公開まで。研究者によると、7 月以降は返信が無かった（IEEE Spectrum）"
glossary:
  - term: "Bluetooth の初期設定"
    desc: "ロボットを Wi-Fi につなぐために、近くのスマートフォンなどから Bluetooth で設定を送る入口。"
  - term: "root（最上位の権限）"
    desc: "機器の中で何でもできる管理者の権限。ここを取られると、機器を思いどおりに操作される。"
  - term: "ファームウェア"
    desc: "機器の中で動くソフト。更新は提供元から配られる。"
insight:
  slug: "one-key-for-all"
  label: "全機共通の 1 本の鍵"
  quote: "全機に同じ鍵を書き込むと、1 台から取り出した鍵が、ほかのすべての機体の入口を開ける。"
industries: ["manufacturing", "public-sector"]
controls:
  - slug: "ownership-check"
    item: "機体ごとに固有の鍵で、接続してきた相手を照合する"
  - slug: "hold-unverified"
    item: "初期設定などの入口から届く入力は、検証してから使う"
search_title: "Unitree のロボットの脆弱性 UniPwn：手口と対策"
search_description: "Unitree の人型・四足ロボット（G1・H1・Go2・B2）が、全機共通の暗号の鍵のために、Bluetooth の初期設定から最上位の権限で乗っ取れることが示された（UniPwn）。手口、なぜ止まらないか、対策を整理。"
self_check: "導入するロボットやネットにつながる機器が、機体ごとに別の鍵で、つないでくる相手を照合しているか。"
countries: ["global"]
---

> **改訂（v2.1 / 2026-11-02）**: 章立てを「通った操作」から始まる並びに組み直し、題から「欠けている層」の後半を外した。事実と出典は変えていない。

## 1. 要点

研究者は、全機が同じ暗号の鍵を使っており、「unitree」という文字列を含む合言葉を送れば、認証を通ると示した。参照した報道では、実際の悪用は報じられていない。Unitree は修正の大半を終えたとしたが、更新が届くまでは、同じ鍵で入口が開く。<strong>全機に同じ鍵を書き込むと、1 台から取り出した鍵が、ほかのすべての機体の入口を開ける。</strong>

## 2. 通った操作

- **通った操作**: Bluetooth の初期設定の入口への接続と、そこで送った Wi-Fi の名前・パスワードとしての文字列。全機共通の鍵で作った合言葉で認証を通り、文字列に紛れたコマンドが、Wi-Fi の設定のやり直しのときに root（最上位の権限）で実行された（CVE-2025-60250・60251・35027・60017）。
- **受け付けた側に届くもの**: 一般に、機体ごとの鍵が無い入口では、合言葉が合えば、どの相手からの接続も、同じ「正しい接続」として届く。取り出した鍵を使う攻撃者と、正規の設定アプリは、入口からは区別がつかない。
- **ほかの機体への広がり**: 研究者は、乗っ取ったロボットが、Bluetooth の届く範囲のほかの Unitree のロボットを探し、自動で乗っ取りうると指摘している。
- **公表されていないこと**: 実際の悪用（参照した報道では報じられていない）と、修正の更新が配られたか（IEEE Spectrum の記事の 2025-11 の更新の時点では、確認されていない）。

## 3. 実行前の照合

経路を問わず区別できる条件は、初期設定などの入口で接続を受け付ける側が、接続してきた相手を、その機体に固有の鍵や証明書で、受け付ける前に照合することである。

- **誰が承認を出すか**: 機器の提供元。機体ごとに固有の鍵や証明書を発行し、全機に同じ秘密を書き込まない。接続してきた相手は、その機体に対応する鍵で応じる。
- **どこで照合するか**: 機体の、初期設定などの入口で接続を受け付ける処理。鍵が合わない接続は受け付けない。受け付けた入力も、使う前に検証し、Wi-Fi の名前やパスワードとして届いた文字列を、そのまま実行に回さない。
- **何が残るか**: どの機体に、どの相手が、どの鍵で接続したかの記録。機器が外へ何を送るかも、導入する側が確認できる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝接続を受け付ける前に、機体ごとの鍵で相手を照合すること。検知＝乗っ取りや外への送信に、後から気づくこと。下の日付は、研究者・NVD・Unitree が公表した日で、乗っ取りが可能になった日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>接続を受け付ける前に、機体ごとの鍵で相手を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>全機共通の鍵で<br>初期設定から root で乗っ取れた（研究者の実証）</span></div>
<div class="rx-zone det"><b>検知 · 一部</b>研究者が見つけ、修正が進む</div>
<div class="rx-g g1"><div class="t">2025-05</div><b>研究者が Unitree に連絡</b></div>
<div class="rx-g g2"><div class="t">09-17</div><b>論文を arXiv に出す</b></div>
<div class="rx-g g3"><div class="t">09-20</div><b>UniPwn を公開</b></div>
<div class="rx-g g4"><div class="t">09-29</div><b>Unitree が修正の大半を終えたとする</b></div>
</div>
</figure>

研究者が見つけて知らせ、Unitree は修正を進めた。ただ、修正は見つかった後の対応である。同じように、入口から届いた外のコマンドが実行された事案に、[Universal Robots の PolyScope](https://lemma.frame00.com/ja/critical/briefs/068-universal-robots-polyscope-command-injection/)（産業用ロボットの操作画面から、外のコマンドを実行できた）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、初期設定などの入口で接続を受け付ける側に組み込む。** 侵入を見つけるのではなく、接続してきた相手が、その機体に固有の鍵を持つかを、受け付ける前に照合する。

### 注意したい業界・業務

- **業界 · 製造・基幹インフラ**: ロボットやネットにつながる機器を作る組織と、工場や施設に導入する組織。
- **業界 · 自治体・公共**: 警備や点検にロボットを試している組織（IEEE Spectrum は、英国の警察が Go2 を試していると伝えた）。

### いまの対策と Lemma の違い

今回の経路は、1 列目（初期設定の入口への接続）と 2 列目（入口から届く文字列の実行）である。3 列目は、修正の更新がまだ届いていない機体で、2025-11 の報道の時点では、配布が確認されていない。

| 対策 | 初期設定の入口への接続 | 入口から届く文字列の実行 | 更新の届いていない機体 |
| --- | --- | --- | --- |
| 通信の暗号化 | 効かない | 関係しない | 関係しない |
| 合言葉による認証 | 効かない | 関係しない | 関係しない |
| ネットワークの分離 | 一部 | 関係しない | 関係しない |
| ファームウェアの更新 | 関係しない | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 | 効かない |

通信の暗号化は、鍵が全機で同じだったので、効かなかった。合言葉による認証は、「unitree」という文字列を含めば通った。ネットワークの分離は、Wi-Fi 側の通信は絞れるが、Bluetooth の入口は、近くにいれば届く。ファームウェアの更新は、修正の大半を終えたとされたが、配布は確認されていない。Lemma は、接続を受け付ける前に、機体ごとの鍵で相手を照合する。

注：Lemma の照合が働くのは、機体ごとに固有の鍵や証明書を発行し、接続を受け付ける処理に照合を組み込んだ機体に限る。更新が届かない機体は、鍵の仕組みが変わらないので、この照合は働かない。機体の固有の鍵そのものを取り出された場合や、正規の設定アプリが乗っ取られた場合は、通ってしまう。入口から届く文字列を実行に回さない検証は、機器の作り手が別に入れる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

ロボットやネットにつながる機器を作る・導入する組織で確認する 3 項目

- 機器の初期設定の入口から届く文字列を、そのまま実行しない作りかを、提供元に確認しているか。
- 導入した機器が外部のサーバーへ何を送っているかを、把握しているか。
- 機器のソフトの更新を、提供元から受け取って入れる手順があるか。

## 5. 事実と時系列

- **研究者**: Andreas Makris 氏と Kevin Finisterre 氏が欠陥を見つけて公開した。Alias Robotics の Víctor Mayoral-Vilches 氏を含む 3 名が、G1 の安全性を調べた論文を arXiv に出した（2025-09）。
- **影響を受けた機種**: 共通のファームウェアを使う G1・H1・Go2・B2（NVD）。
- **入口**: ロボットを Wi-Fi につなぐための、Bluetooth の初期設定の入口。
- **認証を通った理由**: 全機で同じ暗号の鍵と初期値が、機体の中に書き込まれていた（CVE-2025-60250）。合言葉に「unitree」という文字列が含まれていれば受け付けた（CVE-2025-60251）。
- **最上位の権限での実行**: Wi-Fi の名前やパスワードとして送った文字列に紛れ込ませたコマンドを、Wi-Fi の設定のやり直しのときに root で実行した（CVE-2025-35027・CVE-2025-60017）。
- **ほかの機体への広がり**: 研究者は、乗っ取ったロボットが Bluetooth の届く範囲のほかの Unitree のロボットを探し、自動で乗っ取りうると指摘している。
- **設定の暗号の弱さ**: 論文は、設定を守る暗号も、固定の方式と予測できる値に頼っていたとしている。
- **外部への送信**: 論文は、ロボットが利用者に知らせないまま、センサーや状態のデータを 300 秒ごとに 2 つの外部のサーバーへ送っていたとしている。

### 時系列

- **2025-05**: 研究者が Unitree に連絡する。
- **2025-07**: Makris 氏が X で鍵を公開する。研究者によると、この月以降、Unitree から返信が無かった（IEEE Spectrum）。
- **2025-09-17**: 論文を arXiv に出す。
- **2025-09-20**: 研究者が UniPwn を公開する。
- **2025-09-26**: NVD に CVE が公開される。
- **2025-09-29**: Unitree が LinkedIn で、修正の大半を終えたとする。

> 本件の事実は、研究者の論文（一次）、NVD の CVE の記載、IEEE Spectrum の報道に拠る。本件は研究者による実証で、参照した報道では実際の悪用は報じられていない。本 Brief は製造者を責めるものではなく、全機共通の鍵と入力の検証の欠けを論点とする。公表されていないことは、対策が無かったことを意味しない。この手口は Bluetooth の届く近さが要る。Unitree が更新の配布を発表すれば、この Brief を改訂する。

### 公表後の対応

- **Unitree**: 9 月 29 日に LinkedIn で、すぐに対応を始め、修正の大半を終えた、更新は近く届けるとした（IEEE Spectrum）。IEEE Spectrum の記事（2025-11 更新）の時点では、更新が配られたかは確認されていない。
- **研究者**: 論文で、人型ロボットが重要なインフラに入っていくなかで、守りの仕組みが要ると論じた。

## 6. Sources

- **arXiv（研究・一次）**: Mayoral-Vilches, Makris, Finisterre, "Cybersecurity AI: Humanoid Robots as Attack Vectors"（2025-09-17） — <https://arxiv.org/abs/2509.14139>
- **NVD（一次・CVE）**: "CVE-2025-35027"（2025-09-26） — 関連：CVE-2025-60250・CVE-2025-60251・CVE-2025-60017 — <https://nvd.nist.gov/vuln/detail/CVE-2025-35027>
- **IEEE Spectrum（報道）**: "Exploit Allows for Takeover of Fleets of Unitree Robots"（2025-09-25） — <https://spectrum.ieee.org/unitree-robot-exploit>
- **Help Net Security（報道）**: "Humanoid robot found vulnerable to Bluetooth hack, data leaks to China"（2025-10-16） — <https://www.helpnetsecurity.com/2025/10/16/unitree-g1-humanoid-robot-vulnerability/>
- **Hackaday（報道）**: "Unitree Humanoid Robot Exploit Looks Like A Bad One"（2025-09-30） — <https://hackaday.com/2025/09/30/unitree-humanoid-robot-exploit-looks-like-a-bad-one/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
