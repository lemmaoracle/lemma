---
brief_no: 125
title: "keyv・cacheable の npm 乗っ取り：38 分で 9 本が公開され、すべて取り下げられた — 通ったのはビルドの来歴であって、発行者の正体ではない"
title_en: "The keyv and cacheable npm takeover: nine releases published in 38 minutes, all since pulled — what the provenance attested was the build, not who was at the keyboard"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-08-04
published: 2026-08-07
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "082-xz-utils-backdoor-identity-provenance", "038-ironworm-npm-self-propagation", "090-air-fake-agent-skill-toctou"]
status: published
version: "1.0"
og_lead_ja: "keyv・cacheable の npm 乗っ取り、38 分で公開された 9 本がすべて取り下げ"
og_lead_en: "keyv and cacheable npm takeover — nine releases in 38 minutes, all pulled"
gap_detected: "署名と provenance の検証は設計どおり働いた。パッケージ群は GitHub Actions の release.yml から provenance 付きで公開される運用にある。"
gap_missing: "その来歴が、鍵の前にいるのが正規のメンテナ本人かまでは示さない。取り込みの前に発行者の正体を確かめる形が無かった。"
gap_fix: "リリースがどの発行者 ID の・どのソース状態から出たかを取り込みの前に確かめられる形にし、それを伴わないリリースの依存解決を差し止め可能にする。"
analysis_lead_ja: "確かめられないのは、ビルドが正規の workflow から出たかどうかではない。その workflow を起動したのが、正規のメンテナ本人だったかどうかである。"
---

## 1. TL;DR

2026 年 8 月 4 日、npm で広く使われるキャッシュ系パッケージ群（keyv・cacheable ほか）が、メンテナのアカウント乗っ取りを起点に汚染された。npm レジストリには、同日 **09:35 から 10:13 UTC までの約 38 分間に 9 本の版が公開され、そのすべてが後に取り下げられた**記録が残っている。取り込む側から見て、これらは正規のリリース経路を通っていた——このパッケージ群は GitHub Actions の `release.yml` から provenance 付きで公開される運用にあり、署名と来歴の検証は設計どおり働く。**効かなかったのは、その来歴が「どの workflow から出たか」を示しても、それを起動したのが正規のメンテナ本人かを、取り込みの前に確かめる層である。**

## 2. 何が起きたか

- 対象は Node.js で広く依存されるキャッシュ系パッケージ群。npm レジストリ上で、2026-08-04 に公開されたのち取り下げられた版が確認できるのは次の 9 本である。

| パッケージ | 取り下げられた版 | 公開時刻（UTC） |
|---|---|---|
| `keyv` | 6.0.0 | 09:35:00 |
| `@cacheable/node-cache` | 3.1.2 | 10:10:34 |
| `cacheable` | 2.5.1 | 10:10:44 |
| `flat-cache` | 6.1.24 | 10:10:55 |
| `cacheable-request` | 13.0.20 | 10:11:24 |
| `@cacheable/memory` | 2.2.1 | 10:11:29 |
| `file-entry-cache` | 11.1.6 | 10:13:02 |
| `@cacheable/utils` | 2.5.1 | 10:14:21 |
| `cache-manager` | 7.2.10 | 10:14:41 |

- いずれも `latest` タグは直前の版へ戻されている（`keyv` は 6.0.0 ではなく 5.6.0）。取り下げられた版の attestation は、版ごと失われている。
- このパッケージ群は npm provenance を実際に運用している。現存する `cacheable@2.5.0` の attestation を取得すると、SLSA provenance v1 が付与されており、`repository: github.com/jaredwray/cacheable`、`.github/workflows/release.yml`、`ref: refs/heads/main` が記録されている。
- GitHub 側のリポジトリには 8 月 4 日のコミットが残っていない。公開されているリリースは 8 月 3 日の `v6.0.0-rc.1` までで、その日のコミットは通常の依存更新とリリース作業である。リポジトリの `pushed_at` は 8 月 5 日で、是正の過程で履歴が整理されたとみられる。
- 汚染版の中身——インストール時に外部ランタイムを取得して難読化された窃取プログラムを実行する preinstall フック、標的となった開発・CI・クラウドの認証情報、下流への自己増殖——は、複数のセキュリティベンダーによる独立解析の報告に基づく（§6）。取り下げにより、本 Brief 執筆時点でこれらをレジストリから直接確認することはできない。

