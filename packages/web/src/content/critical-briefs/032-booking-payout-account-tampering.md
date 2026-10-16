---
brief_no: 32
title: "ポラリスHD・Booking.com：ホテルの売上金を受け取る口座が、正規の管理画面で第三者の口座に書き換えられ、約 900 万円が送金された（同社開示） — 振込先の変更を、お金が動く前に別の人が確かめる仕組みが無い"
title_en: "Polaris Holdings / Booking.com: the bank account that receives a hotel's sales was switched to a third party's inside the legitimate admin screen, and about ¥9 million was paid out (company disclosure) — nothing has someone else confirm a payout-account change before money moves"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance", "identity-auth"]
incident_date: 2026-05-23
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["149-revolut-italy-government-mailbox-disclosure-requests", "044-arcadia-speecan-raiden-disaster-mail-spoofing", "006-google-api-key-revocation-lag"]
version: "2.0"
status: published
og_lead_ja: "Booking.com でホテルの受取口座が書き換えられ約900万円 — ポラリスHD"
og_lead_en: "Booking.com payout account switched, ¥9M lost — Polaris Holdings"
layout: "report"
key_figures:
  - value: "約 900"
    unit: "万円"
    label: "1 ホテルで不正な口座へ送金された売上金（開示時点）"
    tone: "alert"
  - value: "複数"
    unit: "ホテル"
    label: "受取口座が書き換えられた。1 ホテル以外は送金前に停止"
  - value: "05-23 → 05-28"
    label: "異常の検知から開示まで 5 日"
glossary:
  - term: "エクストラネット"
    desc: "Booking.com がホテル向けに用意する管理サイト。"
  - term: "認証済みセッション"
    desc: "ログインが済んだ状態。この状態での操作は、システムには正規の操作として見える。"
insight:
  slug: "confirmed-by-login-alone"
  label: "ログインだけで確定する操作"
  quote: "お金の行き先を変える操作が、ログインできている人なら誰でも、その場で確定できた。"
