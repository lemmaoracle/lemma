---
brief_no: 117
title: "Speechify の音声クローン、同意の確認はチェックボックス1つだった — 米消費者団体が FTC と州司法長官に調査を申し立て"
title_en: "Speechify verified voice-cloning consent with a single checkbox — CFA asks the FTC and state AGs to investigate"
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
og_lead_ja: "Speechify の音声クローン、同意確認は自己申告チェックボックス1つ — CFA が FTC に申立て"
og_lead_en: "Speechify's voice-cloning consent is one self-certification checkbox; CFA files with the FTC"
gap_detected: "消費者団体と法科大学院の独立テストにより、同意確認と読み上げ検査が実際には機能しないことが具体的に実証され、規制当局に申し立てられた。"
gap_missing: "クローンの対象となった本人が利用を認可したという事実を、音声が生成される時点で独立に確かめる層。"
gap_fix: "音声クローンの生成前に、本人の認可を独立検証可能な証明として要求し、証明が伴わない生成を事前に拒否する。"
---

## 1. TL;DR

2026 年 7 月 27 日、音声クローンサービス **Speechify** について、Consumer Federation of America（CFA）と UCLA ロースクール Information Policy Lab の学生が、連邦取引委員会（FTC）と全米の州司法長官に調査を求める申立てを公表した。申立ての中核は、同意確認として提示されている仕組みが自己申告のチェックボックス1つと自由記述の氏名欄にすぎず、技術的な検証を一切伴わないという指摘である。もう一つの安全策とされる「指定された文章の読み上げ」も、録音済み音声のアップロードで丸ごと迂回できた。独立テストによる検出は働いた。**効かなかったのは、声の持ち主がその利用を認可した事実を、音声が生成される時点で独立に確かめる層である。**

## 2. 何が起きたか

- 申立ては CFA が UCLA ロースクール Information Policy Lab（UCLA Institute for Technology, Law & Policy のプロジェクト）の学生とともに作成し、宛先は「全米の州司法長官および連邦取引委員会」、日付は 2026 年 7 月 27 日である。
- 申立て本体には方法論の節があり、著者らは無料版・有料版および Speechify Studio でアカウントを作成して実地にテストしたと明記している。声のクローンについては、非公人と、利用許諾のない公人の双方を対象に試し、いずれにも安全策が働かないことを示している。
- Speechify Studio における所有権・同意の確認機構は、自己申告のチェックボックスと氏名を入力するテキスト欄のみであり、声の持ち主の身元を確認する技術的検証も、アップロード者が同意を得たことを確認する検証も行われない。申立ては、氏名欄には偽名でも、クローン対象本人の名前でも入力でき、1 件ごとに別の架空の身元を記入できるため、一人の悪意ある利用者が数十の声を、それぞれ別の架空の身元でクローンできると指摘する。
- アカウント作成時にも身元確認はなく、メールアドレスとパスワードのみで足りる。
- 生成されるテキストの内容審査も存在せず、著者らのテストでは、実在の詐欺で使われる典型的な台本（未納の配送料 1.45 ドルを口実に決済情報を入力させる USPS なりすまし、上司になりすまして 100 ドルの Apple ギフトカード 5 枚を購入しコードを送るよう求めるもの）が、警告も制限もなく読み上げられた。
- 申立ては FTC 法第 5 条(a)、および州の不公正・欺瞞的取引慣行法（UDAP）とデジタル偽造に関する州法の適用を主張し、通信品位法第 230 条が本件の免責にはならないとする節を設けている。

同意の確認は、次の連鎖で成立しないまま通過する。

1. 利用者はメールアドレスとパスワードだけでアカウントを作る。身元確認はない。
2. 声をクローンする段で、指定された文章の読み上げを求められる。ただしプラットフォームは、読み上げた内容が指定文と一致するかを検証しない。何を話しても通る。
3. そもそも録音済みの音声ファイルをアップロードすれば、読み上げ工程そのものを迂回できる。
4. 最後にチェックボックス1つに印を付け、氏名欄を埋める。これが「権利を有する」という宣言のすべてであり、技術的な裏取りは行われない。
5. クローンされた声で任意のテキストを読み上げさせられる。内容審査は存在しない。