汚染は次の連鎖で成立している。

1. 攻撃者がメンテナのアカウントを掌握し、リリースを発行できる立場を得る。
2. その立場から公開されたリリースは、正規の経路を通る。取り込む側の署名検証・provenance 検証は、来歴が正規の workflow を指している限り通過する。
3. 依存を解決した環境で preinstall フックが実行され、認証情報が窃取される。
4. 窃取された認証情報でさらに公開が行われ、下流へ広がる。

## 3. 時系列 — 公表と対応

- 2026-08-03：`keyv` で `v6.0.0-rc.1` が公開される。GitHub のコミット履歴上、この日の作業は通常の依存更新とリリースである。
- 2026-08-04 09:35 UTC：`keyv@6.0.0` が公開される。
- 2026-08-04 10:10〜10:14 UTC：`cacheable`・`flat-cache`・`cacheable-request`・`file-entry-cache`・`cache-manager` ほか計 8 本が続けて公開される。
- 2026-08-04〜05：複数のセキュリティベンダーが独立に解析し、影響パッケージと初動対応手順を公表する。
- 公開された 9 本はいずれもレジストリから取り下げられ、`latest` は直前の版へ戻された。

> 本 Brief の骨格——公開・取り下げの事実、版、時刻、provenance の運用——は、npm レジストリと GitHub の API から直接確認したものである。いっぽう汚染版の中身（フックの挙動、窃取対象、伝播の規模、影響本数、ダウンロード数）は、取り下げにより一次で確認できず、ベンダーの独立解析に依拠している。当該メンテナはアカウントを乗っ取られた被害者であり、本 Brief は特定個人の過失を論じるものではない。事案は進行中で、当事者の公式なポストモーテムが出れば内容は更新されうる。

公表後の対応と業界の動きは次のとおり。

- 汚染版は取り下げられ、各社は影響環境での認証情報（npm・CI・クラウドの各トークン）の即時ローテーションと、汚染バージョンの固定・監査を推奨している。
- 本事案は 2026 年に相次いだ npm サプライチェーン侵害の一連に連なる。個別のパッケージ単位の対処が進んでも、「正規の経路を通ったまま悪性版が配られる」という形そのものは残っている。

## 4. なぜ止まらなかったか

この事案の失敗は、署名や provenance の仕組みが無かったことでも、暗号検証が破られたことでもない。**リリースがどの発行者 ID の手で起動されたかを、取り込みの前に確かめる形が無かった**ことにある。

provenance の検証は設計どおり働いていた。このパッケージ群は GitHub Actions の `release.yml` から provenance 付きで公開される運用にあり、その事実は npm の attestation API から今も確認できる。効かなかったのはその手前——provenance が答えるのは「このビルドは、このリポジトリの、この workflow から生成された」という事実であって、「その workflow を起動したのが正規のメンテナ本人か」ではない。アカウントを掌握された時点で、正規の来歴は正規のまま悪性の成果物を運ぶ。

> 取り込みは行動である。行動の前に、来歴が正しい発行者に結びついていることを確かめる形が無ければ、有効な署名はそのまま通行証になる。

