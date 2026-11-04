---
brief_no: 180
title: "Ibermutua：会社向けの週 1 回の通知メールに、他社の従業員の休業のデータが積み重なって届いた(スペイン AEPD の制裁)"
title_en: "Ibermutua: Weekly notification emails to employers carried other companies' employees' sick-leave data, piled up in the attachments (Spain AEPD sanction)"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: []
incident_date: 2024-07-15
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["151-toppan-sompo-japan-misdirected-zip", "134-tokyo-housing-supply-corp-label-misdirection", "156-asos-employee-impersonation-rogue-push"]
status: draft
version: "1.0"
og_lead_ja: "スペイン AEPD、Ibermutua に制裁。週 1 回の通知の添付に、他社の従業員の休業のデータが積み重なった"
og_lead_en: "Spain's AEPD sanctions Ibermutua after weekly employer emails carried other firms' staff sick-leave data"
layout: "report"
sections: "proof"
gate: "delivery"
og_kicker_ja: "情報漏えい事例 · 配信の誤り"
og_kicker_en: "DATA LEAK · MISDELIVERY"
og_headline_ja: "週 1 回の通知に、\n他社の分が積み重なった。\n<accent>3,395 人分</accent>"
og_headline_en: "A weekly report piled up\nother firms' staff data.\n<accent>3,395 people</accent>"
key_figures:
  - value: "3,395"
    unit: "人"
    label: "データが他の会社などに届いた人（AEPD の決定に引かれた Ibermutua の説明）"
    tone: "alert"
  - value: "354"
    unit: "の宛先"
    label: "データが届いた会社・アセソリア（労務の事務所）"
  - value: "60"
    unit: "万ユーロ"
    label: "制裁金（提案の 100 万ユーロから、責任を認めた分と早く払った分で 4 割減）"
glossary:
  - term: "Mutua（社会保障の協力共済）"
    desc: "スペインで、労災や職業病などの給付を社会保障に協力して扱う共済。会社が加入し、従業員の給付の手続きを任せる。"
  - term: "AEPD"
    desc: "スペインのデータ保護当局。GDPR に基づき、苦情を調べて制裁の手続きを開き、制裁金や措置の命令を出す。"
  - term: "コメントアウト"
    desc: "プログラムの 1 行を注釈の扱いにして、実行されないようにすること。消したのと同じ働きになる。"
insight:
  slug: "content-assembled-not-matched"
  stop: true
  label: "組み立てた中身を宛先と照合しない"
  quote: "通知を送る前に、添付の中の一人ひとりが宛先の会社に属するかを、組み立てた処理ではなく預かる側の加入の記録で照合する。"
