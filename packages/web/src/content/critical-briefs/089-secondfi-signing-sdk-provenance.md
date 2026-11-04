---
brief_no: 89
title: "SecondFi：監査済みの署名コードが未監査の SDK に差し替えられ、署名のたびに秘密鍵を公開データから再構成できた(SecondFi の公表・Tibane Labs の解析)"
title_en: "SecondFi: Audited signing code was replaced by an unaudited SDK, and private keys could be reconstructed from public data on every signature (SecondFi disclosure, Tibane Labs analysis)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth", "bridge-config-trust"]
incident_date: 2026-06-23
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["074-taiko-bridge-prover-key-leak", "045-humanity-protocol-multisig-key-custody", "030-stripe-trusted-channel-skimmer", "038-ironworm-npm-self-propagation"]
status: "published"
gate: "signing"
version: "1.0"
og_lead_ja: "SecondFi：署名器の nonce 導出の欠陥で、署名のたびに秘密鍵を公開データから再構成でき、約 1,600 万 ADA（約 240 万ドル）が流出"
og_lead_en: "SecondFi: a nonce-derivation flaw in the signer let private keys be rebuilt from public data on every signature; ~16M ADA (~$2.4M) drained"
search_title: "SecondFi の約240万ドル流出：署名コード差し替えと対策"
search_description: "Cardano のウォレット SecondFi で、署名のたびに秘密鍵を公開データから再構成でき、374 アドレスから約 1,600 万 ADA が流出した（SecondFi の公表）。何が起きたか、何を照合するかを整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "サプライチェーン攻撃 · 署名コードの差し替え"
og_kicker_en: "SUPPLY CHAIN · SIGNING CODE SWAP"
og_headline_ja: "署名のたびに秘密鍵が\n漏れていたと公表。\n<accent>約 240 万ドルが流出</accent>"
og_headline_en: "Each signature leaked\nthe private key,\nSecondFi says.\n<accent>~$2.4M drained.</accent>"
key_figures:
  - value: "約 1,600 万"
    unit: "ADA"
    label: "流出した額（約 240 万ドル相当・SecondFi の公表と報道）"
    tone: "alert"
  - value: "374"
    unit: "アドレス"
    label: "抜き取られたアドレスの数（2 グループで 171＋203）"
  - value: "06-08 → 06-21"
    label: "署名コードが差し替えられた日（外部解析の指摘）から、抜き取りが始まるまで"
glossary:
  - term: "nonce"
    desc: "署名ごとに混ぜる、秘密にしておくべき値。今回、差し替えられた署名器は、標準の実装が各署名に混ぜる鍵ごとの秘密を落としていたと指摘されている。"
  - term: "決定論的 nonce 導出"
    desc: "nonce を乱数でなく、決まった材料から計算して作るやり方。SecondFi の公表では、この導出の欠陥で、本来秘密の値が公開データから計算できた。"
  - term: "ソフトウェア署名器"
    desc: "ウォレットのアプリの中で、利用者の秘密鍵を使って取引に署名する部分。"
insight:
  slug: "signing-code-not-audited-build"
  label: "監査を通っていない署名コード"
  quote: "署名に使うコードが監査を通った版かを、署名の前に照合しなければ、鍵が盗まれていなくても、署名そのものから鍵が漏れる。"
industries: ["finance", "supply-chain"]
controls:
  - slug: "ownership-check"
    item: "署名に使うコードが、監査済みの正規版か確認してから使う"
attack_method: "supply-chain"
impact: "374 アドレスから約 1,600 万 ADA が流出"
takeaway: "SecondFi の公表では、署名器の nonce 導出の欠陥で、署名のたびに秘密鍵を公開データから再構成できた。外部解析は、監査済みの署名コードが未監査の SDK に差し替えられていたと指摘する。署名の前に、署名に使うコードが監査を通った版かを照合する。"
self_check: "署名や暗号の処理に使うライブラリを差し替えるとき、監査を通った版かを、本番に出す前に照合しているか。"
countries: ["global"]
---

## 1. 要点

