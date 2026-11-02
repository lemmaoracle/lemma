---
brief_no: 117
title: "Speechify：音声クローンの同意の確認が自己申告だけだとして、調査が申し立てられた(CFA の申し立て)"
title_en: "Speechify: Consumer group alleges voice-cloning consent relies on self-declaration alone and seeks an investigation (CFA complaint)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-07-27
published: 2026-08-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["105-japro-likeness-voice-ai-provenance", "053-youtube-deepfake-likeness-provenance", "050-grok-deepfake-consent-provenance", "084-hong-kong-deepfake-video-call-fraud", "034-ekyc-liveness-bypass"]
status: published
version: "1.0"
og_lead_ja: "Speechify の音声クローン、同意の確認は自己申告のチェックボックスだけだと CFA が FTC に申し立て"
og_lead_en: "CFA tells the FTC that Speechify's voice-cloning consent check is a single self-declaration checkbox"
layout: "report"
sections: "proof"
gate: "intake"
og_kicker_ja: "AI の事例 · 音声クローンの同意"
og_kicker_en: "AI CASE · VOICE-CLONE CONSENT"
og_headline_ja: "声の持ち主の同意は、\n自己申告だけと訴え。\n<accent>CFA が調査を申し立て</accent>"
og_headline_en: "Voice-clone consent was\nself-declared, CFA says.\n<accent>It seeks an FTC probe.</accent>"
key_figures:
  - value: "1 つ"
    label: "同意の確認として示された、自己申告のチェックボックス（と氏名欄）。技術的な検証は伴わない（CFA の申し立て）"
    tone: "alert"
  - value: "2 本"
    label: "実在の詐欺に使われる型の台本が、警告も制限もなく読み上げられた（申し立ての著者らのテスト）"
  - value: "35"
    unit: "億ドル"
    label: "2025 年のなりすまし詐欺の被害。2020 年からおよそ 3 倍（申し立てが引く FTC の統計）"
glossary:
  - term: "音声クローン"
    desc: "録音した声から、その人の声で任意の文を読み上げられるようにする技術。"
  - term: "CFA"
    desc: "Consumer Federation of America（米国消費者連盟）。消費者団体。今回は UCLA ロースクールの学生と申し立てを作った。"
  - term: "申し立て"
    desc: "行政機関に調査を求める文書。訴訟の提起でも、当局による事実の認定でもない。"
insight:
  slug: "declared-consent-not-checked"
  label: "宣言された同意は、照合された同意ではない"
  quote: "同意を本人の宣言だけで受け付けると、その宣言が本当かを生成の前に照合する手段が無く、他人の声でも同じ手続きで通る。"
industries: ["ai"]
operations: ["approval"]
controls:
  - slug: "ownership-check"
    item: "声の持ち主本人が利用を認めたかを、生成の前に照合する"
impact: "同意の確認が自己申告のチェックボックスと氏名欄だけで、他人の声でもクローンできたと申し立てられた"
takeaway: "申し立てによれば、同意の確認は自己申告で、他人の声でもクローンできた。声を生成する前に、持ち主本人の認可を照合する。"
self_check: "他人の声や肖像を扱う生成の前に、その持ち主本人が利用を認めたかを、本人の申告とは別に照合しているか。"
countries: ["us"]
---

## 1. 要点

申し立てによれば、声をクローンする手順には、同意の確認として自己申告のチェックボックスと氏名欄があったが、その内容を照合する技術的な検証は無かった。指定された文の読み上げも、録音済みの音声のアップロードで迂回できた、とされる。これは消費者団体と法科大学院の学生のテストの結果で、当局の認定ではない。<strong>同意を本人の宣言だけで受け付けると、その宣言が本当かを生成の前に照合する手段が無く、他人の声でも同じ手続きで通る。</strong>

## 2. 通った操作

- **通った操作**: 声のクローンの登録と、クローンした声での読み上げ。申し立ての著者らは、非公人の声と、利用の許諾のない公人の声の両方でクローンを試し、いずれにも安全策が働かなかったとしている（CFA の申し立て）。
- **受け付けた側に届くもの**: 申し立てによれば、アカウントの作成にはメールアドレスとパスワードだけが届き、クローンの登録には、チェックボックスの印と、自由に書ける氏名と、音声が届く。氏名欄には、偽名でも、クローンされる本人の名前でも入れられ、1 件ごとに別の架空の身元を書ける、とされる。
- **読み上げの検査**: 指定された文を読み上げる工程はあったが、読んだ内容が指定の文と一致するかは検証されず、録音済みの音声をアップロードすれば工程ごと迂回できた、とされる。
- **公表されていないこと**: Speechify の反論（本 Brief の作成の時点で確認していない）。実際に、他人の声のクローンが詐欺に使われた事例があるか。

