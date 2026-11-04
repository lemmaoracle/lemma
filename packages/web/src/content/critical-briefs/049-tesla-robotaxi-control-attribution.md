---
brief_no: 49
title: "Tesla Robotaxi：黒塗りだった事故の経緯を NHTSA に再提出し、遠隔運転手が起こした事故が含まれていた(Electrek・TechCrunch)"
title_en: "Tesla Robotaxi: Tesla refiled its once-redacted crash narratives with NHTSA, and some crashes turned out to be caused by remote teleoperators (Electrek, TechCrunch)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance", "attribute-proof-bypass", "ai-bias-harm"]
incident_date: 2026-05-15
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["043-tesla-fsd-self-reported-safety", "035-boeing-787-inspection-records", "012-williams-frt-wrongful-arrest"]
status: published
layout: "report"
sections: "proof"
gate: "none"
version: "1.0"
og_lead_ja: "Tesla が Robotaxi の事故の経緯の黒塗りを外して NHTSA に再提出し、Austin の 17 件のうち 2 件は遠隔運転手が起こしたと報じられた"
og_lead_en: "Tesla refiled its Robotaxi crash narratives with NHTSA unredacted; 2 of 17 Austin crashes were reported as caused by remote teleoperators"
og_kicker_ja: "AI の運転判断 · 制御の帰属"
og_kicker_en: "AI DRIVING · CONTROL ATTRIBUTION"
og_headline_ja: "黒塗りを外した記録で、\n遠隔運転手の事故が\n分かったと報道。\n<accent>17 件のうち 2 件</accent>"
og_headline_en: "Unredacted filings show\nteleoperators caused\ncrashes, reports say.\n<accent>2 of 17 crashes.</accent>"
key_figures:
  - value: "2"
    unit: "件"
    label: "自律システムではなく、遠隔で操作していた人間の運転手が起こした事故（黒塗りを外した再提出による）"
    tone: "alert"
  - value: "17"
    unit: "件"
    label: "Austin の Robotaxi のテスト期間（2025-07〜2026-03）に NHTSA へ報告された ADS の事故"
  - value: "約 5.7 万"
    unit: "マイル"
    label: "2026-02 時点の事故 1 件あたりの走行距離（約 80 万マイルで 14 件・Electrek）"
glossary:
  - term: "ADS（Automated Driving System）"
    desc: "人の運転を代わって走行の判断と操作をする自動運転のシステム。"
  - term: "遠隔運転手（teleoperator）"
    desc: "車両の外から、通信を通じて車を操作する人間の運転手。"
  - term: "安全監視員"
    desc: "Robotaxi に同乗し、走行を見守る担当。本件では ADS が止まったあと遠隔支援を呼んだ。"
  - term: "SGO（Standing General Order）"
    desc: "自動運転・運転支援のシステムが関わる事故を、事業者が NHTSA に報告する命令。"
  - term: "営業秘密（confidential business information）"
    desc: "提出した記録のうち、公開から外すよう事業者が指定した部分。本件では事故の経緯の記述がこれに当たっていた。"
insight:
  slug: "self-reported-control-attribution"
  label: "申告のまま受け付けられる制御の帰属"
  quote: "事故のとき誰が運転を制御していたかは、引き継ぎの時点で、運行する側の外に照合できる形で残さなければ、事故の記録を出す側の申告のまま受け付けられる。"
industries: ["ai"]
operations: ["disclosure"]
controls:
  - slug: "audit-trail"
    item: "事故のとき誰が運転を制御していたかを記録し、外から照合できるようにする"
