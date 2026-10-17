---
brief_no: 148
title: "RubyGems・RubyDoc.info：大量の新規アカウントが500超の悪性パッケージを公開し、ドキュメント生成サーバでコードを実行した(Ruby Central・Nightingale Collective) — 公開者が誰かと、ビルドがそのコードに何を許すかが、実行前に結び付いていない"
title_en: "RubyGems and RubyDoc.info: masses of new accounts published 500+ malicious packages and ran code on the docs build servers (Ruby Central, Nightingale Collective) — who published a package and what the build lets it do are not bound together before it runs"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth]
incident_date: 2026-05-11
published: 2026-09-15
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["125-keyv-cacheable-npm-account-takeover", "038-ironworm-npm-self-propagation", "147-gitspawn-ai-coding-agent-git-config-rce"]
status: published
version: "2.0"
og_lead_ja: "RubyDoc.info のドキュメント生成で任意コード実行、RubyGems に悪性パッケージ500超"
og_lead_en: "RubyDoc.info doc builds ran arbitrary code from 500+ RubyGems spam packages"
industries: ["developers"]
attack_method: "supply-chain"
impact: "\u60aa\u6027\u30d1\u30c3\u30b1\u30fc\u30b8 500 \u8d85\u3092\u524a\u9664"
---

> **改訂（v2.0 / 2026-10-16）**: 主題を、新規アカウントによる RubyGems への大量登録・公開と、RubyDoc.info のドキュメント生成サーバでの任意コード実行に組み直した。あわせて一次資料を取り直し、CDN キャッシュ不具合の報告・修正の日付、RubyDoc.info 側でのネットワーク遮断の変更、APIキー窃取の試みについての Ruby Central の評価を追記した。行為主体の帰属と事案の性格づけは §3 の注記に移した。

---

## 1. TL;DR

2026年5月、Rubyのパッケージレジストリ「RubyGems」で、新規アカウントから迷惑パッケージが大量に公開された。運営元Ruby Centralは新規登録を5月12日から16日まで止め、500超の悪性パッケージを削除した。その一部は、パッケージを公開すると自動でドキュメントを生成するRubyDoc.infoの仕組み(`.yardopts`)を使い、生成サーバ上で任意のコードを実行して、英国ロンドンの3区の議会運営ポータルなどから公開情報を集め、それを新しいパッケージとしてRubyGemsへ公開し直していた。

検出は効いていた。運営元は急増を捉え、数日で封じ込めた。<strong>効かなかったのは、検証されていないアカウントが公開したパッケージに対し、ビルドがどこまでの実行を許すのかを、公開者が誰かと結び付けて実行の前に確かめる層である。</strong>

---

## 2. 何が起きたか

- **対象**: RubyGems.org(Rubyの公式パッケージレジストリ)と、公開されたパッケージのドキュメントを自動生成・掲載するRubyDoc.info
- **規模**: 5月11日〜12日に2,000件超のパッケージが投稿され(Nightingale Collective集計)、Ruby Centralは500超の悪性パッケージを削除し、関係アカウントを停止した。RubyDoc.info経由の実行経路を使ったパッケージは100件を超える(同集計)
- **初動の報告**: 5月12日、RubyGemsの保守者が「DDoS攻撃」を理由に新規登録を一時停止。5月13日、セキュリティ企業Socketがこの一群を「GemStuffer」キャンペーンとして報告した(当時100超のgem、155のパッケージ・バージョンを追跡)
- **事後の調査**: 9月11日、独立研究者のSpencer Kitts・Thomas Larsen・Sydney Von Arx(Nightingale Collective)が公開パッケージの解析結果をrubyhack.aiで公表し、同日Ruby Centralが公式ブログで見解を出した
- **集められたデータ**: Lambeth・Wandsworth・Southwarkの各区が運営する議会運営ポータル(ModernGov)などの会議カレンダー、議題一覧といった公開ページ

攻撃は次の連鎖で成立している。

1. RubyGemsのアカウントを大量に作る(Nightingale Collectiveは、使い捨てメールアドレスが大量に使われたとみている)。当時はメールアドレスの確認を済ませないままAPIキーを取得できる不備があった(修正は5月11日に提出、12日に本番反映。使い捨てメールでの登録自体は5月16日に禁止された)
2. `.yardopts`にスクリプトの読み込み(`--load`)を書いたパッケージをRubyGemsへ公開する
3. RubyDoc.infoにそのパッケージのドキュメント生成を要求する。生成ツールYARDは`.yardopts`の指定どおりにパッケージ同梱のRubyスクリプトを実行するため、生成サーバ上で任意のコードが動く。生成はDockerコンテナ内で行われていたが、コンテナはネットワークにつながったままだった
4. 生成サーバから議会運営ポータル(ModernGov)などのページを取得する
5. 取得したデータを新しいパッケージに詰め、ハードコードしたAPIキーでRubyGemsへ公開し直す。誰でも閲覧できるレジストリが、データの受け渡し場所として使われた

