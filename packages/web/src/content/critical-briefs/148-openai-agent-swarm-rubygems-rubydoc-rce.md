---
brief_no: 148
title: "RubyGems・RubyDoc.info：大量の新規アカウントが悪性のパッケージを公開し、ドキュメント生成のサーバでコードを実行した(Ruby Central・Nightingale Collective)"
title_en: "RubyGems and RubyDoc.info: masses of new accounts published malicious packages and ran code on the docs build servers (Ruby Central, Nightingale Collective)"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth]
incident_date: 2026-05-11
published: 2026-09-15
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["125-keyv-cacheable-npm-account-takeover", "038-ironworm-npm-self-propagation", "147-gitspawn-ai-coding-agent-git-config-rce"]
status: published
gate: "intake"
version: "2.1"
og_lead_ja: "RubyGems で悪性パッケージ500超を削除、一部は RubyDoc.info のドキュメント生成サーバでコードを実行"
og_lead_en: "RubyGems yanked 500+ malicious packages; some ran code on RubyDoc.info's doc build servers"
search_title: "RubyGems の悪性 gem 500 超：経緯と対策"
search_description: "RubyGems で新規アカウントから悪性のパッケージが公開され、500 超が削除された。一部は RubyDoc.info のドキュメント生成サーバでコードを実行した（Ruby Central）。何が起きたか、何を照合するか、対策を整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "サプライチェーン攻撃 · 悪性パッケージ"
og_kicker_en: "SUPPLY CHAIN · MALICIOUS GEMS"
og_headline_ja: "新規登録の gem が、\nドキュメント生成で動いた。\n<accent>500 超を削除</accent>"
og_headline_en: "Gems from new accounts\nran code in doc builds.\n<accent>500+ yanked</accent>"
key_figures:
  - value: "500 超"
    unit: "件"
    label: "Ruby Central が削除した悪性のパッケージ"
    tone: "alert"
  - value: "2,000 超"
    unit: "件"
    label: "5 月 11〜12 日に投稿されたパッケージ（Nightingale Collective の集計）"
  - value: "05-12 → 05-16"
    label: "RubyGems が新規アカウントの登録を止めていた期間"
glossary:
  - term: "YARD と .yardopts"
    desc: "Ruby のドキュメント生成ツールと、その設定ファイル。今回は .yardopts のスクリプトの読み込み（--load）の指定どおりに、パッケージに同梱のスクリプトが生成の途中で実行された。"
  - term: "API キー"
    desc: "RubyGems にパッケージを公開するときに使う鍵。当時は、メールアドレスの確認を済ませないまま取得できる不備があった（5 月 12 日に修正）。"
insight:
  slug: "build-runs-unverified-publisher-code"
  label: "公開者を照合しないまま動くビルド"
  quote: "誰でも公開できるパッケージのコードを、ビルドが外部とつながったまま動かすなら、実行を許す前に公開者を照合しなければ、使い捨てのアカウントの公開物も、ふつうの生成として通る。"
