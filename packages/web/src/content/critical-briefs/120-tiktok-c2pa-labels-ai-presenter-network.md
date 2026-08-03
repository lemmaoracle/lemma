---
brief_no: 120
title: "TikTok の AI ラベル 30 億件と、AI 生成の「司会者」550 本超の偽情報が同時に成立していた — ラベルの不在は、真正の証明にならない（C2PA / CNA 調査）"
title_en: "TikTok's 3 billion AI labels coexisted with a 550-video AI-presenter disinformation operation — the absence of a label is not proof of authenticity (C2PA / CNA)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["identity-auth", "attribute-proof-bypass"]
incident_date: 2026-07-13
published: 2026-08-03
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["011-synthid-watermark-reverse-engineering", "053-youtube-deepfake-likeness-provenance", "105-japro-likeness-voice-ai-provenance", "119-japan-sexual-deepfake-npa-h1-2026", "050-grok-deepfake-consent-provenance"]
status: published
version: "1.0"
og_lead_ja: "TikTok の AI ラベル30億件と、AI生成司会者550本超の偽情報が同時に成立"
og_lead_en: "TikTok's 3 billion AI labels coexisted with a 550-video AI-presenter disinformation network"
gap_detected: "報道機関の痕跡分析が偽装を特定し、共有された2アカウントはプラットフォームによって速やかに停止された。"
gap_missing: "動画の発信者が主張どおりの実在の作り手かを、視聴の時点で視聴者が独立に確かめる層。"
gap_fix: "発信者と成果物の来歴を独立検証可能な証明として要求し、証明を欠く発信を視聴の前に分別できるようにする。"
---

## 1. TL;DR

2026 年 7 月 13 日、**CNA** は **TikTok** 上の 30 アカウント・550 本超の動画を分析した調査を公表した。その 98% は、AI 生成・加工・複製された女性の人物像に、使い回しの音声と台本を継ぎ合わせて組み立てられており、およそ 9 割がシンガポールとマレーシアに関する虚偽または誤解を招く主張を運び、総再生数は 300 万回を超えた。その 15 日後、C2PA は TikTok の運営委員昇格を発表し、同社がこれまでに 30 億件超のコンテンツを AI 生成としてラベル付けしてきたと述べた。この規模のラベル付けを積み上げてきたプラットフォーム上で、その体制は成立していた。ラベル付けと削除による検出は働いた。**効かなかったのは、その動画の発信者が主張どおりの実在の作り手かを、視聴の時点で視聴者が独立に確かめる層である。**

## 2. 何が起きたか

- CNA（Sophia Tay および CNA Verification）は 30 の TikTok アカウントを調査し、550 本超の動画の背後に「工場のような」制作体制があることを特定した。公表は 2026 年 7 月 13 日、更新は 7 月 17 日。
- そのうち 98% は、AI 生成・加工・複製された女性の人物像を用い、使い回しの音声と再利用された台本を継ぎ合わせて組み立てられていた。
- 動画のおよそ 9 割が、シンガポールとマレーシアに関する虚偽または誤解を招く主張を運んだ。総再生数は 300 万回超。対象期間は 2025 年 10 月から 2026 年 6 月である。
- 550 本超のうち 94 本は同一の虚偽・誤解を招く主張を繰り返しており、この 94 本だけで 160 万回超、調査対象全体のほぼ半数の再生数を占めた。24 のアカウントが、時期をずらしながら同じ論点を反復していた。
- 最も極端な例は、シンガポールのヴィヴィアン・バラクリシュナン外相が、同国の港を迂回する新航路を認めないよう中国とインドネシアに懇願して失敗した、という主張である。そのような事実はない。この一件だけで 2 か月近く反復され、10 万回超再生された。
- CNA は TikTok に質問を送り、2 アカウントの実例を共有した。数日後、その 2 アカウントはいずれも「欺瞞的行為」の規約違反として停止された。
- 2026 年 7 月 28 日、C2PA（Coalition for Content Provenance and Authenticity）は TikTok の一般会員から運営委員への昇格を発表した。発表文は、TikTok が Content Credentials・不可視の透かし・作り手向けの教育とラベル付けツールを組み合わせ、これまでに 30 億件超のコンテンツを AI 生成としてラベル付けしてきたと述べている。

偽情報は次の連鎖で成立している。

1. AI 生成・加工・複製によって女性の人物像が作られる。人物像そのものが実在するかは、受け手には確かめられない。
2. 使い回しの音声トラックと台本が、その人物像に継ぎ合わされる。同じ論点が、異なる見た目と異なる声で語られる状態が作られる。
3. 24 のアカウントが、時期をずらしながら同じ台本を反復する。独立した作り手が別々に同じ結論に至ったかのような外観が成立する。
4. 推薦と配信を通じて、視聴者はその主張を異なるアカウントから繰り返し受け取る。反復そのものが、主張の親近性と、もっともらしさを押し上げる。
5. 視聴の時点で、発信者が独立した実在の作り手かを確かめる手段はない。判別が試みられるのは、報道機関が痕跡を分析した後である。

