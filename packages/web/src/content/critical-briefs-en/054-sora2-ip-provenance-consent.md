---
brief_no: 54
title: "OpenAI Sora 2: Launched with a policy letting copyrighted characters be generated unless the rightsholder opted out (CODA and the Japanese government made requests)"
title_en: "OpenAI Sora 2: Launched with a policy letting copyrighted characters be generated unless the rightsholder opted out (CODA and the Japanese government made requests)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["training-data-provenance", "attribute-proof-bypass"]
incident_date: 2025-10-15
published: 2026-06-13
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["008-discord-scraping", "036-commonpool-training-data-pii", "011-synthid-watermark-reverse-engineering", "053-youtube-deepfake-likeness-provenance"]
status: published
gate: "agent-operation"
version: "1.0"
og_lead_ja: "OpenAI Sora 2：権利者が拒否しない限り著作権キャラを生成できる方針で公開し、約 3 日で事前許諾へ改めると表明した"
og_lead_en: "OpenAI Sora 2: launched letting copyrighted characters be generated unless rightsholders opted out, then announced a move to opt-in within about three days"
search_title: "Sora 2 の著作権キャラ問題：CODA・政府の要請と対策"
search_description: "OpenAI は Sora 2 を、権利者が拒否しない限り著作権キャラを生成できる方針で公開し、約 3 日で事前許諾へ改めると表明した。CODA と日本政府も要請。何が通ったか、何を照合するか、対策を整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "生成 AI の事例 · 著作権と許諾"
og_kicker_en: "GENERATIVE AI · COPYRIGHT CONSENT"
og_headline_ja: "Sora 2 は著作権キャラを\n権利者が拒否しない限り\n生成できる方針で公開。\n<accent>約 3 日で事前許諾へ</accent>"
og_headline_en: "Sora 2 let users make\ncopyrighted characters\nunless owners opted out.\n<accent>Opt-in within ~3 days</accent>"
key_figures:
  - value: "~3"
    unit: "days"
    label: "From launch until OpenAI announced a move to an opt-in (prior-permission) model for copyrighted characters (OpenAI's statements and reporting)"
    tone: "alert"
  - value: "opt-out → opt-in"
    label: "From the launch policy of \"generatable unless refused\" to a model that \"requires permission in advance\" (OpenAI's statements)"
  - value: "10-16 → 10-23"
    label: "When the Japanese government formally requested that OpenAI seek rightsholders' permission in advance (2025, reporting)"
glossary:
  - term: "Opt-out (refusal after the fact)"
    desc: "A model under which material may be used unless the rightsholder comes forward to refuse. Sora 2's policy at launch."
  - term: "Opt-in (prior permission)"
    desc: "A model under which only material the rightsholder has permitted in advance is used. OpenAI announced a move to it within about three days of launch."
  - term: "CODA"
    desc: "The Content Overseas Distribution Association, whose members include Studio Ghibli, Bandai Namco, and Toei Animation."
insight:
  slug: "not-refused-is-not-permitted"
  label: "Not refused vs permitted"
  quote: "\"Not refused\" does not mean \"permitted,\" so unless a record of permission is checked before generation, generation using copyrighted works produces unpermitted output too, and it can only be questioned after it spreads."
industries: ["media", "ai"]
controls:
  - slug: "hold-unverified"
    item: "Do not generate copyrighted characters until the rightsholder's permission is confirmed"
takeaway: "OpenAI launched Sora 2 with a policy letting copyrighted characters be generated unless the rightsholder opted out, and within about three days announced a move to opt-in. Check the rightsholder's permission before generation that uses copyrighted works."
self_check: "Before you generate using copyrighted works or other people's material, do you check that the rightsholder has given permission?"
countries: ["us", "jp"]
---

## 1. Summary

The launch policy left confirmation of permission not to before generation, but to rightsholders coming forward afterward to refuse. Right after launch, videos including characters from well-known works were generated and spread on social media, followed by criticism from the MPA and artists and by requests from CODA and the Japanese government. Per-output violation judgments and rightsholder objections work after generation and spread, and do not reach as far as recovering output that has already spread. <strong>"Not refused" does not mean "permitted," so unless a record of permission is checked before generation, generation using copyrighted works produces unpermitted output too, and it can only be questioned after it spreads.</strong>

## 2. What got through