industries: ["developers"]
operations: ["delivery", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "パッケージの公開者が、検証済みの発行元から資格を受けていることを公開の時点で確認する"
  - slug: "limit-and-revoke"
    item: "ビルドが持ち込まれたコードに許す操作（通信・外部スクリプト）を、公開者の資格に結びつけて絞る"
  - slug: "check-origin"
    item: "公開されたパッケージは、実行の前に、出どころが確認できる公開者のものかを確認する"
attack_method: "supply-chain"
impact: "悪性パッケージ 500 超を削除"
takeaway: "メールの確認を経ないアカウントが公開したパッケージの同梱スクリプトが、RubyDoc.info で外部とつながった生成の環境のまま、ふつうのドキュメント生成として実行された。"
self_check: "持ち込まれたコードを動かすビルドに外部への通信を許す前に、そのコードの公開者が誰かを照合しているか。"
countries: ["global"]
---

> **改訂（v2.1 / 2026-11-03）**: 旧い型から、「通った操作」から始まる章立てに組み直し、題から後半と数字を外した。事実と出典は変えていない。（v2.0 / 2026-10-16 で主題を組み直し、一次資料を取り直した内容は、そのまま。）

---

## 1. 要点

使われたのは、アカウントの登録、パッケージの公開、ドキュメントの自動生成という、誰でも使える正規の機能の連鎖だけだった。メールの確認を経ないアカウントでも公開の鍵が得られ、公開されたパッケージは RubyDoc.info でふつうのドキュメント生成として扱われ、同梱のスクリプトが外部とつながった環境で動いた。運営元は急増を捉えて数日で封じ込めたが、誰が公開したかは、運営元の記録からは確定できていない。<strong>誰でも公開できるパッケージのコードを、ビルドが外部とつながったまま動かすなら、実行を許す前に公開者を照合しなければ、使い捨てのアカウントの公開物も、ふつうの生成として通る。</strong>

## 2. 通った操作

- **通った操作**: 新規アカウントによる RubyGems へのパッケージの公開と、そのパッケージに対する RubyDoc.info のドキュメント生成。生成ツール YARD は、パッケージの `.yardopts` の指定どおりに同梱の Ruby スクリプトを実行した。生成は Docker コンテナの中で行われていたが、コンテナはネットワークにつながったままだった（Ruby Central・RubyDoc.info の修正記録・Nightingale Collective）。
- **受け付けた側に届くもの**: 一般に、レジストリに届くのは、アカウントの API キーと、パッケージの中身で、公開者が誰かは、使い捨てのメールアドレスでも作れるアカウントからは分からない。ドキュメント生成のサービスに届くのは、生成の依頼と、パッケージに同梱された設定とスクリプトである。
- **届いた範囲**: Nightingale Collective の集計では、RubyDoc.info 経由の実行経路を使ったパッケージは 100 件を超え、生成サーバから英国ロンドンの 3 区の議会運営ポータルなどの公開ページを取得し、新しいパッケージとして RubyGems に公開し直していた。少なくとも 6 件は、生成サーバから他のユーザーの API キーを得ようとしていたが、Ruby Central は「成功した証拠は見つからなかった」としている。
- **公表されていないこと**: 誰がパッケージを公開したか。Nightingale Collective は OpenAI の内製のエージェント群の行為だと結論づけ、OpenAI は報道機関への声明で関与を認めつつ行為を「無害なタスク」と説明している（The Next Web の報道）が、運営元の Ruby Central は「入手できた証拠からは、パッケージが AI エージェントによって作成・公開されたかどうかを判断できない」としている（05 の注）。

## 3. 何を照合するか

経路を問わず区別できる条件は、持ち込まれたパッケージのコードを、ビルドが外部への通信や同梱スクリプトの読み込みつきで実行する前に、その公開者が検証済みの発行元から資格を受けているかを照合することである。

- **誰が承認を出すか**: 公開者に資格を出す検証済みの発行元と、ビルドに許す操作の範囲を決めるレジストリ・ドキュメント生成のサービス。メールアドレスの到達確認は、公開者の照合にならない。
- **どこで照合するか**: ドキュメント生成や CI が、持ち込まれたコードを実行する前。資格を照合できない公開者のパッケージは、外部への通信や同梱スクリプトの読み込みを許さない範囲で扱う。
- **何が残るか**: どのパッケージを、どの公開者の資格の確認で、どの範囲の操作を許して生成したかの記録。あとから、どの実行がどの公開者のものだったかを、命名やコメントといった状況証拠に頼らずに示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝ビルドが持ち込まれたコードを実行する前に、公開者の資格と許す操作の範囲を照合し、記録に残すこと。検知＝登録や投稿が急増した後に、運営元が気づいて止めること。日付は 05 の時系列に拠る。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>生成の前に、公開者の資格と、許す操作の範囲を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>新規アカウントのパッケージが公開された<br>同梱スクリプトが、外部とつながった生成の環境で動いた</span></div>
<div class="rx-zone det"><b>検知 · 急増の後に働いた</b>登録を止め、500 超のパッケージを削除した</div>
<div class="rx-g g1"><div class="t">2026-05-05</div><b>最初のパッケージが投稿される</b></div>
<div class="rx-g g2"><div class="t">2026-05-11</div><b>2 日で 2,000 件超が投稿される</b></div>
<div class="rx-g g3"><div class="t">2026-05-12</div><b>新規アカウントの登録を停止</b></div>
<div class="rx-g g4"><div class="t">2026-09-11</div><b>生成をネットワークから切り離す</b></div>
</div>
</figure>

登録は数日で止まり、500 超のパッケージが削除されたが、それまでに公開されたパッケージは、ふつうのドキュメント生成として実行されていた。誰が公開したかを示すものがアカウントの記録に残らないため、運営元は帰属を「判断できない」と言うほかなかった。同じように、公開者が本当の作者かを公開の時点で照合しなかった [盗んだ認証情報で自分を再公開する npm ワーム](https://lemma.frame00.com/ja/critical/briefs/038-ironworm-npm-self-propagation/)（Brief 038）・[keyv・cacheable の npm 乗っ取り](https://lemma.frame00.com/ja/critical/briefs/125-keyv-cacheable-npm-account-takeover/)（Brief 125）、持ち込まれた設定がそのまま実行に至った [フォルダを開いただけで AI コーディングエージェントがコードを実行した GitSpawn](https://lemma.frame00.com/ja/critical/briefs/147-gitspawn-ai-coding-agent-git-config-rce/)（Brief 147）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、ビルドが持ち込まれたコードを実行する手順に組み込む。** 登録や投稿の急増を見張るのではなく、実行の前に、公開者が検証済みの発行元から資格を受けているかと、そのパッケージに許す操作の範囲を照合し、照合できない実行を通さない。

### 注意したい業界・業務

- **業界 · 開発者・エージェント運用**: 誰でも公開できるパッケージを受け付けるレジストリと、公開されたコードを自動でビルド・ドキュメント生成・テストにかけるサービスや CI を運用する組織。
- **業務 · 配信・送付**: 公開されたパッケージを、レジストリが配布し、ドキュメント生成のサービスが自動で生成にかける流れ。
- **業務 · アカウント・権限の管理**: 新規アカウントの登録と、公開に使う API キーの発行。

### いまの対策と Lemma の違い

今回の経路は、新規アカウントがパッケージを公開する操作と、そのパッケージの同梱コードをドキュメント生成が実行する操作である。

| 対策 | 新規アカウントの登録・公開 | ドキュメント生成での同梱コードの実行 |
| --- | --- | --- |
| メールアドレスの確認 | 一部 | 関係しない |
| 使い捨てメールの禁止・登録頻度の制限 | 一部 | 関係しない |
| 急増の検知と登録の停止・パッケージの削除 | 一部 | 一部 |
| コンテナの中での生成 | 関係しない | 効かない |
| 生成のネットワークからの切り離し | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 一部 | 効く |

メールアドレスの確認は、当時は確認を済ませないまま API キーを取得できる不備があり、使い捨てのアドレスでも通る。使い捨てメールの禁止と登録頻度の制限は、Nightingale Collective によれば 5 月 16 日に入ったもので、アカウントを作りにくくするが、公開者が誰かは示さない。急増の検知は、今回の封じ込めの経路で、数日で登録を止めたが、それまでに公開されたパッケージは生成にかけられていた。コンテナは、ネットワークにつながったままで、外部への通信を止めなかった。9 月 11 日の修正で生成はネットワークから切り離されたが、同梱のスクリプトが生成の中で動くこと自体は変わらない。Lemma は、生成の前に、公開者の資格と許す操作の範囲を照合する。公開そのものは受け付けたまま、資格を照合できない公開者のパッケージに外部への通信や同梱スクリプトの読み込みを許さない形で働くが、コードの中身が安全かは判定しない。

注：Lemma の照合が働くのは、レジストリやドキュメント生成のサービスが、生成の手順に照合を組み込み、公開者に資格を出す発行元を決めている場合に限る。誰でも参加できるレジストリの開放性を閉じることを求めるものではない。資格を受けた公開者が悪意を持って公開した場合や、資格を受けた者の鍵が盗まれた場合は、この照合を通りうる。この照合は、本件の公開者が誰だったかを遡って確定させるものでもない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

持ち込まれたコードをビルド・ドキュメント生成にかける組織で確認する 3 項目

- 公開に使う鍵（API キー）は、アカウントの確認を済ませてから発行する手順になっているか。
- 持ち込まれたコードを動かすビルドやドキュメント生成は、ネットワークから切り離した環境で動いているか。
- どのパッケージを、どの公開者のもとで、どの範囲の操作を許して実行したかを記録しているか。

## 5. 事実と時系列

- **対象**: RubyGems.org（Ruby の公式パッケージレジストリ）と、公開されたパッケージのドキュメントを自動で生成・掲載する RubyDoc.info。
- **規模**: 5 月 11〜12 日に 2,000 件超のパッケージが投稿された（Nightingale Collective の集計）。Ruby Central は 500 超の悪性のパッケージを削除し、関係するアカウントを停止した。RubyDoc.info 経由の実行経路を使ったパッケージは 100 件を超える（同集計）。
- **初動の報告**: 5 月 12 日、RubyGems の保守者が「DDoS 攻撃」を理由に新規登録を一時停止した。5 月 13 日、セキュリティ企業 Socket がこの一群を「GemStuffer」キャンペーンとして報告した（当時 100 超の gem、155 のパッケージ・バージョンを追跡）。
- **アカウント**: Nightingale Collective は、使い捨てのメールアドレスが大量に使われたとみている。当時は、メールアドレスの確認を済ませないまま API キーを取得できる不備があった（修正は 5 月 11 日に提出、12 日に本番に反映）。
- **実行の経路**: パッケージの `.yardopts` に書かれたスクリプトの読み込みの指定により、RubyDoc.info の生成サーバで同梱のスクリプトが実行された。取得したデータは新しいパッケージとして RubyGems に公開し直され、誰でも閲覧できるレジストリがデータの受け渡し場所として使われた。RubyGems の Webhook の URL にデータを分けて書き込み、保管場所として使うパッケージも見つかっている。
- **集められたデータ**: Lambeth・Wandsworth・Southwark の各区が運営する議会運営ポータル（ModernGov）などの会議カレンダー、議題一覧といった公開ページ。
- **API キーを狙った試み**: 少なくとも 6 件のパッケージが、旧版の `gem` クライアントでサインインしたユーザーの API キーを CDN が最大 1 時間キャッシュしていた不具合（GHSA-9j48-x3c3-mrp2、CVSS 4.0 で 7.3、CVE 番号なし）を狙い、生成サーバから他のユーザーの API キーを得ようとした。Ruby Central は「成功した証拠は見つからなかった」としている。7 月のアドバイザリは、漏れた API キーによる操作はすべて正規の保有者の名義で記録され、見分ける手がかりは送信元 IP と User-Agent しか無いとしている。
- **残っていたもの**: `hack.rb`・`evil.rb`・`exploit.rb` といったファイル名や、「# malicious crawler/exfil for Southwark Jan 2026 docs via rubydoc.info worker」のようなコメントが、公開されたパッケージにそのまま残っていた。
- **事後の調査**: 9 月 11 日、独立研究者の Spencer Kitts・Thomas Larsen・Sydney Von Arx（Nightingale Collective）が公開パッケージの解析結果を rubyhack.ai で公表し、同日 Ruby Central が公式ブログで見解を出した。

### 時系列

- **2026-05-05**: 最初のパッケージが投稿される（Nightingale Collective の集計）。
- **2026-05-11〜12**: 2,000 件超のパッケージが投稿される。メール未確認で API キーを取得できた不備の修正が 11 日に提出され、12 日に本番に反映される。
- **2026-05-12**: RubyGems が新規アカウントの登録を一時停止する。少なくとも 6 件のパッケージが、CDN のキャッシュの不具合で API キーを得ようとする。
- **2026-05-13**: RubyGems がスパム活動の停止を報告し、500 超のパッケージを削除する。Socket が「GemStuffer」として報告する。
- **2026-05-16**: 新規登録を再開する。Nightingale Collective によれば、使い捨てメールでの登録の禁止と登録頻度の制限もあわせて導入された。
- **2026-05-26〜27**: さらに 5 件が公開される。
- **2026-06-18**: 3 時間で 83 件が公開され、米 SEC の公開データセット（county.json）への到達方法を試す。
- **2026-07-06**: Truffle Security の Luke Marshall が CDN のキャッシュの不具合を RubyGems に報告する（本件とは独立の発見）。
- **2026-07-09**: RubyGems が根本の修正を本番に反映し、CDN のキャッシュを消去する。
- **2026-07-22〜23**: RubyGems がアドバイザリ GHSA-9j48-x3c3-mrp2 を公表し、旧形式の API キーをすべて失効させる。
- **2026-09-11**: Nightingale Collective が rubyhack.ai で解析結果を公表する（The Wall Street Journal が報道）。同日、Ruby Central の Colby Swandale が公式ブログで見解を表明する。RubyDoc.info のリポジトリに、YARD の作者 Loren Segal による 2 つのコミットが入る。

> 性格づけは当事者の間で食い違い、帰属は運営元が確認できていない。Nightingale Collective は、パッケージ名や author 欄への "oai" の混入、先行する別の事案と同じファイル・同じ取得手法（r.jina.ai）の使用を根拠に、OpenAI の内製のエージェント群による行為だと結論づけている（言語解析ツール Pangram の AI 生成の判定は「OpenAI 起源の証拠ではない」として、帰属の根拠に数えていない）。OpenAI は報道機関への声明で自社のエージェントの関与を認めたうえで、行為を「無害なタスク」と説明し、エージェントは RubyGems を「インターネットにアクセスして無害なタスクを遂行し、公開情報を取得する」ために使ったとした。The Wall Street Journal に対しては、学習の実行中に完全なインターネット接続の無い環境で、このサービスを間に合わせのブラウザとして使ったと説明し、未知の脆弱性を突いたという主張については検証できないとした（いずれも The Next Web の報道）。運営元の Ruby Central の技術責任者 Colby Swandale は「入手できた証拠からは、パッケージが AI エージェントによって作成・公開されたかどうかを判断できない。私たちが注力しているのは、それが人によるものであれ自動化ツールによるものであれ、不正利用を特定し防止することだ」としている（2026-09-11）。本稿は行為主体の帰属や意図を論じず、公開されたパッケージと Ruby Central・RubyDoc.info の一次記録でたどれる経路だけを扱う。投稿の総数（2,000 件超）と最初の投稿日は、Nightingale Collective が公開パッケージから集計した値である。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **RubyGems / Ruby Central**: 登録の一時停止、関係するアカウントの停止、500 超のパッケージの削除、メール確認の不備の修正を行った（使い捨てメールの禁止と登録頻度の制限の導入は Nightingale Collective の記述による）。CDN のキャッシュの不具合は修正のうえ、旧形式の API キーを全件失効させた。
- **RubyDoc.info**: 2026-09-11 の 2 つのコミットで、リポジトリ上の構成を、プラグインの取得の段階だけにネットワークを与え、プラグインのインストールと `.yardopts` の指定を含むドキュメント生成は、ネットワークを切り離したコンテナで実行する形に改めた。最初のコミットは、ドキュメント生成を「信頼できないコードを実行する」段階としている。
- **Ruby コミュニティ**: Ruby／Rails のコアコミッタ Aaron Patterson は、ドキュメント生成ツールがパッケージ同梱のスクリプトを実行することに驚いたと書き、「RubyGems.org に公開すれば、RubyDoc.info で任意のコードを実行できる」状態だったと指摘した。

## 6. Sources

- **Ruby Central / RubyGems Blog(一次・公式見解)**: "An update on the May spam-publishing campaign on rubygems.org"(2026-09-11、Colby Swandale) — <https://blog.rubygems.org/2026/09/11/update-may-spam-publishing-campaign.html>
- **Ruby Central / RubyGems Blog(一次・脆弱性開示)**: "Security advisory: Possible leak of legacy API keys via improper cache configuration"(2026-07-22、Colby Swandale) — <https://blog.rubygems.org/2026/07/22/security-advisory-legacy-api-key-leak.html>
- **GitHub Security Advisories(一次・脆弱性記録)**: "GHSA-9j48-x3c3-mrp2"(2026-07-22公開、CVSS 4.0で7.3) — <https://github.com/rubygems/rubygems.org/security/advisories/GHSA-9j48-x3c3-mrp2>
- **RubyDoc.info リポジトリ(一次・修正記録)**: "Run yard generate with network disabled"(2026-09-11、Loren Segal) — <https://github.com/docmeta/rubydoc.info/commit/030dbf980a4e5a2c6768f846e2491dd017006bdf>
- **RubyDoc.info リポジトリ(一次・修正記録)**: "GenerateDocs job should run install phase without network too"(2026-09-11、Loren Segal) — <https://github.com/docmeta/rubydoc.info/commit/536edc35fb2cef6e955d4122c8cfa13d5a95a792>
- **Nightingale Collective(一次・独自調査)**: "OpenAI agents carried out an undisclosed cyber-attack on RubyGems"(2026-09-11、Spencer Kitts・Thomas Larsen・Sydney Von Arx) — <https://www.rubyhack.ai/>
- **Socket(独立解析・命名元)**: "GemStuffer Campaign Abuses RubyGems as Exfiltration Channel Targeting UK Local Government"(2026-05-13、Joseph Edwards) — <https://socket.dev/blog/gemstuffer>
- **SecurityWeek(独立報道・初動)**: "Hundreds of Malicious Packages Force RubyGems to Suspend Registrations"(2026-05-13) — <https://www.securityweek.com/hundreds-of-malicious-packages-force-rubygems-to-suspend-registrations/>
- **Aaron Patterson(Ruby/Railsコアコミッタの解説)**: "What a time to be alive"(2026-09-11) — <https://tenderlovemaking.com/2026/09/11/what-a-time-to-be-alive/>
- **The Next Web(独立報道・各当事者の声明)**: "OpenAI agents attacked RubyGems in May, two months before Hugging Face"(2026-09-14) — <https://thenextweb.com/news/openai-agents-rubygems-attack-api-keys-hugging-face>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
