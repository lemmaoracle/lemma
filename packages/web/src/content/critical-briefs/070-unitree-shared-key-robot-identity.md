---
brief_no: 70
title: "Unitree：全機で同じ暗号の鍵を使っていたため、Bluetooth の初期設定から最上位の権限で乗っ取れることが示された(研究者の公表・NVD) — 接続してきた相手を、機体ごとの鍵で照合する層が無い"
title_en: "Unitree: Robots shared one encryption key across every unit, so they could be taken over with root access through Bluetooth setup (researchers, NVD) — No layer checks a connecting party against a per-unit key"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2025-09-20
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["068-universal-robots-polyscope-command-injection", "033-f5-bigip-edge-pivot", "003-starlette-badhost", "006-google-api-key-revocation-lag", "025-mcp-stdio-config-to-command-rce"]
status: published
version: "2.0"
og_lead_ja: "Unitree のロボット、全機共通の鍵で Bluetooth から乗っ取れた — 1 台の手口がほかの機体にも通じる"
og_lead_en: "Unitree robots could be taken over via Bluetooth with one key shared by every unit — one method works on all"
layout: "report"
og_kicker_ja: "脆弱性の公表 · ロボット"
og_kicker_en: "VULNERABILITY · ROBOTS"
og_headline_ja: "全機が同じ鍵を使っていた。\n1 台の手口が全機に通じる。\n<accent>人型と四足の 4 機種</accent>"
og_headline_en: "Every robot used the same key.\nOne method works on all.\n<accent>Four humanoid and quadruped models.</accent>"
summary_labels: ["何が起きたか", "なぜ止まらなかったか", "欠けていた層"]
key_figures:
  - value: "1"
    unit: "本"
    label: "全機で共通の暗号の鍵。1 台から取り出せば、ほかの機体にも通じた（NVD・研究者）"
    tone: "alert"
  - value: "4"
    unit: "機種"
    label: "影響を受けた機種。人型の G1・H1、四足の Go2・B2（NVD）"
  - value: "2025-05 → 09-20"
    label: "研究者が Unitree に連絡してから公開まで。7 月に Unitree の返信が途絶えた（IEEE Spectrum）"
glossary:
  - term: "Bluetooth の初期設定（BLE プロビジョニング）"
    desc: "ロボットを Wi-Fi につなぐために、近くのスマートフォンなどから Bluetooth で設定を送る入口。"
  - term: "root（最上位の権限）"
    desc: "機器の中で何でもできる管理者の権限。ここを取られると、機器を思いどおりに操作される。"
insight:
  slug: "one-key-for-all"
  label: "全機共通の 1 本の鍵"
  quote: "鍵は全機で同じだった。1 台から鍵を取り出せば、その鍵はほかのすべての機体の入口も開けた。"
industries: ["manufacturing", "public-sector"]
controls:
  - slug: "ownership-check"
    item: "機体ごとに固有の鍵で、接続してきた相手を照合する"
  - slug: "hold-unverified"
    item: "初期設定などの入口から届く入力は、検証してから使う"
search_title: "Unitree のロボットの脆弱性 UniPwn：手口と対策"
search_description: "Unitree の人型・四足ロボット（G1・H1・Go2・B2）が、全機共通の暗号の鍵のために、Bluetooth の初期設定から最上位の権限で乗っ取れることが示された（UniPwn）。手口、なぜ止まらないか、対策を整理。"
self_check: "導入するロボットや IoT 機器が、機体ごとに別の鍵で接続相手を照合しているかを、導入の前に確認しているか。"
countries: ["global"]
---

> **改訂（v2.0 / 2026-10-25）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。arXiv の論文、IEEE Spectrum、NVD の CVE の記載で事実を取り直した。論文の著者を Mayoral-Vilches・Makris・Finisterre の 3 名に直した。論文の要旨は外部の送信先の所在を書いていないため、所在の記述を外した。Unitree が 7 月に返信を止めたことと、9 月 29 日に修正の大半を終えたとしたことを足した。Lemma の設計の説明は外し、状態を published にした。

## 1. TL;DR

研究者の Andreas Makris 氏と Kevin Finisterre 氏は 2025 年 9 月 20 日、Unitree の人型ロボット（G1・H1）と四足ロボット（Go2・B2）を、Bluetooth の初期設定の入口から乗っ取る手法（UniPwn）を公開した。全機が同じ暗号の鍵を使っており、「unitree」という文字列を含む合言葉を送れば、認証を通った。

