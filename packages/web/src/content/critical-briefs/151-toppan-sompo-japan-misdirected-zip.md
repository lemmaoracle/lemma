---
brief_no: 151
title: "TOPPAN：手作業の送付で、損保ジャパンの契約者 177,426 名分のリストが別の保険会社向けの ZIP に紛れ込み、そのまま送られた(保険料控除証明書発行サービス) — 宛先と中身の対応を、送る前に確かめる層が無い"
title_en: "TOPPAN: During a manual send, a list of 177,426 Sompo Japan policyholders slipped into another insurer's ZIP and went out (insurance-premium deduction certificate service) — nothing checks that the contents match the recipient before the send"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: []
incident_date: 2026-09-01
published: 2026-10-14
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["065-hokkaido-hospital-hdd-disposal", "137-ssk-receipt-review-screen-display-proof", "149-revolut-italy-government-mailbox-disclosure-requests"]
status: published
version: "2.0"
og_lead_ja: "TOPPAN、損保ジャパン契約者 17.7 万名分のリストを別の保険会社へ誤送付"
og_lead_en: "TOPPAN sent 177,426 Sompo Japan policyholder records to another insurer"
layout: "report"
og_kicker_ja: "情報漏えい事例 · 人の操作ミス"
og_kicker_en: "DATA LEAK · HUMAN ERROR"
og_headline_ja: "別の保険会社向けの\nファイルに、契約者の\nリストが紛れ込んだ。\n<accent>177,426 名分</accent>"
og_headline_en: "A policyholder list slipped into a file for another insurer.\n<accent>177,426 people.</accent>"
key_figures:
  - value: "177,426"
    unit: "名"
    label: "誤送付された損保ジャパンの契約者（重複を含む可能性あり）。カナ氏名・証券番号など"
    tone: "alert"
  - value: "17:15"
    label: "誤送付の当日（2026-09-01）、受け取った保険会社が日本損害保険協会に照会した時刻"
  - value: "28"
    unit: "日"
    label: "誤送付から公表（09-29）まで"
glossary:
  - term: "保険料控除証明書発行サービス"
    desc: "損害保険各社の控除証明書をまとめて発行するサービス。TOPPAN が 14 社から運用を受託している。"
  - term: "ドラッグ＆ドロップ"
    desc: "マウスでファイルをつかんで別の場所に落とす操作。落とす先を誤ると、ファイルが意図しないフォルダや ZIP に入る。"
insight:
  slug: "contents-unchecked-before-send"
  label: "送る前に中身と宛先を照合しない"
  quote: "どの宛先にどの会社のデータを送るかを、作業者の操作と目だけが決めていて、送る前に中身と宛先を照合する仕組みは無かった。"