## 3. 何を照合するか

経路を問わず区別できる条件は、声を生成する前に、その声の利用が、声の持ち主本人の認めた範囲に入るかを、登録する人の申告とは別に照合することである。

- **誰が承認を出すか**: 声の持ち主本人。登録する人の申告（チェックボックスや氏名）は、本人の承認の代わりにならない。
- **どこで照合するか**: クローンした声を生成する手前。本人の認可が照合できない生成は、行わない。用途・期間・配布先などの範囲を外れた生成も、同じ手前で止める。
- **何が残るか**: どの声の生成が、本人のどの認可に基づいたかの記録。本人の身元や連絡先を渡さずに、認可があることだけを示せる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝声を生成する前に、声の持ち主本人の認可を照合し、記録に残すこと。検知＝生成ができてしまうことを、後から見つけること。今回は、消費者団体などの独立したテストがそれに当たる。日付は申し立ての日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>生成の前に、声の持ち主本人の認可を照合する</div>
<div class="rx-zone gapz"><b>申し立てられたこと</b><span>同意の確認は自己申告だけで<br>他人の声でもクローンできた</span></div>
<div class="rx-zone det"><b>検知 · 独立したテストが働いた</b>テストで示し、FTC と州司法長官に申し立てる</div>
<div class="rx-g g1"><div class="t">登録</div><b>メールとパスワードでアカウントを作る</b></div>
<div class="rx-g g2"><div class="t">クローン</div><b>チェックボックスと氏名で、声を登録する</b></div>
<div class="rx-g g3"><div class="t">読み上げ</div><b>詐欺の型の台本が、警告なく読み上げられる</b></div>
<div class="rx-g g4"><div class="t">07-27</div><b>CFA が申し立てを公表する</b></div>
</div>
</figure>

