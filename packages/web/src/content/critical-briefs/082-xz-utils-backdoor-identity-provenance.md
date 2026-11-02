---
brief_no: 82
title: "xz utils：メンテナーの権限を得た「Jia Tan」が、署名済みの正規リリースにバックドアを埋め込んだ(CVE-2024-3094、Andres Freund / CISA)"
title_en: "xz utils: \"Jia Tan,\" after gaining maintainer authority, planted a backdoor in signed official releases (CVE-2024-3094, Andres Freund / CISA)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2024-03-29
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["004-megalodon-github-supply-chain", "014-tanstack-oidc-trusted-publisher"]
status: published
gate: "intake"
version: "1.0"
og_lead_ja: "xz utils：約 2 年の貢献で権限を得た「Jia Tan」が、署名済みのリリース 5.6.0／5.6.1 にバックドアを埋め込んだ（CVE-2024-3094）"
og_lead_en: "xz utils: \"Jia Tan,\" who gained authority over about two years of contributions, planted a backdoor in signed releases 5.6.0 / 5.6.1 (CVE-2024-3094)"
search_title: "xz のバックドア（CVE-2024-3094）：経緯と対策"
search_description: "xz utils の署名済みリリース 5.6.0／5.6.1 に、約 2 年の貢献で権限を得た「Jia Tan」がバックドアを埋め込んだ（CVE-2024-3094、CVSS 10.0）。何が起きたか、なぜ署名で止まらないか、対策を整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "サプライチェーン攻撃 · OSS のバックドア"
og_kicker_en: "SUPPLY CHAIN · OSS BACKDOOR"
og_headline_ja: "権限を得た開発者が、\n署名済みの版に仕込んだ。\n<accent>CVSS 10.0</accent>"
og_headline_en: "Signed releases\ncarried a backdoor.\n<accent>CVSS 10.0</accent>"
key_figures:
  - value: "10.0"
    unit: "CVSS"
    label: "CVE-2024-3094 の深刻度（NIST NVD）"
    tone: "alert"
  - value: "約 2"
    unit: "年"
    label: "「Jia Tan」が貢献を始めてから、バックドア入りの 5.6.0 が出るまで"
  - value: "約 500"
    unit: "ms"
    label: "発見のきっかけになった SSH ログインの遅延（Andres Freund）"
glossary:
  - term: "PGP 署名"
    desc: "ファイルが特定の鍵で署名されたことを示す仕組み。署名が有効でも、その鍵の持ち主が誰かは、署名だけでは分からない。"
  - term: "リリースアーカイブ"
    desc: "配布用にソースをまとめた圧縮ファイル（.tar.gz）。今回は、git のソースには無いファイルが、アーカイブにだけ含まれていた。"
insight:
  slug: "valid-signature-is-not-identity"
  label: "有効な署名は、持ち主の照合ではない"
  quote: "署名が有効でも、その鍵の持ち主が誰かを、権限を渡す前に照合しなければ、実在の確認できない開発者のリリースも、正規として通る。"
