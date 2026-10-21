---
brief_no: 150
title: "北朝鮮IT労働者：国内の支援者から提供された身分証の画像でその支援者になりすまし、業務を受注していた(日米豪独7機関の合同文書・国内初のラップトップ・ファーム解体) — 身分証は本物でも、その持ち主と画面の向こうで働く人物を、業務を渡す前に結びつける層が無い"
title_en: "North Korean IT workers: they won contracts in Japan by posing as local enablers, using ID images the enablers supplied (joint advisory by seven agencies in Japan, the US, Australia and Germany; Japan's first laptop farm dismantled) — the ID was genuine, but nothing tied its holder to the person doing the work before the work was handed over"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth]
incident_date: 2026-09-18
published: 2026-09-24
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["141-idscan-net-drivers-license-dark-web-breach", "034-ekyc-liveness-bypass", "084-hong-kong-deepfake-video-call-fraud"]
status: published
version: "2.0"
og_lead_ja: "北朝鮮IT労働者が国内支援者の身分証で業務を受注、国内初のラップトップ・ファーム解体"
og_lead_en: "North Korean IT workers won contracts in Japan with ID images supplied by local enablers"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · なりすまし"
og_kicker_en: "CYBERATTACK · IMPERSONATION"
og_headline_ja: "国内の支援者の\n身分証で、北朝鮮の\n労働者が仕事を受けた。\n<accent>数億円相当を海外へ送金</accent>"
og_headline_en: "North Korean workers took jobs in Japan with local enablers' IDs.\n<accent>Hundreds of millions of yen sent abroad.</accent>"
key_figures:
  - value: "数億"
    unit: "円相当"
    label: "北朝鮮 IT 労働者が、暗号資産などで海外へ送金した額（関連捜査の分を含む）"
    tone: "alert"
  - value: "国内初"
    label: "支援者の自宅に置かれた遠隔操作用の PC（ラップトップ・ファーム）を把握し、解体"
  - value: "7"
    unit: "機関"
    label: "日米豪独の当局が、合同文書で活動実態を公表（2026-09-18）"
glossary:
  - term: "ラップトップ・ファーム"
    desc: "支援者の自宅などに置かれ、海外から遠隔操作される PC。作業が国内から行われているように見せる。"
  - term: "支援者（イネーブラー）"
    desc: "身分証の画像や口座、自宅の回線などを提供し、北朝鮮 IT 労働者の受注を手伝う国内の人物。"
  - term: "クラウドソーシング"
    desc: "インターネット上で、不特定の作業者に業務を発注するサービス。受注者とは画面越しにしか会わないことが多い。"
insight:
  slug: "id-image-not-the-worker"
  label: "身分証の持ち主と働く人は別"
  quote: "提出された身分証は本物だったが、その持ち主と、画面の向こうで実際に働く人物は、業務を渡す前に結びつけられていなかった。"
industries: ["developers"]
operations: ["account-admin"]
controls:
  - slug: "ownership-check"
    item: "身分証の持ち主と、実際に働く人物が同じか確認する"
  - slug: "audit-trail"
    item: "誰に業務を渡し、誰に支払ったかを記録する"
attack_method: "impersonation"
impact: "国内初のラップトップ・ファームを解体。数億円相当を海外へ送金"
takeaway: "身分証は本物でも、その持ち主と画面の向こうで働く人物を、業務を渡す前に結びつける手順が無かった。"
self_check: "業務を任せた外部の人が、身分証の持ち主と同じ人物だと、仕事を渡す前に確かめられるか。"
---

> **改訂（v2.0 / 2026-10-21）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。合同文書を読み直し、発注側の被害の事例（ソースコードの公開、Web サイトの改ざん）を加えた。関連 Brief 084 を「リアルタイムのディープフェイク」と書いていたのは、同 Brief の改訂（録画で対話は無かった）に合わせて削除した。

## 1. TL;DR

警察庁と国家サイバー統括室は 2026 年 9 月 18 日、米・豪・独の当局と合同で、北朝鮮 IT 労働者の活動実態を公表した。北朝鮮 IT 労働者は、国内に住む支援者から身分証明書の画像を受け取り、支援者になりすましてクラウドソーシングで業務を受注していた。支援者の自宅に置かれた遠隔操作用の PC（ラップトップ・ファーム）は国内で初めて把握・解体され、暗号資産などで数億円相当が海外に送金されていた。

身分証は本物で、接続も国内の支援者宅から来ている。発注する側から見れば、書類の確認も、接続元の確認も正しく通る。

不審点に気づいて採用を見送った暗号資産交換業者もあり、警察はファームを突き止めた。効かなかったのは、身分証の持ち主と、実際に作業する人物が同じであることを、業務を渡す前に確かめる層である。

## 2. 何が起きたか

