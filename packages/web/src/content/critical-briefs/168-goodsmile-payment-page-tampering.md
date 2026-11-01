---
brief_no: 168
title: "グッドスマイルカンパニー：決済ページに不正なプログラム、カード番号とセキュリティコードが漏えいした可能性"
title_en: "Good Smile Company: A rogue program on the payment page, and card numbers and security codes may have been exposed"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: []
incident_date: 2026-10-21
published: 2026-10-30
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["087-polymarket-frontend-supply-chain", "081-bybit-safe-wallet-ui-injection", "030-stripe-trusted-channel-skimmer"]
status: draft
version: "1.0"
og_lead_ja: "グッスマ公式ショップ：決済ページの不正プログラムで、カード全桁が漏えいの可能性"
og_lead_en: "Good Smile Company: a payment-page program may have exposed full card data"
search_title: "グッドスマイル公式ショップのカード情報漏えい：経緯と対策"
search_description: "グッドスマイルカンパニー公式ショップの決済ページに不正なプログラムが置かれ、2,800 人のカード番号とセキュリティコードが漏えいした可能性がある（同社第 4 報）。保存していないカード情報がなぜ漏れたか、決済ページの改ざんへの対策を整理。"
layout: "report"
sections: "proof"
gate: "intake"
victim_desk:
  ja: "グッドスマイルカンパニー公式ショップの利用者の方へ：カード情報の漏えいや、ご自身が対象かのご相談は、同社のカスタマーサポートへ。身に覚えのない請求は、カードの発行会社へ。当サイトはグッドスマイルカンパニーとは関係がありません。"
  en: "Good Smile Company shop customers: for card exposure or whether you are affected, contact the company's customer support; report unfamiliar charges to your card issuer. This site is not affiliated with Good Smile Company."
  url: "https://support.goodsmile.com/hc/ja/requests/new?ticket_form_id=48452039907097"
og_kicker_ja: "サイバー攻撃事例 · 決済ページの改ざん"
og_kicker_en: "CYBERATTACK · PAYMENT PAGE TAMPERING"
og_headline_ja: "決済ページに\n不正なプログラム。\n判明は閉鎖の5日後。\n<accent>2,800 人のカード全桁</accent>"
og_headline_en: "Payment page tampered;\nfound 5 days after shutdown.\n<accent>Full card data of 2,800 people.</accent>"
key_figures:
  - value: "2,800"
    unit: "人"
    label: "カード名義、16 桁の番号、有効期限、セキュリティコードが漏えいした可能性のある利用者"
    tone: "alert"
  - value: "約 41"
    unit: "時間"
    label: "決済ページに不正なプログラムが置かれていた時間（10 月 21 日 13 時 55 分〜23 日 7 時）"
  - value: "402,466"
    unit: "枚"
    label: "カード番号の下 4 桁と有効期限が漏えいした可能性のあるカード（重複を除く）"
insight:
  slug: "payment-page-code-not-verified"
  label: "決済ページの改ざんを、入力の前に確認しない"
  quote: "守る対象は、保存したカード番号ではなく、入力を受け取るページのコードである。"
industries: ["retail"]
controls:
  - slug: "ownership-check"
    item: "決済ページで読み込まれるスクリプトを、承認した一覧と内容で照合し、一覧に無いものは読み込ませない"
  - slug: "separate-approval"
    item: "決済ページとそのスクリプトの変更を、サイトの管理者権限とは別の承認で反映する"
  - slug: "audit-trail"
    item: "どの版の決済ページで、誰が決済の操作をしたかを記録する"
attack_method: "privilege-abuse"
impact: "2,800 人のカード全桁とセキュリティコード、402,466 枚の下 4 桁と有効期限が漏えいした可能性がある"
takeaway: "サイトはカードの全桁を保存していなかったが、決済ページに置かれたプログラムが入力を傍受した可能性がある。決済ページが改ざんされていないかを、入力の前に確認する仕組みは、公表からは見えない。"
self_check: "自社の決済ページで読み込んでいるスクリプトを、一覧で把握しているか。"
countries: ["jp"]
---

## 1. 要点

同社はカード番号を保存していなかったが、決済ページに置かれたプログラムが、入力された瞬間に読み取った可能性がある。不正アクセスには気づいて 1 時間後にサイトを閉じたが、このプログラムに気づいたのはその 5 日後だった。<strong>決済ページを書き換えられれば、カード番号を保存していなくても、入力した瞬間に読み取られうる。</strong>

## 2. 通った操作