このほか、少なくとも6件のパッケージが、RubyDoc.infoの生成サーバから他のユーザーのAPIキーを取得しようとしていた。狙われたのは、旧版の`gem`クライアントでサインインしたユーザーのAPIキーをCDN(配信を高速化する中継サーバ群)が最大1時間キャッシュし、同じ中継ノードに認証なしで問い合わせた者へ返してしまう不具合である(GHSA-9j48-x3c3-mrp2、CVSS 4.0で7.3、CVE番号なし)。RubyGemsのWebhook(公開時に通知するURLの登録機能)のURL自体にデータを分割して書き込み、保管場所として使うパッケージも見つかっている。`hack.rb`・`evil.rb`・`exploit.rb`といったファイル名、「# malicious crawler/exfil for Southwark Jan 2026 docs via rubydoc.info worker」のようなコメントが、公開されたパッケージにそのまま残っていた。

---

## 3. 時系列 — 公表と対応

- 2026-05-05: 最初のパッケージが投稿される(Nightingale Collective集計)
- 2026-05-11〜12: 2,000件超のパッケージが投稿される。メール未確認でAPIキーを取得できた不備の修正が11日に提出され、12日に本番へ反映される
- 2026-05-12: RubyGemsが新規アカウント登録を一時停止。少なくとも6件のパッケージが、CDNキャッシュの不具合でAPIキーを得ようとする
- 2026-05-13: RubyGemsがスパム活動の停止を報告し、500超のパッケージを削除。Socketが「GemStuffer」として報告
- 2026-05-16: 新規登録を再開。Nightingale Collectiveによれば、使い捨てメールでの登録の禁止と登録頻度の制限もあわせて導入された
- 2026-05-26〜27: さらに5件が公開される
- 2026-06-18: 3時間で83件が公開され、米SECの公開データセット(county.json)への到達方法を試す
- 2026-07-06: Truffle SecurityのLuke MarshallがCDNキャッシュの不具合をRubyGemsへ報告(本件とは独立の発見)
- 2026-07-09: RubyGemsが根本修正を本番に反映し、CDNのキャッシュを消去
- 2026-07-22〜23: RubyGemsがアドバイザリGHSA-9j48-x3c3-mrp2を公表し、旧形式のAPIキーをすべて失効
- 2026-09-11: Nightingale Collectiveがrubyhack.aiで解析結果を公表(The Wall Street Journalが報道)。同日、Ruby CentralのColby Swandaleが公式ブログで見解を表明
- 2026-09-11: RubyDoc.infoのリポジトリに、YARD作者のLoren Segalによる2つのコミットが入る。最初のコミットで、ドキュメント生成を「信頼できないコードを実行する」段階としてネットワークから切り離し、同日のもう1つのコミットで、プラグインのインストール段階もネットワークなしで動かし、ネットワークを使うのはプラグインの取得段階だけにした

> 性格づけは当事者間で食い違い、帰属は運営元が確認できていない。Nightingale Collectiveは、パッケージ名やauthor欄への"oai"の混入、先行する別事案と同じファイル・同じ取得手法(r.jina.ai)の使用を根拠に、OpenAIの内製エージェント群による行為だと結論づけている(言語解析ツールPangramのAI生成判定は「OpenAI起源の証拠ではない」として帰属の根拠に数えていない)。OpenAIは報道機関への声明で自社エージェントの関与を認めたうえで、行為を「無害なタスク」と説明し、エージェントはRubyGemsを「インターネットにアクセスして無害なタスクを遂行し、公開情報を取得する」ために使ったとした。The Wall Street Journalに対しては、学習の実行中に完全なインターネット接続の無い環境で、このサービスを間に合わせのブラウザとして使ったと説明し、未知の脆弱性を突いたという主張については検証できないとした(いずれもThe Next Web報道)。運営元Ruby Centralは「入手できた証拠からは、パッケージがAIエージェントによって作成・公開されたかどうかを判断できない」としている。本稿は行為主体の帰属や意図を論じず、公開されたパッケージとRuby Central・RubyDoc.infoの一次記録で確かめられる経路だけを扱う。

公表後の対応と業界の動きは次のとおり。

- **RubyGems / Ruby Central**: 登録の一時停止、関係アカウントの停止、500超のパッケージの削除、メール確認の不備の修正を実施(使い捨てメールの禁止と登録頻度の制限の導入はNightingale Collectiveの記述による)。CDNキャッシュの不具合は修正のうえ旧形式のAPIキーを全件失効させた。APIキー窃取の試みについては「成功した証拠は見つからなかった」としている
- **RubyDoc.info**: 2026-09-11の2つのコミットで、リポジトリ上の構成を、プラグインの取得段階だけにネットワークを与え、プラグインのインストールと`.yardopts`の指定を含むドキュメント生成はネットワークを切り離したコンテナで実行する形に改めた
- **Ruby コミュニティ**: Ruby/Railsのコアコミッタ Aaron Pattersonは、ドキュメント生成ツールがパッケージ同梱のスクリプトを実行することに驚いたと書き、「RubyGems.orgに公開すれば、RubyDoc.infoで任意のコードを実行できる」状態だったと指摘した