## 3. 時系列 — 公表と対応

- 2026-07-27：申立て文書の日付。宛先は全米の州司法長官および FTC。
- 2026-07-27：CFA がプレスリリースを公表し、FTC と州司法長官に Speechify の音声クローン慣行の調査を求めた。
- 2026-07-27：申立て本体（PDF）が CFA サイトで公開。文書冒頭の表題は "Draft Complaint" であり、本 Brief が参照するのはこの公開版である。

> 注：本 Brief の事実関係は、CFA が公開した申立て本体とプレスリリースに基づく。申立ては行政機関に調査を求めるものであり、訴訟の提起でも、事実認定でもない。記述された安全策の不備は申立て著者らによる独立テストの結果であり、Speechify 側の反論は本 Brief 作成時点で確認していない。本 Brief は特定事業者の断罪ではなく、同意という属性が生成の時点で検証されない構造に焦点を当てる。

公表後の対応と業界の動きは次のとおり。

- 申立ては、FTC 法第 5 条(a)に加え、州の UDAP 法とデジタル偽造に関する州法の適用可能性を並べ、第 230 条が音声クローン生成パイプラインを免責しないと主張する構成を取っている。声のクローンを「ホスティング」ではなく「コンテンツ生成」と位置付ける論理である。
- 背景として、申立ては FTC の統計を引き、なりすまし詐欺の被害が 2025 年に 35 億ドルに達し、2020 年比でおよそ 3 倍に増加したことを示している。なりすまし詐欺は最も件数の多い詐欺類型となっている。
- Speechify の利用規約とプライバシーポリシー自体が、従業員による利用者コンテンツの監視も、投稿物の系統的な審査も行わないと述べていることを、申立ては内容審査不在の裏付けとして引用している。

## 4. なぜ止まらなかったか

この事案の失敗は、安全策が用意されていなかったことではない。用意された安全策のいずれもが宣言を受け取るだけで、**声の持ち主がその利用を認可した事実を独立に確かめる層が無かった**ことにある。チェックボックスは宣言であり、証明ではない。氏名欄は自己申告であり、身元ではない。読み上げ検査は音声の存在を確かめるだけで、その音声の持ち主が誰で、何に同意したかは確かめない。

検出は効いていた。消費者団体と法科大学院が実地にアカウントを作り、非公人と公人の双方でクローンを試し、詐欺台本を読み上げさせ、安全策が名目に過ぎないことを具体的に示したうえで規制当局に申し立てた。効かなかったのはその手前——音声が生成される瞬間に、その生成が本人に認可された範囲に属するかを独立に確かめる層である。

> 自己申告のチェックボックスは、悪意ある利用者にとって費用ゼロの手続きである。正直な利用者にだけ効き、迂回する動機を持つ者には効かない。安全策として提示されることで、確認が行われているという印象だけが受け手に残る。

