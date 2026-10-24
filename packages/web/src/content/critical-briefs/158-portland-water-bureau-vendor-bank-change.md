---
brief_no: 158
title: "米ポートランド市：取引先を装う相手が、パスワード再設定のリンクで取引先登録に入り、工事代金を別の口座へ送らせた(米司法省ほか) — 新しい振込先を、取引先の登録済みの連絡先で照合してから払う層が無い"
title_en: "City of Portland: An impostor used a password-reset link to enter a contractor's supplier account and had a construction payment sent elsewhere (US DOJ and others) — Nothing checks a new bank account against the supplier's registered contact before paying"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2025-03-21
published: 2026-10-24
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering"]
status: published
version: "1.0"
og_lead_ja: "米ポートランド市、取引先を装う相手に振込先を変えられ浄水場の工事代金 670 万ドルが別口座へ"
og_lead_en: "City of Portland: a supplier's bank account was switched, and a $6.7M water-plant payment went elsewhere"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 振込先の変更"
og_kicker_en: "CYBERATTACK · BANK ACCOUNT CHANGE"
og_headline_ja: "取引先を装う相手に、\n振込先を書き換えられた。\n<accent>670 万ドルが別の口座へ</accent>"
og_headline_en: "Someone posing as a contractor\nswitched the bank account on file.\n<accent>$6.7M went elsewhere.</accent>"
summary_labels: ["何が起きたか", "なぜ通ったか", "欠けていた層"]
key_figures:
  - value: "670"
    unit: "万ドル"
    label: "取引先に払うはずだった浄水場の工事代金（約 10 億円）。取引先を装う相手が指定した口座へ送られた（米司法省）"
    tone: "alert"
  - value: "03-21 → 03-25"
    label: "市の送金から、受け手の銀行が不正の疑いを知らせるまで（市の宣誓供述を引いた報道）"
  - value: "全額"
    unit: "回収"
    label: "2025 年 8 月、連邦保安官局から市に返された（報道）"
glossary:
  - term: "SAP Ariba"
    desc: "取引先の登録情報や請求・支払いを管理するクラウドのサービス。ポートランド市は 2025 年 2 月に入れ、取引先に使うよう求めた。"
  - term: "パスワード再設定のリンク"
    desc: "ログインできなくなったときに送られる、パスワードを決め直すためのリンク。受け取った人が、そのアカウントに入れるようになる。"
  - term: "民事没収"
    desc: "犯罪で得た資金を、刑事の有罪を待たずに国が差し押さえ、被害者に返すための民事の手続き。"
insight:
  slug: "reset-link-to-requester"
  label: "再設定のリンクが依頼者へ届く"
  quote: "メールでの振込先の変更は、登録済みの連絡先への確認で止まった。次に送られた取引先登録のパスワード再設定のリンクは、依頼者の手に渡り、振込先はそこで書き換えられた。"
