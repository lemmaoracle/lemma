---
brief_no: 63
title: "Bright Data SDK：家庭のスマートテレビなどが、AI 学習向けスクレイピングの中継ノードにされていると報告された(Include Security の解析)"
title_en: "Bright Data SDK: Researchers report it turns devices, including living-room smart TVs, into relay nodes for AI scraping (Include Security)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["training-data-provenance"]
incident_date: 2026-06-05
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["008-discord-scraping", "036-commonpool-training-data-pii", "011-synthid-watermark-reverse-engineering"]
status: published
gate: "intake"
version: "1.0"
og_lead_ja: "Bright Data の SDK が家庭のテレビなどを AI スクレイピングの中継ノードにすると、Include Security が解析"
og_lead_en: "Include Security reports Bright Data's SDK turns devices, including smart TVs, into AI-scraping relay nodes"
search_title: "Bright Data SDK：テレビが AI 収集の中継に"
search_description: "無料アプリに組み込まれた Bright Data の SDK が、スマートテレビなどを AI 向けスクレイピングの中継ノードにしていると研究者が報告した（Include Security）。何が起きたか、なぜ見分けにくいか、対策を整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "AI の事例 · 学習データの出所"
og_kicker_en: "AI CASE · TRAINING-DATA ORIGIN"
og_headline_ja: "家庭のテレビが、\nAI 収集の中継に\nされていると報告。\n<accent>設定は月 200GB まで</accent>"
og_headline_en: "Living-room TVs relay\nAI scraping, study says.\n<accent>Up to 200 GB a month.</accent>"
key_figures:
  - value: "200"
    unit: "GB/月"
    label: "Roku アプリ Petflix の SDK 設定が許す中継の上限。同意の画面の表示は「ときどき」（Include Security の解析）"
    tone: "alert"
  - value: "4 億超"
    unit: "IP"
    label: "Bright Data が広告で示す、住宅用プロキシ網の住宅 IP の数（同社の説明）"
  - value: "1.5 億超"
    unit: "IP"
    label: "そのうち「同意に基づく」と同社が説明する IP の数（同社の説明）"
glossary:
  - term: "住宅用プロキシ"
    desc: "家庭の回線の IP アドレスを経由して、他のサイトへの通信を中継する仕組み。受け取る側からは、ふつうの家庭の利用に見える。"
  - term: "exit node（中継ノード）"
    desc: "住宅用プロキシ網の中で、実際に他のサイトへ通信を出す機器。今回は、SDK を組み込んだアプリが動く機器がこれに当たる、とされる。"
  - term: "SDK"
    desc: "アプリの開発者が自分のアプリに組み込む、第三者が提供する部品。組み込まれたアプリの中で、そのアプリと同じ機器・回線を使って動く。"
insight:
  slug: "consent-label-not-behavior"
  label: "同意の表示と、実際に許される挙動"
  quote: "同意を画面の表示だけで受け付けると、実際の挙動がその範囲に入るかを照合する手段が無く、集めたデータの出所と同意も、受け取る側からは見分けられない。"
industries: ["ai", "developers"]
controls:
  - slug: "check-origin"
    item: "AI 学習に取り込むデータの出所と収集経路を、取り込みの前に確認する"
  - slug: "hold-unverified"
    item: "出所と同意を確認できないデータは、取り込みの前に除外する"
impact: "家庭の機器が、AI 業界向けスクレイピングの中継ノードに使われていると報告された"
takeaway: "解析によれば、同意の画面は「ときどき」と表示する一方、SDK の設定は月 200GB の中継を許していた。AI 学習に取り込む前に、データの出所と同意を照合する。"
self_check: "AI 学習に取り込むデータが、どの出所から、どの同意のもとで集められたかを、取り込みの前に照合しているか。"
countries: ["global"]
---

## 1. 要点

