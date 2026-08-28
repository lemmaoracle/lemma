---
brief_no: 134
title: "Cloudflare Workers で隣接テナントの JWT が Spectre で抜き取れることが示された — 盗まれたトークンが、そのまま利用者として通ってしまう"
title_en: "A co-located tenant's JWT was shown to be extractable from Cloudflare Workers via Spectre — a stolen token passes straight through as the user"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [agent-infrastructure]
incident_date: 2026-08-19
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["006-google-api-key-revocation-lag", "075-klue-oauth-salesforce-credential-lifecycle", "059-vercel-contextai-oauth", "062-claude-code-github-action-bot-trust", "083-change-healthcare-mfa-credential-access"]
status: published
version: "1.0"
og_lead_ja: "Cloudflare Workers で隣接テナントのJWTがSpectreで抽出可能"
og_lead_en: "Co-located JWT extractable from Cloudflare Workers via Spectre; a stolen token passes"
gap_detected: "検出は効きうる。悪性らしい挙動のプロセス隔離（DyPrIs）は、監視の層として機能する。"
gap_missing: "盗まれた JWT を提示した相手が、その正当な持ち主かを確かめる層が無かった。トークンの保持がそのまま本人性として通る。"
gap_fix: "セッションの認証を、再利用できる持参トークンでなく、鍵を渡さずに本人性を示す証明へ置き換える。"
---

## 1. TL;DR

Cloudflare は、テナントが 1 プロセスを共有する Workers で、**本番相当の条件下で隣接テナントの JWT を抜き取れる**リモート Spectre 攻撃を実証したと公表した。読み出しは最大 12 ビット/秒・99% 超の精度。JWT は、持っていること自体が「ログイン済み」の証明として扱われる。**効かなかったのは、トークンを提示した相手が、その正当な持ち主かを確かめる層である。**

## 2. 何が起きたか

- Cloudflare Workers Runtime チームは、学術研究者（Univ. Edinburgh の Haocheng Xiao ほか）と共同で、2021 年に評価した Workers へのリモート Spectre 攻撃を再評価した。論文（arXiv:2608.17043）を公表し、研究は 2024〜2025 年初に実施された。
- 本番環境で、最大 12 ビット/秒・99% 精度で別テナントのメモリを読み出せることを実証した。Workers は数万のテナントを V8 アイソレートで 1 プロセスに同居させており、各 Worker は独立ヒープを持つが、1 つの任意読み取りがテナントをまたいだ漏洩につながりうる。
- 常時接続用の仕組み Durable Objects を使い、WebSocket のキープアライブで 1 つのアイソレートを生かし続けることで、CPU 時間・リクエスト上限のリセットを繰り返し、攻撃に必要な持続的な計測チャネルを確保した。これにより、悪性らしいスクリプトを事後にプロセス隔離する DyPrIs を回避した。
- Cloudflare は実験として被害側 Worker に JWT を置き、それを 1 ビットずつ漏洩させたと記している。JWT は多くの Web アプリで「ログイン済み」を示す資格情報であり、静かに盗めばそのセッションを盗めることになる。

攻撃は次の連鎖で成立している。

1. 攻撃者の Worker が、被害者の Worker と同じプロセスに同居する。
2. Durable Objects と WebSocket で 1 つのアイソレートを生かし続け、持続的な計測チャネルを得る。
3. Spectre のサイドチャネルで、隣接テナントのメモリ（JWT を含む）を 1 ビットずつ読み出す。
4. 得た JWT を提示すれば、提示した相手が正当な持ち主かを問われないまま、そのセッションの利用者として通る。

## 3. 時系列 — 公表と対応

- 2024〜2025 年初：Cloudflare Workers Runtime チームが本番環境で再評価を実施。
- 2025-09：Memory Protection Keys（MPK）によるプロセス内隔離を配備。
- 2026-08（公表）：Cloudflare が論文と解説を公開。本番で 12 ビット/秒・99% 精度の漏洩を実証。**攻撃は公表時点で既に本番で緩和済み**（DyPrIs 改善・V8 Sandbox 統合・MPK 導入）。過去 3 年に実悪用の痕跡は確認されていない、と表明。

> 本 Brief は、実地の被害でなく、プラットフォーム自身による本番環境での実証を扱う。攻撃は公表時点で緩和済みで、実悪用の痕跡は確認されていない。数値（12 ビット/秒・99% 超）と緩和内容、および JWT 抽出の実験は、いずれも Cloudflare の公表に基づく。

