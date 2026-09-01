---
brief_no: 140
title: "AnonyMousKIT：AI 音声エージェントが「Apple サポート」を装い、盗難 iPhone の所有者から解除用パスコードを聞き出していた — パスコードを言えることが、所有者である証明として扱われている"
title_en: "AnonyMousKIT: AI voice agents posing as 'Apple Support' extracted unlock passcodes from stolen-iPhone owners — being able to state the passcode is treated as proof of ownership"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth]
incident_date: 2026-08-24
published: 2026-09-01
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["051-instagram-ai-support-takeover", "047-openclaw-agent-phishing", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "AnonyMousKIT、AI 音声で盗難 iPhone 所有者から解除コード聴取"
og_lead_en: "AnonyMousKIT: AI voice calls harvest stolen-iPhone passcodes"
---

## 1. TL;DR

SOCRadar は 2026 年 8 月 24 日、盗難 iPhone の Activation Lock 解除に特化した AI 搭載フィッシング・アズ・ア・サービス「AnonyMousKIT」の内部構造を公開した。AI 音声エージェントが「Apple サポート」を名乗り、解除用パスコードや 2 要素認証コードを聞き出す。運用者側の設定不備でログが露出し、検出は効いていた。**効かなかったのは、Apple を名乗る相手が本当に Apple かを、解除という行動の前に独立に確かめる層である。**

## 2. 何が起きたか

- SOCRadar Threat Research Unit（STRU）が 2026 年 8 月 24 日、AnonyMousKIT の内部を分析したレポートを公開した。
- 対象は Apple 製品の Activation Lock。iOS 7 で導入され、Find My が有効になった時点で端末を所有者の Apple ID に結び付け、盗難端末を無価値化する仕組みである。
- 単一のパネルコードベースが 506 ドメイン・168 ストアフロントブランドを通じて再販されている。単発の攻撃者ではなく、再販型のエコシステムである。506 ドメインの走査では、ログを露出した稼働中のバックエンドが 41 件、42 ドメインにまたがる 30 件の独立した設置が確認されている。318 ドメインは停止済みまたはシンクホールで、188 ドメインが稼働中とされる。
- 運用者自身のコーディング上の不備——Web ルートに解決してしまう相対パス指定——により本番ログが露出し、STRU はバックエンドのソースコードと数か月分の運用ログを直接確認できた。同じコードベースを配布した全設置がこの不備を継承している。
- AI 音声チャネルは、メールに次いで記録が多く残っていた。商用の音声 AI プラットフォーム Vapi 上の運用者アカウントから、通話記録 200 件・会話トランスクリプト 55 本・設定済みペルソナ 5 体が回収されている。200 件のうち 179 件（90%）はブラジルの番号宛で、使用ペルソナも 178 件がポルトガル語だった。総費用は 19.24 ドル、1 通話あたり約 9.6 セントである。通話時間の中央値は 22 秒である。
- チャネルごとに課金が異なる。メールは 1.50 クレジット、SMS は送信者 ID ごと、録音音声は 1 クレジット、AI 音声エージェントは 2 クレジットである。

攻撃は次の 7 段階で成立する。

1. 盗難端末の機種と Find My の状態（オンライン／ロック中）をプロファイリングする。
2. Lost Mode で表示される連絡先などから、被害者の氏名・電話番号・機種・追跡用リンクをパネルに記録する。
3. メール・SMS・WhatsApp・録音音声・AI 音声のいずれかでルアーを配信する。
4. 被害者が、端末の位置を示す偽の地図画面などと対話する。
5. 4 桁または 6 桁のパスコード、Apple ID、6 桁の 2 要素認証コードを聞き出す。AI 音声エージェントは所有権の確認から入り、パスコードを読み上げさせて復唱し、「誰かがその端末を Apple ストアに持ち込んだ」という筋書きへ移る。
6. 取得した情報をパネルおよび Telegram へ送出する。
7. 認証情報を使って Activation Lock を解除し、端末を転売する。

## 3. 時系列 — 公表と対応

- 2024-02：パネルのコードベースが最初に観測される（URLScan 上の共有管理ライブラリのハッシュから遡って確認）。
- 2025-03：英語・スペイン語・ブラジルポルトガル語の AI ペルソナが構築される。
- 2025-08-31：最初の AI 音声通話が記録される。以後、200 件の通話ログの起点となる。
- 2026-05-30：最後の AI 音声通話が記録される。
- 2026-07-30：露出した SMTP ログ上で最後のメールが記録される。
- 2026-07-31〜08-04：STRU が被害者向けキットを入手し、パネルが稼働中であることとパネルログとの接続を確認。
- 2026-08-10：パネルログ上で運用者の活動が確認できる最終日。SOCRadar はこの時点でプラットフォームが稼働中であるとしている。
- 2026-08-24：SOCRadar が分析結果を公開。

> 本 Brief の数値は、SOCRadar が運用者側の露出ログとパネルのソースコードを直接確認した自己公表レポートを一次とする。ペルソナ名は同レポート内で 2 通りに書かれており、タイムラインでは 5 体が翻訳された同一の名義「Alice from Apple Support」を持つとされ、ペルソナ節では音声オプション 3 体が「Alice Dias, Apple Support」を共有するとされている。二次報道の食い違いはこの 2 か所をそれぞれ引いたことによる。**取得の成否については注意が要る。** レポートのアウトカム欄は 200 件すべてを切断・無音タイムアウト・不応答・発信エラーのいずれかに分類しており、取得件数の集計はどのチャネルについても示されていない。一方、公開された 1 本のトランスクリプトについては、通話中にパスコードを取得・検証したと記述されている。本稿は個別の取得成功を事実として扱うが、200 件全体の成功規模は公表されていない。Apple 公式からの本件に関する言及は、本稿執筆時点で確認できていない。

公表後の対応と業界の動きは次のとおり。

- SOCRadar は本件をドメイン・インフラの侵害指標（IOC）とともに公開し、脅威インテリジェンスとして共有した。
- BleepingComputer・Help Net Security・The Hacker News 等が同週のうちに技術詳細を報じた。
- The Hacker News は、Vapi へ運用者アカウントが通報されたかどうか、またそのアカウントが現在も有効かどうかについて、レポートも各社も明らかにしていないと記している。プラットフォーム自体は、SOCRadar が収集最終日（2026-08-10）時点で稼働中であるとし、追跡を継続すると述べている。

## 4. なぜ止まらなかったか

この事案の失敗は、Apple の暗号的な認証機構が破られたことでも、Activation Lock の設計自体に欠陥があったことでもない。**電話やメール、WhatsApp の向こう側にいる相手が本当に「Apple サポート」であるかを、被害者側にも通話・配信経路側にも独立に確かめる層がなく、被害者がパスコードを口頭で告げられること自体が、端末所有者としての本人性の証明として扱われていた**ことにある。

検出は効いていた。SOCRadar は運用者側の実装不備を突いてログを直接確認し、通話台本・ペルソナ設定・被害者データまで含めて手口を可視化した。効かなかったのはその手前——「Apple を名乗る発信者」が実際に Apple かどうかを検証する層である。

> 「私たちがその iPhone 16 Pro Max が紛失モードにあると分かったため、セキュリティ上の理由で端末をお預かりし、復旧のケースを開きました。端末を復旧するためのセキュリティリンクを記載したメッセージは届きましたか」——回収された通話トランスクリプトより。SOCRadar は、この通話でソフトウェアが約 10 セントのコストでパスコードを取得・検証したと記述している。

AI 音声エージェントが変えたのは検証の有無ではなく、なりすましのコストである。商用の音声 AI サービスを借りてペルソナを構築し、1 通話あたり約 10 セントで自然な会話を再現できるようになったことで、以前は人手を要した社会工学が、多言語・多地域で自動化・量産化された。200 件のうち 179 件がブラジル宛に集中していたことは、この量産が地域を選んで振り向けられることを示している。パスコードという「知っていることの証明」は、本来は所有者が正当な相手に対して行う認証の一部にすぎない。だが相手の身元が検証されない電話・メール経路では、その知識が誰に向けて開示されたかに関係なく、解除という行動の根拠として扱われてしまう。

同種の構図は、AI サポートに依頼するだけで所有権確認を経ずにアカウントが乗っ取られた [Brief 051](https://lemma.frame00.com/ja/critical/briefs/051-instagram-ai-support-takeover/) や、送信者を確かめる前に認証情報が社外へ渡った [Brief 047](https://lemma.frame00.com/ja/critical/briefs/047-openclaw-agent-phishing/) にも見られる。

## 5. 証明があれば、何が変わるか

事前証明は、解除やアカウント変更を認める根拠を「パスコードを言えたから」ではなく、「その提示が、身元の確かめられた相手からの正当な求めに応じたものだと確かめられたから」に置き換える。なりすましの生成を止めるのではない。なりすましが成功しても、それが解除という行動に変わらないようにする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>発信者の身元証明</strong>：サポートを名乗る発信者の身元を、被害者側が独立に検証できる経路を用意する。名乗りではなく、確かめられる証明を根拠にする。</li>
<li><strong>提示の文脈の束縛</strong>：認証情報（パスコード・2 要素認証コード）の提示を、その場の口頭確認ではなく、正規チャネルとの独立した突き合わせに基づかせる。</li>
<li><strong>行動の来歴</strong>：解除やアカウント変更という行動の来歴を、その根拠となった確認プロセスとひもづけて記録する。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>盗難端末の物理的な回収や、フィッシングインフラそのものの摘発は行わない。それは法執行機関の仕事である。</li>
<li>音声 AI によるなりすましの生成自体を検出・遮断するものではない。生成のコストが下がり続ける前提に立つ。</li>
<li>証明が示せるのは、その提示が身元の確かめられた相手への応答であったかまでである。所有者本人が自ら第三者に渡した場合までは示せない。</li>
</ul>

事後の通話記録との違いはここにある。記録は通話の後に残るが、その通話の相手に認証情報を渡してよかったかを、渡す時点で判断する材料にはならない。

検出の層と、この層は代替ではなく補完の関係にある。前者はフィッシング基盤を可視化して経路の数を減らし、後者は「発信者の身元が確かめられるまで、解除は成立しない」ことを、次のペルソナが立ち上がる前に確かめられるようにする。

## 6. Sources

- **SOCRadar Threat Research Unit（一次・自己公表レポート）**: "Exposing AnonyMousKIT: AI-Powered PhaaS Supply Chain"（2026-08-24）— <https://socradar.io/blog/anonymouskit-ai-phaas-supply-chain/>（原文は自動取得を遮断しているため、保存版: <http://web.archive.org/web/20260829120403/https://socradar.io/blog/anonymouskit-ai-phaas-supply-chain/>）
- **The Hacker News（独立報道）**: "Fake Apple Support AI Calls Target Stolen-Device Owners for Passcodes and 2FA Codes"（2026-08）— <https://thehackernews.com/2026/08/fake-apple-support-ai-calls-target.html>
- **BleepingComputer（独立報道）**: "AnonyMousKIT PhaaS uses voice AI agents to phish iPhone passcodes" — <https://www.bleepingcomputer.com/news/security/anonymouskit-phaas-uses-voice-ai-agents-to-phish-iphone-passcodes/>
- **Help Net Security（独立報道）**: "AnonyMousKIT phishing-as-a-service uses AI voice calls to steal iPhone passcodes"（2026-08-26）— <https://www.helpnetsecurity.com/2026/08/26/anonymouskit-phishing-stolen-iphone/>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。属性の証明は[Pillar 04 — 規制属性](https://lemma.frame00.com/ja/pillars/#attribute)。

数値は SOCRadar の自己公表レポートに基づき、独立報道 3 社の記述で相互に照合しています。プラットフォームは同レポートの収集最終日（2026-08-10）時点で稼働中と報告されており、その後の状況および Apple 側の対応は本稿執筆時点で公表されていません。