38 分という短さも同じことを示している。取り下げは事後の是正として機能したが、その間に依存を解決した環境では、検証はすべて通過したうえで実行されている。これは有効な署名・来歴が悪性物を運んだ [Brief 014](https://lemma.frame00.com/ja/critical/briefs/014-tanstack-oidc-trusted-publisher/)（正規の OIDC trusted publisher で署名された悪性パッケージ）と [Brief 082](https://lemma.frame00.com/ja/critical/briefs/082-xz-utils-backdoor-identity-provenance/)（「信頼された開発者」の立場を得たうえでの正規リリースへのバックドア）の直系であり、窃取した認証情報で広がる点は [Brief 038](https://lemma.frame00.com/ja/critical/briefs/038-ironworm-npm-self-propagation/) と、検証をすべて通過した点は [Brief 090](https://lemma.frame00.com/ja/critical/briefs/090-air-fake-agent-skill-toctou/) と構造を共有する。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、依存を取り込む一つひとつの行動の前に、来歴の相手を固定する一段を経路へ挟む。署名や provenance の有効性を取り込み可否の代用にせず、「このリリースは、どの発行者 ID の・どのソース状態から出たのか」を、インストールが成立する前に、取り込む側が発行者に問い合わせずに確かめられる形にする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>発行者 ID を来歴に結びつける</strong>：リリースを、workflow だけでなくそれを起動した発行者 ID に結びつけ、どの主体の手で出たものかを取り込みの前に確かめられる形で残す。</li>
<li><strong>ソース状態への束縛</strong>：来歴を、ビルドが走った事実だけでなく、そのビルドが依拠したソースの状態に結びつける。</li>
<li><strong>取り込み前の認可</strong>：依存の解決とインストールを、来歴の確認が通った場合にのみ進め、それを伴わないリリースを行動の前に差し止め可能にする。</li>
<li><strong>再公開の連鎖を断つ</strong>：窃取された認証情報による再公開が、発行者 ID の確認を欠く限り取り込み側で通らないようにする。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>マルウェアを検知するものではない。コードが悪性かどうかを判断するのは、この結びつきを前提にした人と既存のスキャナーである。</li>
<li>アカウントの乗っ取りそのものを防ぐものではない。防ぐのは認証の側であり、この層は乗っ取られた後に出たものを見分ける材料を出す。</li>
<li>取り込みを止めるのは依存解決のポリシーであり、この層が出せるのはその判断材料までである。</li>
</ul>

自社のビルドログとの違いはここにある。ログは公開する側が自分のために出すものであり、取り込む側が独立に確かめられない。本事案で 38 分の間に取り込んだ環境では、検証はすべて通過している。

Lemma はスキャナーや署名・provenance を置き換えるものではない。スキャナー・署名検証・provenance は、この層と代替ではなく補完の関係にある。前者は既知の悪性物や無効な署名を弾き、後者は取り込みが成立する前の一点を閉じる。

## 6. Sources

- **npm レジストリ（一次・直読）**: パッケージ・メタデータ（公開時刻・取り下げ・`dist-tags`）— <https://registry.npmjs.org/keyv> ほか、本 Brief に挙げた各パッケージ
- **npm attestation API（一次・直読）**: 現存版の SLSA provenance — <https://registry.npmjs.org/-/npm/v1/attestations/cacheable@2.5.0>
- **GitHub API（一次・直読）**: リポジトリのコミット・リリース — <https://github.com/jaredwray/keyv> · <https://github.com/jaredwray/cacheable>
- **Chainguard（独立解析）**: "The keyv and cacheable npm Supply Chain Attack: Inside the Mini Shai-Hulud Campaign" — <https://www.chainguard.dev/unchained/the-keyv-and-cacheable-npm-supply-chain-attack-inside-the-mini-shai-hulud-campaign>
- **Wiz（独立解析）**: "keyv and cacheable npm Package Hijacked in Supply Chain Attack" — <https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack>
- **Snyk（独立解析）**: "Inside the keyv npm Supply Chain Compromise" — <https://snyk.io/blog/inside-keyv-npm-compromise-preinstall-malware-trusted-provenance-ide-hooks/>
- **Aikido（独立解析）**: "Keyv and friends compromised in npm supply chain attack" — <https://www.aikido.dev/blog/keyv-and-friends-compromised-in-npm-supply-chain-attack>
- **SafeDep（独立解析）**: "keyv and cacheable npm compromise" — <https://safedep.io/keyv-npm-supply-chain-compromise/>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）。設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance) · [Brief 014（TanStack）](https://lemma.frame00.com/ja/critical/briefs/014-tanstack-oidc-trusted-publisher/) · [Brief 082（xz utils）](https://lemma.frame00.com/ja/critical/briefs/082-xz-utils-backdoor-identity-provenance/)