industries: ["retail", "finance"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "separate-approval"
    item: "変更した本人以外が確かめる"
  - slug: "ownership-check"
    item: "新しい口座が本当に自分たちのものか確かめる"
  - slug: "hold-unverified"
    item: "確かめられない変更は止める"
  - slug: "audit-trail"
    item: "何を確かめて通したかを残す"
---

> **改訂（v2.0 / 2026-10-16）**: 一般の読者にも読める構成に組み直し、§5 を「対策するには」に改めた。あわせて報道と業界の調査を取り直した。

## 1. TL;DR

<div class="rx-exsum"><ol>
<li><div class="lab">01<b>何が起きたか</b></div><p>ホテルを運営するポラリス・ホールディングスが使う Booking.com のアカウントに第三者が入り込み、複数のホテルで、売上金を受け取る口座が第三者の口座に書き換えられた。1 ホテルでは売上金の一部がその口座に振り込まれ、約 900 万円の損失が出た。ほかのホテルは、異常に気づいた後の早い対応で送金を止めている。</p></li>
<li><div class="lab">02<b>なぜ見分けられないか</b></div><p>書き換えは、正規の管理画面から、ログイン済みの操作として行われた。システムから見れば、いつもの設定変更と区別がつかない。</p></li>
<li class="key"><div class="lab">03<b>欠けていた層</b></div><p>検出は効いていた。異常に気づいたことで、被害は 1 ホテルに収まった。効かなかったのは、振込先の変更を、お金が動く前に、変更した本人とは別の人が確かめる層である。</p></li>
</ol></div>

## 2. 何が起きたか

<div class="rx-facts"><dl>
<dt>当事者</dt><dd>ポラリス・ホールディングス（ホテル運営）。グループのホテルは、予約サイト Booking.com をグループ単位のアカウントで管理していた。</dd>
<dt>書き換えられたもの</dt><dd>Booking.com からホテルへ売上金を払い込む先の口座。ホテル側が管理画面で登録しておく設定で、これが第三者の口座に変えられた。</dd>
<dt>被害</dt><dd>1 ホテルで、本来受け取るはずの売上金の一部が不正な口座に振り込まれ、約 900 万円の損失（開示時点）。ほかの複数のホテルでも書き換えがあったが、送金前に止めた。</dd>
<dt>宿泊客への波及</dt><dd>一部のホテルの予約客に、フィッシングのメッセージが届いた。管理画面から取られた予約情報が使われた可能性と、外部の予約管理システムから漏れた可能性の両方を、同社が調べている。</dd>
<dt>侵入の経路</dt><dd>開示時点では調査中で、公表されていない。本 Brief も断定しない。</dd>
<dt>業界の背景</dt><dd>Booking.com に掲載するホテルの管理画面（エクストラネット）は、以前から狙われている。セキュリティ企業 Sekoia の 2025 年 11 月の調査では、Booking.com を装ったメールでホテルの職員に不正なプログラムを実行させ、管理画面のログイン情報を盗む手口が確認されている。盗んだアカウントからは、本物の予約情報を使って宿泊客に偽の支払い依頼を送っていた。</dd>
</dl></div>

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過の連鎖</span></div>
<p class="rx-ex-cap">止めるべきだったのは ② の確定時点。③ で Booking.com の側に誤りは無い。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">第三者</div><div class="no">1</div><b>グループの Booking.com アカウントに入り込む</b><p>経路は調査中。</p></div>
<div class="rx-step crit"><div class="who">第三者</div><div class="no">2</div><b>正規の管理画面で、受取口座を書き換える</b><p>複数のホテルの口座を、第三者の口座に。</p></div>
<div class="rx-step"><div class="who">Booking.com</div><div class="no">3</div><b>登録口座へ、いつもどおり払い込む</b><p>1 ホテル分が不正な口座に入る。</p></div>
<div class="rx-step good"><div class="who">ポラリス</div><div class="no">4</div><b>アカウントの異常に気づき、送金を止める</b><p>ほかのホテルの送金は止まった。</p></div>
</div>
</figure>

3 の時点で、Booking.com の側に誤りは無い。登録された口座に払ったからである。<strong>問題は 2 の変更が、正しい変更として受け入れられたことにある。</strong>

## 3. 時系列 — 公表と対応

<ul class="rx-tl">
<li><time>2026-05-23</time><span>ポラリスが、Booking.com のグループアカウントの異常に気づき、調査を始める。</span></li>
<li><time class="nd">調査で判明</time><span>複数のホテルで受取口座が書き換えられていた。1 ホテルで約 900 万円が不正な口座へ送金。ほかは送金前に止めた。</span></li>
<li><time>2026-05-28</time><span>ポラリスが不正アクセスを開示する。同日、旅行業界メディアの TRAICY が報じる。</span></li>
<li><time>2026-06-02〜03</time><span>セキュリティ専門媒体の ScanNetSecurity、Security NEXT が報じる。</span></li>
</ul>

<p class="rx-aside">本件の事実は、ポラリス・ホールディングスの 5 月 28 日の開示と、それを伝えた報道に拠る。侵入の経路、宿泊客の個人情報が漏れたかどうかは、開示時点で調査中である。開示資料は同社サイトから取り下げられており、本 Brief では報道を出典として示す。</p>

### 公表後の対応

- **ポラリス**: 全ホテルの Booking.com 関連アカウントのパスワードを変え、アクセスの記録の開示を求め、被害が広がらないよう手当てをした。クレジットカード情報の漏えいは確認されていない。業績への影響は軽微と見込む。
- **業界**: Booking.com のホテル向け管理画面を狙う手口は、国内でも被害の公表が相次いでいる。多くは宿泊客へのフィッシングで、本件はそこから一歩進み、ホテル自身のお金の流れを書き換えた点で被害が直接の損失になった。

## 4. なぜ止まらなかったか

この事案の失敗は、パスワードが盗まれたことだけではない。

ログインは「入ってきたのが登録された人か」を確かめる仕組みで、入った後に何をするかは確かめない。セキュリティの言葉では、ログインが済んだ状態を「認証済みセッション」と呼ぶ。この状態で行われた操作は、システムには正規の操作として見える。振込先の変更も、連絡先の変更も、同じ一つの操作として扱われる。

検出は効いていた。ポラリスはアカウントの異常に気づき、ほかのホテルの送金を止めている。ただ、検出は異常が表に出てから働く。1 ホテル分の送金は止められなかった。止めるべきだったのは、その手前、振込先の変更が確定する時点である。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">証明は変更が確定する前に働き、検出は異常が表に出た後に働く。その間、書き換えられた口座は正しい設定として扱われる。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回なし</b>確定の前に、変更が正しいと確かめる</div>
<div class="rx-zone gapz"><b>落差</b><span>変更は確定済み。<br>まだ誰も気づいていない</span></div>
<div class="rx-zone det"><b>検出の層 · 効いた</b>表に出た異常に気づき、止める</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>ログイン</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>振込先の変更が受理される</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>異常に気づく</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>ほかの送金を止める</b></div>
</div>
</figure>

異常に気づくことと、変更が正しいと確かめることの間にある隔たりが、本 Brief の言う<strong>検出と証明の落差</strong>であり、構造的な欠落である。

同じ形は、国の認証メール網から届いた開示要求に応じた [Revolut](https://lemma.frame00.com/ja/critical/briefs/149-revolut-italy-government-mailbox-disclosure-requests/) にも、本物の配信ドメインから偽のメールが届いた [SpeeCAN RAIDEN](https://lemma.frame00.com/ja/critical/briefs/044-arcadia-speecan-raiden-disaster-mail-spoofing/) にも現れている。どれも「正規の経路から来た」ことが、「正しい依頼である」ことの代わりに使われていた。

## 5. 対策するには

<p class="rx-lead"><strong>今回の手口は、仕組みがあれば一部まで防げた。</strong>振込先の変更を、別の人が別の経路で確かめるまで確定させない仕組みがあれば、書き換えは止まる。ただし変更は Booking.com の管理画面の中で起きたので、その仕組みは予約サイトの側に組み込まれている必要がある。利用者の側だけで足せるのは、変更の後、最初の入金の前に止める手立てである。</p>

### 注意したい業界・業務

<div class="rx-facts rx-scope"><dl>
<dt><span class="kk">業界</span>サービス・小売</dt><dd>予約サイトや EC、決済代行を通じて売上金を受け取る宿泊・飲食・小売の事業者。受取口座の設定は、外部サービスの管理画面にある。</dd>
<dt><span class="kk">業界</span>金融・FinTech</dt><dd>振込先の登録や変更を受け付ける銀行・決済の事業者。利用者の側で書き換えられた振込先も、正しい指示として届く。</dd>
<dt><span class="kk">業務</span>振込先・口座の変更</dt><dd>取引先や自分たちの受取口座を登録・変更する操作。変えた結果は、次の支払いまで表に出ない。</dd>
<dt><span class="kk">業務</span>アカウント・権限の管理</dt><dd>外部サービスのアカウントと、誰が何を変えられるかの管理。今回の書き換えは、乗っ取られたアカウントから行われた。</dd>
</dl></div>

同じ穴は、ホテルに限らず多くの組織にある。取引先の振込先を変える経理の操作、ネットバンキングの振込先の登録、EC や決済代行サービスの受取口座の設定。どれも、ログインできる人がその場で変えられ、変えた結果は次の支払いまで表に出ない。そして多くの組織で、この操作には持ち主がいない。

<div class="rx-facts"><dl>
<dt>経理</dt><dd>口座と支払いを扱う。変更は「システムの話」と見がち。</dd>
<dt>情報システム</dt><dd>アカウントを管理する。変更は「業務の話」と見がち。</dd>
<dt>事業部門</dt><dd>予約サイトや決済サービスを契約し、日々使う。</dd>
</dl></div>

<strong>三者の間に、「その振込先の変更は本当に正しいか」を確かめる役が無い。</strong>今回は 1 回の書き換えで約 900 万円が動いた。

### いまの対策で埋まるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 多要素認証（MFA） | <span class="bx-st no">効かない</span> | 入ってくる人を確かめる仕組みで、入った後の操作の中身は見ない。盗まれたログインがそのまま使われた場合や、端末が乗っ取られた場合は通る。 |
| 端末の監視（EDR） | <span class="bx-st no">効かない</span> | 組織の端末で起きることを見る仕組みで、予約サイトや外部サービスの中で起きた設定変更は見えない。 |
| 折り返しの電話確認 | <span class="bx-st part">一部</span> | 取引先から「口座を変えたい」と依頼が来たときには効く。今回のように自分たちの設定そのものが書き換えられると、誰にも電話がかからない。 |
| 送信ドメイン認証（DMARC など） | <span class="bx-st na">関係しない</span> | メールのなりすましを減らすが、今回の書き換えには関係しない。 |

<section class="rx-box"><div class="rx-ex-h"><span class="rx-ex-no">対策</span><span class="rx-ex-t">必要になるもの</span></div>
<ol class="num">
<li><b>変更した本人以外が確かめる。</b>振込先の変更は、ログイン中の操作だけでは確定させない。あらかじめ決めた別の承認者が、ログインとは別の経路で承認したことを、変更の前に確かめる。乗っ取られたアカウントと同じ経路で承認できるなら、意味が無い。</li>
<li><b>新しい口座が本当に自分たちのものか確かめる。</b>口座の名義を、銀行の側の確認で裏付ける。承認者がだまされた場合にも効く。</li>
<li><b>確かめられない変更は止め、何を確かめて通したかを残す。</b>確かめられなかった変更は保留にし、その口座への支払いも止める。いつ、誰の承認で、どの口座を通したかを、後から第三者に示せる形、つまり証明として残す。</li>
</ol>
</section>

<div class="bx-checklist"><div class="rx-ex-h"><span class="rx-ex-no">点検</span><span class="rx-ex-t">点検チェックリスト</span></div><p class="rx-box-cap">振込先の変更について、組織で確かめる 3 項目</p><ul>
<li>受取口座や振込先を変更できるアカウントは誰か。変更されたとき、変更した本人以外の誰に知らせが届くか。</li>
<li>振込先の変更を、本人以外の人が登録時とは別の手段で確かめるまで、最初の入出金を止めておけるか。</li>
<li>変更後の最初の入金や支払いを、誰が、何日以内に照合するか。合わなければ、次の送金を止められるか。</li>
</ul></div>

<p class="rx-aside">注：承認者自身がだまされて承認した場合や、承認の経路まで乗っ取られた場合は、この仕組みでも通ってしまう。また、確かめるまで止める運用にすると、正規の変更も遅れる。</p>

## 6. Sources

<ol class="rx-srcs">
<li><span class="ty">当事者・開示</span><span class="bs"><b>ポラリス・ホールディングス</b>「不正アクセス（Booking.com アカウント）に関するお知らせ」<span class="meta">2026-05-28 · 同社サイトの資料は現在取り下げられている</span></span></li>
<li><span class="ty">報道</span><span class="bs"><b>Security NEXT</b>「宿泊予約サービスの口座情報が改ざん、不正送金被害 - ポラリスHD」<span class="meta">2026-06-03 · <a href="https://www.security-next.com/185176">security-next.com/185176</a></span></span></li>
<li><span class="ty">報道</span><span class="bs"><b>TRAICY</b>「ポラリスHD、ブッキングドットコムへの不正アクセスで不正送金被害 宿泊予約者へのフィッシングメッセージも確認」<span class="meta">2026-05-28 · <a href="https://www.traicy.com/posts/20260528371641/">traicy.com/posts/20260528371641</a></span></span></li>
<li><span class="ty">報道</span><span class="bs"><b>ScanNetSecurity</b>「Booking.comへの不正アクセス、売上金受領口座情報が改ざん 約 900 万円の損失が発生」<span class="meta">2026-06-02 · <a href="https://scan.netsecurity.ne.jp/article/2026/06/02/55403.html">scan.netsecurity.ne.jp/article/2026/06/02/55403</a></span></span></li>
<li><span class="ty">業界の調査</span><span class="bs"><b>Sekoia</b> "Phishing campaigns 'I Paid Twice' targeting Booking.com hotels and customers"<span class="meta">2025-11-06 · <a href="https://www.sekoia.com/blog/phishing-campaigns-i-paid-twice-targeting-booking-com-hotels-and-customers">sekoia.com/blog/…</a></span></span></li>
</ol>

参照: 事後の検知が証明にならない論点は[「AI時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。
