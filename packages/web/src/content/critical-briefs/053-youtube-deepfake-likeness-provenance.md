---
brief_no: 53
title: "偽の著名人が 2 億回見られても、肖像の来歴は誰も確かめていなかった — 肖像・音声の来歴が生成・公開の前に固定されない構造（YouTube）"
title_en: "200 Million Views of Fake Celebrities — The Likeness Provenance Gap Behind YouTube's Deepfake Detection"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["ai-decision-integrity", "attribute-proof-bypass"]
incident_date: 2026-03-10
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["011-synthid-watermark-reverse-engineering", "050-grok-deepfake-consent-provenance", "005-noroboto-lying-fonts"]
status: published
version: "1.0"
og_lead_ja: "偽著名人が 2 億回再生、肖像の来歴が固定されない — YouTube"
og_lead_en: "200M views of fake celebrities, likeness provenance gap — YouTube"
gap_detected: "登録済みの顔に一致する合成動画は走査・削除でき、報道・調査が被害規模を可視化できた。"
gap_missing: "「この肖像・音声は本人の同意ある正規の来歴を持つか」を生成・公開の前に確かめる層が無く、来歴を欠く合成物が拡散の前に区別されなかった。"
gap_fix: "高リスク行動の前に「この肖像・音声は、本人の同意のもとに、検証可能な来歴を伴って生成されている」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

YouTube 上の著名人なりすまし AI 詐欺広告が、ある調査では約 2 億回再生された。YouTube は登録済みの顔をアップロード動画から走査する肖像検出を公人から全クリエイターへ広げたが、これは合成物が作られ拡散した後にしか働かない。肖像・音声という本人の属性に、生成・公開の前に同意ある来歴が固定されていないため、検出は構造的に拡散の後追いになる。

---

## 2. 何が起きたか

- **対象**: YouTube 上の、著名人を装ったディープフェイク動画・広告と、YouTube の AI 肖像検出（likeness detection）ツール
- **被害の規模**: 著名人を装ったディープフェイク詐欺広告のキャンペーンが、ある調査によれば約 2 億回再生されたと報じられた。YouTube は偽の著名人を使った広告 1,000 件超を削除した（404 Media の調査が契機）。これらは YouTube が肖像対策を強化する背景となった
- **検出ツールの展開**: YouTube は AI 肖像検出ツールを、当初の限られたクリエイター（YouTube Partner Program）から段階的に拡大。2026-03 には政治家・政府関係者・ジャーナリストへ、2026-04 には主要タレント事務所（CAA・UTA・WME 等）および所属の著名人へ、2026-05 には条件を満たす 18 歳以上の全クリエイター（登録者数・チャンネル年数を問わず）へ拡大した
- **仕組み**: Content ID に類似し、クリエイターが顔の参照情報を登録すると、アップロード動画から同じ顔の合成・改変を走査し、権利者に削除要請やプライバシー違反としての申告の選択肢を与える

本事象は、肖像・音声の来歴・同意が生成・公開の前に固定されない構造に起因する。失敗が大規模な拡散へ伝播する経路は以下の通り。

1. **来歴のない肖像の生成**: 攻撃者が、本人の同意なく著名人等の顔・声を題材に合成動画を生成する。生成物には、それが誰の肖像をどの同意で用いたかを示す検証可能な来歴が付与されない
2. **公開と配信**: 合成動画・広告がプラットフォームに公開・配信される。肖像の来歴が固定されていないため、公開の時点で真贋・同意の有無を独立に確かめられない
3. **拡散**: 合成物が再生・配信を重ね、詐欺・偽広告として大規模に拡散する。被害は拡散の規模に比例して広がる
4. **検出と削除**: クリエイターが顔の参照を登録し、アップロード動画から合成を走査して削除要請する。ただしこれは合成物が生成・公開・拡散した後に作動する事後の系列であり、拡散済みの再生・被害は回復しにくい

---

