---
brief_no: 202
title: "MetaMask Staking：報酬の受取先を一元で保管するインフラに不正アクセスがあり、一部のバリデーターの受取先が書き換えられた(MetaMask の公表)"
title_en: "MetaMask Staking: Unauthorised access to infrastructure that centrally stored reward recipient addresses led to some validators' recipients being altered (MetaMask disclosure)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth]
incident_date: 2026-09-28
published: 2026-11-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering", "175-storm-2657-university-payroll-diversion", "196-bithumb-event-reward-btc-payout-error"]
status: draft
version: "1.0"
og_lead_ja: "MetaMask Staking で、報酬の受取先を保管するインフラに不正アクセスがあり、一部のバリデーターの受取先が書き換えられて約 0.385 ETH の報酬が流れた"
og_lead_en: "At MetaMask Staking, unauthorised access to the infrastructure storing reward recipient addresses let an attacker alter some validators' recipients and divert about 0.385 ETH"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · 受取先の書き換え"
og_kicker_en: "CYBERATTACK · PAYOUT REDIRECT"
og_headline_ja: "報酬の受取先が、\n保管先への不正アクセスで\n書き換えられた。\n<accent>約 0.385 ETH</accent>"
og_headline_en: "Reward payout addresses\nwere altered after a breach\nof where they were stored.\n<accent>About 0.385 ETH diverted.</accent>"
key_figures:
  - value: "約 0.385"
    unit: "ETH"
    label: "受取先の書き換えで流れた報酬（実行層の報酬・顧客がステーキングに預けた ETH とは別・MetaMask の公表）"
    tone: "alert"
  - value: "09-28 → 11-05"
    label: "MetaMask が事案を把握してから、受取先の書き換えを公表するまで（2026 年・MetaMask の公表）"
  - value: "約 523,000"
    unit: "ETH"
    label: "予防のために退出を始めたバリデーター約 17,000 の預かり（研究者の推計・MetaMask は確認していない・Decrypt）"
glossary:
  - term: "バリデーター"
    desc: "イーサリアムで、預かった ETH を担保に取引の承認に加わり、報酬を受け取る仕組み。MetaMask Staking は、顧客やパートナーのためにバリデーターを運営する。"
  - term: "報酬の受取先"
    desc: "バリデーターが取引の承認で得る報酬（実行層の報酬）を受け取るアドレス。バリデーターの運営者が設定し、預けた ETH を引き出す鍵とは別に管理される。"
insight:
  slug: "payout-recipient-taken-from-central-store"
  stop: true
  label: "保管先の値がそのまま受取先になる"
  quote: "報酬の受取先を変更する前に、新しい受取先を、一元の保管先の値ではなく、顧客が指定した受取先の記録で照合する。"