対応と論点は次のとおり。

- プラットフォーム側は、サイドチャネルという塞ぎにくい経路に対し、隔離と検知を重ねて緩和した。これは重要な防御だが、その前提は「盗まれた資格情報は、盗んだ側では通らない」ことではない。
- JWT のような持参型トークンは、保持がそのまま本人性として扱われるため、いったん漏れれば持ち主の区別が効かない。

## 4. なぜ止まらなかったか

この事案の焦点は、Spectre というサイドチャネルの塞ぎにくさだけではない。**盗まれた JWT を提示した相手が、その正当な持ち主かを確かめる層が無い**ことにある。

JWT は、それを持っていること自体が「ログイン済みの利用者だ」という証明として扱われる（bearer トークン）。だから、同居テナントがサイドチャネルで静かにそれを読み出せば、盗んだ側は正規の利用者と区別されないまま、そのセッションで行動できる。悪性らしい挙動を検知してプロセスを隔離する DyPrIs は防御として機能するが、常時接続で回避された。効かなかったのはその手前——「このトークンを出しているのは、本当にその持ち主か」を確かめる層である。

> 持参型の資格情報は、保持がそのまま本人性として通る。トークンが漏れた瞬間、持ち主と盗んだ側の区別は消える。本人性は、トークンの保持ではなく、鍵を渡さずに示せる証明で初めて担保される。

これは、失効後もしばらく有効だった資格情報が使われた [Brief 006](https://lemma.frame00.com/ja/critical/briefs/006-google-api-key-revocation-lag/)、失効されない古い資格情報と長命 OAuth が侵入経路になった [Brief 075](https://lemma.frame00.com/ja/critical/briefs/075-klue-oauth-salesforce-credential-lifecycle/) と同じ方向にある。共通するのは、資格情報の「保持」と「正当な持ち主であること」が結び付いていないことである。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、セッションの認証を、再利用できる持参トークンから、鍵を渡さずに本人性を示す証明へ置き換える。トークンが漏れないようにするのではない（サイドチャネルは塞ぎにくい）。漏れたトークンが、そのまま利用者として通らないようにする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>鍵を渡さない本人性の証明</strong>：セッションの認証を、持参すれば通る秘密（bearer トークン）でなく、鍵そのものを送らずに正当な持ち主だけが示せる証明に置く。</li>
<li><strong>提示者の正当性の検証</strong>：資格情報を受け取った側が、「これを出しているのは正当な持ち主か」を、行動を認可する前に確かめられる形にする。保持を本人性の代用にしない。</li>
<li><strong>スコープと短命化</strong>：セッションで示せる権限を必要な範囲に固定し、漏れた場合の再利用の窓を狭める。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>Spectre のようなサイドチャネルそのものを塞ぐのは、ランタイムと CPU の隔離・緩和の仕事である。この層はその後段で、漏れたトークンが利用者として通らないようにする。</li>
<li>証明が示せるのは提示者が正当な持ち主かまでで、利用者側の端末が別経路で侵害された場合までは守れない。</li>
<li>どのセッションにこの認証を課すかを決めるのは運用者であり、この層が出せるのはその手段までである。</li>
</ul>

自社のアクセスログとの違いはここにある。ログはトークンが使われた後に残るが、それを出したのが正当な持ち主かを、行動の前に区別する材料にはならない。

検出の層と、この層は代替ではなく補完の関係にある。前者は悪性らしい挙動を捉えて漏洩の確率を下げ、後者は「漏れたトークンが、そのまま利用者として通らない」ようにする。

## 6. Sources

- **Cloudflare（一次・公式発表）**: "A revisit of remote Spectre attacks on Workers"（2026-08）— <https://blog.cloudflare.com/revisiting-spectre-attacks-on-workers/>
- **arXiv（一次・論文）**: Pedersen, Xiao, Ainsworth, Topham, Schwarzl, "Remote Spectre attacks on Cloudflare Workers"（arXiv:2608.17043）— <https://arxiv.org/pdf/2608.17043>
- **The Hacker News（独立報道）**: "Cloudflare Workers Spectre Attack Leaks JWT From Co-Located Worker at 12 Bits/Second"（2026-08）— <https://thehackernews.com/2026/08/cloudflare-workers-spectre-attack-leaks.html>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。設計は[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)。エージェント権限の証明は[Pillar 03 — エージェント権限](https://lemma.frame00.com/ja/pillars/#authority)。

攻撃は公表時点で本番環境において緩和済みです。