鍵は盗まれておらず、ウォレットのアプリにマルウェアが入ったのでもない。SecondFi の公表では、ソフトウェア署名器の決定論的 nonce 導出に欠陥があり、影響アドレスが取引に署名するたびに、公開済みのオンチェーンのデータだけから、その秘密鍵を計算できる状態になっていた。外部解析（Tibane Labs・The Block）は、この署名コードが、監査済みの EMURGO の署名コードから、未監査の第三者の SDK（npm の "trantor"）に差し替えられていたと指摘している。利用者から見れば、ウォレットはいつもどおりに動き、署名もいつもどおりに作られた。<strong>署名に使うコードが監査を通った版かを、署名の前に照合しなければ、鍵が盗まれていなくても、署名そのものから鍵が漏れる。</strong>

## 2. 通った操作

- **通った操作**: 差し替えられた署名器による、影響アドレスの取引への署名と、その取引のネットワークへの送信。続いて、攻撃者が、公開データから再構成した秘密鍵で署名した引き出しの取引。どちらも、正規の鍵による有効な署名として受け付けられた。
- **受け付けた側に届くもの**: 一般に、ブロックチェーンが確認するのは、署名がそのアドレスの鍵に対して有効かである。署名がどのコードで作られたか、nonce が安全に作られたかは届かない。攻撃者の取引も、再構成した正規の鍵で署名されるので、利用者の取引と見分けられない。SecondFi によれば、脆弱性はアドレスの単位にあり、同じリカバリーフレーズを別のウォレットに取り込んでも、侵害された状態は残る。
- **公表されていないこと**: 署名コードが、どのような経緯と、誰の承認で差し替えられたか。差し替えの指摘についての SecondFi／EMURGO の見解。EMURGO は、本 Brief の作成時点で、ポストモーテムを公表していない。

## 3. 実行前の照合

経路を問わず区別できる条件は、署名器が署名を始める前に、署名に使うコードが、監査を通って承認された版と同じかを照合することである。

- **誰が承認を出すか**: 監査を依頼し、その結果を受け取る側（ウォレットの開発とセキュリティの責任者）。監査を通った版を、署名器に入れてよい版として登録する。依存の SDK を入れ替える開発者自身の判断は、この承認にならない。
- **どこで照合するか**: 署名器のコードを変える版を本番に出す前と、署名器が署名を始める前。使うコードが登録した版と合わないとき（監査を経ていない SDK に入れ替わっているなど）は、出さずに保留にし、署名を始めない。
- **何が残るか**: どの版を、誰が、どの監査にもとづいて承認したかと、どのリリースが、どの承認した版で出たかの記録。あとから、どのアドレスの署名が、どの版のコードで作られたかを辿れる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝署名器が署名する前に、署名に使うコードを、監査を通って承認された版と照合し、記録に残すこと。検知＝抜き取りが起きた後に気づくこと。06-08 の差し替えは外部解析の指摘。ほかの日付は、各社が公表した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>署名の前に、署名に使うコードが監査を通った版かを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>署名のたびに秘密鍵を再構成でき<br>374 アドレスから約 1,600 万 ADA が流出</span></div>
<div class="rx-zone det"><b>検知 · 抜き取りの後に働いた</b>原因の特定、資金の退避、復旧基金、外部の監査</div>
<div class="rx-g g1"><div class="t">06-08</div><b>署名コードが未監査の SDK に差し替えられる（外部解析）</b></div>
<div class="rx-g g2"><div class="t">06-21</div><b>2 グループの攻撃者が、自動化された抜き取りを始める</b></div>
<div class="rx-g g3"><div class="t">06-25</div><b>SecondFi が根本原因を公表する</b></div>
<div class="rx-g g4"><div class="t">06-27</div><b>Tibane Labs がフォレンジックの報告を公表する</b></div>
</div>
</figure>