- **公表**: 2026 年 9 月 18 日、警察庁・国家サイバー統括室と、米 FBI・国防総省サイバー犯罪センター（DC3）、豪 ASD's ACSC、独 BND・BfV の 7 機関が合同文書を公表した。
- **手口**: 支援者から提供された身分証明書の画像を使い、支援者になりすまして業務を受注した。支援者が受けた業務を請け負う形や、報酬の振込先に支援者名義の口座を指定し、支援者から送金させる形もあった。
- **居場所の偽装**: 支援者の自宅に遠隔操作用の PC を置かせる（ラップトップ・ファーム）か、支援者が借りた VPS を使い、国内から作業しているように見せた。
- **送金**: 関連捜査の分を含め、暗号資産などで数億円相当を海外に送金した。
- **発注側の被害**: 報酬の支払いでもめた際に、担当したプログラムのソースコードをインターネットに公開された事例と、作成に関わった Web サイトが後に改ざんされた事例があった。
- **関連する攻撃**: 同じ文書は、求人を装って IT 技術者にマルウェアを実行させるグループ「WaterPlum」も扱う。100 以上の国・地域で 3 万台以上とみられる端末が感染した。警察庁と FBI は、WaterPlum と一部の北朝鮮 IT 労働者が同じ指揮下にあると評価している。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">合同文書が示した、なりすまし就労の流れ</span></div>
<p class="rx-ex-cap">止めどころは ③。業務とアクセスを渡す前に、作業する人物が身分証の持ち主と同じかを確かめる。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">国内の支援者</div><div class="no">1</div><b>自分の身分証明書の画像を渡し、自宅に PC を置く</b><p>口座も貸す。</p></div>
<div class="rx-step"><div class="who">北朝鮮 IT 労働者</div><div class="no">2</div><b>支援者宅の PC や VPS を経由し、国内からの接続に見せる</b><p>クラウドソーシングで応募する。</p></div>
<div class="rx-step crit"><div class="who">発注側</div><div class="no">3</div><b>身分証と接続元を見て、支援者本人として業務を渡す</b><p>書類は本物で、接続も国内から。</p></div>
<div class="rx-step crit"><div class="who">支援者名義の口座</div><div class="no">4</div><b>報酬を受け取り、北朝鮮 IT 労働者へ送る</b><p>海外へ数億円相当。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2025-05**: 暗号資産交換業者 bitFlyer のエンジニア職に、別人になりすました履歴書で応募。同社は北朝鮮 IT 労働者の可能性を考えて面接し、不審点に気づいて採用を見送った（被害なし）。
- **2026-07-31**: 警察庁や外務省などが、北朝鮮 IT 労働者に関する注意喚起を公表。
- **2026-09-18**: 7 機関が合同文書を公表。国内初のラップトップ・ファームの解体も明らかにした。

> 一次情報は日米豪独 7 機関の合同文書である。ラップトップ・ファームの所在地と解体の時期、関与した支援者の人数、発注した国内企業の名前は公表されていない。「数億円相当」は文書の表記のまま扱う。

### 公表後の対応

- **発注・委託する事業者へ**: 再委託先も含めて北朝鮮 IT 労働者の関与を考え、外注・再委託の禁止条項を契約で明確にする。渡す情報とアクセスは最小限にし、疑いが出たらアカウントとセッションを無効にする。
- **採用の確認**: アクセス元の IP アドレスと居住地の突き合わせ、連絡先の確認、スキルの具体的な説明、資格の認定番号の確認を挙げた。
- **法的な注意**: 北朝鮮 IT 労働者に発注して報酬を支払った場合、または外貨獲得を幇助した場合は、国内法令や対北朝鮮制裁の違反に問われるおそれがある。また、北朝鮮の者と知って報酬を払ったり、身分証明書（画像を含む）を渡したりすると、犯罪に加担する可能性がある。

## 4. なぜ止まらなかったか

この事案の失敗は、身分証の偽造を見抜けなかったことでも、面接官の目の甘さでもない。身分証は本物で、その持ち主と、画面の向こうで実際に働く人物を、業務を渡す前に結びつける手順が無かった。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">証明は業務とアクセスを渡す前に働き、検出は兆候が表に出た後に働く。その間、作業者は身分証の持ち主として扱われる。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回なし</b>業務を渡す前に、作業者が身分証の持ち主かを確かめる</div>
<div class="rx-zone gapz"><b>落差</b><span>業務とアクセスは渡った。<br>報酬は支援者の口座へ</span></div>
<div class="rx-zone det"><b>検出の層 · 気づいた</b>受け答えや接続元の兆候で気づく</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>身分証と接続元が通る</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>業務とアクセスが渡る</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>兆候に気づく</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>アカウントを止める</b></div>
</div>
</figure>