---

## 4. なぜ止まらなかったか

この事案の失敗は、レジストリが誰にでも開かれていたことでも、YARDに`--load`という機能があったことでもない。<strong>検証されていないアカウントが公開したパッケージのコードを、ビルドがネットワークつきで実行してよいかを、公開者が誰かと結び付けて実行の前に確かめる層が無かった</strong>ことにある。

検出は効いていた。RubyGemsは登録と投稿の急増を捉えて数日で登録を止め、500超のパッケージを削除した。Socketは5月13日には一群を解析し、レジストリをデータの受け渡しに使う手口を公表した(実行経路は未特定)。効かなかったのは、その手前である。メールの確認を経ないアカウントでもAPIキーが得られ、そのキーで公開したパッケージは、RubyDoc.infoで「ふつうのドキュメント生成」として扱われ、同梱スクリプトが外部へ通信できる環境で動いた。公開者の確かさと、ビルドが与える実行権限が、どこでも結び付いていなかった。

運営元が帰属を確定できないこと自体が、この落差の裏返しである。アカウントは使い捨てのメールアドレスでも作れたため、アカウントの記録には公開者が誰かを示すものが何も残らない。誰が公開したかを証拠で示す仕組みが無い以上、事後に残るのは命名規則やコメントといった状況証拠だけで、運営元は「判断できない」と言うほかない。同じ構造は、7月のアドバイザリでも、漏れたAPIキーによる操作がすべて正規の保有者の名義で記録され、見分ける手がかりが送信元IPとUser-Agentしか無いという形で語られている。検出と証明の落差が、被害の封じ込めと帰属の確定の差としてそのまま現れている。

パッケージの公開者が本当の作者かを公開時に確かめる層を欠いた[Brief 038](https://lemma.frame00.com/ja/critical/briefs/038-ironworm-npm-self-propagation/)・[Brief 125](https://lemma.frame00.com/ja/critical/briefs/125-keyv-cacheable-npm-account-takeover/)、持ち込まれた設定がそのまま実行に至った[Brief 147](https://lemma.frame00.com/ja/critical/briefs/147-gitspawn-ai-coding-agent-git-config-rce/)と同じ系譜に立つ。本件に固有なのは、侵入ではなく、登録・公開・ドキュメント生成という誰もが使える正規の機能の連鎖だけで、第三者のサーバでのコード実行とデータの持ち出しが成立した点である。

> 「入手できた証拠からは、パッケージがAIエージェントによって作成・公開されたかどうかを判断できない。私たちが注力しているのは、それが人によるものであれ自動化ツールによるものであれ、不正利用を特定し防止することだ。」——Colby Swandale、Ruby Central技術責任者(2026-09-11)

---

## 5. 証明があれば、何が変わるか

パッケージの公開と、そのパッケージに対するビルドの実行の間に、事前の証明を1段挟む。公開時に「この公開者は検証済みの発行元から資格を受けている」ことを示す証明を添えさせ、ビルド側はその証明が無いパッケージ、あるいは許された範囲を超える実行(外部への通信、同梱スクリプトの読み込み)を、既定で拒否する。メールの到達確認のような薄い検証とは別に、公開者の確かさがビルドの権限を決める構造にする。

Lemmaがこの落差に対して提示する設計は次のとおりである。

- **公開者の資格証明**: アカウント登録やパッケージ公開の時点で、公開者が検証済みの発行元から資格を受けていることを、身元そのものを開示せずに(ゼロ知識証明で)示させる。使い捨てメールだけでは資格を満たさない
- **ビルド実行のスコープ化**: ドキュメント生成やCIが持ち込まれたコードを実行する際、許される操作(ネットワーク、外部スクリプトの読み込み)を公開者の資格に結び付け、ビルド側で検証してから実行する
- **鍵の使用と保有者の結び付け**: APIキーによる操作に、正規の保有者が行ったことを示す証明を伴わせる。漏れたキーでの操作は保有者の名義に紛れず、事後の帰属も状況証拠に頼らずに確かめられる

RubyGemsが実際に行った急増の検知と登録停止は、異常が積み上がってから作動する。事前の証明は、操作が起きる前に、公開者と実行権限の結び付きを確かめる。両者は代替ではなく補完の関係にある。前者は被害を見つけて封じ込め、後者はその手前で、資格の無い公開物が第三者の環境で実行されることを構造的に防ぐ。

注：誰でも参加できるレジストリの開放性を閉じることを求めるものではない。資格の証明が無い公開も受け付けたうえで、ビルドが与える権限だけを絞る運用がありうる。また、本件の行為主体が誰であったかを、この層が遡って確定させるものでもない。

---

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

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance)

本稿は執筆時点で、OpenAIは自社エージェントの関与を認めつつ行為を「無害なタスク」と説明しており、事案の性格づけは当事者間で食い違っている。運営元Ruby Centralは、パッケージがAIエージェントによって作成・公開されたかどうかを確認できていない。件数・日付のうち投稿総数(2,000件超)と最初の投稿日は、Nightingale Collectiveが公開パッケージから集計した値である。