独立したテストは、手続きが名目にとどまることを具体的に示したが、それは生成ができてしまう状態を後から見つけたものだった。同じように、同意や来歴が生成・公開の前に照合されなかった事案に、[JAPRO の肖像・声の実態調査](https://lemma.frame00.com/ja/critical/briefs/105-japro-likeness-voice-ai-provenance/) と [Grok のディープフェイクの同意](https://lemma.frame00.com/ja/critical/briefs/050-grok-deepfake-consent-provenance/) がある。生体のチェックが迂回できた点は、[eKYC のライブネスの回避](https://lemma.frame00.com/ja/critical/briefs/034-ekyc-liveness-bypass/) と重なる。

## 4. Lemma でできること

**Lemma は、03 の照合を、声を生成する手前に組み込む。** 声の品質を判定するのでも、詐欺の台本を見つけるのでもなく、その生成が声の持ち主本人の認めた範囲に入るかを、生成の前に照合する。

### 注意したい業界・業務

- **業界 · AI**: 声や肖像から、本人のように話す・写るものを生成するサービス。
- **業務 · 承認・決裁**: 他人の声や肖像を使う生成の、本人の同意の受け付け。

### いまの対策と Lemma の違い

今回の経路は、1 列目（声のクローンの登録で、持ち主の同意を受け付ける）である。2 列目は、クローンした声で読み上げる文の生成で、申し立ては、文の内容の審査が無かったとしている。

| 対策 | 声のクローンの登録（持ち主の同意） | クローンした声での読み上げ |
| --- | --- | --- |
| 自己申告のチェックボックスと氏名欄 | 効かない | 関係しない |
| 指定された文の読み上げの検査 | 効かない | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 一部 |

申し立てによれば、チェックボックスと氏名欄は宣言を受け取るだけで、技術的な検証を伴わない。読み上げの検査は、読んだ内容と指定の文の一致を検証せず、録音済みの音声のアップロードで迂回できた。Lemma は、登録する人の申告ではなく、声の持ち主本人が出した認可を、生成の前に照合する。読み上げでは、認可に用途や期間などの範囲を結び付ければ、範囲外の生成を止められるが、範囲の中で読み上げる文の中身が詐欺かどうかは判定しない。

注：Lemma の照合が働くのは、声を生成する手前に照合を組み込み、声の持ち主本人の認可が、登録する人とは別に発行・管理されている場合に限る。本人が認可した範囲の中の生成は、この照合を通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

他人の声や肖像を扱う生成について、組織で確認する 3 項目

- 同意の確認が、登録する人の自己申告（チェックボックスや氏名）だけになっていないか。
- 声の持ち主本人の認可を、生成の前に照合しているか。
- 認可の用途・期間・配布先の範囲を外れた生成を、生成の前に止められるか。

## 5. 事実と時系列

- **申し立てた人**: Consumer Federation of America（CFA）と、UCLA ロースクールの Information Policy Lab（UCLA Institute for Technology, Law & Policy のプロジェクト）の学生。宛先は、全米の州司法長官と連邦取引委員会（FTC）。
- **テストの方法**: 著者らは、無料版・有料版と Speechify Studio でアカウントを作り、実地にテストしたと、申し立ての方法論の節に書いている。
- **同意の確認**: Speechify Studio の所有権・同意の確認の仕組みは、自己申告のチェックボックスと氏名の欄だけで、声の持ち主の身元も、アップロードした人が同意を得たかも、技術的に検証されない、と申し立ては指摘する。1 人の利用者が、数十の声を、それぞれ別の架空の身元でクローンできる、とする。
- **アカウントの作成**: メールアドレスとパスワードだけで作れ、身元の確認は無い、とされる。
- **読み上げる文**: 文の内容の審査は無く、著者らのテストでは、実在の詐欺に使われる型の台本（未納の配送料 1.45 ドルを口実に決済情報を入力させる USPS のなりすまし、上司になりすまして 100 ドルの Apple ギフトカード 5 枚の購入とコードの送付を求めるもの）が、警告も制限もなく読み上げられた、とされる。
- **申し立ての根拠**: FTC 法第 5 条(a)、州の不公正・欺瞞的取引慣行法（UDAP）、デジタル偽造に関する州法の適用を主張し、通信品位法第 230 条は免責にならないとする節を設けている。

### 時系列

- **2026-07-27**: 申し立ての文書の日付。宛先は全米の州司法長官と FTC。
- **2026-07-27**: CFA がプレスリリースで、FTC と州司法長官に、Speechify の音声クローンの慣行の調査を求める。
- **2026-07-27**: 申し立ての本体（PDF）が CFA のサイトで公開される。文書の表題は "Draft Complaint" で、本 Brief はこの公開版に拠る。

> 本件の事実は、CFA が公開した申し立ての本体とプレスリリースに拠る。申し立ては行政機関に調査を求めるもので、訴訟の提起でも、事実の認定でもない。安全策の不備は、申し立ての著者らによる独立したテストの結果で、Speechify の反論は本 Brief の作成の時点で確認していない。本 Brief は、特定の事業者を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **申し立ての論理**: 声のクローンを「ホスティング」ではなく「コンテンツの生成」と位置付け、第 230 条が音声クローンの生成の流れを免責しないと主張している。
- **背景の統計**: 申し立ては FTC の統計を引き、なりすまし詐欺の被害が 2025 年に 35 億ドルに達し、2020 年からおよそ 3 倍に増え、件数で最も多い詐欺の型になったとしている。
- **利用規約**: 申し立ては、Speechify の利用規約とプライバシーポリシーが、従業員による利用者のコンテンツの監視も、投稿物の系統的な審査も行わないと述べていることを、内容の審査が無いことの裏付けとして引いている。

## 6. Sources

- **CFA / UCLA Law（一次）**: “Draft Complaint — To: Attorneys General of the United States; Federal Trade Commission”（2026-07-27, PDF）— <https://consumerfed.org/media/iy5hjsp2/speechify-complaint-cfa.pdf>
- **CFA（一次・プレスリリース）**: “Consumer Federation of America Urges FTC and State Attorneys General to Investigate Speechify Over AI Voice-Cloning Practices”（2026-07-27）— <https://consumerfed.org/news/press-releases/consumer-federation-of-america-urges-ftc-and-state-attorneys-general-to-investigate-speechify-over-ai-voice-cloning-practices/>
- **CFA（一次・申立て掲載ページ）**: “CFA Complaint Against Speechify for Facilitating AI Voice Cloning Impersonation Scams” — <https://consumerfed.org/news/testimony-comments/cfa-complaint-against-speechify-for-facilitating-ai-voice-cloning-impersonation-scams/>
- **CFA（背景レポート・一次）**: Ben Winters, “Scamplified”（2025）— <https://consumerfed.org/reports/scamplified/>
- **FTC（背景・一次）**: “FTC Data Show People Reported Losing $3.5 Billion to Imposter Scams in 2025”（2026-06）— <https://www.ftc.gov/news-events/news/press-releases/2026/06/ftc-data-show-people-reported-losing-3-point-5-billion-imposter-scams-2025>
- **FBI / IC3（背景・一次）**: “Federal Bureau of Investigation Internet Crime Report 2025”（PDF）— <https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