- **What got through**: Generation of videos including copyrighted characters whose rightsholders had not explicitly opted out. Right after launch, Pikachu, SpongeBob, full-episode-style South Park, and the like were easily generated (reporting).
- **What reached the receiving side**: In general, under an opt-out model the condition for generation is that no refusal has been filed, not that the rightsholder has given permission. At the moment of generation, which material was used under which permission cannot be told from the output.
- **CODA's position**: CODA treated reproduction during training as potentially infringing and flagged outputs closely resembling One Piece, Demon Slayer, Pokémon, Mario, and the like. It said the opt-out model inverts the burden of consent and runs counter to Japan's copyright principle of prior permission (CODA).
- **Not disclosed**: The specific composition of the training data and the status of individual permissions.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is checking, before generating with copyrighted works, whether the rightsholder has permitted this use of that material, separately from whether a refusal has been filed.

- **Who approves**: The rightsholder of the material. It states, as a permission, which works and characters may be used for which uses.
- **Where it is checked**: Just before the generation service runs a generation. Generation using copyrighted works is checked against the record of permission; if there is no permission or the use does not match, it is not generated.
- **What is recorded**: Which generation ran after passing a check against which rightsholder's permission. When rightsholders or authorities object, it can be traced what each generation rested on.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before generation, the rightsholder's permission for the material, and keeping a record. Detection means finding the problem after generation and spread, through output violations or rightsholder objections. The dates below follow the statements and reporting.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the rightsholder's permission for the material before generation</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Videos with copyrighted characters<br>spread on social media right after launch</span></div>
<div class="rx-zone det"><b>Detection · worked after generation and spread</b>Output violation judgments, and objections from rightsholders, industry, and government</div>
<div class="rx-g g1"><div class="t">Late 09 to early 10</div><b>Launched with opt-out</b></div>
<div class="rx-g g2"><div class="t">~3 days after launch</div><b>Move to opt-in announced</b></div>
<div class="rx-g g3"><div class="t">Around 10-15</div><b>CODA makes demands</b></div>
<div class="rx-g g4"><div class="t">10-16 to 10-23</div><b>Japanese government requests</b></div>
</div>
</figure>

Per-output violation judgments and a channel for rightsholder objections are needed to grasp and correct harm, and this Brief does not deny that role. But as long as confirmation of permission sits after generation, the response comes after the spread. A case of the kind where being public does not mean being usable for training or generation is [Discord](/critical/briefs/008-discord-scraping/) (publication of messages collected through a public API); a case where the provenance of a likeness is not checked before generation and publication is [YouTube](/critical/briefs/053-youtube-deepfake-likeness-provenance/) (deepfake ads impersonating celebrities).

## 4. What Lemma does

**Lemma places the check in section 03 just before the generation service runs a generation.** It does not judge whether output resembles a copyrighted work; it checks, before generation, whether the rightsholder has permitted this use of the material being used.

### Industries and operations to watch

- **Industry · AI**: Providers of image and video generation services. Whether the default is "use unless refused" or "use only what is permitted" becomes a point of contention with rightsholders, industry bodies, and governments.
- **Industry · Media**: Studios, publishers, and game companies that hold rights to works and characters, and production teams that use images and videos made with generative AI. In jurisdictions where prior permission is the principle, whether opt-out is enough is in question.

### Current controls vs Lemma

The route in this case is column 1 (generating copyrighted characters whose rightsholders have not filed a refusal).

| Control | Generating copyrighted characters whose rightsholders have not filed a refusal | Generating copyrighted characters whose rightsholders have filed a refusal | Spread of already-generated videos on social media |
| --- | --- | --- | --- |
| Rightsholder refusal (opt-out) | Not effective | Partial | Not relevant |
| Per-output content-violation judgment | Partial | Partial | Not relevant |
| **Lemma (pre-execution check)** | Partial | Partial | Not relevant |

An opt-out refusal works only for the works of rightsholders who filed one, and generation of works with no refusal passes by default. Per-output violation judgment stops output that resembles known protected works, but what it judges is the result of generation, not whether permission exists. Lemma makes "permitted," not "not refused," the condition for generation, so it stops generation from material with no record of permission whether or not a refusal was filed. It works to the extent that the material a generation uses can be identified, and it does not stop or delete the spread of videos already generated.

