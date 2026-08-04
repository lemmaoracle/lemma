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
gap_detected: "最終的な非該当判断は機械でなく有資格の臨床医が下すと CMS は定め、事業者もそう説明している。"
gap_missing: "不承認という不利益処分の前に、その判定が患者の根拠データに照らして独立に検証・認可されたことを確かめる層が無い。"
gap_fix: "判定が正しい患者の正しい根拠データに基づくことを独立検証可能な証明として要求し、証明を伴わない不利益処分を確定の前に差し止める。"
---

## 1. TL;DR

米 Medicare は 2026 年 1 月から 6 州で、AI・機械学習を用いた事前承認モデル **WISeR** を試行している。2026 年 6 月 23 日、KFF Health News（CBS 掲載）は現場の混乱を報じた。医師らは、一部の不承認が臨床事実を取り違える AI のハルシネーションに由来すると証言する——頸部への注射が必要な患者に「胸椎は対象外」と不承認、しびれが無いと 4 回記録された患者に「しびれ」を理由に不承認。CMS は最終的な非該当判断を有資格の臨床医が下すと定めている。判定の層は在った。**効かなかったのは、不承認という処分の前に、その判定が患者の根拠データに照らして独立に検証・認可されたことを確かめる層である。**

## 2. 何が起きたか

- 対象は Medicare 出来高払い（従来型 Medicare）に導入された WISeR（Wasteful and Inappropriate Service Reduction）モデル。アリゾナ・ニュージャージー・オハイオ・オクラホマ・テキサス・ワシントンの 6 州で、不正・濫用に脆弱とされた 13 サービスが対象となる（皮膚代替材、電気刺激装置の植込み、変形性膝関節症に対する膝関節鏡、脊椎骨折の椎体形成術など）。入院限定サービス・救急・遅延が重大な危険を招くサービスは対象外である。
- 医師・スタッフの証言では、不承認の一部が AI のハルシネーション（臨床情報の取り違え・捏造）に見える。ワシントン大学の医療システムだけで、WISeR 関連の遅延により硬膜外注射の待機が今年に入って約 100 人に達した（上院議員事務所の 4 月報告、病院団体データに基づく）。
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

この事案の失敗は、AI が誤ることそのものでも、人手の確認が制度に無かったことでもない。**不承認という不利益処分の前に、その判定が患者の根拠データに照らして独立に検証・認可されたことを確かめる層が無かった**ことにある。

人手による最終判断は、制度として明文化されている。CMS は非該当判断を有資格の臨床医が下すと定め、事業者もそう説明する。検証の層は設計上は在った。効かなかったのは、その手前——処分が確定する前に、判定を実際の根拠データへ突き合わせる検証——である。医師が同じ記録に 4 回明記しても取り違えが覆らないとき、その層は処分の手前で実効的に働いていない。

> 不承認は行動である。行動の前に、その判定が正しい患者の記録に基づくことを独立に確かめる証跡が無ければ、誤りは処分として先に実行される。

報酬設計はこの落差を広げうる。支払いが「不適切な利用の削減と支出低下」に連動する以上、判定の正当性そのものを独立の証跡として切り出しておかなければ、誘因が判定を傾けなかったことを後から示す手立てが残らない。これは [Brief 078](https://lemma.frame00.com/ja/critical/briefs/078-tenncare-connect-medicaid-eligibility/)（TennCare の自動適格判定が誤ったまま Medicaid を打ち切った事案）の直系であり、公共部門の AI 判断が行動の前に独立検証されない構造を共有する。争点は判定の「公平性」ではなく、[Brief 012](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/)（顔認証の誤認逮捕）が示した「判定が強制的な処分の前に独立検証・認可されない」一点にある。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、不利益処分が確定する一つひとつの行動の前に、その判定が根拠データに基づくことを独立に検証する層を経路に一段挟む。人手の最終判断という制度上の建前を検証の代用にせず、「この判定は、正しい患者の・正しい根拠データに・基準どおり適用されたか」を、処分が成立する前に確かめる。

Lemma がこの primitive に対して提示する設計は次の通りである。

- **判定の事前証跡**：不利益処分の確定前に、判定が根拠データに照らして独立に検証・認可されたことを証跡として残す。
- **根拠データへのバインド**：判定を、実際に参照した患者の記録に結びつけ、取り違え（別部位・矛盾する所見）を処分前に検出可能にする。
- **決定の来歴**：AI の提案から人手の最終判断までの経路を、後から改ざんできない形で記録する。「臨床医が判断した」ことが、制度上の建前ではなく検証可能な事実として残る。
- **誘因からの分離**：報酬が削減額に連動する場合でも、判定の正当性の証跡を独立の検証対象として切り出す。

Lemma は医学的必要性を判定する製品ではなく、AI の誤りを検知するものでもない。射程は、不利益処分が確定する前にその判定が根拠データに基づくことを独立検証し、証明を伴わない処分を差し止め可能にすることにある。AI の精度改善と人手の最終確認（臨床医レビュー、不服申立て、事後の是正）と、事前証明（処分の前に判定を根拠へ突き合わせる証跡）は、代替ではなく補完の関係にある。前者は誤りを後から正し、後者は「判定が下された」ことと「判定が根拠に照らして独立に検証・認可された」ことのあいだ——検出が構造的に届かない一点を閉じる。補完の位置づけは [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、適用範囲は [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/#inference) を参照。

## 6. Sources

- **KFF Health News / CBS News（独立報道）**: Darius Tahir, “Medicare's AI push snarls patients and doctors in errors and delays”（2026-06-23）— <https://www.cbsnews.com/news/medicare-ai-program-wiser-prior-authorization-errors-delays/>
- **CMS（一次・公式発表）**: “CMS Launches New Model to Target Wasteful, Inappropriate Services in Original Medicare”（2025-06-27）— <https://www.cms.gov/newsroom/press-releases/cms-launches-new-model-target-wasteful-inappropriate-services-original-medicare>
- **CMS（一次・実務ガイド）**: “WISeR Model Provider and Supplier Operational Guide” — <https://www.cms.gov/priorities/innovation/files/wiser-provider-supplier-guide.pdf>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）。設計と適用範囲は [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/#inference) · [Brief 078（TennCare 自動適格判定）](https://lemma.frame00.com/ja/critical/briefs/078-tenncare-connect-medicaid-eligibility/) · [Brief 012（顔認証の誤認逮捕）](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/)