- **通った操作**: 決済ページで動く不正なプログラム。10 月 21 日 13 時 55 分から 23 日 7 時まで置かれ、この間に決済ページで入力された情報が傍受されたと同社は認識している。
- **受け付けた側に届くもの**: 利用者のブラウザには、正規のサイトから、いつもの決済画面が届く。一般に、見た目やサイトへの接続からは、ページの中のコードが書き換えられたことは分からない。
- **公表されていないこと**: 入口の脆弱性の種別、プログラムがブラウザで動くものかサーバー側の改ざんか、傍受した情報の送り先、カードの不正利用の被害。

## 3. 何を照合するか

経路を問わず区別できる条件は、決済ページを配る側が、ページで動くコードを承認した版と、入力の前に照合することである。

- **誰が承認を出すか**: 決済ページの持ち主（EC の事業者）。リリースのときに、決済ページで読み込むスクリプトと内容のハッシュを、サイトの管理者権限とは別の鍵で承認する。
- **どこで照合するか**: 決済ページを配るサーバーと、利用者のブラウザ（CSP や Subresource Integrity）。承認した版と一致しないコードは、読み込ませない。
- **何が残るか**: どの版の決済ページで、どの決済の操作（入力の開始、完了、カード情報の変更）が行われたかの記録。対象の利用者を後から絞り込める。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝決済ページを開くたびに、動いているコードが承認した版と一致するかを照合し、記録に残すこと。検知＝不正アクセスが起きた後に気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>入力の前に、決済ページのコードを承認した版と照合する</div>
<div class="rx-zone gapz"><b>その間</b><span>正規のサイトから届いた<br>いつもの画面で入力された</span></div>
<div class="rx-zone det"><b>検知 · 働いた</b>委託先の連絡で不正アクセスに気づき、閉鎖する</div>
<div class="rx-g g1"><div class="t">10-21</div><b>決済ページにプログラムが置かれる</b></div>
<div class="rx-g g2"><div class="t">10-21〜10-23</div><b>約 41 時間、入力が傍受されうる</b></div>
<div class="rx-g g3"><div class="t">10-23</div><b>サイトを閉鎖</b></div>
<div class="rx-g g4"><div class="t">10-28</div><b>プログラムが判明</b></div>
</div>
</figure>