industries: ["finance"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "報酬の受取先の変更は、顧客が指定し署名した受取先の記録と合うときだけ反映する"
  - slug: "hold-unverified"
    item: "顧客の記録と結びつかない受取先の変更は、支払いに使う前に保留し、変更した人とは別の人が確かめる"
  - slug: "audit-trail"
    item: "誰がいつ、どの受取先に変え、誰が承認したかを、受取先の保管先とは別に残す"
impact: "一部のバリデーターの報酬の受取先が書き換えられ、約 0.385 ETH の報酬が流れた。予防のため、影響のあるバリデーターをすべて退出させた（MetaMask の公表）"
takeaway: "報酬の受取先を一元で保管するインフラに不正アクセスがあり、書き換えられた受取先がそのまま支払いに使われた。受取先の変更は、顧客が指定した記録と照合してから反映する。"
self_check: "支払いの受取先を変更する前に、新しい受取先を、保管先の値とは別の、顧客が指定した記録で照合する仕組みがあるかを把握しているか。"
countries: ["us"]
---

## 1. 要点

2026 年 9 月 28 日、MetaMask は、インフラの一部への不正アクセスを把握した。MetaMask Staking が運営する一部のバリデーターで、報酬（実行層の報酬）の受取先のアドレスが短時間書き換えられ、約 0.385 ETH の報酬が流れた（MetaMask の公表）。受取先は、不正アクセスを受けたインフラに一元で保管されていた。

MetaMask は書き換えを同じ日に見つけて直し、予防のため、影響のあるバリデーターをすべて退出させた。顧客がステーキングに預けた ETH（元本）と、それを引き出す鍵が侵害された証拠は無く、ウォレットも影響を受けていないとしている。不正アクセスの経路は公表されていない。研究者は、退出したバリデーターを約 17,000、預かりを約 523,000 ETH と推計している（Decrypt）。

<strong>受取先を一元で保管する場所の値がそのまま使われる仕組みでは、そこで書き換えられた受取先も、正しい受取先として支払いに使われる。</strong>

## 2. 通った操作

- **通った操作**: バリデーターの報酬の受取先の変更と、その受取先への報酬の支払い。MetaMask によれば、攻撃者は、受取先を一元で保管するインフラへの不正アクセスのあと、一部のバリデーターの実行層の報酬の受取先を短時間書き換え、約 0.385 ETH の報酬が流れた。書き換えは同じ日に見つけられ、直された。
- **受け付けた側に届くもの**: 一般に、バリデーターは、運営者が設定した受取先をそのまま報酬の支払いに使う。その受取先が、ステーキングを委ねた顧客の指定したものかは、設定の値には含まれない。研究者の解析によれば、報酬を得た 19 のバリデーターのうち 18 で、報酬が本来の受取先ではない別のアドレスに支払われ、計約 0.36 ETH だった（Decrypt）。
- **公表されていないこと**: 不正アクセスの経路と、誰が行ったか。受取先が書き換えられた日時と、影響を受けたバリデーターの数。退出させたバリデーターの数と、預かりの総額（研究者の推計だけがある）。受取先の保管先に誰が書き込めたか、変更に承認の手順があったか。流れた報酬や逃した報酬の補償の中身。

## 3. 実行前の照合

経路を問わず区別できる条件は、報酬の受取先を変更する前に、新しい受取先を、ステーキングを委ねた顧客が指定した受取先の記録で照合することである。保管先に書かれた値かどうかではなく、顧客の指定と結びつくかを見る。

- **誰が承認を出すか**: ステーキングを委ねた顧客（機関やパートナー）。報酬の受取先を顧客の鍵で署名して指定し、変更するときも、顧客の署名した指定で出す。運営者の保管先に書き込めるだけでは、この指定は作れない。
- **どこで照合するか**: 受取先の設定をバリデーターに反映する手順（報酬の支払いに使われる前）。顧客の指定と合わない受取先は、反映の前に保留する。保管先そのものの値も、反映のたびに顧客の指定と突き合わせる。
- **何が残るか**: 誰がいつ、どのバリデーターの受取先をどこに変え、どの顧客の指定に基づくかの記録。顧客への説明や補償で、どの変更が指定と食い違ったかを示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝報酬の受取先を変更する前に、新しい受取先を顧客が指定した記録で照合し、記録に残すこと。検知＝書き換えに気づいて直し、バリデーターを退出させること。日付は MetaMask と Lido の公表に拠る。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>新しい受取先を、顧客が指定した記録で照合してから反映する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>一部のバリデーターの受取先が書き換えられた<br>約 0.385 ETH の報酬が流れた</span></div>
<div class="rx-zone det"><b>検知 · 同じ日に働いた</b>書き換えに気づいて直し、影響のあるバリデーターを退出させる</div>
<div class="rx-g g1"><div class="t">09-28</div><b>MetaMask がインフラの一部への不正アクセスを把握する</b></div>
<div class="rx-g g2"><div class="t">09-30</div><b>MetaMask と Lido が公表し、バリデーターの退出が始まる</b></div>
<div class="rx-g g3"><div class="t">10-07</div><b>Lido の見込みで、最後のバリデーターが退出する</b></div>
<div class="rx-g g4"><div class="t">11-05</div><b>MetaMask が受取先の書き換えと約 0.385 ETH を公表する</b></div>
</div>
</figure>

検知は同じ日に働き、流れた報酬は約 0.385 ETH にとどまった。それでも、書き換えられた受取先は支払いに使われ、運営者は預かりのバリデーターをすべて退出させることになった。正規の管理画面で受取口座が書き換えられた事案に [ポラリスHD・Booking.com](https://lemma.frame00.com/ja/critical/briefs/032-booking-payout-account-tampering/)、乗っ取られた職員のアカウントで給与の振込先が書き換えられた事案に [Storm-2657](https://lemma.frame00.com/ja/critical/briefs/175-storm-2657-university-payroll-diversion/)、社内の入力がそのまま付与として記帳された事案に [Bithumb](https://lemma.frame00.com/ja/critical/briefs/196-bithumb-event-reward-btc-payout-error/) がある。今回は、受取先を一元で保管する場所そのものが書き換えられた。

## 4. Lemma でできること

**Lemma は、実行前の照合を、報酬の受取先の変更をバリデーターに反映する側に組み込む。** 不正アクセスを見つけるのではなく、新しい受取先が顧客の指定と結びつくかを、支払いに使われる前に照合する。

### 注意したい業界・業務

- **業界 · 金融**: ステーキングの運営、資産の預かり、決済の代行など、顧客に代わって支払いや報酬の受取先を設定し、その値を一か所に保管して多数の口座やノードに配る事業者。
- **業務 · 振込先・口座の変更**: 報酬・配当・売上金の受取先の登録と変更。
- **業務 · アカウント・権限の管理**: 受取先の保管先に書き込めるアカウントと経路の管理。

### いまの対策と Lemma の違い

今回の経路は 1 列目（受取先の保管先への不正アクセスによる書き換え）である。2 列目は、権限のある社内の担当者が受取先を変える場合、3 列目は、顧客を装う相手から受取先の変更の依頼が届く場合で、今回そうだったという公表は無い。

| 対策 | 保管先への不正アクセスによる書き換え | 権限のある担当者による変更 | 顧客を装う変更の依頼 |
| --- | --- | --- | --- |
| 保管先へのアクセス制御と多要素認証 | 一部 | 効かない | 効かない |
| 受取先の変更の二人承認 | 一部 | 一部 | 効かない |
| 支払い先の監視と検知 | 一部 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く | 一部 |

アクセス制御と多要素認証は、保管先への入口を守るが、入口を越えられたあとの書き換えは止めない。二人承認は、承認の手順を通る変更には働くが、保管先の値が直接書き換えられれば通らずに済む経路がありうる。監視と検知は、書き換えられた受取先に支払いが起きてから気づくもので、今回も同じ日に気づいたが、その間に報酬が流れた。Lemma は、保管先の値や承認者の目ではなく、新しい受取先が顧客の署名した指定と合うかを、反映の前に照合する。

注：Lemma の照合が働くのは、受取先をバリデーターに反映する手順に照合を組み込み、顧客の指定を運営者の保管先とは別の場所に、顧客の鍵で署名して残す場合に限る。顧客の鍵そのものが奪われ、偽の指定が署名された場合は通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではなく、流れた報酬を取り戻すものでもない。

### 点検チェックリスト

報酬や支払いの受取先を一か所で管理する仕組みについて、組織で確認する 3 項目

- 実際に支払われた先を、登録した受取先と自動で突き合わせ、食い違いにすぐ気づけるか。
- 受取先の保管先に書き込めるアカウントと経路を一覧にし、必要な分だけに絞っているか。
- 誰がいつ、どの受取先に変え、誰が承認したかを、受取先の保管先とは別に記録しているか。

## 5. 事実と時系列

- **当事者**: MetaMask を提供する Consensys Software Inc.（MetaMask の名で事業を行う・米国テキサス州）。事案の起きたのは、顧客やパートナーのためにイーサリアムのバリデーターを運営する MetaMask Staking で、Lido のフォーラムでは「MetaMask Staking（旧 Consensys Staking）」と表記されている。MetaMask Staking は、Lido のノード運営者の一つでもある。
- **起きたこと**: MetaMask によれば、9 月 28 日、インフラの一部への不正アクセスを把握した。事案の中で、攻撃者は、受取先のアドレスを一元で保管するインフラへの不正アクセスのあと、一部のバリデーターの実行層の報酬の受取先を短時間書き換えた。書き換えは同じ日に見つけられて直され、約 0.385 ETH の報酬が流れた。この報酬は、顧客がステーキングに預けた ETH とは別である。研究者 Kaden の解析では、報酬を得た 19 のバリデーターのうち 18 で別のアドレスに支払われ、計約 0.36 ETH だった（Decrypt）。
- **気づいた経緯**: MetaMask は、受取先の書き換えを同じ日に見つけたとしているが、その日付と、どう気づいたかは記していない。9 月 30 日の最初の公表では、受取先の書き換えには触れず、インフラの一部に影響する事案に対応しているとだけ述べた。不正アクセスの経路は、11 月 5 日の更新でも記されていない。
- **影響と対応**: MetaMask は、予防のため、影響のあるバリデーターの退出を顧客・パートナーと調整して始め、11 月 5 日にすべて退出したとした。顧客の元本や引き出しの鍵が侵害された証拠は無く、引き出しの鍵は顧客に代わって管理していないとした。ウォレットとその基盤が侵害された兆候は無く、利用者の復元フレーズと秘密鍵も侵害されていないとした。退出によって、一部の顧客で引き出しが一時遅れ、一部は報酬を逃した可能性がある。研究者 Kaden は、退出したバリデーターを約 17,000、預かりを約 523,000 ETH と推計し、MetaMask はこの数字を確認していない（Decrypt）。

### 時系列

- **2026-09-28**: MetaMask がインフラの一部への不正アクセスを把握する。
- **2026-09-30**: MetaMask が事案を公表し、影響のあるバリデーターの退出を始める。Lido が、MetaMask Staking のバリデーターの予防の退出を公表する。
- **2026-10-01**: MetaMask が、ウォレットや顧客の資金に影響した兆候は無いと更新する。研究者の推計（約 17,000 のバリデーター・約 523,000 ETH・約 0.36 ETH）が報じられる（Decrypt）。
- **2026-10-07**: Lido の見込みで、最後のバリデーターが退出する（引き出しが終わるのはその後）。
- **2026-10-23**: Lido のガバナンスで、MetaMask Staking の目標の上限を 0 にし、新しい預かりを割り当てない提案が実行される。
- **2026-11-05**: MetaMask が、受取先の書き換えと約 0.385 ETH の流出、影響のあるバリデーターがすべて退出したことを公表する。

> 本件の事実は、MetaMask の公表（9 月 30 日・10 月 1 日・11 月 5 日の更新を 1 ページにまとめたもの）と Lido のフォーラムの公表（いずれも一次）、報道（Decrypt）に拠る。流れた報酬は、MetaMask は約 0.385 ETH、研究者の解析は約 0.36 ETH としている。退出したバリデーターの数と預かりの額は研究者の推計で、MetaMask は確認していない。受取先が書き換えられた日時、影響を受けたバリデーターの数、不正アクセスの経路と誰が行ったかは公表されていない。研究者の X の投稿は開けず、内容は Decrypt の記事に拠る。公表されていないことは、対策が無かったことを意味しない。本 Brief は、MetaMask と Lido の対応を評価するものではない。11 月 12 日時点の記述。

### 公表後の対応

- **MetaMask**: 外部のセキュリティの専門家と、不正アクセスを封じ込め、影響のあるシステムを保護したとした。影響のある顧客・パートナーと直接やり取りし、残る影響に対応しているとした。ウォレットの利用者は何もする必要が無く、ステーキングの顧客は MetaMask かステーキングの提供者の案内に従うよう呼びかけ、求めていない連絡に注意し、MetaMask が復元フレーズを尋ねることは無いとした。
- **Lido**: stETH の保有者は何もする必要が無いとし、退出して再びステーキングに入るまでには、入りの順番待ちが長いため最大約 45 日かかりうること、報酬を逃し、停止の罰則を受けうることを示した。6,750 stETH を超える準備の資金があるとした。10 月 23 日、ガバナンスで MetaMask Staking の目標の上限を 0 にし、新しい預かりを割り当てない提案が実行された。

## 6. Sources

- **MetaMask（一次・当事者の公表）**: "MetaMask user update on recent security incident"（2026-11-05・9 月 30 日と 10 月 1 日の更新を含む） — <https://metamask.com/news/user-update>
- **Lido（一次・パートナーの公表）**: "[Security Disclosure] MetaMask Staking Precautionary Out of Order Exits"（2026-09-30・10 月 23 日までの返信を含む） — <https://research.lido.fi/t/security-disclosure-metamask-staking-precautionary-out-of-order-exits/11961>
- **MetaMask（一次・利用規約）**: "Terms of Use"（運営する会社と所在地） — <https://metamask.com/terms-of-use>
- **Decrypt（報道）**: "MetaMask Exits Lido Validators Amid Infrastructure 'Security Incident'"（2026-10-01） — <https://decrypt.co/379800/metamask-exits-lido-validators-amid-infrastructure-security-incident>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