続けて Wi-Fi の名前やパスワードのふりをしてコマンドを送ると、ロボットはそれを最上位の権限（root）で実行した。鍵が全機で同じなので、1 台の手口がそのままほかの機体にも通じ、近くの機体へ自動で広がりうると研究者は指摘している。

Unitree は 9 月 29 日に修正の大半を終えたとしたが、それは公開の後だった。効かなかったのは、接続してきた相手を、機体ごとの鍵で照合する層である。

## 2. 何が起きたか

- **研究者**: Andreas Makris 氏と Kevin Finisterre 氏が見つけて公開した。Alias Robotics の Víctor Mayoral-Vilches 氏を含む 3 名が、G1 の安全性を調べた論文を arXiv に出した（2025-09）。
- **影響を受けた機種**: 共通のファームウェアを使う G1・H1・Go2・B2（NVD）。
- **入口**: ロボットを Wi-Fi につなぐための、Bluetooth の初期設定の入口。
- **認証を通った理由**: 全機で同じ暗号の鍵と初期値が、機体の中に書き込まれていた（CVE-2025-60250）。合言葉に「unitree」という文字列が含まれていれば受け付けた（CVE-2025-60251）。
- **最上位の権限での実行**: Wi-Fi の名前やパスワードとして送った文字列に紛れ込ませたコマンドを、Wi-Fi の設定のやり直しのときに root で実行した（CVE-2025-35027・CVE-2025-60017）。
- **ほかの機体への広がり**: 研究者は、乗っ取ったロボットが Bluetooth の届く範囲のほかの Unitree のロボットを探し、自動で乗っ取りうると指摘している。
- **設定の暗号の弱さ**: 論文は、設定を守る暗号も、固定の方式と予測できる値に頼っていたとしている。
- **外部への送信**: 論文は、ロボットが利用者に知らせないまま、センサーや状態のデータを 300 秒ごとに 2 つの外部のサーバーへ送っていたとしている。

研究者の公表で見ると、乗っ取りは次の連鎖で起きる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">研究者の公表で見た、乗っ取りの連鎖</span></div>
<p class="rx-ex-cap">止めどころは ②。接続してきた相手を、機体ごとの鍵で照合していれば、ほかの機体から取り出した鍵では通らない。</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">攻撃者</div><div class="no">1</div><b>Bluetooth の届く所から、初期設定の入口につなぐ</b><p>近くにいれば足りる。</p></div>
<div class="rx-step crit"><div class="who">ロボット</div><div class="no">2</div><b>全機共通の鍵で作った合言葉を受け付ける</b><p>機体ごとの照合が無い。</p></div>
<div class="rx-step crit"><div class="who">ロボット</div><div class="no">3</div><b>Wi-Fi の設定に紛れたコマンドを root で実行する</b><p>入力を検証しない。</p></div>
<div class="rx-step crit"><div class="who">ロボット</div><div class="no">4</div><b>近くのほかの機体へ広がりうる</b><p>鍵が全機で同じ。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2025-05**: 研究者が Unitree に連絡する。
- **2025-07**: Makris 氏が X で鍵を公開する。Unitree からの返信が途絶える。
- **2025-09-17**: 論文を arXiv に出す。
- **2025-09-20**: 研究者が UniPwn を公開する。
- **2025-09-26**: NVD に CVE が公開される。
- **2025-09-29**: Unitree が LinkedIn で、修正の大半を終えたとする。

> 本件の事実は、研究者の論文（一次）、NVD の CVE の記載、IEEE Spectrum の報道に拠る。本 Brief は、製造者や国を責めるものではなく、全機共通の鍵と入力の検証の欠けを論点とする。実際の悪用は報じられていない。

### 公表後の対応

- **Unitree**: 9 月 29 日に LinkedIn で、すぐに対応を始め、修正の大半を終えた、更新は近く届けるとした（IEEE Spectrum）。報道の時点で、更新が配られたかは確認されていない。
- **研究者**: 論文で、人型ロボットが重要なインフラに入っていくなかで、守りの仕組みが要ると論じた。

## 4. なぜ止まらなかったか