industries: ["finance"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "中身と宛先を照合できるまで送らない"
  - slug: "audit-trail"
    item: "どのファイルを、何と照合して送ったかを記録する"
attack_method: "human-error"
impact: "契約者 17.7 万名分を別の保険会社へ誤送付"
takeaway: "宛先と中身の対応を、送る前に確かめる手順が無かった。"
self_check: "取引先ごとのファイルの中身と宛先を、送る前に照合できるか。"
countries: ["jp"]
---

> **改訂（v2.0 / 2026-10-21）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。TOPPAN と損保ジャパンの発表を読み直し、事実に変更が無いことを確かめた。

## 1. TL;DR

TOPPAN は 2026 年 9 月 1 日、損害保険各社から受託する保険料控除証明書発行サービスの運用で、損保ジャパンの契約者 177,426 名分のリストを、別の損害保険会社 1 社に誤って送った。複数社分の ZIP ファイルが同じフォルダに並ぶなかで、ドラッグ＆ドロップの操作を誤り、損保ジャパン分が他社向けの ZIP に入った。TOPPAN は外部からの攻撃ではないと確認している。

送る前に、ZIP の中身は確かめ直されていなかった。どの宛先にどの会社のデータが入っているかは、作業者の操作と目だけが決めていた。

受け取った保険会社は同じ日のうちに混入に気づき、日本損害保険協会に照会した。ただしその時点で、リストはすでに社外に出ていた。効かなかったのは、宛先と中身の対応を、作業者の操作とは別に、送る前に確かめる層である。

## 2. 何が起きたか

- **業務**: 保険料控除証明書発行サービスの運用。損害保険会社 14 社が TOPPAN に運用を委託している（損保ジャパンの発表）。
- **誤送付したもの**: 損保ジャパンの契約者のうち、控除証明書のハガキが不要な契約者のリスト（CSV）。別の損害保険会社 1 社に送られた。
- **件数と項目**: 177,426 名（同じ契約者の重複を含む可能性があり、精査で減ることがある）。カナ氏名、保険料控除用の証券番号、業務 ID。漢字氏名・住所・生年月日・電話番号・メールアドレス・カード・口座・マイナンバーは含まない。
- **原因**: 手作業での誤操作と、確認の手順の不備。複数社分の ZIP が同じフォルダにある状態でドラッグ＆ドロップを行い、損保ジャパン分を他社向けの ZIP の中にコピーした。送る前に ZIP の中身を確かめ直していなかった（TOPPAN）。
- **送付先での扱い**: TOPPAN は、送付先で速やかに廃棄・完全削除され、第三者への流出は現時点で確認されていないとする。損保ジャパンは、送付先に連絡してデータの削除を確認したとし、二次流出や不正利用は現時点で確認されていないとする。
- **ほかの混入**: 今回の納入作業での混入はこの 1 件のみと、TOPPAN が確認した。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過</span></div>
<p class="rx-ex-cap">止めどころは ③。送る前に、ZIP の中身がその宛先の会社のものかを、作業者の操作とは別に確かめていれば、配信は止まった。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">TOPPAN</div><div class="no">1</div><b>社ごとのリストを ZIP にまとめ、同じフォルダに並べる</b><p>複数社分。</p></div>
<div class="rx-step crit"><div class="who">運用担当者</div><div class="no">2</div><b>ドラッグ＆ドロップを誤り、損保ジャパン分を他社向けの ZIP に入れる</b><p>2026-09-01。</p></div>
<div class="rx-step crit"><div class="who">運用担当者</div><div class="no">3</div><b>中身を確かめ直さないまま、ファイル転送で送る</b><p>他社向けとして配信。</p></div>
<div class="rx-step"><div class="who">送付先の保険会社</div><div class="no">4</div><b>混入に気づき、日本損害保険協会に照会する</b><p>同日 17:15。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2026-09-01**: 手作業での送信の際に誤送付。17 時 15 分、送付先の保険会社が他社の契約者情報の混入について日本損害保険協会に照会した。
- **2026-09-02**: 協会から TOPPAN に調査の要請があり、混入が分かった。TOPPAN はファイル転送サービスの配信を止めた。
- **2026-09-29**: TOPPAN と損保ジャパンが同じ日に公表。

> 事実は TOPPAN と損保ジャパンの発表（いずれも一次）に拠る。発生の経緯、原因、再発防止策は TOPPAN の発表にだけ書かれている。件数と項目は両社で一致している。削除と流出についての記述は、それぞれの会社の言葉のまま書き分けた。

### 公表後の対応

- **TOPPAN**: ファイルの添付を「ファイルを選択」に統一し、作業者とは別に確認者を置いて全工程を確認し、添付ファイルの容量とタイムスタンプを元データと照合する。恒久策として、送付の工程をシステム化する。
- **損保ジャパン**: 対象の契約者に、登録されたメールアドレス宛てに個別に案内し、未登録の契約者には封書を送る。TOPPAN に再発防止の徹底を求め、委託先の管理を強めるとした。

## 4. なぜ止まらなかったか

この事案の失敗は、外部からの攻撃でも、作業者ひとりの不注意だけでもない。どの宛先にどの会社のデータを送るかを、作業者の操作と目だけが決めていて、送る前に中身と宛先を照合する仕組みが無かった。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">証明は送る前に働き、検出は届いた側が気づいた後に働く。送ってしまえば、データは手を離れている。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回なし</b>送る前に、中身が宛先の会社のものかを照合する</div>
<div class="rx-zone gapz"><b>落差</b><span>177,426 名分は<br>すでに社外へ</span></div>
<div class="rx-zone det"><b>検出の層 · 受け手が気づいた</b>届いた側が混入に気づき、照会する</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>ZIP に混入する</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>確かめずに送る</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>受け手が気づく</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>配信を止める</b></div>
</div>
</figure>

検出は働いた。受け取った保険会社は同じ日のうちに気づき、協会に照会している。ただ、気づいたのは送った後で、「作業者がこの ZIP をこの宛先に送った」と「この ZIP の中身はこの宛先の会社のものである」は別々の事実なのに、前者だけで配信が通った。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[東京都住宅供給公社の宛名](https://lemma.frame00.com/ja/critical/briefs/134-tokyo-housing-supply-corp-label-misdirection/)（宛名と元の一覧のずれに、発送の前に作業者以外が気づけなかった）にも現れている。

## 5. 対策するには

**送る前に、中身が宛先のものかを、作業者の操作とは別に照合する。** 確認者を増やすだけでは、人の目に頼る点は変わらない。ファイルごとに「どの会社のデータか」を作る段階で記録し、送る直前に宛先と自動で照合して、合わないものは送らない。

### 注意したい業界・業務

- **業界 · 金融・FinTech**: 保険会社など、多くの契約者情報を扱い、帳票の作成や発送を外部に委託する組織。委託先では、複数社分のデータが同じ担当者の手元に並ぶ。
- **業務 · 配信・送付**: 取引先ごとに分けたファイルを、手作業で送る業務。ファイル名や置き場所を誤ると、別の会社のデータが混ざる。

### いまの対策で防げるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 作業者による送付前の確認 | 効かない | 送る前に ZIP の中身を確かめ直していなかった（TOPPAN）。 |
| 作業者とは別の確認者 | 一部 | 誤りに気づく機会は増えるが、人の目に頼る点は変わらない。 |
| 容量とタイムスタンプの照合 | 一部 | ZIP が丸ごと紛れ込む混入は捉えうるが、中身がその宛先のものかは直接は示さない。 |
| 送付工程のシステム化 | 一部 | 手作業は減るが、中身と宛先を照合する仕組みが無ければ、誤りの置き場所が変わるだけになる。 |

### 必要になるもの

1. **ファイルごとに、どの会社のデータかを作る段階で記録する。** ZIP の中のファイル一つひとつまで、持ち主の会社が分かるようにする。
2. **送る直前に、中身と宛先を自動で照合する。** 宛先ごとに受け取ってよい会社のデータを登録しておき、合わないファイルや、持ち主の分からないファイルを含む配信は止める。
3. **何を照合して送ったかを残す。** 照合の結果と送った内容を、作業者の操作の記録とは別に、後から第三者に示せる形、つまり証明として残す。

### 点検チェックリスト

取引先ごとのデータを送る業務について、組織で確かめる 3 項目

- 取引先ごとに分けたファイルを、同じ場所で同じ担当者が扱っていないか。
- 送る前に、中身が宛先の取引先のものかを、人の目とは別の手段で照合しているか。
- 委託先がこうした送付を行う場合、委託先の確認の手順を把握しているか。

注：宛先ごとに登録した範囲そのものが誤っていれば、誤った配信も通る。また、照合の仕組みを入れるまでの間は、確認者を置くなどの人の確認で補うことになる。

## 6. Sources

- **TOPPAN（一次・当事者の公表）**: 「当社受託『保険料控除証明書発行サービス』運用業務におけるデータ誤送付について」（2026-09-29） — <https://www.holdings.toppan.com/ja/info/toppan_info20260929.pdf>
- **損害保険ジャパン（一次・当事者の公表）**: 「『保険料控除証明書発行サービス』における業務委託先のデータ誤送付について」（2026-09-29） — <https://www.sompo-japan.co.jp/-/media/SJNK/files/news/2026/20260929_1.pdf?la=ja-JP>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
