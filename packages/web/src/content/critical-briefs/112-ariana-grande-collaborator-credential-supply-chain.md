---
brief_no: 112
title: "アリアナ・グランデ：未発表曲は本人ではなく、協力者の最も弱いアカウントから抜かれた — なりすましと古い認証情報が、行動の前に独立検証されない"
title_en: "Ariana Grande: the unreleased tracks were taken from her collaborators' weakest accounts, not from her — impersonation and stale credentials never verified before the action"
pillar: "01-verifiable-origin"
primary_category: "identity-auth"
secondary_categories: ["data-provenance"]
incident_date: 2026-07-27
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["047-openclaw-agent-phishing", "075-klue-oauth-salesforce-credential-lifecycle", "064-salesloft-drift-oauth-salesforce", "006-google-api-key-revocation-lag", "013-coinbase-kyc-insider-breach"]
status: published
version: "1.0"
og_lead_ja: "アリアナ・グランデ提訴：協力者の認証情報が行動前に検証されず未発表曲流出"
og_lead_en: "Ariana Grande suit: collaborator credentials unverified before the action"
gap_detected: "漏洩と転売は事後に把握され、2026 年 7 月に法的手続きへ持ち込まれた。"
gap_missing: "協力者のアカウントへのアクセスと素材の受け渡しが、行動ごとに正規かを独立に確かめる層。"
gap_fix: "アクセスと受け渡しの前に、認証情報の来歴と認可を独立検証し、なりすましを実行前に排除する。"
---

## 1. TL;DR

アリアナ・グランデは 2026 年 7 月 27 日、氏名不詳の攻撃者（John Doe 1–100）を相手取り、未発表曲・録音映像・私的写真の窃取と転売をめぐってロサンゼルス郡上級裁判所に提訴した。狙われたのは本人のアカウントではない。長年ともに働くフォトグラファー・プロデューサー・技師といった協力者の、最も弱いアカウントと端末である。2019 年にはフォトグラファーの Dropbox 認証情報、2020 年にはプロデューサーの端末、2024 年にはなりすましの Gmail アカウントとドメインで欺かれた技師が、順に突破口になった。漏洩の検知と事後の法的追跡は働いた。**効かなかったのは、協力者のアカウントへのアクセスと素材の受け渡しが、行動ごとに正規かを独立に確かめる層である。**

## 2. 何が起きたか

- 提訴は 2026 年 7 月 27 日、ロサンゼルス郡上級裁判所。被告は John Doe 1 と Does 2–100。主張はプライバシー侵害、カリフォルニア州包括的コンピュータデータアクセス・詐欺法（CDAFA）違反、および conversion（動産の不法領得）。
- 漏洩は 2011 年のデビュー以降、断続的に続いてきたとされる。2023 年だけで未発表曲 45 曲が窃取・流出した。対象素材は未発表マスターとデモ、録音セッションの映像、ミュージックビデオ、舞台裏の写真・動画、アルバムや撮影のアウトテイクを含む。
- 手口の共通点は、本人ではなく、近しく働く協力者の個人アカウント・端末を侵害し、得た素材をダークウェブで転売した点にある。

攻撃は次の連鎖で成立している。

1. 2019 年：フォトグラファーの Dropbox のログイン認証情報が窃取された。
2. 2020 年：プロデューサーの携帯端末が侵害され、未発表マスター・デモ・映像が流出した。
3. 2023 年：攻撃者が未発表曲 45 曲にアクセスし、流出させた。
4. 2024 年：別のフォトグラファーに雇われたデジタル技師を標的にフィッシングが行われた。攻撃者はそのフォトグラファーになりすました Gmail アカウントとインターネットドメインを作成し、技師を騙してグランデの素材を送らせた。

## 3. 時系列 — 公表と対応

- 2011 年〜：デビュー以降、未発表素材の漏洩が断続的に発生。
- 2019 年：フォトグラファーの Dropbox 認証情報が窃取される。
- 2020 年：プロデューサーの端末が侵害され、素材が流出。
- 2023 年：未発表曲 45 曲が窃取・流出。
- 2024 年：なりすましの Gmail アカウント・ドメインを用いた技師へのフィッシング。
- 2026-07-27：ロサンゼルス郡上級裁判所に提訴（John Doe 1–100）。
- 2026-07-31：第 8 スタジオ・アルバム『petal』を自身のレーベル BabyDoll Music と Republic Records から発売予定（提訴の数日後）。

> 注：本 Brief の事実は提訴と確立メディアの報道に基づく。訴訟は係争中であり、金銭的被害額は訴状で確定されておらず、本 Brief では規模を断定しない。John Doe 訴訟は、開示手続き（discovery）を通じて匿名の当事者の身元特定を図る手法である。本 Brief は攻撃者の動機・行為の断罪ではなく、協力者アカウントへのアクセスと素材の受け渡しが行動の前に独立検証されないという構造に焦点を当てる。

公表後の対応と業界の動きは次のとおり。

- 原告側は、ISP など記録を保持する事業者への召喚（subpoena）を通じ、IP アドレス・アカウント・端末から匿名の攻撃者を特定する方針とされる。
- 窃取された素材はダークウェブで「相当な額」で転売されたと訴状は主張している。

## 4. なぜ止まらなかったか

この事案の失敗は、グランデ本人のセキュリティが弱かったことでも、個々の攻撃者が突出して巧妙だったことでもない。本人と素材をつなぐ協力者——フォトグラファー、プロデューサー、技師——のアカウントと端末が、そこを通るアクセスと受け渡しのたびに正規かを独立に確かめられなかったことにある。検出は効いていた。漏洩は把握され、転売は追跡され得るし、攻撃者は開示手続きで特定され得る。効かなかったのは、その手前——アクセスと受け渡しが起きる瞬間の検証である。これは検出層の射程外にある、構造的に独立した層の落差である。