## 3. 時系列 — 公表と対応

- 2025-10〜2026-06：調査対象となった 550 本超の動画が投稿された期間。
- 2026-02：CNA が先行する調査を公表し、YouTube 上でも同種の筋書きが流通していることを示した。
- 2026-07-13：CNA が TikTok に関する調査を公表（7 月 17 日更新）。
- 2026-07-13 前後：CNA が TikTok に質問と 2 アカウントの実例を送付。数日後、その 2 アカウントが「欺瞞的行為」により停止。
- 2026-07-28：C2PA が TikTok の運営委員昇格を発表。累計 30 億件超の AI ラベル付けに言及。

> 注：本 Brief の事実は、CNA の調査記事と C2PA の公式発表という二つの一次ソースに基づく。**CNA が TikTok に共有したのは 2 アカウントであり、その 2 件はいずれも停止された**。共有された対象に対する措置は完全に機能している。残る 28 アカウントおよび 550 本超の動画について、記事は措置の有無を述べていない。また CNA の調査記事は、対象動画に来歴ラベルが付いていたか否かに言及していない。CNA は運営主体や発注者を特定できておらず、商業目的か国家関与かも判定していない。本 Brief は特定プラットフォームの断罪ではなく、発信者の来歴が視聴の時点で検証されない構造に焦点を当てる。

公表後の対応と業界の動きは次のとおり。

- TikTok の広報担当者は、規約違反として 2 アカウントを停止したと説明し、同社が「システムやコミュニティを操作して世論に影響を与えようとする」アカウントを常時監視・削除していると述べた。同社の定義する欺瞞的行為には、隠蔽された影響工作・なりすまし・スパム・偽レビューが含まれる。
- C2PA 議長の Clement Wolf 氏は発表文で、TikTok による Content Credentials の「早期かつ大規模な実装は、来歴が実環境で意味ある価値をもたらしうることを示している」と述べている。Content Credentials は、コンテンツの出所と加工履歴を示す「デジタルの栄養表示ラベル」として位置付けられている。
- CNA が偽装を特定した手がかりは、人物像の頭部や胴体が 1 本の動画の中でも複数の動画をまたいでもほぼ動かず固定されていたこと、口の動きと音声のずれが頻発していたこと、台本を共有するアカウント群のうち半数が同一の音声トラックを使っていたこと、そして一部のアカウントが「人物名＋金融関連語」という命名の型と短時間の大量投稿（バースト投稿）を示していたことである。
- 専門家は別の見立てを示している。南洋理工大学の Saifuddin Ahmed 准教授は、ディープフェイク技術の急速な進展を踏まえ、AI の痕跡を見つけようとすることは「負け戦（losing game）」だと述べた。同氏は、個別の主張ではなく手口そのものに対する事前の免疫付け（prebunking）のほうが拡張性があるとし、「コンテンツは変わるが、手口は変わらない」と述べている。

## 4. なぜ止まらなかったか

この事案の失敗は、ラベル付けが行われていなかったことでも、削除が働かなかったことでもない。**動画の発信者が主張どおりの実在の作り手かを、視聴の時点で視聴者が独立に確かめる層が無かった**ことにある。

検出は効いていた。プラットフォームは 30 億件超に AI ラベルを付け、来歴の業界団体で運営委員に昇格し、共有された 2 アカウントを数日で停止した。報道機関は 30 アカウント・550 本超を分析し、頭部の固定・音声のずれ・音声トラックの共有といった痕跡から偽装を特定した。効かなかったのはその手前——300 万回の再生が積み上がる一件ごとの視聴の瞬間に、その発信者が独立した実在の作り手かを確かめる検証である。

痕跡による判定は検出であって、証明ではない。頭部が動かない、口の動きがずれる、声が使い回されている——これらは現時点の生成技術の粗さに依存した手がかりであり、技術の進展とともに消える。

同じことが、ラベルの側にも当てはまる。ラベルは来歴のメタデータが経路を生き延びたときにだけ付く。したがって、ラベルが無いことは「AI 生成でない」ことの証明にはならず、敵対的に作られたコンテンツはラベルを持たないまま届く。30 億件のラベルは、ラベルの付いた 30 億件について何かを述べるが、ラベルの付いていない残りについては何も述べない。

> 措置は、共有された対象に対しては完全に働いた。CNA が実例を渡した 2 アカウントは、いずれも数日で停止されている。だがそれは、報告された個別の対象に対する事後の操作であり、次の 550 本を成立させない構造にはならない。24 のアカウントが同じ台本を回し続ける体制に対して、事後の個別削除が追いつく設計ではない。