Note: Lemma's check works only when the generation service builds the check in just before running a generation, and rightsholders issue their permissions as records. Judging from a free-form prompt whether output will resemble a particular character is not Lemma's role, and generation whose material cannot be identified can slip past the check. If the key for the permission records leaks, generation can get through. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in organizations that handle copyrighted works with generative AI

- Is your generation service's default set to use only material that is permitted?
- Do you record permissions from rightsholders, tied to the work, the use, and the period?
- Do you record which generation ran on which permission, so it can be traced when an objection comes in?

## 5. Facts and timeline

- **Subject**: OpenAI's video generator Sora 2 and its rights-management policy (opt-out at launch).
- **Policy at launch**: Videos including copyrighted characters could be generated unless the rightsholder explicitly opted out. Right after launch, well-known works — Pikachu, SpongeBob, full-episode-style South Park, and the like — were easily generated.
- **Criticism**: Copyrighted-character videos spread right after launch, and broad criticism followed, including from the U.S. Motion Picture Association (MPA) and artists.
- **Policy change**: Within about three days of launch, OpenAI announced a move to an opt-in (prior-permission) model requiring permission in advance to generate copyrighted characters. Sam Altman also mentioned finer control for rightsholders and revenue sharing with those who opt in. Characters such as Family Guy and South Park became content violations thereafter, and generation of specific individuals — Martin Luther King Jr. and others — was halted following objections from estates.
- **CODA's demands**: CODA (including Studio Ghibli, Bandai Namco, Toei Animation, and others) demanded a stop to unauthorized use for training. It treated reproduction during training as potentially infringing, flagged outputs closely resembling One Piece, Demon Slayer, Pokémon, Mario, and the like, and said the opt-out model runs counter to Japan's copyright principle of prior permission.
- **Japanese government's request**: The Japanese government formally requested that OpenAI refrain from potentially infringing acts and seek rightsholders' permission in advance.

### Timeline

- **Late 2025-09 to early 2025-10**: OpenAI releases Sora 2 with an opt-out policy. Right after launch, videos including copyrighted characters spread on social media, and criticism comes from the MPA, artists, and others.
- **2025-10 (about three days after launch)**: OpenAI announces a move to an opt-in (prior-permission) model for copyrighted characters and mentions revenue sharing. Generation of specific individuals (MLK Jr., etc.) is also halted following objections from estates.
- **Around 2025-10-15**: CODA demands a stop to unauthorized use for training.
- **2025-10-16 to -23**: The Japanese government formally requests that OpenAI seek rightsholders' permission in advance.

> The "change from opt-out to opt-in" and the "halting of generation of specific individuals" are based on OpenAI's statements and international reporting. Public information on the specific composition of the training data and the status of individual permissions is limited, and we do not assert them here. Interpretation of Japanese copyright law and the final judgment of infringement are left to rightsholders, authorities, and the courts. What has not been disclosed does not mean there were no controls.

### Response after disclosure

- **OpenAI**: Announced within about three days that it would change the launch opt-out policy to an opt-in (prior-permission) model for copyrighted characters. Mentioned finer control for rightsholders and revenue sharing with those who opt in, and halted generation of specific individuals.
- **CODA and the Japanese government**: CODA demanded a stop to unauthorized use for training and said opt-out runs counter to the principle of prior permission. The Japanese government formally requested that OpenAI seek rightsholders' permission in advance.
- **MPA**: The U.S. MPA also criticized the opt-out policy.

## 6. Sources

- **The Register**: "Japan asks OpenAI to keep Sora 2's hands off anime IP" (2025-10-15; the CODA / Japanese-government requests, spread of copyrighted characters) — <https://www.theregister.com/2025/10/15/japan_openai_copyrighted_anime/>
- **Copyright Lately**: "Sora, Not Sorry: OpenAI Backtracks on Opt-Out Copyright Policy" (the opt-out-to-opt-in reversal, halting specific generation, the revenue-sharing mention) — <https://copyrightlately.com/openai-backtracks-sora-opt-out-copyright-policy/>
- **EU IP Helpdesk (European Commission)**: "Japanese government requests OpenAI avoid copyright infringement (Sora 2)" (2025-10-23; the Japanese government's formal request) — <https://intellectual-property-helpdesk.ec.europa.eu/news-events/news/japanese-government-requests-openai-avoid-copyright-infringement-sora-2-us-federal-judge-dismisses-2025-10-23_en>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
