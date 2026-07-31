---
brief_no: 116
title: "偽の OpenAI モデルが Hugging Face のトレンド1位になった — 発行者の来歴が、実行の前に独立検証されない"
title_en: "A fake OpenAI model hit #1 trending on Hugging Face — publisher provenance never verified before execution"
pillar: "02-verifiable-ai"
primary_category: "model-supply-chain"
secondary_categories: ["code-provenance", "identity-auth"]
incident_date: 2026-05-07
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["010-claude-code-leak-lure", "101-paysafe-fake-payment-sdk", "090-air-fake-agent-skill-toctou", "004-megalodon-github-supply-chain", "048-trapdoor-ai-instruction-provenance"]
status: published
version: "1.0"
og_lead_ja: "偽 OpenAI モデルが Hugging Face トレンド1位、発行者来歴が実行前に未検証"
og_lead_en: "Fake OpenAI model tops Hugging Face trending; publisher provenance unverified before execution"
gap_detected: "スキャンとトレンド監視により悪性リポジトリは把握され、公表と削除に至った。"
gap_missing: "モデル成果物と発行者の来歴が、実行の前に正規かを独立に確かめる層。"
gap_fix: "モデルの発行者来歴を実行前に独立検証し、typosquat を正規発行者から来歴で分別する。"
---

## 1. TL;DR

2026 年 5 月 7 日、HiddenLayer は Hugging Face 上の悪性リポジトリ `Open-OSS/privacy-filter` を公表した。これは OpenAI 正規の `openai/privacy-filter` リリースを typosquat したもので、model card をほぼ丸写しにし、OpenAI 公式ドキュメントへのリンクまで含めて正規に偽装していた。README だけが差し替えられ、Windows では `start.bat`、Unix 系では `loader.py` を実行するよう誘導する。`loader.py` は遠隔サーバから PowerShell コマンドを取得し、infostealer を実行する。リポジトリは 18 時間未満でトレンド 1 位・244,000 ダウンロード・667 likes に到達したが、これらの数値はほぼ確実に人為的に水増しされたものだった。スキャンとトレンド監視による検出は、事後に働いた。**効かなかったのは、そのモデルの発行者が本当に OpenAI かを、実行の前に独立に確かめる層である。**

## 2. 何が起きたか

- 悪性リポジトリ `Open-OSS/privacy-filter` は、OpenAI の正規リリース `openai/privacy-filter` を typosquat し、model card をほぼ丸写しにして、OpenAI の実物の model card PDF へのリンクまで含めて正規に見せていた。
- 正規プロジェクトと異なるのは README の一点のみで、リポジトリを clone して `start.bat`（Windows）または `python loader.py`（Linux/macOS）を直接実行するよう指示していた。
- `loader.py` は実在のローダーに見せかけたダミーコードを走らせた後、遠隔サーバから PowerShell コマンドを取得し、最終的に認証情報を収集する infostealer を実行する。
- リポジトリは削除されるまでの 18 時間未満に、トレンド 1 位・約 244,000 ダウンロード・667 likes へ到達した。（帰属は中国語圏のアクターとされるが、本 Brief の焦点ではない。）

攻撃は次の連鎖で成立している。

1. 利用者は `openai/privacy-filter` を探し、名前も見た目も酷似した `Open-OSS/privacy-filter` に到達する。model card は正規の丸写しで、OpenAI 公式ドキュメントへのリンクまで揃っている。
2. トレンド 1 位・24 万超のダウンロード・数百の likes という評判シグナルが、正規であることの根拠として受け取られる。
3. 利用者は README の指示に従い、`start.bat` または `loader.py` を実行する。
4. `loader.py` が遠隔サーバから PowerShell コマンドを取得し、infostealer が実行され、ブラウザ資格情報・トークン・ウォレット等が窃取される。

## 3. 時系列 — 公表と対応

- 2026-05-07：HiddenLayer が `Open-OSS/privacy-filter` の悪性コードを特定し、公表。この時点でリポジトリはプラットフォームのトレンド上位に位置し、24 万超のダウンロードを記録していた。
- 2026-05-07：HiddenLayer が Hugging Face のセキュリティチームへ報告。
- 2026-05-08：Hugging Face が利用規約違反を確認し、リポジトリを削除。

> 注：本 Brief の事実は HiddenLayer の一次調査と確立メディアの報道に基づく。ダウンロード数・likes 数はほぼ確実に人為的に水増しされたものであり、実際のクローン・実行の規模を表さない。667 の like アカウントの大半は `firstname-lastname###`（504 件）・`adjectivenoun####`（153 件）といった機械的命名で、bot によりトレンド一覧が操作されたと判定されている。本 Brief は攻撃者の帰属や動機の断罪ではなく、モデルの発行者来歴が実行の前に独立検証されないという構造に焦点を当てる。

公表後の対応と業界の動きは次のとおり。

- HiddenLayer は、リポジトリを clone して該当ファイルを実行した Windows ホストを侵害済みとして扱い、再イメージ化と全資格情報のローテーションを推奨した。
- 同社は、同一のコマンド取得 URL を用いる別アカウントの悪性リポジトリ群も特定し、より広範なオープンソース・エコシステムを標的とするサプライチェーン活動の一部である可能性を指摘した。

## 4. なぜ止まらなかったか