成果物側に埋めた来歴印が除去も偽造もされうることは [Brief 011（SynthID 透かし）](https://lemma.frame00.com/ja/critical/briefs/011-synthid-watermark-reverse-engineering/) が示している。肖像の来歴が生成・公開の前に固定されないまま 2 億回が視聴された [Brief 053（YouTube 偽の著名人）](https://lemma.frame00.com/ja/critical/briefs/053-youtube-deepfake-likeness-provenance/)、削除率 100% を達成してなお再投稿が続いた [Brief 105（JAPRO 肖像・声の実態調査）](https://lemma.frame00.com/ja/critical/briefs/105-japro-likeness-voice-ai-provenance/)、事後の摘発が届く範囲に限りがあることを統計が示した [Brief 119（性的ディープフェイクの把握 123 件）](https://lemma.frame00.com/ja/critical/briefs/119-japan-sexual-deepfake-npa-h1-2026/) と、失敗の primitive は共通している。いずれも、成果物が「本物らしく見える」ことと、その発信者と来歴が「いま検証されている」ことが別の問いであることを示している。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、動画が視聴者に届く一つひとつの経路の前に、発信者と成果物の来歴を独立に検証する層を一段挟む。ラベルの有無を真正性の代用にせず、「この発信は、主張どおりの作り手が発行した、改ざんされていないものか」を確かめられる形にする。答えが「来歴の証明がない」であれば、視聴者はそれを独立した作り手の発信として受け取る前に分別できる。

Lemma がこの primitive に対して提示する設計は次の通りである。

- **発信者来歴の検証**：発信を、アカウント名や人物像の見た目ではなく、発行者の検証可能な来歴に結び付ける。同じ運営体が複数の人物像を立てても、独立した作り手としては通らない。
- **ラベル不在の意味を反転させる**：「ラベルが無い＝AI 生成でない」という推定を、「来歴の証明が無い＝独立に確認されていない」という既定に置き換える。証明の不在が、判断材料として正しく働く状態にする。
- **成果物完全性のバインド**：音声・映像・台本が別々に作られて継ぎ合わされた成果物について、その構成要素の来歴を改ざん耐性のある形で束ねる。使い回しの音声トラックや複製された人物像は、来歴の対応を欠くものとして分別される。
- **配信経路での事前検証**：推薦と配信の経路に来歴検証を組み込み、証明を欠く発信が視聴者の前に「独立した作り手の意見」として並ぶ前に分別する。反復による親近性の醸成は、ここで断たれる。

Lemma は偽情報の真偽を判定する製品ではなく、AI 生成の痕跡を検出するものでもない。射程は、発信が視聴者に届く前に発信者と成果物の来歴を独立に検証し、証明を欠く発信を分別可能にすることにある。検出（報道機関による分析、プラットフォームの監視と削除、ラベル付けの拡大）と、事前証明（視聴の前に発信者来歴を独立検証する証跡）は、代替ではなく補完の関係にある。前者は起きた流通の把握と封じ込めに、後者は流通が信頼を獲得する前の分別に働く。補完の位置づけは [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance) を参照。

## 6. Sources

- **CNA（一次・調査報道）**: Sophia Tay & CNA Verification, “AI-generated women are spreading disinformation about Singapore on TikTok”（2026-07-13、2026-07-17 更新）— <https://www.channelnewsasia.com/singapore/tiktok-ai-women-disinformation-deepfake-presenters-6250271>
- **C2PA / PR Newswire（一次・公式発表）**: “C2PA Welcomes TikTok to Steering Committee, Advancing the Adoption of Content Credentials at a Global Scale”（2026-07-28）— <https://www.prnewswire.com/news-releases/c2pa-welcomes-tiktok-to-steering-committee-advancing-the-adoption-of-content-credentials-at-a-global-scale-302836730.html>
- **CNA（一次・関連調査）**: Renald Loh & CNA Verification, “Some 260 fake Jack Ma videos spreading falsehoods about Singapore on YouTube: CNA investigation”（2026-07-28）— <https://www.channelnewsasia.com/singapore/jack-ma-ai-deepfakes-youtube-disinformation-falsehoods-6273136>
- **CNA（一次・先行調査）**: “Singapore and PM Lawrence Wong targeted in AI-driven disinformation campaign on YouTube”（2026-02）— <https://www.channelnewsasia.com/singapore/lawrence-wong-disinformation-ai-youtube-campaign-chinese-fake-videos-5949266>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）。設計と適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance) · [Brief 011（SynthID 透かし）](https://lemma.frame00.com/ja/critical/briefs/011-synthid-watermark-reverse-engineering/) · [Brief 053（YouTube 偽の著名人）](https://lemma.frame00.com/ja/critical/briefs/053-youtube-deepfake-likeness-provenance/)