industries: ["finance", "healthcare"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "添付の中の一人ひとりが宛先の会社に属すると照合できるまで、配信を止める"
  - slug: "minimize-data"
    item: "定期の通知に載せる項目を、受け取る会社の手続きに要る分に絞る"
  - slug: "audit-trail"
    item: "配信ごとに、どの宛先に、誰の分を、何と照合して送ったかを記録する"
attack_method: "human-error"
impact: "他社の従業員 3,395 人分の休業・給付のデータが、354 の宛先に届いた"
takeaway: "宛先が正しくても、中身を組み立てる処理が変わると、他社の分が届く。添付の一人ひとりが宛先の会社に属するかを、送る前に照合する。"
self_check: "定期の配信で、添付の中の一人ひとりが宛先の会社に属するかを、送る前に照合しているか。"
countries: ["es"]
search_title: "Ibermutua の休業データ誤送信：AEPD 制裁の経緯"
search_description: "スペインの労災共済 Ibermutua の週1回の通知で、他社の従業員3,395人分の休業のデータが354の宛先に届いた（AEPD の制裁・60万ユーロ）。何が起きたか、送る前に照合する点を整理。"
---

## 1. 要点

送る人が宛先を取り違えたのではない。会社向けのポータルは、週 1 回の通知を自動で送る。処理の変更の際に、コードの 1 行がコメントアウト（注釈の扱いにして実行されないように）された。添付の Excel は、通知ごとにリセットされなくなった。その日の配信で先に作られた他社向けの Excel が、後の通知に次々と加わった（AEPD の決定に引かれた Ibermutua の説明）。宛先は、それぞれの会社が設定したアドレスだった。<strong>宛先が正しくても、中身を組み立てる処理が変われば、他社の分は同じ配信に乗って届く。</strong>

## 2. 通った操作

- **通った操作**: 通知の仕組み（Ibermutua の言う「notificador」）が、利用する会社の設定どおりに Excel を作り、設定されたアドレスへ送る、いつもの定期配信。変更で添付のリセットの 1 行が実行されなくなり、各通知に、その日の同じ配信で先に作られた他社向けの Excel が加わった（AEPD の決定に引かれた Ibermutua の説明）。
- **受け付けた側に届くもの**: 一般に、受け取る会社には、登録した宛先に、いつもの差出人から、いつもの形の通知として届く。添付が自社の従業員の分だけかは、開いて中を見るまで分からない。
- **気づいた経路**: 2024-07-15、利用する会社の 1 社が、週 1 回の通知に自社以外の人のデータが入っていると Ibermutua に知らせた（同上）。
- **公表されていないこと**: 変更がいつ入ったか、何回の配信に及んだか、変更の前にどんな試験をしていたか。

## 3. 何を照合するか

経路を問わず区別できる条件は、添付の中の一人ひとりが宛先の会社に属するかを、組み立てた処理とは別に、送る前に照合することである。

- **誰が承認を出すか**: データを預かる側（今回は Ibermutua）。どの会社がどの従業員のデータを受け取ってよいかを、加入と給付の記録から登録しておく。処理のコードの側では決めない。
- **どこで照合するか**: 通知を送る直前。添付ごとに、中に入った人の所属の会社が宛先の会社と合うかを照合する。合わない人や所属の分からない人を含む通知は止める。AEPD も、命じた措置の例に、データに載る人と知ってよい会社とを結び付ける仕組みを挙げている。
- **何が残るか**: 配信ごとに、どの宛先に、誰の分を、何と照合して送ったかの記録。処理を変えた後に、変更の前と結果を比べられる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝通知を送る前に、添付の中の一人ひとりが宛先の会社に属するかを照合し、記録に残すこと。検知＝届いた会社が気づいて知らせるなど、送った後に分かること。下の日付は、AEPD の決定に書かれた日である。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>送る前に、添付の中の人が宛先の会社に属するかを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>354 の宛先へ<br>3,395 人分の休業・給付のデータ</span></div>
<div class="rx-zone det"><b>検知 · 受け手が知らせた</b>届いた会社が、他社の人のデータに気づいて知らせる</div>
<div class="rx-g g1"><div class="t">変更</div><b>通知の処理の 1 行がコメントアウトされる</b></div>
<div class="rx-g g2"><div class="t">2024-07-15</div><b>利用する会社が Ibermutua に知らせる</b></div>
<div class="rx-g g3"><div class="t">2024-07-17</div><b>Ibermutua が AEPD に届け出る</b></div>
<div class="rx-g g4"><div class="t">2024-09-06</div><b>354 の宛先の削除の確認を終える</b></div>
</div>
</figure>

検知は働いた。届いた会社が気づいて知らせ、Ibermutua は 2 日後に AEPD に届け出ている。ただ、気づいたのは届いた後だった。中身と宛先のずれが送った後に分かった事案に、手作業の送付で他社向けの ZIP に契約者のリストが入った [TOPPAN](https://lemma.frame00.com/ja/critical/briefs/151-toppan-sompo-japan-misdirected-zip/)、一覧から宛名を作る段で取り違えた[東京都住宅供給公社の宛名](https://lemma.frame00.com/ja/critical/briefs/134-tokyo-housing-supply-corp-label-misdirection/)がある。正規の通知の仕組みから、承認していない中身が出た事案に [ASOS](https://lemma.frame00.com/ja/critical/briefs/156-asos-employee-impersonation-rogue-push/) がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、通知を送る仕組みに組み込む。** 侵入やコードの誤りを見つけるのではなく、組み立て終えた添付の中の一人ひとりが宛先の会社に属するかを、送る直前に、処理のコードとは別に照合する。

### 注意したい業界・業務

- **業界 · 金融・FinTech**: 保険・共済など、加入した会社の従業員の給付を扱い、会社ごとの報告を定期に送る組織。1 つの配信の処理で、多くの会社の分を続けて作る。
- **業界 · 医療・ヘルスケア**: 休業・病気・事故など、健康に関わるデータを会社や関係者に知らせる業務を持つ組織。届いた先が違えば、特別な種類のデータが外に出る。
- **業務 · 配信・送付**: 宛先ごとに中身を自動で組み立てて送る、定期の通知やレポート。処理を変えると、宛先は変わらないまま中身だけが変わりうる。

### いまの対策と Lemma の違い

今回の経路は 1 列目（変更した処理での定期配信）である。2 列目は、宛先のアドレスの登録や変更を誤る場合で、今回の経路ではない。

| 対策 | 変更した処理での定期配信 | 宛先のアドレスの登録・変更 |
| --- | --- | --- |
| 変更ごとの網羅的な試験（Ibermutua の事後の対策） | 一部 | 関係しない |
| 1 通に複数の添付を許さない（同） | 一部 | 関係しない |
| 添付の ID と宛先の利用者の照合（同） | 一部 | 関係しない |
| 20 件の見本での送る前の試験（同） | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 一部 |

4 つは、いずれも Ibermutua が判明の後に入れたと AEPD に説明した対策である。変更ごとの試験と見本での試験は、誤りに気づく機会を増やすが、試した範囲の外の誤りは通る。複数の添付を許さない制限と、添付の ID の照合は、今回のように他社向けのファイルが丸ごと加わる形は捉えるが、1 つのファイルの中に他社の人の行が混ざる形は捉えない。Lemma は、添付の中の一人ひとりの所属の会社を、宛先の会社と照合する。宛先のアドレスそのものを誤って登録した場合は、会社と中身は合っているので、登録の変更を誰が承認したかを照合できる範囲でしか働かない。

注：Lemma の照合が働くのは、通知を送る仕組みに組み込み、受け取ってよい会社と人の対応を、処理のコードとは別に預かる側で登録している場合に限る。登録した対応そのものが誤っていれば、誤った配信も通る。Lemma はデータを消さず、届いた先から回収もしない。通知に載せる項目を絞るのは、データを預かる組織の仕事である（AEPD は制裁金の算定で、一人あたりに送られたデータの量も考慮した）。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

宛先ごとに中身を組み立てる定期の配信について、組織で確認する 3 項目

- 配信の処理を変えたとき、変更の前と後で、宛先ごとの添付の数と中身の人数を比べているか。
- 定期の通知に載せる項目が、受け取る会社の手続きに要る分に絞られているか。
- 健康に関わるデータを送る配信で、どの宛先に誰の分を送ったかを、配信ごとに記録しているか。

## 5. 事実と時系列

- **組織**: Ibermutua（社会保障の協力共済 274 番）。加入した会社と労務の事務所（アセソリア）の従業員の給付を扱い、ポータル「Ibermutua Digital Empresas/Asesorías」を提供する（AEPD）。
- **配信**: 利用する会社は、自社の従業員の給付の状況を、週 1 回などの設定でメールで受け取れる。通知の仕組みが Excel を作り、設定されたアドレスに添付して送る。通知は月に平均 25 万通（AEPD に引かれた Ibermutua の説明）。
- **原因**: 通知の仕組みの変更の際、添付の Excel を通知ごとにリセットする 1 行がコメントアウトされ、実行されなかった。各通知に、同じ日の配信で先に作られた他の宛先向けの Excel が加わった。Ibermutua は、プログラミングでの人の誤りと説明している（AEPD）。
- **届いたデータ**: 3,395 人分が 354 の宛先（加入した会社と労務の事務所）に届いた。氏名、NIF/NIE、社会保障の番号、年齢、性別、勤め先、職業の分類、休業の有無と開始・終了の日、休業の日数と見込み、復帰の理由、給付の種類と算定の基礎、手続きの費用、通勤や交通の事故かどうか、など（AEPD に引かれた Ibermutua の説明）。
- **AEPD の認定**: AEPD は、病気や事故による休業についての健康のデータ（GDPR 9 条の特別な種類）が含まれ、一人あたりのデータの量も多いとした。判明の後の対策は、これだけの規模の配信には基本的な安全の措置にあたり、配信の誤りを防ぐか見つける仕組みを持つことが合理的だったとして、GDPR 5 条 1 項 f（完全性と機密性）の違反とした（AEPD）。
- **苦情**: 2024 年 8 月から 10 月にかけて、Ibermutua の DPD（データ保護の責任者）から知らせを受けた人が、AEPD に計 8 件の苦情を出した（AEPD）。

### 時系列

- **2024-07-15**: 利用する会社の 1 社が、週 1 回の通知に他社の人のデータが入っていると Ibermutua に知らせる。
- **2024-07-17**: Ibermutua が AEPD に漏えいを届け出る。
- **2024-08-01**: AEPD への苦情が始まる（09-06 までに 7 件、10-21 に 1 件）。
- **2024-09-06**: 354 の宛先からの削除の確認を終える（Ibermutua の説明）。
- **2025-02-03**: AEPD が制裁の手続きを開き、制裁金 100 万ユーロを示す。
- **2025-02-17**: Ibermutua が責任を認め、行政の不服申し立てをしないとして、60 万ユーロを払う。
- **その後**: AEPD が手続きの終了を決定し、違反の認定と措置の命令を確定させる。

> 本件の事実は、AEPD の決定（PS-00540-2024、手続きの番号 EXP202412881）に拠る。原因と対策の内容は、決定に引かれた Ibermutua の説明による。違反の認定は AEPD によるもの。Ibermutua は責任を認めて制裁金を払った。本 Brief は、それ以上に会社の対応を評価するものではない。決定そのものの日付は、決定の文書に書かれていない（支払いは 2025-02-17）。変更が入った日、及んだ配信の回数、届いた先での二次的な利用の有無は公表されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Ibermutua（判明の後の対策）**: 誤りを直し、変更ごとに網羅的な試験をする。1 通に複数の添付を許さず、見つけたら送信を止める。添付の ID が宛先の利用者のものかを送る前に照合し、合わなければ止める。配信の前に 20 件の見本で試す。354 の宛先に削除を求めて確認を取り、対象の人にメールか郵便で知らせた。今後、ダウンロードのリンクと記録の仕組みに移すとした（AEPD に引かれた説明）。
- **AEPD の命令**: 決定が確定してから 3 か月以内に、添付の数の制限、データに載る人と知ってよい会社とを結び付ける仕組み、送る前の試験などの措置を入れたことを AEPD に知らせるよう命じた。

## 6. Sources

- **スペイン データ保護庁（AEPD・一次・当局）**: "Resolución de terminación del procedimiento por reconocimiento de responsabilidad y pago voluntario"（PS-00540-2024・EXP202412881） — <https://www.aepd.es/documento/ps-00540-2024.pdf>
- **Economist & Jurist（報道）**: "Ibermutua, sancionada con 600.000 euros por filtrar datos personales de más de 3.000 personas por error"（2025-03-12） — <https://www.economistjurist.es/actualidad-juridica/ibermutua-sancionada-con-600-000-euros-por-filtrar-datos-personales-de-mas-de-3-000-personas-por-error/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