研究者の解析によれば、無料アプリに組み込まれた SDK が、常時稼働のスマートテレビを含む機器を、家庭の回線から AI 業界向けのスクレイピングを中継する exit node に変えていた。同意は無料アプリのオプトインの画面で取られるが、画面の表示と、SDK の設定が許す挙動は一致しない、とされる。住宅 IP からの収集はふつうの家庭の利用と区別がつきにくく、集めたデータを受け取る側からは、その出所も同意も見えない。<strong>同意を画面の表示だけで受け付けると、実際の挙動がその範囲に入るかを照合する手段が無く、集めたデータの出所と同意も、受け取る側からは見分けられない。</strong>

## 2. 通った操作

- **通った操作**: 家庭の機器による、他のサイトのページの取得（スクレイピングの中継）と、その結果の AI 業界向けのデータとしての供給。アプリの起動時に SDK が Bright Data のサーバーに接続して指示を受け取り、以後サーバーは、家庭の回線を使って他のサイトのページを取得させられる、と解析は示す（Include Security）。
- **受け付けた側に届くもの**: スクレイピングされるサイトには、一般に、家庭の回線の IP アドレスからの通常のアクセスに見える要求が届く。中継ジョブを運ぶピア通信には実質的な認証が無く、iOS では設定済みの VPN を迂回し、通常のアプリの監視ツールにも多くが現れない、とされる（Include Security）。集めたデータを受け取る側に届くのは、住宅 IP 由来の収集の結果で、誰の何を、どの同意のもとで集めたかは届かない。
- **公表されていないこと**: 公開のパートナー一覧に載ったアプリのうち、どれがいま SDK を含むか（研究者は、一覧への掲載は過去の協業を示すだけだと注意している）。中継で集めたデータを、どの組織が AI 学習に使ったか。解析に対する Bright Data の見解は、本 Brief の出典には含まれていない。

## 3. 実行前の照合

経路を問わず区別できる条件は、データを AI 学習に取り込む前に、そのデータがどの出所から、どの同意のもとで、どの経路で集められたかを、集めた側の申告とは別に照合することである。

- **誰が承認を出すか**: 回線と機器の持ち主。同意は、画面の表示の文言ではなく、実際に許す挙動（量・時間・用途）に対して出される必要がある。集めたデータの出所と同意の記録は、収集の時点で、収集を担った側から出される。
- **どこで照合するか**: 集めたデータを AI 学習に取り込む手前。出所と同意の記録が照合できないデータは、取り込まない。
- **何が残るか**: どのデータの取り込みが、どの出所・同意の記録に基づいたかの記録。個人の機器や行動の詳細を渡さずに、出所と同意の記録があることだけを示せる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝データを AI 学習に取り込む前に、その出所と同意の記録を照合し、記録に残すこと。検知＝中継や収集が動いていることを、後から見つけること。今回は、研究者の解析がそれに当たる。日付は解析の公開日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>取り込みの前に、データの出所と同意の記録を照合する</div>
<div class="rx-zone gapz"><b>報告されたこと</b><span>同意の表示は「ときどき」<br>SDK の設定は月 200GB まで</span></div>
<div class="rx-zone det"><b>検知 · 研究者の解析が働いた</b>SDK を解析し、遮断の手段を示す</div>
<div class="rx-g g1"><div class="t">同意</div><b>無料アプリのオプトインの画面で同意を取る</b></div>
<div class="rx-g g2"><div class="t">中継</div><b>サーバーの指示で、家庭の回線から他のサイトを取得する</b></div>
<div class="rx-g g3"><div class="t">供給</div><b>住宅 IP 由来の収集の結果が、AI 業界へ渡る</b></div>
<div class="rx-g g4"><div class="t">06-05</div><b>Include Security と Buchodi が解析を公開する</b></div>
</div>
</figure>