検出は働いた。bitFlyer は経歴と受け答えの食い違いから採用を見送り、警察はファームを突き止めた。ただ、文書が挙げる確認の多くは兆候を探すもので、WaterPlum のメンバーは顔を差し替えるソフトを面接で数分だけ使い、後は回線を口実に映像を切るよう助言し合っていた。「身分証が本物である」と「働いているのがその持ち主である」は別々の事実で、兆候が消されれば前者だけで通る。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[eKYC のライブネス回避](https://lemma.frame00.com/ja/critical/briefs/034-ekyc-liveness-bypass/)（差し替えた映像で本人確認を通す）にも現れている。

## 5. 対策するには

**身分証の画像ではなく、作業する本人を、業務とアクセスを渡す前に確かめる。** 画像はコピーして渡せるので、持ち主と働く人を結びつける証拠にはならない。受注のときだけでなく、システムに入るたびに同じ本人であることを確かめ、報酬の振込先も、確かめた本人の名義にそろえる。

### 注意したい業界・業務

- **業界 · 開発者・エージェント運用**: ソフトウェア開発や Web 制作を、クラウドソーシングや業務委託で外に出す組織。ソースコードや認証情報を渡すことが多い。
- **業務 · アカウント・権限の管理**: 外部の作業者に、リポジトリや社内システムのアカウントを渡す業務。渡した後は、その人物の操作が正規の操作として扱われる。

### いまの対策で埋まるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 身分証の画像の確認 | 効かない | 身分証は実在の国内居住者のもので、本物だった。 |
| 接続元（IP アドレス）の確認 | 効かない | 接続は国内の支援者宅や、支援者が借りたサーバーから来ていた。 |
| 面接での見極め | 一部 | 受け答えの不自然さで気づいた例があるが、兆候は消されうる。 |
| 渡す情報とアクセスの最小化 | 一部 | 被害の範囲は狭まるが、誰に渡したかは分からないままになる。 |

### 必要になるもの

1. **身分証の画像ではなく、本人だけが示せる方法で確かめる。** 国内の作業者なら、マイナンバーカードの公的個人認証のように、カードと暗証番号を持つ本人しか通せない方法を使う。画像のように、コピーして手渡すことはできない。
2. **アクセスのたびに、同じ本人かを確かめる。** 受注のときに確かめた本人と、リポジトリや社内システムに入る人物が同じかを、入るたびに確かめる。疑いが出たら、アカウントとセッションを止める。
3. **誰に業務を渡し、誰に支払ったかを残す。** 報酬の振込先を確かめた本人の名義にそろえ、後から第三者に示せる形、つまり証明として残す。発注側が違反を問われたときの説明にもなる。

### 点検チェックリスト

外部の作業者への発注について、組織で確かめる 3 項目

- 外部の作業者が身分証の持ち主本人であることを、画像以外の方法で確かめているか。
- 再委託を含め、実際に作業する人物を把握できる契約になっているか。
- 作業者に渡したアカウントを、疑いが出たときにすぐ止められるか。

注：名義人が、カードや端末ごと第三者に渡す共謀は、この確認でも止められない。また、確かめる手間が増えるぶん、短期の小さな発注は出しにくくなる。

## 6. Sources

- **警察庁・国家サイバー統括室（一次・当局の公表）**: 「北朝鮮サイバー攻撃グループ『WaterPlum』（ウォータープラム）及び北朝鮮IT労働者に関する我が国、米国、豪州及びドイツによるパブリック・アトリビューションについて」（2026-09-18） — <https://www.npa.go.jp/bureau/cyber/koho/caution/caution20260918.html>
- **日米豪独 7 機関（一次・合同文書 和文）**: 「北朝鮮サイバー攻撃グループ『WaterPlum』によるIT技術者を標的としたサイバー攻撃並びに北朝鮮IT労働者の我が国、米国及び欧州における活動実態等について」（2026-09-18） — <https://www.npa.go.jp/bureau/cyber/pdf/20260918_j.pdf>
- **日米豪独 7 機関（一次・合同文書 英文）**: 「North Korean 'WaterPlum,' commonly referred to as 'Contagious Interview,' Cyber Actor Group Targeting IT Professionals; Activities of North Korean IT Workers in Japan, the United States and Europe」（2026-09-18） — <https://www.npa.go.jp/bureau/cyber/pdf/20260918_e.pdf>
- **警察庁ほか（一次・先行する注意喚起）**: 「北朝鮮IT労働者に関する企業等に対する注意喚起」（2026-07-31） — <https://www.npa.go.jp/bureau/security/northkorea_IT/NK_IT_202607.html>
- **The Register（報道）**: 「North Korea's fake job interviews infected 30,000 devices」（2026-09-18） — <https://www.theregister.com/security/2026/09/18/north-koreas-fake-job-interviews-infected-30000-devices/5297461>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
