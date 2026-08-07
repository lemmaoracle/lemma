---
brief_no: 124
title: "Medicare の AI 事前承認 WISeR：不承認は下されたが、その判定が根拠データに照らして独立に検証された証跡は残らない — 医師はハルシネーションを疑う"
title_en: "Medicare's WISeR AI prior authorization: denials were issued, but no record that the judgment was independently verified against the patient's own evidence"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["ai-bias-harm", "attribute-proof-bypass"]
incident_date: 2026-06-23
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["078-tenncare-connect-medicaid-eligibility", "012-williams-frt-wrongful-arrest", "060-withers-aberdeen-ai-hallucinated-precedent", "115-mobley-workday-ai-hiring-bias"]
status: published
version: "1.0"
og_lead_ja: "Medicare の AI 事前承認モデル WISeR、不承認をめぐり医師がAIハルシネーションを指摘"
og_lead_en: "Medicare's WISeR AI prior-authorization denials draw doctors' suspicions of AI hallucination"
gap_detected: "判断の層は制度としては在った。最終的な非該当判断は機械でなく有資格の臨床医が下すと CMS は定め、事業者もそう説明する。"
gap_missing: "その判断がどの患者の・どの記録に対して下されたかの証跡は、公表されている運用ガイドの範囲では確認できない。"
gap_fix: "照合の相手と発行者を処分の前に固定し、それを伴わない不承認を差し止め可能にする。"
analysis_lead_ja: "確かめられないのは、記録に照らしたかどうかではない。その照合が、どの患者の・どの記録に対して行われたのかである。"
---

## 1. TL;DR

米 Medicare は 2026 年 1 月から 6 州で、AI・機械学習を用いた事前承認モデル **WISeR** を試行している。2026 年 6 月 23 日、KFF Health News（CBS 掲載）は現場の混乱を報じた。医師らは、一部の不承認が臨床事実を取り違える AI のハルシネーションに由来すると証言する——頸部への注射が必要な患者に「胸椎は対象外」と不承認、しびれが無いと 4 回記録された患者に「しびれ」を理由に不承認。CMS は最終的な非該当判断を有資格の臨床医が下すと定めている。判断の層は、制度としては在った。**効かなかったのは、その照合がどの記録に対して行われたのかを、処分の前に確かめる層である。**

## 2. 何が起きたか

- 対象は Medicare 出来高払い（従来型 Medicare）に導入された WISeR（Wasteful and Inappropriate Service Reduction）モデル。アリゾナ・ニュージャージー・オハイオ・オクラホマ・テキサス・ワシントンの 6 州で、不正・濫用に脆弱とされた 13 サービスが対象となる（皮膚代替材、電気刺激装置の植込み、変形性膝関節症に対する膝関節鏡、脊椎骨折の椎体形成術など）。入院限定サービス・救急・遅延が重大な危険を招くサービスは対象外である。
- 医師・スタッフの証言では、不承認の一部が AI のハルシネーション（臨床情報の取り違え・捏造）に見える。ワシントン大学の医療システムだけで、WISeR 関連の遅延により硬膜外注射の待機が今年に入って約 100 人に達したと報じられている（上院議員事務所の 4 月報告、病院団体データに基づく）。
- CMS の公表によれば、モデル参加事業者への支払いは「不適切な利用の削減と Original Medicare の支出低下」に応じて行われ、迅速な意思決定や関係者の体験に関する品質・プロセス指標で調整される。事業者の一社（Humata Health CEO）は、AI ハルシネーションの報告は把握していないとする。

不承認は次の経路で患者に届く。

1. 医師が対象 13 サービスの手続き前に、根拠となる医療記録をポータルへ提出する。
2. AI・機械学習が基準に合う申請を「即時承認」する（事業者の一社は、臨床データが承認を裏づける場合の約 88% が即時承認と説明）。
3. 残りは審査に回り、一部で臨床事実を取り違えた不承認が返る。
4. 患者は遅延・追加受診・治療断念に直面し、不服申立てが増える。審査コストは政府側にも積み上がる。

## 3. 時系列 — 公表と対応

- 2025-06-27：CMS が WISeR モデルを公表。最終的な非該当判断は「機械ではなく有資格の臨床医」が下すと明記した。
- 2026-01 中旬：6 州で試行開始。オハイオ州医師会の前 CEO は「通常より速い」立ち上げだったと述べ、ワシントン州医師会の政策責任者は医師が「手探りで対応せざるを得なかった」と述べる。事業者側も「通知から稼働までは急ピッチだった」と認める。
- 2026-04：Cantwell 上院議員事務所が、病院団体データに基づく WISeR の実態報告を公表（ワシントン大学の硬膜外注射待機 約 100 人など）。
- 2026-06-23：KFF Health News（Darius Tahir、CBS News 掲載）が、混乱・誤り・遅延と、AI ハルシネーション由来が疑われる不承認を報じる。

> 本 Brief は AI ハルシネーションの各事例の当否を判定しない。CMS と事業者は人手が最終判断を担うとし、事業者の一社はハルシネーションの報告を把握していないと述べている。個々の医師の証言は、直接の利害を持つ立場からの説明として扱う。上院議員事務所の報告は本 Brief 執筆時点で当該 PDF への直接アクセスが確認できず、数値は KFF Health News の報道を通じて参照している。

公表後の対応と業界の動きは次のとおり。

- CMS は「適切な医療を遅らせずに不適切な医療を減らす」ことが目的とし、決定は 72 時間以内に返すと説明する。問題のない請求は 15 日以内に支払われるはずだと現場の医師は述べるが、実務では「6〜8 週間の遅延」（タルサの放射線科医）が報告されている。アリゾナ州を担当する事業者の説明会（4 月）では、1 月まで遡る大きな支払い滞留が認められた。
- 不服申立ては増えていると報じられ、CMS は申立件数の変動とそのコストを織り込んでいると述べた。対象サービスの一覧に「現時点で変更は検討していない」が、変更の要否は評価を続けるとする。
- CMS イノベーションセンター長は「不正・濫費・濫用を行う医療者の割合は小さい」とも認めている。