## 3. 時系列 — 公表と対応

- 〜2024: 著名人を装った AI 詐欺広告が問題化。404 Media の調査を機に、約 2 億回再生の規模・偽広告 1,000 件超の削除が明らかになり、YouTube の肖像対策の契機となる
- 2024〜2025: YouTube が AI 肖像検出ツールを試験導入（YouTube Partner Program のクリエイター）。CAA と連携（2024-12）して開発
- 2026-03-10: AI 肖像検出を政治家・政府関係者・ジャーナリストへ拡大
- 2026-04: 主要タレント事務所（CAA・UTA・WME 等）および所属の著名人へ拡大
- 2026-05: 条件を満たす 18 歳以上の全クリエイターへ拡大（登録者数・チャンネル年数を問わず）

> 注: 再生数（約 2 億）・削除広告数（1,000 件超）は報道・調査に基づく集計であり、キャンペーンの網羅的範囲は集計により幅がある。本文では特定の被害者の描写を行わず、肖像の来歴が固定されない構造に焦点を当てる。

公表後の対応と業界の動きは次のとおり。

- **YouTube / 業界**: YouTube は AI 肖像検出を公人から全クリエイターへ拡大し、タレント事務所と連携した。検出と削除の網を広げる一方、合成物の生成・公開の前に肖像の来歴を固定する仕組みは、まだ検出層と独立した課題として残っている。音声への肖像検出の拡張も計画されている
- **来歴・同意の論点**: 肖像・音声という本人の属性に、生成・公開の前に検証可能な来歴・同意を固定する仕組み（コンテンツ来歴標準、同意のトークン化等）が、検出の事後性を補うものとして論点になっている。来歴が剥離可能・事後付与では実効が伴わない点も [Brief 011](https://lemma.frame00.com/ja/critical/briefs/011-synthid-watermark-reverse-engineering/) と通じる
- **業界横断の論点**: 合成コンテンツへの対応を、配信後の検出・削除に依存させず、肖像・音声の来歴と同意を生成・公開の前に独立検証可能な形で固定する（provenance / pre-execution attestation）方向へ、プラットフォームの信頼設計の重心を移す議論が進んでいる

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「肖像・音声という本人の属性に、生成・公開の前に検証可能な来歴・同意が固定されておらず、合成物の真贋・同意の有無を公開時点で独立検証できない」</strong>であり、ここに検出の事後性が生じる。

検出ツールの位置づけが核心である。YouTube の肖像検出は、Content ID に似て、登録された顔をアップロード動画から走査する。これは強力な検出層だが、原理的に「合成物が作られ、アップロードされた後」に働く。肖像の来歴が生成の時点で固定されていれば、「この動画は本人の同意ある来歴を持つか」を公開の時点で問えるが、現状はその来歴がないため、検出は拡散の後追いにならざるを得ない。再生数 2 億という規模は、来歴の不在と検出の事後性の差から生まれる。

[Brief 011](https://lemma.frame00.com/ja/critical/briefs/011-synthid-watermark-reverse-engineering/)（SynthID の透かしが統計的に剥がせ、AI 生成物の来歴標識が機能しない）と同根で、生成物の来歴が検証可能な形で固定されない問題である。[Brief 050](https://lemma.frame00.com/ja/critical/briefs/050-grok-deepfake-consent-provenance/)（生成の時点で被写体の同意・属性が検証されず、生成物に来歴が付かない）の、プラットフォーム配信・検出側の断面であり、[Brief 005](https://lemma.frame00.com/ja/critical/briefs/005-noroboto-lying-fonts/)（フォント偽装で目視と AI 入力が乖離する）の「表示と実体の乖離」を、肖像の真贋へ移す。本事案が示すのは、肖像の来歴を生成・公開の前に固定しないまま、検出だけで合成物を追うことの限界である。

YouTube の AI 肖像検出、タレント事務所との連携、偽広告の削除、報道による可視化は、被害の把握・除去・抑止に不可欠であり、本 Brief がその役割を否定するものではない。詐欺・偽広告の検出と削除、権利者への申告経路の整備は最優先の実務対応であり、強化されるべきである。

一方で、検出は「この動画の肖像が、本人の同意ある正規の来歴を持つか」を、**生成・公開の時点で**独立には立証しない。肖像検出は「登録された顔に一致するか」を走査するが、それは合成物がアップロードされた後に働く。透かしは剥がされ得（[Brief 011](https://lemma.frame00.com/ja/critical/briefs/011-synthid-watermark-reverse-engineering/)）、削除は拡散済みの再生を回復しない。欠けていたのは「この肖像・音声は、本人の同意のもとに、検証可能な来歴を伴って生成されたか」という生成・公開時点の独立検証であり、これは事後の走査・削除とは別系統である。検出を生成・公開の後に置く限り、対応は拡散の後追いにならざるを得ない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）と来歴バインドは、肖像・音声に生成・公開の前に検証可能な来歴・同意を固定することで、この落差を埋める。生成物に、それが誰の肖像をどの同意で用いたかを示す来歴を docHash でバインドし、公開の経路で「本人の同意ある来歴を持つか」を問えるようにすれば、来歴を欠く合成物を拡散の前に区別できる。合成物の検出（detection 的な「これは登録顔に一致するか」）と、肖像の来歴証明（「これは本人の同意ある来歴を持つか」）は代替ではなく **補完** の関係にある。

本事象で露呈した落差（肖像・音声の来歴・同意が、生成・公開の前に固定されず、検出が拡散の後追いになる）に対して、Lemma は、生成・公開という行為の前に、肖像の来歴と同意を独立検証可能な暗号証明として固定する設計を提示している。

- **肖像の来歴バインド**: 生成物に、それが誰の肖像・音声を、どの同意のもとに用いたかを示す来歴を、生成の時点で docHash バインドする。事後の剥離・偽装を、来歴の側から検証可能にする
- **同意の事前証明**: 肖像・音声を用いた生成・公開の前に、本人の同意が存在することを検証可能な証明として要求する。同意のない肖像利用を、公開の前に区別する
- **配信経路での来歴照会**: プラットフォームの公開・配信経路で「この動画は本人の同意ある来歴を持つか」を照会可能にし、来歴を欠く合成物を拡散の前に扱えるようにする
- **検出との補完**: 来歴を持つ正規の合成・編集（同意あるパロディ・吹替等）と、来歴を欠く悪性の合成とを証跡で区別し、検出の事後性を前置の証明で補う

これにより、生成・公開の時点で固定された来歴が、「この肖像は本人の同意ある来歴を持つか」を、拡散の前に独立検証可能なトレイルとして機能させる。検出・削除（事後の走査・除去）は被害の除去・抑止に、来歴・同意の事前証明（生成・公開前の固定）は合成物の未然区別に、それぞれ相補的に働く。

---

## 6. Sources

- **Axios**: "YouTube expands deepfake detection tool to politicians and journalists"（2026-03-10、肖像検出の拡大・仕組み） — <https://www.axios.com/2026/03/10/youtube-deepfake-detection-journalists-politicians>
- **TechCrunch**: "YouTube expands its AI likeness detection technology to celebrities"（2026-04-21、タレント事務所・著名人への拡大） — <https://techcrunch.com/2026/04/21/youtube-expands-its-ai-likeness-detection-technology-to-celebrities/>
- **Bitdefender (HotForSecurity)**: "YouTube's New AI Tool Fights Deepfakes—But Creators Still Need Real Protection"（検出の限界・詐欺キャンペーンの規模） — <https://www.bitdefender.com/en-us/blog/hotforsecurity/youtubes-new-ai-tool-fights-deepfakes-but-creators-still-need-real-protection>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/)、[Trust402](https://lemma.frame00.com/ja/trust402/)