industries: ["developers"]
operations: ["delivery", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "リリースに署名した開発者が、実在の本人か確認する"
attack_method: "supply-chain"
impact: "Linux で広く使われる圧縮ライブラリの署名済みリリースにバックドア（CVSS 10.0）"
takeaway: "リリースは「Jia Tan」の鍵で有効に署名されていたため、署名の検証ではバックドアに気づけず、発見は SSH の遅延という偶然の観察に拠った。"
self_check: "リリースや署名の権限を渡す前に、受け取る開発者が実在の本人かを照合しているか。"
countries: ["global"]
---

## 1. 要点

「Jia Tan」は、品質の高いパッチを出し続けてプロジェクトの信頼を得て、リリースの作成と署名を含む実質的なメンテナーの権限を得た。バックドアはソースツリーに直接書かれず、ビルドスクリプトと、リリースアーカイブにだけ含まれるテストファイルの組み合わせで隠され、アーカイブは「Jia Tan」の PGP 鍵で有効に署名されていた。<strong>署名が有効でも、その鍵の持ち主が誰かを、権限を渡す前に照合しなければ、実在の確認できない開発者のリリースも、正規として通る。</strong>

## 2. 通った操作

- **通った操作**: 「Jia Tan」の PGP 鍵で署名されたリリースアーカイブ 5.6.0／5.6.1 の公開と、各ディストリビューションでの正規パッケージとしての取り込み。その前に、約 2 年の貢献と既存のメンテナーへの直接の接触を経て、リリースの作成・署名を含む実質的なメンテナーの権限が渡っていた。
- **受け付けた側に届くもの**: 一般に、リリースを取り込む側に届くのは、アーカイブと有効な署名で、鍵の持ち主が誰かは、署名からは分からない。今回のバックドアは、Autoconf のビルドスクリプト（`build-to-host.m4`）と、`.tar.gz` のアーカイブにだけ含まれる難読化されたテストファイルの組み合わせで、`git clone` のソースには現れなかった（Andres Freund・Binarly）。
- **届いた範囲**: Fedora Rawhide と、一部の Debian testing／unstable。主要な安定版には、届く前に発覚した。攻撃が実際に使われた証拠は確認されていない。
- **公表されていないこと**: 「Jia Tan」が誰か。タイムゾーンやコミット時刻などの分析から国家レベルのアクターの関与が議論されているが、帰属は確定していない。

## 3. 何を照合するか

経路を問わず区別できる条件は、リリースや署名の権限を渡す前に、その鍵の持ち主が、プロジェクトが承認した実在の人物に対応するかを照合することである。

- **誰が承認を出すか**: 権限を渡すプロジェクトのメンテナーと、そのプロジェクトのリリースを取り込むディストリビューション。貢献の量や質、有効な署名は、鍵の持ち主の承認にならない。
- **どこで照合するか**: メンテナーやリリースの権限を渡す前と、署名済みのリリースを取り込む前。持ち主を照合できない鍵で署名されたリリースは、取り込まずに保留にする。
- **何が残るか**: 誰が、誰に、どの権限を渡したかと、どのリリースを、どの署名者の確認で取り込んだかの記録。あとから、どの版が誰の署名で入ったかを示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝権限を渡す前とリリースを取り込む前に、鍵の持ち主が承認された実在の人物かを照合し、記録に残すこと。検知＝配布の後に、動作の異常から気づくこと。日付は 05 の時系列に拠る。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>権限を渡す前とリリースを取り込む前に、鍵の持ち主を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>署名済みの 5.6.0／5.6.1 が公開された<br>Fedora Rawhide などの開発版に届いた</span></div>
<div class="rx-zone det"><b>検知 · 配布の後に働いた</b>SSH ログインの遅延から、安定版に届く前に発見</div>
<div class="rx-g g1"><div class="t">2021年末〜</div><b>「Jia Tan」が貢献を始める</b></div>
<div class="rx-g g2"><div class="t">2024-02-24</div><b>バックドア入りの 5.6.0 を公開</b></div>
<div class="rx-g g3"><div class="t">2024-03-09</div><b>5.6.1 を公開</b></div>
<div class="rx-g g4"><div class="t">2024-03-29</div><b>Andres Freund が報告・CISA が勧告</b></div>
</div>
</figure>

発見は安定版に届く前だったが、それまでに署名済みのリリースは、開発版のディストリビューションに正規のパッケージとして入っていた。同じように、署名や認証が有効なまま、中身や署名者の出どころが照合されなかった事案に、[盗まれた開発者の認証情報での push](https://lemma.frame00.com/ja/critical/briefs/004-megalodon-github-supply-chain/)（Brief 004）、[正規の OIDC 署名つきで公開された悪性の npm パッケージ](https://lemma.frame00.com/ja/critical/briefs/014-tanstack-oidc-trusted-publisher/)（Brief 014）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、権限を渡す手順とリリースを取り込む手順に組み込む。** 動作の異常を見張るのではなく、権限を渡す前とリリースを取り込む前に、鍵の持ち主が承認された実在の人物かを照合し、照合できないものを通さない。

### 注意したい業界・業務

- **業界 · 開発者・エージェント運用**: OSS のリリースを依存やパッケージとして取り込み、ビルドや配布に流す開発者・組織・ディストリビューション。
- **業務 · 配信・送付**: 署名済みのリリースアーカイブを公開し、各ディストリビューションが正規のパッケージとして配布する流れ。
- **業務 · アカウント・権限の管理**: OSS プロジェクトで、コミット権やリリースの作成・署名の権限を、貢献者に渡す手順。

### いまの対策と Lemma の違い

今回の経路は、メンテナーの権限を得た者が署名したリリースを、各ディストリビューションが取り込む操作である。

| 対策 | メンテナーの権限を渡す | 署名済みのリリースを取り込む |
| --- | --- | --- |
| 署名の検証 | 関係しない | 効かない |
| `git clone` のソースのレビュー | 関係しない | 効かない |
| 動作の異常の検知（遅延・Valgrind の出力） | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 |

署名の検証は、署名が有効だったため、バックドアに気づかない。ソースのレビューは、バックドアが `git clone` のソースに現れず、アーカイブにだけ含まれていたため、見分けにくい。動作の異常の検知は、今回の唯一の発見の経路で、安定版に届く前に働いたが、開発版のディストリビューションにはすでに入っていた。Lemma は、権限を渡す前に、受け取る者の鍵が承認された実在の人物に対応するかを照合する。リリースを取り込む前には、署名者がその照合を通った者かを照合するが、中身が安全かは判定しない。

注：Lemma の照合が働くのは、権限を渡す手順とリリースを取り込む手順に照合を組み込み、プロジェクトが、承認した人物と鍵の対応を管理している場合に限る。照合を通った本人が悪意を持って署名した場合や、照合を通った者の鍵が盗まれた場合は、この照合を通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

OSS のリリースを取り込む開発の組織で確認する 3 項目

- 取り込む OSS のリリースアーカイブが、公開されたソースと同じ中身か確認しているか。
- 署名の検証のほかに、署名した鍵の持ち主が誰かを確認する手順があるか。
- どのリリースを、誰の署名の確認で取り込んだかを記録しているか。

## 5. 事実と時系列

- **対象**: xz utils（liblzma）。Linux／Unix 系のシステムで広く使われる圧縮ライブラリで、多数のディストリビューションに標準で入っている。
- **CVE**: CVE-2024-3094（CVSS 10.0・NIST NVD）。
- **発見**: Andres Freund（Microsoft 所属のエンジニア）が、Valgrind の出力と SSH ログインのわずかな遅延（約 500ms）に気づいて調べ、2024-03-29 に Openwall のメーリングリストへ報告した。
- **攻撃者**: 「Jia Tan」（GitHub: JiaT75）。実在が確認できない人物。国家レベルのアクターの関与は状況証拠に留まり、確定されていない。
- **手口**: バックドアは、Autoconf のビルドスクリプト（`build-to-host.m4`）と、`.tar.gz` のアーカイブにだけ含まれる難読化されたテストファイルの組み合わせで隠された。systemd と結び付いた `openssh-server` が liblzma を読み込むとき、公開鍵認証の処理に割り込み、攻撃者の特定の秘密鍵の持ち主が RCE を実行できる状態になる。
- **署名**: リリースアーカイブは「Jia Tan」の PGP 鍵で署名され、署名は技術的に有効だった。
- **届いた範囲**: Fedora Rawhide と、一部の Debian testing／unstable。主要な安定版には届く前に発覚した。

### 時系列

- **2021年末〜2022年初頭**: 「Jia Tan」が xz プロジェクトへの貢献を始める。品質の高いパッチを出し続け、信頼を得る。
- **2022〜2023年**: コミット権を得て、既存のメンテナー（Lasse Collin 氏）の作業を少しずつ引き継ぎ、中心の貢献者になる。同じ時期に、既存のメンテナーへ外部から「もっと積極的にリリースを」と迫る不審なアカウント群も確認されている。
- **2024-02-24**: xz utils 5.6.0 を公開。バックドアを含むビルドスクリプトが初めて入る。
- **2024-03-09**: xz utils 5.6.1 を公開。バックドアの細部が更新される。
- **2024-03-29**: Andres Freund が liblzma のバックドアを見つけ、Openwall のメーリングリストとセキュリティの関係者に報告する。
- **2024-03-29〜30**: CISA と各 Linux ディストリビューターが緊急の勧告を出し、影響を受けた版のダウングレードを推奨する。
- **2024-03-29 以降**: 「Jia Tan」のアカウントの活動が止まる。Binarly・Openwall などから詳しい技術解析が続けて公表される。

> 固有名・CVE・版は、Openwall（Andres Freund の一次報告）・NIST NVD・CISA の一次情報に拠る。国家レベルのアクターへの帰属は状況証拠に留まり、確定されていない。各ディストリビューターの対応は時点により異なるため、最新の情報を参照のこと。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Andres Freund（Microsoft）**: 発見した日に、コミュニティと CISA に知らせた。
- **CISA**: 緊急のアラートを出し（2024-03-29）、影響を受けた版からのダウングレードを推奨した。
- **各 Linux ディストリビューター**: Fedora・Debian・openSUSE・Arch などが、ダウングレードのパッケージを配布した。
- **Binarly**: 難読化されたビルドスクリプトとテストファイルの詳しい技術解析を公表した。

## 6. Sources

- **Andres Freund（一次報告）**: Openwall メーリングリスト投稿「backdoor in upstream xz/liblzma leading to ssh server compromise」（2024-03-29）— https://www.openwall.com/lists/oss-security/2024/03/29/4
- **CISA 緊急アラート**: "CISA Adds One Known Exploited Vulnerability to Catalog" / XZ Utils Backdoor Advisory（2024-03-29）
- **Binarly**: "XZ Utils Supply Chain Backdoor: Technical Analysis"（2024-03〜04）
- **NIST NVD**: CVE-2024-3094 エントリー — https://nvd.nist.gov/vuln/detail/CVE-2024-3094
- **Ars Technica**: "What we know about the xz Utils backdoor that almost infected the world"（2024-03-29）

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