impact: "17 件の事故のうち 2 件は遠隔運転手が起こした"
takeaway: "事故のときに自律システムと遠隔運転手のどちらが制御していたかは、運行する側が作って当局に出す記録に拠っていた。"
search_title: "Tesla Robotaxi の事故記録：遠隔運転手と黒塗り"
search_description: "Tesla が Robotaxi の事故の経緯の黒塗りを外して NHTSA に再提出し、Austin の 17 件のうち 2 件は遠隔運転手が起こしたと報じられた。何が通ったか、何を照合するか、対策を整理。"
self_check: "自動の仕組みから人へ運転や操作を引き継ぐとき、そのとき誰が制御しているかを、運行する側の外で照合できる形で残しているか。"
countries: ["us"]
---

## 1. 要点

黒塗りが外れるまで、事故のうちどれが自律システムの走行で、どれが遠隔の人間の操作だったかは、外からは読めなかった。制御の帰属と事故の経緯は、運行する側が作って当局に出す記録に書かれ、どこまで開示するかも出す側が決めていた。報道は、黒塗りを外した再提出の後に、遠隔運転手の事故を伝えた。<strong>事故のとき誰が運転を制御していたかは、引き継ぎの時点で、運行する側の外に照合できる形で残さなければ、事故の記録を出す側の申告のまま受け付けられる。</strong>

## 2. 通った操作

- **通った操作**: 二つある。一つは、ADS から遠隔の人間の運転手への制御の引き継ぎと、その後の遠隔運転。2025-07 の 1 件では、ADS が停止し、安全監視員が遠隔支援を呼んだ後、遠隔運転手が縁石に乗り上げて金属のフェンスに接触した。もう一つは、事故の記録の NHTSA への提出。Tesla は事故の経緯の記述を、全件「営業秘密」として黒塗りにして提出していた。
- **受け付けた側に届くもの**: 一般に、事故報告の制度で当局に届くのは、運行する側が作った記録である。そのとき ADS・遠隔運転手・安全監視員のどれが制御していたかは、車両側のログと、運行する側の記録づけに拠る。経緯が黒塗りなら、第三者は帰属を読めない。
- **検知の経路**: 2026-05-15 の、黒塗りを外した再提出と、それを伝えた Electrek・TechCrunch の報道。いずれも事故と最初の報告の後に働く。
- **公表されていないこと**: 参照した資料には、遠隔運転手に制御を渡す手順や認可の仕組み、黒塗りを外した理由は書かれていない。個別の事故の過失の認定も出ていない。

## 3. 実行前の照合

経路を問わず区別できる条件は、制御が自動の仕組みから人へ移るとき、誰が・どの認可で制御を受け取ったかを、その時点で、運行する処理の外で照合し、当局に出す記録をそれに結びつけることである。

- **誰が承認を出すか**: 遠隔で操作してよい人と、その条件を定める側（運行の安全の設計）。事故の記録では、報告の様式と記載の範囲を定める側（当局の報告の制度、社内の記録の定義）。
- **どこで照合するか**: 遠隔運転手が制御を受け取る直前と、事故の記録を当局に出す直前。前者は、受け取る人が認可された相手かを、後者は、記録に書いた制御の帰属が引き継ぎの時点の記録どおりかを照合する。照合できないものは、保留にして、確認できるまで出さない。
- **何が残るか**: いつ、誰から誰へ制御が移ったか、どの認可で受け取ったかの記録と、そのときのテレメトリ。後から書き換えられない形で、運行する処理の外に残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝制御を人へ渡す前、事故の記録を当局に出す前に、誰が・どの認可で制御していたかを運行する処理の外で照合し、記録に残すこと。検知＝事故と最初の報告の後に、再提出や報道から気づくこと。日付は、各社・当局・報道が確認・公表した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>制御の引き継ぎと、出す記録の帰属を、運行する処理の外で照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>17 件のうち 2 件は遠隔運転手が起こした<br>経緯は営業秘密として黒塗りで提出されていた</span></div>
<div class="rx-zone det"><b>検知 · 事故と最初の報告の後に働いた</b>黒塗りを外した再提出と報道で、遠隔運転手の事故が分かった</div>
<div class="rx-g g1"><div class="t">2025-07</div><b>テスト開始・遠隔運転手がフェンスに接触</b></div>
<div class="rx-g g2"><div class="t">2026-01</div><b>遠隔運転手がバリケードに接触</b></div>
<div class="rx-g g3"><div class="t">2026-02</div><b>報告の累計 14 件</b></div>
<div class="rx-g g4"><div class="t">2026-05-15</div><b>黒塗りを外して再提出</b></div>
</div>
</figure>