industries: ["public-sector"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "新しい振込先が取引先のものかを、払う前に照合する"
  - slug: "hold-unverified"
    item: "登録済みの連絡先で照合できない変更は有効にしない"
  - slug: "audit-trail"
    item: "誰が、何で照合して変更を通したかを残す"
attack_method: "impersonation"
impact: "浄水場の工事代金 670 万ドルが、取引先を装う相手の指定した口座へ送られた（のちに全額回収）"
takeaway: "取引先登録のパスワード再設定のリンクが依頼者に渡り、振込先が書き換えられた。新しい口座を、取引先の登録済みの連絡先で照合してから払う層が無かった。"
self_check: "取引先が振込先を変えたとき、その取引先の登録済みの連絡先で照合してから払っているか。"
countries: ["us"]
---

## 1. TL;DR

米オレゴン州のポートランド市は 2025 年 3 月、浄水場の建設を請け負う共同企業体に払うはずの 670 万ドル（約 10 億円）を、その社員を装う相手が指定した口座へ送った。相手は、取引先の登録を管理する SAP Ariba で、取引先の振込先を書き換えていた（米司法省、市の宣誓供述を引いた報道）。

最初にメールで振込先の変更を頼まれたとき、市は登録済みの連絡先に確認を送り、返事が無かったので変えなかった。ところが相手は次に、取引先登録のパスワード再設定のリンクを送り直すよう頼み、そのリンクは本人ではなく相手に届いた。そこからの書き換えは、取引先自身の正規の操作として見える。

3 月 25 日、受け手の銀行が不正の疑いを知らせ、市は支払いの停止を求めた。資金は受け手の口座に残っていて 4 月に差し押さえられ、のちに全額が市に返った。それでも 3 月 21 日の送金は通った。効かなかったのは、新しい振込先を、取引先の登録済みの連絡先で照合してから払う層である。

## 2. 何が起きたか

- **当事者**: 米オレゴン州ポートランド市。水道局が進める浄水場（Bull Run Filtration Project・総額約 21 億ドル）の建設を、MWH Constructors と Kiewit の共同企業体（MWH-Kiewit）が請け負っている。
- **装われた人**: MWH の提案担当の社員。市の取引先の台帳に、この社員が契約の窓口として載っていた（市の訴状を引いた報道）。市は、この社員が盗んだとは考えておらず、名前を使われたとみている。
- **被害**: 670 万ドルの工事代金が、相手が指定した口座へ送られた。2025 年 4 月 16 日、FBI がその口座に残っていた 674 万 8,680 ドルを差し押さえた（米司法省）。8 月、資金は連邦保安官局から市に返された（報道）。
- **受け手の口座**: ニューヨークの法律事務所の名義の、預り金の口座だった。市は一時この事務所を訴えたが、事務所も被害者だったとして取り下げた（報道）。
- **侵入の経路**: 相手が取引先のメールに入り込んでいたかは公表されていない。ENR は、フィッシングでメールが破られたことから始まった可能性が高いとみている（推測）。逮捕者は出ていない（2025 年 9 月時点）。

攻撃は次の連鎖で成立した（市の弁護士の宣誓供述を引いた ENR の報道に拠る）。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過の連鎖</span></div>
<p class="rx-ex-cap">止めどころは ③。リンクを送る先、または書き換えられた振込先を、取引先の登録済みの連絡先で照合していれば、④ の送金は起きない。① の確認は効いていた。</p>
<div class="rx-chain">
<div class="rx-step good"><div class="who">市</div><div class="no">1</div><b>メールでの振込先の変更の依頼を、登録済みの連絡先に確認する</b><p>2025 年 2 月。銀行の口座確認書が添えられていた。確認に返事が無く、市は変えなかった。</p></div>
<div class="rx-step crit"><div class="who">相手</div><div class="no">2</div><b>SAP Ariba で変えるよう案内され、再設定のリンクの送り直しを頼む</b><p>同じ宛先に見えるメールアドレスへ送るよう求めた。</p></div>
<div class="rx-step crit"><div class="who">相手</div><div class="no">3</div><b>リンクで取引先の登録に入り、新しい口座を加える</b><p>リンクは本人ではなく相手に届いた。</p></div>
<div class="rx-step crit"><div class="who">市</div><div class="no">4</div><b>登録どおりに 670 万ドルを送る</b><p>3 月 21 日。決済日は 3 月 25 日。</p></div>
<div class="rx-step good"><div class="who">銀行・市</div><div class="no">5</div><b>受け手の銀行が不正の疑いを知らせ、市が支払いの停止を求める</b><p>3 月 25 日。資金は受け手の口座に残っていた。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2025-02**: 市が SAP Ariba を入れ、取引先に使うよう求める。同じ月、MWH の社員を名乗るメールが、振込先の変更を頼む。市は登録済みの連絡先に確認を送り、返事が無いため変えない。続いて相手が再設定のリンクの送り直しを頼み、市が送る。
- **2025-03-21**: 市が 670 万ドルを送る。決済日は 3 月 25 日。
- **2025-03-24**: 相手が、振込先が誤っていたとして、別の口座への変更をメールで求める。ENR は、この差し替えが不正の警告のきっかけになったらしいとしている。
- **2025-03-25**: 受け手の銀行 Chase が、市の銀行 Wells Fargo に不正の疑いを知らせる。市の副コントローラーが、支払いの拒否・停止を指示する。
- **2025-04-02**: 相手が、支払いの状況を聞く電話を市にかけ始める（計 10 回）。
- **2025-04-04**: 水道局が、MWH の社員が装われていたことを確認する。
- **2025-04-16**: FBI が令状を得て、674 万 8,680 ドルを差し押さえる。
- **2025-05-23**: 米司法省（オレゴン地区連邦検事局）が、民事没収の訴えを起こしたと発表する。
- **2025-08**: 連邦保安官局が資金を市に返す。

> 2 月の依頼の経緯と 3 月 21 日〜25 日の動きは、市の弁護士の宣誓供述を引いた ENR の報道に拠る。宣誓供述そのものは確認できていない。2 月の書き換え（取引先を装う相手が支払いのシステムに入り、振込先を変えた）と差し押さえの金額・日付は、米司法省の発表（一次）に拠る。リンクが届いた宛先が、取引先に似せたアドレスだったかは公表されていない。米司法省は書き換えを 2 月とするが、ENR の経過では、リンクの送付と書き換えは 3 月 21 日の約 2 週間前で、3 月上旬だった可能性がある。

### 公表後の対応

- **ポートランド市**: 受け手の口座を持つ法律事務所をニューヨーク州の裁判所に訴え、資金が動かされないようにした。事務所が FBI の捜査に協力し、自らも被害者だったと示したため、訴えを取り下げた（報道）。市長は、地元と連邦の捜査機関の速い動きで、資金が「悪い手に渡る前に」止まったとする声明を出した（報道）。
- **米司法省**: 同様の被害に遭ったら、ためらわず捜査機関に知らせるよう呼びかけた。今回の回収は、市が知らせたから可能だったとした。

## 4. なぜ止まらなかったか

この事案の失敗は、メールの見分けでも、銀行の検知でもない。**取引先の振込先を書き換える操作が、取引先の登録済みの連絡先と照合されないまま有効になり、そのまま支払いに使われた**ことにある。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">ここでいう証明は、新しい振込先が本当にその取引先のものかを、払う前に取引先の登録済みの連絡先で照合し、記録に残すこと。検出は、送金のあとに不正の疑いに気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 無かった</b>新しい振込先を、払う前に取引先と照合する</div>
<div class="rx-zone gapz"><b>落差</b><span>670 万ドルが<br>別の口座へ</span></div>
<div class="rx-zone det"><b>検出の層 · 働いた</b>受け手の銀行が不正の疑いを知らせる</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>再設定のリンクが相手へ</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>振込先の書き換え</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>03-21 送金</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>03-25 銀行の通報</b></div>
</div>
</figure>

メールでの最初の依頼は登録済みの連絡先への確認で止まったが、再設定のリンクの送り先を照合したという記述は無く、そこを通った書き換えは取引先自身の操作と区別がつかない。資金が戻ったのは受け手の銀行の通報と差し押さえによるもので、送金そのものは通った。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[ポラリス HD・Booking.com](https://lemma.frame00.com/ja/critical/briefs/032-booking-payout-account-tampering/)（正規の管理画面で、ホテルの受取口座が書き換えられた）にも現れている。

## 5. 対策するには

**取引先の振込先の変更は、どの道から入っても、取引先の登録済みの連絡先で照合できたものだけを有効にする。** メールの依頼でも、取引先が自分でポータルから変えた場合でも、パスワードの再設定を経た場合でも同じにする。そうすれば、取引先を装う相手がログインまで手に入れても、それだけでは支払いの行き先は変わらない。検出の代わりではなく、検出の手前に置く層である。

### 注意したい業界・業務

- **業界 · 行政・公共**: 工事や委託の取引先が多く、支払いの額も大きい自治体・公共の事業者。取引先と窓口の名前は、入札や契約の公開情報から分かる。
- **業界 · 建設**: 大きな工事では、発注者や元請けから下請けへの支払いが続く。工事の中断や再開の時期も公になりやすい。
- **業務 · 振込先・口座の変更**: 取引先の振込先の変更と、取引先の登録へのログインの再設定。

### いまの対策で防げるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 登録済みの連絡先への確認 | 一部 | 効いた：メールでの振込先の変更の依頼は、確認に返事が無く変えなかった。効かなかった：再設定のリンクの送り先を照合したという記述は無く、リンクは相手に届いた。 |
| 取引先ポータルでの自己登録 | 効かない | 効かなかった：ログインを手に入れた相手の入力も取引先自身の操作に見え、振込先の書き換えが通った。 |
| 銀行の不正の検知 | 一部 | 効いた：送金の 4 日後に受け手の銀行が不正の疑いを知らせ、差し押さえを経て資金は戻った。効かなかった：送金そのものは止めていない。 |
| 職員の教育 | 一部 | 効いた：最初のメールの依頼は見抜いた。効かなかった：再設定のリンクという別の道は防げなかった。 |

### 必要になるもの

1. **振込先の変更とログインの再設定を、同じ照合にかける。** どちらも、取引先の登録済みの連絡先で照合できたときだけ有効にする。依頼者が示した宛先には送らない。
2. **新しい振込先が取引先のものかを、払う前に照合する。** 口座の名義と取引先が合うかを、支払いの前に見る。
3. **誰が、何で照合して変更を通したかを残す。** 支払いの前にその記録を見て、記録の伴う振込先にだけ払う。記録は後から第三者に示せる形、つまり証明として残す。

### 点検チェックリスト

取引先の振込先について、組織で確認する 3 項目

- 取引先の登録へのログインの再設定を、登録済みの連絡先以外へ送れる手順になっていないか。
- 振込先が変わった直後の支払いを、照合が済むまで保留にしているか。
- 振込先の変更を、取引先の名前で届いたメールの中にある連絡先ではなく、登録済みの連絡先で確認しているか。

注：取引先の登録済みの連絡先そのものが乗っ取られている場合は、この照合を通りうる。また、照合は振込先の行き先を守るもので、取引先を装う相手が請求の中身を偽ることは別に防ぐ必要がある。

## 6. Sources

- **米司法省 オレゴン地区連邦検事局（一次）**: "United States Files Forfeiture Action to Recover $6.7 Million in Stolen Funds"（2025-05-23） — <https://www.justice.gov/usao-or/pr/united-states-files-forfeiture-action-recover-67-million-stolen-funds>
- **ENR（報道・市の弁護士の宣誓供述を引用）**: "How Portland, Ore., Recovered a Stolen $6.7M Payment Meant for MWH-Kiewit"（2025-09-19） — <https://www.enr.com/articles/61379-how-portland-ore-recovered-a-stolen-67m-payment-meant-for-mwh-kiewit>
- **Willamette Week（報道・市の訴状を引用）**: "Feds Investigate $6.7 Million in Stolen Vendor Payments From Bull Run Filtration Project"（2025-04-23） — <https://www.wweek.com/news/city/2025/04/23/feds-investigating-67-million-in-allegedly-stolen-vendor-payments-from-bull-run-filtration-project/>
- **Willamette Week（報道）**: "City Recovers $6.7 Million From Scam That Targeted the Water Bureau"（2025-08-29） — <https://www.wweek.com/news/city/2025/08/29/city-recovers-67-million-from-scam-that-targeted-the-water-bureau/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