## 4. なぜ止まらなかったか

この事案の失敗は、AI が誤ることそのものでも、人手の確認が制度に無かったことでもない。**その判断がどの患者の・どの記録に対して下されたかを、処分の確定前に確かめられる形で残していなかった**ことにある。

人手による最終判断は、制度として明文化されている。CMS は非該当判断を有資格の臨床医が下すと定め、事業者もそう説明する。判断の層は設計上は在った。効かなかったのは、その手前——その判断が実際にどの記録に対して下されたのかを、処分が確定する前に第三者が確かめられる形——である。医師が同じ記録に 4 回明記しても取り違えが覆らないとき、照合されたという説明を裏づけるものは何も残っていない。

> 不承認は行動である。行動の前に、その判定がどの記録と照合されたかの証跡が無ければ、照合したという説明は説明のまま残り、誤りは処分として先に実行される。

報酬設計はこの落差を広げうる。支払いが「不適切な利用の削減と支出低下」に連動する以上、判定がどの記録に基づくかの証跡を支払いの当事者から独立に切り出しておかなければ、発行のされ方を後から監査する材料そのものが残らない。これは [Brief 078](https://lemma.frame00.com/ja/critical/briefs/078-tenncare-connect-medicaid-eligibility/)（TennCare の自動適格判定が誤ったまま Medicaid を打ち切った事案）の直系であり、公共部門の AI 判断が行動の前に独立検証されない構造を共有する。争点は判定の「公平性」ではなく、[Brief 012](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/)（顔認証の誤認逮捕）が示した「判定が強制的な処分の前に独立検証・認可されない」一点にある。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、不利益処分が確定する一つひとつの行動の前に、照合の相手を固定する一段を経路に挟む。照合の中身が正しいかを機械が判定するのではない。「この判定は、どの患者の・どの記録に対して下されたのか」を、処分が成立する前に、受け取った側が発行者に問い合わせずに確かめられる形にする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>照合の相手を固定する</strong>：不利益処分の確定前に、判定を実際に参照した患者の記録へ結びつけ、どの記録に基づく判定かを処分の前に確かめられる形で残す。</li>
<li><strong>照合の証跡</strong>：その結びつけが「いつ・どの機関の発行で・改ざんなく」行われたかを、後から覆せない形で残す。照合したという説明が、説明のままでは済まなくなる。</li>
<li><strong>決定経路の来歴</strong>：AI の提案から人手の最終判断までの経路を、後から改ざんできない形で記録する。承認がいつ行われたかが残れば、一件あたりの審査時間という検証可能な事実が生まれる。</li>
<li><strong>支払側から独立した監査</strong>：報酬が削減額に連動する場合でも、判定がどの記録に基づくかの証跡を、支払いの当事者から独立に監査できる形で切り出す。</li>
</ul>

この層が担わないものも、あわせて書いておく。取り違えの有無を判断するのは、この結びつきを前提にした人である。来歴が示せるのは有資格の担当者がいつ承認操作を行ったかまでであり、その担当者が記録を実際に読んだかまでは示せない。経路にゲートを置くのは支払側であり、この層が出せるのはその判断材料までである。自社の操作ログとの違いもここにある。ログは自社が自社のために出すものであり、処分を受けた側が独立に確かめられない。

報じられた 2 例は、性質が異なる。頸部への注射に対して胸椎を理由に返したとされる不承認は、申請側が自らの提出内容と突き合わせられるため、照合の相手が固定されていれば処分の前に争える。一方、記録に繰り返し明記された所見と矛盾する判定があったとすれば、それは記録の読み取りそのものに関わり、事前証明の射程外にある。同じ読み取りに依存する層では、同じ誤りを再生産するからである。後者を担うのは、AI の精度改善と人手の確認、そして不服申立てである。

Lemma は医学的必要性を判定する製品ではなく、AI の誤りを検知するものでもない。射程は、不利益処分が確定する前に照合の相手と発行者を固定し、それを伴わない処分を差し止め可能にすることにある。AI の精度改善と人手の最終確認（臨床医レビュー、不服申立て、事後の是正）と、事前証明（照合の相手を処分の前に固定する証跡）は、代替ではなく補完の関係にある。前者は誤りを後から正し、後者は「照合したと説明されている」ことと「どの記録と照合されたかが確かめられる」ことのあいだ——検出が構造的に届かない一点を閉じる。この層をどう組むかは [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/) に書いた。

## 6. Sources

- **KFF Health News / CBS News（独立報道）**: Darius Tahir, “Medicare's AI push snarls patients and doctors in errors and delays”（2026-06-23）— <https://www.cbsnews.com/news/medicare-ai-program-wiser-prior-authorization-errors-delays/>
- **CMS（一次・公式発表）**: “CMS Launches New Model to Target Wasteful, Inappropriate Services in Original Medicare”（2025-06-27）— <https://www.cms.gov/newsroom/press-releases/cms-launches-new-model-target-wasteful-inappropriate-services-original-medicare>
- **CMS（一次・実務ガイド）**: “WISeR Model Provider and Supplier Operational Guide” — <https://www.cms.gov/priorities/innovation/files/wiser-provider-supplier-guide.pdf>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）。設計と適用範囲は [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/#inference) · [Brief 078（TennCare 自動適格判定）](https://lemma.frame00.com/ja/critical/briefs/078-tenncare-connect-medicaid-eligibility/) · [Brief 012（顔認証の誤認逮捕）](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/)