検知は抜き取りの後に働き、攻撃者のアドレスの特定と、約 1 億 2,900 万 ADA の退避、復旧の枠組みを進めたが、すでに作られた署名から鍵が再構成されることは止めない。署名の体系の根にあるものが、出どころを照合されないまま信頼された事案に、[Taiko](https://lemma.frame00.com/ja/critical/briefs/074-taiko-bridge-prover-key-leak/)（prover の署名鍵が公開リポジトリに漏れた）がある。本番に届くパッケージの出どころが論点になった事案に、[IronWorm](https://lemma.frame00.com/ja/critical/briefs/038-ironworm-npm-self-propagation/)（盗んだ認証情報で自分を再公開する npm のワーム）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、署名器のコードを本番に出す段と、署名器が署名を始める段に組み込む。** 外部の監査や鍵の保管の代わりではなく、その上で、署名に使うコードが、監査を通って承認された版と同じかを照合する。コードの中身が安全かは判定しない。

### 注意したい業界・業務

- **業界 · 金融**: 暗号資産のウォレットなど、利用者の秘密鍵で取引への署名を作るサービス。
- **業界 · サプライチェーン**: 署名や暗号の処理を、第三者の SDK やライブラリに頼っている組織。

### いまの対策と Lemma の違い

今回の経路は、1 列目から 2 列目へ続く。1 列目で止まらなければ、2 列目の引き出しは、正規の鍵による有効な署名として通る。3 列目は、抜き取りの後の封じ込めである。

| 対策 | 差し替えた版での署名 | 再構成した鍵での引き出し | 抜き取りの後の封じ込め |
| --- | --- | --- | --- |
| 元の署名コードの外部の監査 | 効かない | 効かない | 関係しない |
| 鍵を盗まれないように保管する | 関係しない | 効かない | 関係しない |
| 原因の特定と資金の退避 | 関係しない | 効かない | 効く |
| **Lemma（実行の前の照合）** | 効く | 効かない | 一部 |

外部の監査は、監査を受けた元の EMURGO の署名コードには働くが、外部解析の指摘では、本番の署名器に入ったのは監査を経ていない SDK だった。鍵の保管は、鍵が盗まれる経路には働くが、今回は鍵が署名と公開データから計算された。原因の特定と資金の退避は、追加の流出の抑止と復旧を進めたが、すでに漏れた署名からの鍵の再構成は止めない。Lemma は、署名器が署名を始める前に、使うコードが承認された版かを照合する。攻撃者が自分の側で再構成した鍵で署名する引き出しには、届かない。どのアドレスの署名が、どの版で作られたかの記録が残るので、影響の範囲の把握にも使える。

注：Lemma の照合が働くのは、リリースの手順と署名器の起動に照合を組み込み、監査を通った版の記録を、コードを変える開発の経路とは別に管理する場合に限る。監査を通った版そのものに欠陥がある場合や、承認する人が監査を経ていない版を承認した場合は、この照合を通りうる。差し替えの経緯は公表されていない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

署名や暗号の処理を、第三者の SDK やライブラリに頼るサービスで確認する 3 項目

- 署名器が署名を始める前に、使うコードが承認した版と同じかを照合しているか。
- 署名に関わる依存（SDK・ライブラリ）の変更が、誰の承認で入ったかを、後から辿れる記録に残しているか。
- 鍵が漏れた疑いのあるアドレスを、どの版のコードで署名したかから特定できるか。

## 5. 事実と時系列

- **サービス**: SecondFi（Cardano のライトウォレット。旧 Yoroi。EMURGO は Cardano の三大設立組織の一つ）の利用者のウォレット。
- **被害の規模**: 約 1,600 万 ADA（約 240 万ドル相当）が、374 アドレスから流出した。4 回の連続したウォレットの抜き取りに分かれて起きた。
- **根本原因（SecondFi の公表）**: ソフトウェア署名器の決定論的 nonce 導出の欠陥。影響アドレスが署名するたびに、その秘密鍵をオンチェーンの公開データから再構成できる十分な情報が漏れていた。脆弱性はアドレスの単位にあり、同じリカバリーフレーズを別のウォレットに取り込んでも、侵害された状態は残る。
- **出どころの指摘（外部解析）**: Tibane Labs・The Block は、問題の署名コードが 2026-06-08 に、監査済みの EMURGO の署名コードから、未監査の第三者の SDK（npm の "trantor"）に差し替えられたと指摘する。標準の実装が各署名に混ぜるはずの鍵ごとの秘密を落としたため、本来秘密の値が公開の取引データだけから計算できたとする。
- **攻撃者**: SecondFi は 2 グループを特定した。一方が 2 回に分けて 171 アドレス、もう一方が別の掃引で 203 アドレスから抜き取った。約 402 万 ADA が、特定済みの集約ウォレットに残り、監視されている。

### 時系列

- **2026-06-08**: 外部解析（Tibane Labs・The Block）の指摘によれば、監査済みの EMURGO の署名コードが、未監査の第三者の SDK（npm の "trantor"）に差し替えられる。
- **2026-06-21〜23**: 2 グループの攻撃者が、自動化された抜き取りを実行する。374 アドレス（171＋203）から約 1,600 万 ADA が流出する。
- **2026-06-23 頃**: 連続した抜き取りが明らかになる。SecondFi がメンテナンスモードに移り、封じ込めを始める。
- **2026-06-25**: SecondFi が調査のアップデートを公表する。根本原因（決定論的 nonce 導出の欠陥で、アドレスの単位で秘密鍵が露出）と、攻撃者 2 グループの特定、約 1 億 2,900 万 ADA の退避、復旧基金の設置を発表する。
- **2026-06-27**: Tibane Labs がフォレンジックの報告を公表し、署名コードの差し替え（未監査の SDK "trantor"）を指摘する。
- **以降**: 外部のセキュリティ企業による監査と、復旧のプログラムが進む（本 Brief の作成時点で、メンテナンスは続いている）。

> 根本原因（決定論的 nonce 導出の欠陥、アドレスの単位での秘密鍵の露出）は、SecondFi の公表に拠る。署名コードが 2026-06-08 に未監査の SDK（"trantor"）に差し替えられたとの指摘は、外部解析（Tibane Labs の 2026-06-27 のフォレンジックの報告・The Block）に拠る。Tibane Labs は自社で競合するウォレットを開発する立場にあるため、その指摘は SecondFi／EMURGO の公式の見解と並べて扱う。EMURGO は、本 Brief の作成時点でポストモーテムを公表していない。規模と日付は、最新の一次情報を参照されたい。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **SecondFi / EMURGO**: 根本原因を公表した。約 1 億 2,900 万 ADA を独立した第三者のカストディアンに退避し、専用の復旧基金を設置した。複数の外部のセキュリティ企業に監査を依頼し、メンテナンスモードを続けている。約 2 週間での資産の返還を目標に掲げた。
- **利用者への警告**: 影響アドレスのリカバリーフレーズを、別のウォレットに復元しない（侵害はアドレスの単位で残る）。ステーキング報酬の引き出しを避ける（mempool の監視で資金が露出しうる）。公式の復旧の手続きを待ち、サポートポータルから申請する。
- **外部解析（Tibane Labs・The Block）**: Tibane Labs が 2026-06-27 のフォレンジックの報告で、署名コードの差し替えを指摘し、署名器が鍵ごとの秘密を落としていた点を技術的に説明した。
- **業界の論点**: ウォレットの署名器で、本番に入れる暗号のコードの出どころの確認（CI/CD での来歴の固定、依存の差し替えの検出、監査済みのビルドの照合）が論点として挙がった。

## 6. Sources

- **The Block**: "SecondFi maps recovery path after $2.4 million Cardano wallet exploit, aims to return funds within two weeks"（2026-06）— <https://www.theblock.co/post/406457/secondfi-maps-recovery-path-after-2-4-million-cardano-wallet-exploit-aims-to-return-funds-within-two-weeks>
- **AMBCrypto**: "Cardano wallet exploit: SecondFi traces attack to private key flaw, warns users not to restore seed phrases"（2026-06-25）— <https://ambcrypto.com/cardano-wallet-exploit-secondfi-traces-attack-to-private-key-flaw-warns-users-not-to-restore-seed-phrases/>
- **crypto.news**: "SecondFi keeps two-week recovery plan after $2.4M Cardano wallet exploit"（2026-06）— <https://crypto.news/secondfi-keeps-two-week-recovery-plan-after-2-4m-cardano-wallet-exploit/>
- **Crypto Briefing**: "SecondFi wallet vulnerability drains $2.4M in Cardano assets"（2026-06）— <https://cryptobriefing.com/secondfi-wallet-vulnerability-cardano-drain/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