この事案の失敗は、スキャンが甘かったことでも、利用者が不注意だったことでもない。モデルハブが提供する信頼シグナル——トレンド順位・ダウンロード数・likes・model card の見た目——が、そのモデルの発行者来歴、すなわち本当に OpenAI が発行したものかを、何ら証明しないことにある。検出は効いていた。悪性コードはスキャンで特定され、リポジトリは報告を受けて削除された。効かなかったのは、その手前——利用者が実行する瞬間に、モデル成果物と発行者が正規かを独立に確かめる検証である。

利用者はパブリッシャー ID を独立に検証する手段を持たないまま実行した。丸写しの model card、公式ドキュメントへのリンク、トレンド 1 位という順位——いずれも「正規の OpenAI モデル」に見えた。だが見た目の正しさと評判の高さは、発行者が本当にその主体であることの証明ではない。さらにこの事案では、評判シグナルそのものが攻撃面になった。bot によって水増しされたトレンド順位が、正規性の代用として機能し、利用者を実行へと誘導したのである。

> ダウンロード数と likes は、本来ならモデルの信頼性を測る手がかりとして参照される。だがそれらは機械的に生成でき、順位は操作できる。「多くの人が使っている」ように見えることは、「正規の発行者が出したものである」ことの証明ではない。

同じ構造は、正規のパッケージやリリースに偽装した成果物が来歴を確かめられる前に取り込まれた [Brief 101（Paysafe 偽装決済 SDK）](https://lemma.frame00.com/ja/critical/briefs/101-paysafe-fake-payment-sdk/)・[Brief 004（Megalodon の GitHub サプライチェーン）](https://lemma.frame00.com/ja/critical/briefs/004-megalodon-github-supply-chain/)、正規に見える誘い文句が実行前に検証されなかった [Brief 010（Claude Code の漏洩を装った誘導）](https://lemma.frame00.com/ja/critical/briefs/010-claude-code-leak-lure/) と連なる。いずれも、成果物が「正規に見える」ことと、その発行者と中身がいま検証されていることが、別の問いであることを示している。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、モデルをハブから取得して実行する一つひとつの行動の前に、その成果物と発行者の来歴を独立に検証する層を経路に一段挟む。トレンド順位・ダウンロード数・likes・model card の見た目を正規性の代用にせず、「このモデルは、主張どおりの発行者が発行した、改ざんされていない成果物か」を実行が成立する前に確かめる。答えが「来歴不明」「発行者が一致しない」であれば、取得も実行も事前に保留される。

Lemma がこの primitive に対して提示する設計は次の通りである。

- **発行者来歴の実行前検証**：モデルの取得と実行を、名前や見た目の一致ではなく、発行者の検証可能な来歴に結び付ける。`openai/privacy-filter` を騙る typosquat は、正規発行者の来歴を欠くものとして実行の前に分別される。
- **評判シグナルの来歴置換**：トレンド順位・ダウンロード数・likes といった操作可能な評判シグナルを、正規性の判断根拠から外し、来歴証明で置き換える。bot による水増しが正規性の代用として通ることを排除する。
- **成果物完全性のバインド**：model card や README の見た目ではなく、モデル成果物そのものの完全性を検証可能な来歴に束ねる。丸写しのメタデータで正規に偽装した成果物は、実行の前に証明を欠くものとして分別される。
- **CI 経路への来歴検証の組み込み**：ハブからモデルを取得する CI・自動化の経路に来歴検証を組み込み、来歴を欠くモデルが取得・実行される前に止める。

Lemma は悪性コードを走査・削除する製品ではなく、ハブの評判順位を管理するものでもない。射程は、モデルの取得と実行が起きる前に、成果物と発行者の来歴を独立に検証し、typosquat と偽装成果物の通過を実行前に排除することにある。検出（悪性コードの特定、リポジトリの削除、IOC の共有）と、事前証明（取得と実行の前に発行者来歴と成果物完全性を独立検証する証跡）は、代替ではなく補完の関係にある。前者は起きた侵害の把握と封じ込めに、後者は侵害が成立する前の信頼確立に働く。設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、適用範囲は [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/verifiable-ai/) を参照。発行者と成果物の来歴を束ねる観点は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) にも接続する。

## 6. Sources

- HiddenLayer Research Team, “Malware Found in Trending Hugging Face Repository ‘Open-OSS/privacy-filter’”（2026-05-07）— <https://www.hiddenlayer.com/research/malware-found-in-trending-hugging-face-repository-open-oss-privacy-filter>
- Infosecurity Magazine, “Malicious Hugging Face Repo Impersonates OpenAI to Spread Infostealer”（2026-05）— <https://www.infosecurity-magazine.com/news/malicious-hugging-face-repo/>
- The Hacker News, “Fake OpenAI Privacy Filter Repo Hits Hugging Face Trending, Delivers Infostealer”（2026-05）— <https://thehackernews.com/2026/05/fake-openai-privacy-filter-repo-hits-1.html>
- Security Boulevard, “Fake OpenAI Repository on Hugging Face Pushes Infostealer Malware”（2026-05）— <https://securityboulevard.com/2026/05/fake-openai-repository-on-hugging-face-pushes-infostealer-malware/>

参照: [Proof-as-Auth: 鍵を一度も送らずにサインインする](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/verifiable-ai/) · [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) · [Brief 101（Paysafe 偽装決済 SDK）](https://lemma.frame00.com/ja/critical/briefs/101-paysafe-fake-payment-sdk/) · [Brief 004（Megalodon の GitHub サプライチェーン）](https://lemma.frame00.com/ja/critical/briefs/004-megalodon-github-supply-chain/)