同じ構造は、削除と監視が完全に機能してなお次の生成を止められなかった [Brief 105（JAPRO 肖像・声の実態調査）](https://lemma.frame00.com/ja/critical/briefs/105-japro-likeness-voice-ai-provenance/)、肖像の来歴が公開の前に固定されなかった [Brief 053（YouTube 偽の著名人）](https://lemma.frame00.com/ja/critical/briefs/053-youtube-deepfake-likeness-provenance/)、既定の許諾状態が同意の証明として通用した [Brief 050（Grok のディープフェイク同意）](https://lemma.frame00.com/ja/critical/briefs/050-grok-deepfake-consent-provenance/) に連なる。いずれも、同意が「宣言された」ことと、その同意が「いま検証されている」ことが別の問いであることを示している。生体的なチェックが迂回可能な代物であった点は [Brief 034（eKYC のライブネス回避）](https://lemma.frame00.com/ja/critical/briefs/034-ekyc-liveness-bypass/) とも重なる。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、音声クローンが生成される一つひとつの行動の前に、本人の認可を独立に検証する層を経路に一段挟む。チェックボックスと氏名の自己申告を同意の代用にせず、「この声の利用は、その声の持ち主が認可した範囲に属するか」を生成が成立する前に確かめる。答えが「認可の証明がない」であれば、生成は事前に拒否される。

Lemma がこの primitive に対して提示する設計は次の通りである。

- **認可証明の生成前検証**：声のクローン生成を、自己申告ではなく、本人が発行した検証可能な認可証明に結び付ける。証明を伴わないクローン要求は、生成の前に分別される。
- **属性の選択的開示**：「この声の利用が認可されている」という事実だけを、本人の身元情報や連絡先を渡さずに証明できる形にする。認可の確認のために本人情報を集積させない。
- **認可範囲のスコープ**：用途・期間・配布先といった認可の範囲を証明に束ね、範囲外の生成を事前に排除する。一度の許諾が無制限の利用に転化することを防ぐ。
- **生成物への来歴バインド**：生成された音声そのものに認可の来歴を改ざん耐性のある形で結び付け、受け手が独立に確認できるようにする。

Lemma は音声クローンの品質を判定する製品ではなく、詐欺台本を検知するものでもない。射程は、音声が生成される前に本人の認可を独立検証し、認可の証明を欠く生成を事前に排除することにある。検出（実態調査、独立テスト、規制当局への申立てと執行）と、事前証明（生成の前に認可を独立検証する証跡）は、代替ではなく補完の関係にある。前者は起きた被害の把握と是正に、後者は被害が成立する前の信頼確立に働く。設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、適用範囲は [Pillar 04 — 規制・属性証明](https://lemma.frame00.com/ja/pillars/regulatory-attribute-proof/) を参照。

## 6. Sources

- **CFA / UCLA Law（一次）**: “Draft Complaint — To: Attorneys General of the United States; Federal Trade Commission”（2026-07-27, PDF）— <https://consumerfed.org/media/iy5hjsp2/speechify-complaint-cfa.pdf>
- **CFA（一次・プレスリリース）**: “Consumer Federation of America Urges FTC and State Attorneys General to Investigate Speechify Over AI Voice-Cloning Practices”（2026-07-27）— <https://consumerfed.org/news/press-releases/consumer-federation-of-america-urges-ftc-and-state-attorneys-general-to-investigate-speechify-over-ai-voice-cloning-practices/>
- **CFA（一次・申立て掲載ページ）**: “CFA Complaint Against Speechify for Facilitating AI Voice Cloning Impersonation Scams” — <https://consumerfed.org/news/testimony-comments/cfa-complaint-against-speechify-for-facilitating-ai-voice-cloning-impersonation-scams/>
- **CFA（背景レポート・一次）**: Ben Winters, “Scamplified”（2025）— <https://consumerfed.org/reports/scamplified/>
- **FTC（背景・一次）**: “FTC Data Show People Reported Losing $3.5 Billion to Imposter Scams in 2025”（2026-06）— <https://www.ftc.gov/news-events/news/press-releases/2026/06/ftc-data-show-people-reported-losing-3-point-5-billion-imposter-scams-2025>
- **FBI / IC3（背景・一次）**: “Federal Bureau of Investigation Internet Crime Report 2025”（PDF）— <https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）。設計と適用範囲は [Pillar 04 — 規制・属性証明](https://lemma.frame00.com/ja/pillars/regulatory-attribute-proof/) · [Brief 105（JAPRO 肖像・声の実態調査）](https://lemma.frame00.com/ja/critical/briefs/105-japro-likeness-voice-ai-provenance/) · [Brief 053（YouTube 偽の著名人）](https://lemma.frame00.com/ja/critical/briefs/053-youtube-deepfake-likeness-provenance/)