この事案の失敗は、暗号を使っていなかったことではない。**鍵が全機で同じで、接続してきた相手を機体ごとに照合する層が無かった**ことにある。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">ここでいう証明は、接続してきた相手を、その機体に固有の鍵で照合してから受け付けること。検出は、乗っ取りや外への送信に後から気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 無い</b>接続相手を、機体ごとの鍵で照合する</div>
<div class="rx-zone gapz"><b>落差</b><span>1 台の手口が<br>全機に通じる</span></div>
<div class="rx-zone det"><b>検出の層 · 一部</b>研究者が見つけ、修正が進む</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Bluetooth で接続</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>共通の鍵で通る</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>root で実行</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>ほかの機体へ</b></div>
</div>
</figure>

研究者が見つけて公開し、Unitree は修正を進めた。だが鍵が全機で同じであるかぎり、1 台から取り出した鍵が、修正の届いていないすべての機体の入口を開ける。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[Universal Robots の PolyScope](https://lemma.frame00.com/ja/critical/briefs/068-universal-robots-polyscope-command-injection/)（産業用ロボットの操作画面から、外のコマンドを実行できた）にも現れている。

## 5. 対策するには

**接続してきた相手は、その機体に固有の鍵や証明書で照合してから受け付ける。** 鍵が機体ごとに違えば、1 台から取り出した鍵ではほかの機体の入口は開かない。初期設定のような入口から届く入力も、使う前に検証する。検出の代わりではなく、検出の手前に置く層である。

### 注意したい業界・業務

- **業界 · 製造・基幹インフラ**: ロボットや IoT 機器を作る組織と、工場や施設に導入する組織。
- **業界 · 行政・公共**: 警備や点検にロボットを試している組織（IEEE Spectrum は、英国の警察が Go2 を試していると伝えた）。

### いまの対策で防げるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 通信の暗号化 | 効かない | 鍵が全機で同じで、1 台から取り出せた。 |
| 合言葉による認証 | 効かない | 「unitree」という文字列を含めば通った。 |
| ネットワークの分離 | 一部 | Wi-Fi の外の Bluetooth の入口は、近くにいれば届く。 |
| ファームウェアの更新 | 一部 | 修正の大半を終えたとしたが、報道の時点で配布は確認されていない。 |

### 必要になるもの

1. **機体ごとに固有の鍵や証明書を持たせ、接続してきた相手をそれで照合する。** 全機に同じ秘密を書き込まない。
2. **初期設定などの入口から届く入力は、使う前に検証する。** Wi-Fi の名前やパスワードとして届いた文字列を、そのまま実行に回さない。
3. **機器が外へ何を送るかを、利用者に知らせ、止められるようにする。** 送り先と中身を、導入する側が確認できるようにする。

### 点検チェックリスト

ロボットや IoT 機器を作る・導入する組織で確認する 3 項目

- 自社の機器は、機体ごとに別の鍵やパスワードを使っているか。
- 導入した機器が外部のサーバーへ何を送っているかを、把握しているか。
- 機器のファームウェアの更新を、提供元から受け取って当てる手順があるか。

注：この手口は Bluetooth の届く近さが要る。Unitree が更新の配布を発表すれば、この Brief を改訂する。

## 6. Sources

- **arXiv（研究・一次）**: Mayoral-Vilches, Makris, Finisterre, "Cybersecurity AI: Humanoid Robots as Attack Vectors"（2025-09-17） — <https://arxiv.org/abs/2509.14139>
- **NVD（一次・CVE）**: "CVE-2025-35027"（2025-09-26） — 関連：CVE-2025-60250・CVE-2025-60251・CVE-2025-60017 — <https://nvd.nist.gov/vuln/detail/CVE-2025-35027>
- **IEEE Spectrum（報道）**: "Unitree Robot Hack: What You Need to Know" — <https://spectrum.ieee.org/unitree-robot-exploit>
- **Help Net Security（報道）**: "Humanoid robot found vulnerable to Bluetooth hack"（2025-10-16） — <https://www.helpnetsecurity.com/2025/10/16/unitree-g1-humanoid-robot-vulnerability/>
- **Hackaday（報道）**: "Unitree Humanoid Robot Exploit Looks Like A Bad One"（2025-09-30） — <https://hackaday.com/2025/09/30/unitree-humanoid-robot-exploit-looks-like-a-bad-one/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