守るべき対象がどれだけ堅牢でも、信頼の輪は最も弱い協力者のエンドポイントの強度で決まる。2019 年の Dropbox 認証情報、2020 年の端末、2024 年のなりすましは、いずれも「正規の協力者による正規のアクセス」に見えた。盗まれた認証情報は本物であり、なりすましのドメインは本物らしく、受け渡しの相手は信頼された関係者に見えた。差し出された資格情報や送信元の見た目が信頼の代用として通り、その資格情報がいまこの行動を本当に認可されているかは、行動の前に問われなかった。

> 2024 年の突破口が象徴的である。技師は「フォトグラファーからのメール」を信じて素材を送った。だが送信元は、そのフォトグラファーになりすまして作られた Gmail アカウントとドメインだった。見た目の正しさは、その相手が本当にその人物であることの証明ではない。

同じ構造は、失効されない/盗まれた認証情報や連携権限が正規のアクセスとして通った [Brief 075（Klue→Salesforce）](https://lemma.frame00.com/ja/critical/briefs/075-klue-oauth-salesforce-credential-lifecycle/)・[Brief 064（Salesloft Drift の OAuth トークン窃取）](https://lemma.frame00.com/ja/critical/briefs/064-salesloft-drift-oauth-salesforce/)、送信者を確かめる前に認証情報を送り出した [Brief 047（OpenClaw のエージェント・フィッシング）](https://lemma.frame00.com/ja/critical/briefs/047-openclaw-agent-phishing/) と連なる。いずれも、資格情報や連携が「本物」であることと、その行動がいま認可されていることが、別の問いであることを示している。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、協力者がアカウントにアクセスし素材を受け渡す一つひとつの行動の前に、その認証情報の来歴と認可の状態を独立に検証する層を経路に一段挟む。差し出された資格情報や送信元の見た目を信頼の代用にせず、「この認証情報は、いまこの行動を、この範囲で認可されているか」を行動が成立する前に確かめる。答えが「認可なし」「来歴不明」であれば、アクセスも受け渡しも事前に保留される。

Lemma がこの primitive に対して提示する設計は次の通りである。

- **行動ごとの認可証明**：アカウントへのアクセスや素材の受け渡しを、静的な認証情報の所持ではなく、その行動をいま認可されていることの独立検証可能な証明に結び付ける。盗まれた認証情報の単純な再利用を、行動の前に排除する。
- **送信元・相手の来歴バインド**：受け渡しの相手が主張する身元（「あのフォトグラファー」）を、なりすまし可能な表示名やドメインの見た目ではなく、検証可能な来歴に束ねる。なりすましのアカウントやドメインは、実行の前に証明を欠くものとして分別される。
- **認証情報のライフサイクル検証**：古い・失効すべき・共有された認証情報が「正規」として通り続けない設計。認証情報の発行から失効までの状態を、行動のたびに独立に確認する。
- **選択的な受け渡し記録**：誰が・どの範囲で・どの認可の下で素材にアクセスし受け渡したかを、後から改ざんできない証跡として残す。漏洩が起きた場合に、経路と認可の状態を独立に立証できる。

Lemma は素材の窃盗そのものを防ぐ製品ではなく、闇市場での価値を左右するものでもない。射程は、アクセスと受け渡しが起きる前に、認証情報の来歴と認可を独立に検証し、なりすましと失効済み認証情報の通過を実行前に排除することにある。検出（漏洩の把握、転売の追跡、提訴による事後の救済）と、事前証明（アクセスと受け渡しが起きる前に認証情報の来歴と認可を独立検証する証跡）は、代替ではなく補完の関係にある。前者は起きた被害の把握と回復に、後者は被害が成立する前の信頼確立に働く。設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance) を参照。

## 6. Sources

- Rolling Stone, “Ariana Grande Sues Hackers Over Alleged Theft of Unreleased Music, Photos, and Video Footage”（2026-07-27）— <https://www.rollingstone.com/music/music-news/ariana-grande-sues-hackers-unreleased-music-leak-1235599473/>
- Variety, “Ariana Grande Sues Hackers for Leaking Unreleased Music and Footage”（2026-07）— <https://variety.com/2026/music/news/ariana-grande-sues-hackers-leaking-unreleased-music-footage-1236822277/>
- The Hollywood Reporter, “Ariana Grande Sues Over Years-Long Hacking Campaign Targeting Inner Circle”（2026-07）— <https://www.hollywoodreporter.com/business/business-news/ariana-grande-sues-over-yearslong-hacking-campaign-music-1236657620/>
- CBC News, “Ariana Grande sues hackers for leaking and selling her unreleased music for years”（2026-07）— <https://www.cbc.ca/news/entertainment/ariana-grande-sues-hackers-leaking-music-9.7287374>
- IBTimes UK, “Ariana Grande Sues Dark Web Hackers Over Theft of 45 Unreleased Songs”（2026-07）— <https://www.ibtimes.co.uk/ariana-grande-lawsuit-unreleased-songs-dark-web-1811135>

参照: [Proof-as-Auth: 鍵を一度も送らずにサインインする](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance) · [Brief 047（OpenClaw のエージェント・フィッシング）](https://lemma.frame00.com/ja/critical/briefs/047-openclaw-agent-phishing/) · [Brief 075（Klue→Salesforce）](https://lemma.frame00.com/ja/critical/briefs/075-klue-oauth-salesforce-credential-lifecycle/)