解析と遮断の手段は、家庭の機器が中継に使われる状態を具体的に示したが、それは中継と収集が動いた後に見つけたものだった。同じように、公開や同意の体裁と、照合できる出所とが切り離されていた事案に、[Discord のスクレイピング](https://lemma.frame00.com/ja/critical/briefs/008-discord-scraping/)（公開＝同意ではない）と [CommonPool の学習データの個人情報](https://lemma.frame00.com/ja/critical/briefs/036-commonpool-training-data-pii/)（収集の時点で出所と同意が照合されなかった）がある。出所の標識が独立に照合できる形で固定されない点は、[SynthID の透かしの解析](https://lemma.frame00.com/ja/critical/briefs/011-synthid-watermark-reverse-engineering/) と重なる。

## 4. Lemma でできること

**Lemma は、実行前の照合を、データを AI 学習に取り込む手前に組み込む。** 中継している機器を見つけるのでも、通信を遮断するのでもなく、取り込むデータが、照合できる出所と同意の記録を持つかを、取り込みの前に照合する。

### 注意したい業界・業務

- **業界 · AI**: AI 学習のデータを、スクレイピングや外部の収集事業者から集める・買う組織。
- **業界 · 開発者**: 無料アプリに、利用者の回線や帯域を使う第三者の SDK を組み込む開発者。

### いまの対策と Lemma の違い

今回の経路は、両方の列にまたがる。1 列目は、家庭の機器の回線を使った中継で、2 列目は、その中継で集めたデータの AI 学習への取り込みである。

| 対策 | 家庭の機器での中継 | AI 学習へのデータの取り込み |
| --- | --- | --- |
| オプトインの同意の画面 | 一部 | 関係しない |
| DNS レベルの遮断 | 一部 | 関係しない |
| プラットフォームによる背景プロキシ SDK の制限 | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 関係しない | 効く |

解析によれば、同意の画面は同意を取るが、その表示と SDK の設定が許す挙動は一致しない。DNS レベルの遮断は研究者が示したが、モバイル回線ではオフィスの Wi-Fi を迂回するため、ネットワークの遮断だけでは捕捉しきれない。Google・Amazon・Roku は背景プロキシ SDK を制限したが、Samsung の Tizen と LG の webOS は引き続き対象として掲載されている。どれも中継の側に働き、集めたデータを受け取る側の取り込みには関わらない。Lemma は、取り込むデータの出所と同意の記録を、取り込みの前に照合するが、家庭の機器での中継そのものは止めない。

注：Lemma の照合が働くのは、データを AI 学習に取り込む手前に照合を組み込み、出所と同意の記録が、収集の時点で、取り込む側とは別に発行・管理されている場合に限る。記録の中身が実際の収集と食い違っていれば、この照合は通ってしまう。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではなく、集めたデータを消すものでもない。

### 点検チェックリスト

AI 学習に取り込むデータと、アプリに組み込む SDK について、組織で確認する 3 項目

- 外部から集める・買うデータについて、どの回線・どの機器から集めたかの説明を受けているか。
- 出所と同意を確認できないデータを、取り込みの前に止める手順があるか。
- 自社のアプリに組み込む第三者の SDK が、利用者の回線や帯域をどれだけ使うかを把握し、同意の画面の表示と合っているかを確認しているか。

## 5. 事実と時系列

- **サービス**: Bright Data が消費者向けの無料アプリに組み込む SDK と、それを使う住宅用プロキシ網。Bright Data は Luminati の後継で、広告上 4 億超の住宅 IP を擁し、その供給の一部がこの SDK に由来する（同社は「同意に基づく 1.5 億超の IP」と説明している）。
- **解析**: Include Security と独立研究者 Buchodi が、iOS の `brdsdk.framework` v1.532.120 をリバースエンジニアリングし、30 日間の TLS インターセプトによる観測を含めて、機器を Bright Data が AI 業界向けに販売する Web スクレイピング事業の exit node に変える仕組みを文書化した。
- **確認されたこと**: 中継ジョブを運ぶピア通信には実質的な認証が無い（「多くのマルウェアより弱い」と評されている）。iOS では、そのトラフィックが設定済みの VPN を迂回し、通常のアプリの監視ツールに多くが現れない。バッテリーが低くない限り、視聴中・通話中も背景で中継を続ける（Include Security の解析）。
- **同意の表示と設定**: Roku アプリ Petflix は「ときどき」利用すると表示する一方、SDK の設定は月 200GB までを許す（ウズベキスタン・オマーンなど一部の国では上限がさらに高い）。SDK は、同じ事業者のアプリを動かす本人のスマートフォンと PC を 1 人の利用者として束ねうる、とされる。
- **スマートテレビへの到達**: Bright Data のプラットフォーム対応・公開のパートナー一覧・先行報道に基づく。最も深い技術的な根拠は iOS の SDK のものである。

### 時系列

- **2015**: Bright Data の前身 Luminati（Hola VPN 由来）が、無料の利用者の帯域を exit node として 1GB あたり 20 ドルで販売していたことが指摘される。
- **2025-10**: Krebs on Security が、Aisuru などのボットネット由来のプロキシが大規模な AI のデータ収集を支えていると報じる（機器を乗っ取る側）。
- **2026-01**: Google が犯罪的なプロキシ網 IPIDEA を解体する。
- **2026-02**: Lowpass（The Verge が配信）が、スマートテレビの切り口を先に報じる。
- **2026-06-05**: Include Security と Buchodi が、iOS の SDK の技術的な解析を公開する。
- **2026-06-06**: The Hacker News が報じる。
- **その後**: Google・Amazon・Roku が背景プロキシ SDK を制限し、Bright Data は当該プラットフォームから撤退する。Samsung の Tizen と LG の webOS は引き続き対象として掲載される。

> 本件の事実は、Include Security と Buchodi の解析と、その報道に拠る。仕組みと挙動は研究者の解析の結果で、住宅 IP の数と「同意に基づく」という説明は Bright Data の説明である。Bright Data はパートナー一覧を公開しているが、研究者は「一覧への掲載は過去に協業した事実を示すだけで、当該アプリがいま SDK を含むとは限らない」と注意しており、本 Brief は個別のアプリについて断定しない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **プラットフォーム · 事業者**: Google・Amazon・Roku が背景プロキシ SDK を制限し、Bright Data は当該プラットフォームから撤退した（Samsung Tizen・LG webOS は引き続き掲載）。
- **研究者**: DNS レベルの遮断の手段を示した。ただし、モバイル回線ではオフィスの Wi-Fi を迂回するため、ネットワークの遮断だけでは捕捉しきれないとしている。
- **同意の意味の論点**: 機器を乗っ取るボットネット型のプロキシ（Aisuru・IPIDEA など）と、オプトインの同意を掲げる事業者型のプロキシの違いは同意にあるが、表示と実際の挙動が一致しないとき、その同意が実質的かは未決の問いとして残る。
- **業界横断の論点**: anti-bot の対策が datacenter の IP を弾くため、AI のスクレイピングは住宅の回線へ移っている。収集したデータの出所・同意と、収集を担った中継の来歴を、収集の時点で照合する要請が、AI 学習データのサプライチェーン全体で浮上している。

## 6. Sources

- **Include Security（一次・技術解析）**: "The Smart TV in Your Living Room Is a Node in the AI-Scraping Economy"（2026-06-05、iOS SDK のリバースエンジニアリング）— <https://blog.includesecurity.com/2026/06/the-smart-tv-in-your-livingroom-is-a-node-in-the-aiscraping-economy/>
- **The Hacker News**: "Free Apps Are Quietly Turning Smart TVs Into Web-Scraping Proxies for AI"（2026-06-06）— <https://thehackernews.com/2026/06/free-apps-are-quietly-turning-smart-tvs.html>
- **Lowpass（The Verge 配信）**: スマートテレビ × Web スクレイピング・プロキシ網の先行報道（2026-02）— <https://www.lowpass.cc/p/smart-tv-web-scraping-ai-bright-data-proxy-networks>
- **Krebs on Security**: "Aisuru Botnet Shifts from DDoS to Residential Proxies"（2025-10、住宅プロキシが AI データ収集を支える文脈）— <https://krebsonsecurity.com/2025/10/aisuru-botnet-shifts-from-ddos-to-residential-proxies/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