検知は、遠隔運転手が起こした事故を外から見えるようにした。制御の引き継ぎと記録の提出の前の照合とは、別に働く。同じ運行主体で、事故のデータと安全の数字が申告に拠っていた事案に [Brief 043](https://lemma.frame00.com/ja/critical/briefs/043-tesla-fsd-self-reported-safety/)（FSD の視界低下の事故調査）、記録があることが実施の裏づけと取り違えられた事案に [Brief 035](https://lemma.frame00.com/ja/critical/briefs/035-boeing-787-inspection-records/)（Boeing 787 の検査記録）がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、制御を人へ渡す側と、事故の記録を当局に出す側に組み込む。** 事故を検出したり、走行の判断の正否や過失を判定したりするのではなく、制御を受け取った人が認可された相手か、出す記録の制御の帰属が引き継ぎの時点の記録どおりかを、運行する処理の外で照合し、記録に残す。

### 注意したい業界・業務

- **業界 · AI 導入**: 自動の仕組みが判断し、解決できない場面を遠隔の人が引き継ぐ運用をする組織。
- **業務 · 情報の開示・提供**: 事故の記録や経緯を、当局への報告や公表として外に出す業務。

### いまの対策と Lemma の違い

今回は、2 つの列のどちらも通った経路にあたる。

| 対策 | 遠隔運転手への制御の引き継ぎ | 当局に出す事故の記録（誰が制御していたか） |
| --- | --- | --- |
| 安全監視員の同乗と遠隔支援の呼び出し | 一部 | 関係しない |
| 車両側のログ | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 一部 | 効く |

安全監視員の同乗は、ADS が止まった場面で遠隔支援につなぐもので、受け取る人が認可された相手かを外から照合するものではない。車両側のログは帰属の材料になるが、記録に何を書くかは運行する側の記録づけに拠る。Lemma は、引き継ぎの時点で誰がどの認可で制御を受け取ったかを記録に残し、当局に出す記録の帰属がそれどおりかを提出の前に照合する。引き継ぎの列で Lemma が照合するのは受け取る人の認可で、遠隔運転そのものの安全は判定しない。

注：Lemma の照合が働くのは、制御の引き継ぎと事故の記録の提出の手順に照合を組み込み、認可の条件と引き継ぎの記録を、運行する処理の外で管理できる場合に限る。認可の条件そのものが誤っていれば、誤ったものも通る。どこまでを開示するかは、出す側と当局の判断で、Lemma はそれを決めない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

自動の仕組みと人の間で運転や操作を引き継ぐ組織で確認する 3 項目

- 遠隔で操作する人が、その車両や機械を操作してよい相手かを、制御を渡す前に照合しているか。
- 当局に出す事故の記録の「誰が制御していたか」を、引き継ぎの時点の記録に結びつけ、後から確認できるか。
- 制御の引き継ぎと事故のときの記録を、後から書き換えられない形で、運行する処理の外に残しているか。

## 5. 事実と時系列

- **対象**: Austin で運行する Tesla の Robotaxi（2026 年式 Model Y・ADS を搭載・安全監視員が同乗する運用）。
- **対象のデータ**: Austin の Robotaxi のテスト期間（2025-07〜2026-03）の、ADS が関わる固有の事故 17 件。
- **確認されたこと**: 17 件のうち 2 件は、自律システムではなく、車を遠隔で操作していた人間の運転手が起こした。1 件（2025-07）は、ADS が停止し安全監視員が遠隔支援を呼んだ後、遠隔運転手が縁石に乗り上げ、金属のフェンスに約 8mph で接触した（このデータで唯一の負傷。入院には至らない軽傷）。もう 1 件（2026-01）は、遠隔運転手が仮設のバリケードに約 9mph で接触した。
- **記録の提出**: Tesla は従来、事故の経緯の記述を全件「営業秘密（confidential business information）」として黒塗りにして NHTSA に提出していた。Waymo・Zoox などは読める記述を提出していた。
- **発生の頻度**: Electrek によれば、2026-02 時点で Austin の車両は約 80 万マイルを走行し、14 件の事故を NHTSA に報告した。約 5.7 万マイルに 1 件で、Tesla 自身のベンチマーク（人間は約 22.9 万マイルに 1 件の軽微な衝突）の約 4 倍とされた。

### 時系列

- **2025-07**: Austin で Robotaxi のテストが始まる。以後、ADS の事故が NHTSA に報告される。遠隔運転手がフェンスに接触する事故が起きる（軽傷 1 件・入院なし）。
- **2026-01**: 遠隔運転手が仮設のバリケードに約 9mph で接触する。
- **2026-02**: Austin の車両が約 80 万マイルを走行し、報告の累計が 14 件になる（約 5.7 万マイルに 1 件・Electrek）。
- **2026-05-15**: Tesla が事故の経緯の黒塗りを外して再提出する。17 件のうち 2 件が遠隔運転手によるものだったと、Electrek・TechCrunch が報じる。

> 遠隔運転手による 2 件・黒塗りでの提出の経緯は Electrek と TechCrunch の 2026-05-15 の報道に、走行距離と事故の頻度は Electrek の 2026-02-17 の報道に拠る。大半の事故は軽微で、他の運転手の側の要因とされ、Tesla の集計では自律システムの重大な過失は確認されていないと報じられている。本 Brief は過失の割合を断定せず、Tesla を責めるものではない。NHTSA の調査・評価は別に進んでいる。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Tesla**: 2026-05-15、事故の経緯の黒塗りを外し、Waymo・Zoox などと同じ水準の開示にそろえた。
- **NHTSA**: 自動運転の安全性の評価を続けている（FSD をめぐる調査は [Brief 043](https://lemma.frame00.com/ja/critical/briefs/043-tesla-fsd-self-reported-safety/)）。
- **業界の論点**: 自動運転の事故報告で、制御の帰属（ADS／遠隔の人間／安全監視員）と記録の真正性をどう外から照合するかが、規制と業界をまたぐ論点として挙がっている。遠隔操作を含む運用では、とくに制御の帰属の記録が論点になる。

## 6. Sources

- **Electrek**: "Tesla finally reveals what happened in 17 'Robotaxi' crashes"（2026-05-15、narrative 黒塗り解除・遠隔運転手起因 2 件・営業秘密指定の経緯） — <https://electrek.co/2026/05/15/tesla-unredacts-robotaxi-crash-narratives-nhtsa/>
- **TechCrunch**: "Tesla reveals two Robotaxi crashes involving teleoperators"（2026-05-15、遠隔操作起因の事故・NHTSA 提出記録） — <https://techcrunch.com/2026/05/15/tesla-reveals-two-robotaxi-crashes-involving-teleoperators/>
- **Electrek**: "Tesla 'Robotaxi' adds 5 more crashes in Austin in a month — 4x worse than humans"（2026-02-17、約 80 万マイル・14 件・約 5.7 万マイルに 1 件・人間比約 4 倍） — <https://electrek.co/2026/02/17/tesla-robotaxi-adds-5-more-crashes-austin-month-4x-worse-than-humans/>
- **NHTSA**: Standing General Order ADS Incident Reports（自動運転事故報告制度の一次データ） — <https://www.nhtsa.gov/laws-regulations/standing-general-order-crash-reporting>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