閉鎖でプログラムも止まったが、気づいたのは不正アクセスで、決済ページの書き換えではない。画面に届いたコードが書き換えられる点は、[Polymarket](https://lemma.frame00.com/ja/critical/briefs/087-polymarket-frontend-supply-chain/)（第三者経由で画面に JavaScript が注入された）と [Stripe の API の転用](https://lemma.frame00.com/ja/critical/briefs/030-stripe-trusted-channel-skimmer/)（信頼された API が、カードを盗むコードの配送に使われた）とも共通する論点である。

## 4. Lemma でできること

**Lemma は、03 の照合を、決済ページを配る仕組みに組み込む。** 侵入を見つけるのではなく、いま配っているページのコードが、承認した版かを確かめる。

### 注意したい業界・業務

- **業界 · サービス・小売**: 自社のページにカードの入力欄を置いている EC サイト。ページの改ざんが、そのまま入力の傍受になる。
- **業務 · サイトの開発・保守の委託**: 決済ページの変更や管理画面の権限を、委託先に任せている場合。

### いまの対策と Lemma の違い

| 対策 | スクリプトの差し替え・追加 | サーバー側のページの書き換え | 承認した版そのものの問題 |
| --- | --- | --- | --- |
| カードの全桁を保存しない | 関係しない | 関係しない | 関係しない |
| 不正アクセスの検知とサイトの閉鎖 | 一部 | 一部 | 関係しない |
| 脆弱性の改修 | 一部 | 一部 | 関係しない |
| 決済画面を外部の決済代行に任せる | 一部 | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 効く | 効かない |

カードの全桁を保存しないことは保存した情報を守り、検知と閉鎖は気づいた後に効く。Lemma だけが、ページで動くコードそのものを、入力の前に照合する。カード業界の基準 PCI DSS v4.0.1 の要件 6.4.3 と 11.6.1 も、2025 年 3 月から決済ページのスクリプトの承認と改ざんの検知を求めている。

注：Lemma の照合が働くのは、決済ページを配る仕組みに照合を組み込み、承認の鍵がサイトの管理者権限とは別にある場合に限る。承認の権限ごと奪われた場合や、照合の仕組みごと書き換えられた場合は通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

EC サイトの決済ページの改ざんについて、組織で確認する 3 項目

- 決済ページの変更は、サイトの管理者権限だけでは本番に反映できないようになっているか。
- 決済ページの内容が承認した版から変わったとき、その日のうちに知らせが届くか。
- 決済を試みた人と、カートに入れただけの人を、記録から区別できるか。

## 5. 事実と時系列

- **サイト**: グッドスマイルカンパニー公式ショップ。楽天市場店は対象外。Amazon Pay・PayPal など外部決済のカード情報も対象外だが、注文情報は決済方法を問わず対象になる。
- **原因**: システムの一部の脆弱性が悪用され、管理者権限が取られたと同社は認識している。近時報告された PHP の脆弱性ではないとしている。
- **なぜ保存していないのに漏れたか**: セキュリティコードは、カード業界の基準で支払いの後に保存してはならない番号で、同社も全桁とあわせて保存していなかった。漏えいは、決済ページ上で入力された情報が傍受されたことによると同社は認識している。この型の手口は、一般に「ウェブスキミング」と呼ばれる。
- **カード全桁の漏えいの可能性**: 2,800 人。カード決済で注文した 384 人、予約後にカード情報を変えた 185 人、決済を試みて完了しなかった人、カートに入れただけの人を含む。操作の記録が無く、後の 2 つを区別できないため、漏えいは無いと考えられるカートだけの人にも連絡している。
- **カード情報の一部**: カードを登録したことのある利用者の、402,466 枚（重複を除く）の下 4 桁と有効期限。
- **注文情報**: 5,356 人の注文 7,774 件のうち、閲覧された最大 202 件。

### 時系列

- **2026-10-19**: 15 時過ぎころ、不正アクセスが始まる（22 日 23 時前ころまで）。
- **2026-10-21**: 13 時 55 分、決済ページに不正なプログラムが置かれる。
- **2026-10-23**: 6 時過ぎころ、委託先の連絡で不正アクセスが判明し、7 時にサイトを閉鎖。第 1 報（カード情報は下 4 桁と有効期限のみ）。
- **2026-10-26**: 第 2 報（第 1 報への追記）。
- **2026-10-28**: 18 時 30 分過ぎころ、決済ページのプログラムが判明。
- **2026-10-29**: 第 3 報。カード全桁とセキュリティコードの漏えいの可能性を公表（30 日の第 4 報で注文情報の範囲を訂正）。

> 事実は同社の公式告知（第 1 報〜第 4 報と Q&A）に拠り、「漏えいした可能性」は同社の表現のままである。公表されていないことは、対策が無かったことを意味しない。11 月 1 日時点で、第 5 報は出ていない。

### 公表後の対応

- **改修**: 原因と思われる脆弱性を改修し、システム間の接続情報を一式無効化して更新した。サイトの再開時期は未定。
- **連絡と報告**: 対象者にメールで個別に連絡し、個人情報保護委員会に報告した。カードの再発行の手数料を利用者に負担させないよう、カード会社に申し入れている。

## 6. Sources

- **グッドスマイルカンパニー（一次・当事者の公表）**: 「不正アクセスによるお客様情報流出の可能性について（第4報）」（2026-10-30。第 3 報 10-29 の一部修正） — <https://support.goodsmile.com/hc/ja/articles/63718007508761>
- **グッドスマイルカンパニー（一次・当事者の公表）**: 「不正アクセスによるお客様情報流出の可能性について【2026年10月26日追記】」（第 1 報 2026-10-23、第 2 報 10-26） — <https://support.goodsmile.com/hc/ja/articles/63547468806297>
- **グッドスマイルカンパニー（一次・Q&A）**: 「グループB：クレジットカード全情報が漏えいした可能性のあるお客様」（2026-10-29 公開、10-31 更新） — <https://support.goodsmile.com/hc/ja/articles/63751588397849>
- **グッドスマイルカンパニー（一次・Q&A）**: 「不正アクセス・情報漏えいに関するよくあるご質問（全対象共通）」（2026-10-29 公開、10-31 更新） — <https://support.goodsmile.com/hc/ja/articles/63753982590105>
- **PCI Security Standards Council（一次・基準の策定団体）**: "Coffee with the Council Podcast: Guidance for PCI DSS E-commerce Requirements Effective After 31 March 2025"（2025-03-26） — 要件 6.4.3・11.6.1 の発効 · <https://blog.pcisecuritystandards.org/coffee-with-the-council-podcast-guidance-for-pci-dss-e-commerce-requirements-effective-after-31-march-2025>
- **グッドスマイルカンパニー（一次・当事者の公表、英語版）**: "Notice of Possible Exposure of Customer Information Due to Unauthorized Access (Fourth Update)"（2026-10-30） — <https://support.goodsmile.com/hc/en-us/articles/63718007508761>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
