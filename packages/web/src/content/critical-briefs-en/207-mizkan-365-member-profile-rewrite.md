---
brief_no: 207
title: "Mizkan「ミツカン 365」：第三者にほかの会員の登録情報を書き換えられ、仕込まれたプログラムで一部の会員の顧客 ID とメールアドレスが取得された(同社の公表)"
title_en: "Mizkan's \"Mizkan 365\": A third party rewrote other members' profile data, and a program planted in it obtained some members' customer IDs and email addresses (company disclosure)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-10-30
published: 2026-11-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["164-capcom-id-password-change-ecommerce-mypage", "168-goodsmile-payment-page-tampering", "190-iwai-cosmo-tradeworks-admin-function-unintended-orders"]
fact_check:
  by: "muse-spark-1.3×7 + GLM-5.3"
  at: 2026-11-12
  rev: "0a58c79c12de1758"
  ref: "https://github.com/lemmaoracle/lemma/pull/1162"
status: draft
version: "1.0"
og_lead_ja: "Mizkan のコミュニティサイト「ミツカン 365」で、会員 487 名のニックネームとアイコンが書き換えられ、29 名の顧客 ID とメールアドレスが漏えいした"
og_lead_en: "On Mizkan's community site \"Mizkan 365\", nicknames and icons of 487 members were rewritten, and customer IDs and email addresses of 29 were leaked"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · 会員サイト"
og_kicker_en: "CYBERATTACK · MEMBER SITE"
og_headline_ja: "ほかの会員の\n登録情報が\n書き換えられた。\n<accent>487 名・漏えい 29 名</accent>"
og_headline_en: "Other members'\nprofile data was rewritten.\n<accent>487 members, 29 leaked.</accent>"
key_figures:
  - value: "487"
    unit: "members"
    label: "Members whose member data was tampered with. Their nicknames were changed to \"名なしさん\" (\"Nameless\") and their user icons were rewritten (Mizkan)"
    tone: "alert"
  - value: "29"
    unit: "members"
    label: "Of the 487, members whose customer IDs and registered email addresses were leaked. For 26 of them, the number of perk exchanges using points and of entries to campaigns and monitor programmes were leaked too (Mizkan)"
  - value: "10-30 → 11-02"
    label: "From the unauthorised access to the start of the investigation, prompted by members' enquiries, and the suspension of the site"
glossary:
  - term: "Mizkan 365 (ミツカン 365)"
    desc: "A members-only community site run by Mizkan Co., Ltd. Members register a nickname and a user icon, exchange points for perks and enter campaigns and monitor programmes."
  - term: "Customer ID"
    desc: "According to Mizkan, a number assigned in the system to identify each customer."
insight:
  slug: "profile-write-not-tied-to-owner"
  stop: true
  label: "The target of a rewrite is not tied to the person acting"
  quote: "Before a member's profile data is rewritten, check that the member being rewritten is the owner of the login that made the change, against the server-side login record rather than the content of the request."
industries: ["retail", "media"]
operations: ["account-admin", "data-access"]
controls:
  - slug: "verify-entry"
    item: "Let a rewrite of a member's profile data through only when the member being rewritten is the owner of the login that made it"
  - slug: "check-origin"
    item: "Before text or images a member registered are shown on other members' screens, put them in a form that cannot run as a program"
  - slug: "hold-unverified"
    item: "Hold, before execution, any rewrite of profile data that cannot be tied to the owner of the login that made it"
  - slug: "audit-trail"
    item: "Record which login rewrote which field of which member's data"
attack_method: "privilege-abuse"
impact: "Nicknames of 487 members were changed to \"名なしさん\" and their icons rewritten. Customer IDs and registered email addresses of 29 of them were leaked, and for 26 the number of perk exchanges and campaign entries too (Mizkan, 6 November)"
takeaway: "A third party rewrote other members' nickname and icon data, and a program planted in it obtained some members' data. Let a rewrite of profile data through only after checking that the member being rewritten owns the login that made it."
self_check: "Do you know the mechanism that limits rewrites of a member's profile data to that member's own login?"
countries: ["jp"]
search_title: "ミツカン365 不正アクセス：487名の改ざんと漏えいの経緯"
search_description: "Mizkan のコミュニティサイト「ミツカン 365」で会員 487 名のニックネームなどが書き換えられ、29 名の顧客 ID とメールアドレスが漏えいした（同社 11 月 6 日公表）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

On 30 October 2026, a third party gained unauthorised access to "Mizkan 365", a community site run by Mizkan Co., Ltd., and the nicknames of 487 members were changed to "名なしさん" ("Nameless") and their user icons rewritten. According to the company, the third party exploited deficiencies in the function for changing member data and in the mechanism that displays information on screen to rewrite other members' profile data, and a program planted in that data ran when members opened the site.

Through this, customer IDs and registered email addresses of 29 of the 487 were obtained, and for 26 of them the number of perk exchanges and of entries to campaigns and monitor programmes too. On 2 November the company received several enquiries saying "my nickname was changed without my permission", began investigating, and the same day stopped the site and fixed the program. No leak of passwords, names, addresses, phone numbers or credit card data, and no change of email addresses or passwords, has been confirmed.

<strong>An operation that rewrites member data goes through as a valid operation unless there is a step that checks whether the target is the data of the person acting.</strong>

## 2. What got through

- **What got through**: Rewriting other members' nickname and user icon data. According to Mizkan, the third party exploited deficiencies in the function for changing member data and in the mechanism that displays information on screen, and rewrote the profile data of 487 members.
- **What ran**: A program planted in the rewritten profile data. According to the company, it ran when members opened the site, and the customer IDs, registered email addresses and other data of 29 members were obtained.
- **What reached the accepting side**: In general, a function for changing member data receives a logged-in session and the fields and values to change. Whether the change reflects the will of the member being rewritten does not arrive unless it is checked. Registered text and images also appear as they are on other members' screens.
- **Not disclosed**: What the deficiencies were, and how other members' data could be rewritten. Whether the third party used a member account (the company says it is dealing with malicious programs and accounts). Whether the rewrites took place only on 30 October. Why data was obtained from 29 of the 487. Where the obtained data was sent.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a member's profile data is rewritten, the member being rewritten is checked as the owner of the login that made the change, against a server-side record kept apart from the content of the request.

- **Who approves**: The member who owns the profile data. Only a rewrite from that member's own login counts as their approval. When the operator corrects a member's data, it goes through separately, under the operator staff's rights and a record of the request.
- **Where it is checked**: The step at which the site saves a rewrite of member data. If the member being rewritten differs from the owner of the login that made the change, it is not saved. Registered text and images are put in a form that cannot run as a program before they appear on other members' screens.
- **What is recorded**: Which login rewrote which field of which member's data, and when. When a member reports that something "changed without permission", the affected members and fields can be traced from the record.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a member's profile data is rewritten, that the member being rewritten owns the login that made the change, and keeping a record. Detection means noticing the unauthorised access from members' enquiries, stopping the site and fixing the program. Dates rely on Mizkan's disclosure.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Save a rewrite only after checking that the target owns the login that made it</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Other members' profile data rewritten: 487<br>Customer IDs and email addresses leaked: 29</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Enquiries investigated, site stopped, program fixed</div>
<div class="rx-g g1"><div class="t">10-30</div><b>Profile data rewritten through unauthorised access</b></div>
<div class="rx-g g2"><div class="t">11-02</div><b>Enquiries investigated and the site stopped</b></div>
<div class="rx-g g3"><div class="t">11-05</div><b>Preliminary report to the PPC</b></div>
<div class="rx-g g4"><div class="t">11-06</div><b>Disclosure and emails to the 487 members</b></div>
</div>
</figure>

Detection worked, and the site was stopped on the day members' enquiries arrived. Even so, before that, the profile data of 487 members had been rewritten and data of 29 obtained. A case where password changes were not tied to the owner is [Capcom](/critical/briefs/164-capcom-id-password-change-ecommerce-mypage/) (password changes on shared accounts); a case where a program placed on a site's page may have read input is [Good Smile Company](/critical/briefs/168-goodsmile-payment-page-tampering/) (the payment page); and a case where operations without the owner's authentication went through a function is [Iwai Cosmo Securities](/critical/briefs/190-iwai-cosmo-tradeworks-admin-function-unintended-orders/) (a contractor's admin function). Here, rewriting fields that members write themselves became the way in to running a program on other members' screens.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side of a member site that saves rewrites of profile data.** It does not look for unauthorised access; it checks, before saving, that the rewrite comes from the login of the member being rewritten.

### Industries and operations to watch

- **Industry · Services & retail**: Food and household-goods makers and retailers with member sites where members collect points, exchange them for perks and enter campaigns. They hold members' customer IDs and email addresses in a member system shared with online stores or other services.
- **Industry · Media & content**: Community sites where members register nicknames, icons and posts that appear on other members' screens. What one member writes reaches other members' screens as it is.
- **Operation · Accounts & permissions**: Rewriting profile data such as members' nicknames, icons and email addresses.
- **Operation · Lookup & data access**: Displaying profile data on other members' screens, and reading members' customer IDs and email addresses.

### Current controls vs Lemma

The route in this case is column 1 (rewriting other members' profile data) and column 2 (a program planted in the rewritten data running). Column 3 covers a member's password being stolen and the data rewritten from their own login; the company says no unauthorised change of email addresses or passwords has been confirmed.

| Control | Rewriting other members' profile data | A program planted in the rewritten data running | Rewriting through a takeover of the member's own login |
| --- | --- | --- | --- |
| Processing that stops content running as a program before display | Not effective | Effective | Not effective |
| Multi-factor authentication on logins | Not effective | Not effective | Effective |
| Web application firewall (WAF) | Partial | Partial | Not effective |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

Processing before display keeps a planted program from running, but does not stop other members' data being rewritten. Multi-factor authentication protects a member's own login, but has no bearing on rewrites that do not use that login. A WAF narrows traffic in known attack patterns, but a correctly formed rewrite goes through. Lemma checks, before saving, not the form of the rewrite but whether the member being rewritten owns the login that made it.

Note: Lemma's check works only when it is built into the step that saves member data and the login record is held on the server side apart from the content of the request. If a member plants a program in their own field, it passes as that member's own rewrite, so processing before display is needed as well. If a member's password is stolen and the data rewritten from their own login, it passes too. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and it does not recover data already obtained.

### Checklist

Three things to confirm about the information members register

- Do you put text and images members register in a form that cannot run as a program before showing them on other members' screens?
- When profile data is rewritten, can you identify from your records the same day which login rewrote which field of which member's data?
- Do you have a procedure to investigate members' reports that "my profile changed without my permission" as a possible sign of unauthorised operations?

## 5. Facts and timeline

- **Parties**: Mizkan Co., Ltd. (runs the community site "Mizkan 365").
- **What happened**: According to Mizkan, on 30 October a third party gained unauthorised access to the site, member data was tampered with and some personal data was leaked. According to the company, the cause was deficiencies in the function for changing member data and in the mechanism that displays information on screen. The third party exploited these to rewrite other members' nickname and icon data, and a malicious program planted in it ran when members opened the site, obtaining some personal data.
- **Data**: Member data of 487 members was tampered with: nicknames were changed to "名なしさん" and user icons rewritten. Personal data of 29 of the 487 was leaked: customer IDs and registered email addresses for all 29, and for 26 of them also the number of perk exchanges using points and of entries to campaigns and monitor programmes. The leaked data has not been confirmed to include login passwords, names, addresses, phone numbers or credit card data.
- **Impact**: According to the company, no misuse of the leaked data or secondary harm has been confirmed, and no unauthorised change of email addresses or passwords has been confirmed. The "Mizkan official online store" and "Fibee 腸内会" have been suspended since 4 November for safety checks, and the company says no direct impact through the same mechanism has been confirmed there.
- **How it was found**: On 2 November the company received several enquiries saying "my nickname was changed without my permission", began investigating and confirmed the unauthorised access and the leak.

### Timeline

- **2026-10-30**: Unauthorised access to the site; member data is tampered with and some personal data leaked.
- **2026-11-02**: Prompted by several members' enquiries, the company investigates and confirms the access and the leak. The same day it stops the site and, according to the company, fixes the deficiency in the program that was exploited.
- **2026-11-04**: The "Mizkan official online store" and "Fibee 腸内会" are suspended for safety checks.
- **2026-11-05**: Preliminary report to the Personal Information Protection Commission.
- **2026-11-06**: Disclosure; from 16:00, emails go out in turn to the 487 members affected (458 tampering only, 29 leak and tampering).

> The facts rely on Mizkan Co., Ltd.'s notice 「「ミツカン 365」への不正アクセスに伴う お客様情報の改ざん・漏えいに関するお詫びとお知らせ」 (6 November 2026, primary). "Deficiencies" is the company's own wording. What the deficiencies were, how the third party rewrote other members' data and where the obtained data was sent have not been disclosed. This Brief does not cover details that could help reproduce the attack. The company's site lists other notices about unauthorised access (Sagawa Express, Mizkan Asia Pacific); these are separate incidents and are not covered here. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the company's response. Written as of 12 November.

### After disclosure

- **Mizkan**: On 2 November it fixed the deficiency in the program that was exploited and confirmed that unauthorised operations by the same method can no longer be performed. It is restoring the tampered data, dealing with malicious programs and accounts, inspecting other functions and verifying safety. It will review its procedures for developing and checking programs and consider measures to prevent recurrence.
- **Resuming the site**: The company will decide after restoring the data and confirming safety, and will update the notice with the timing of resumption and any newly found facts.
- **Advice to members**: It warns members not to open URLs or attachments in suspicious emails or SMS, and says it never asks for passwords or verification codes by email or phone.

## 6. Sources

- **Mizkan Co., Ltd. (Primary, company disclosure)**: 「「ミツカン 365」への不正アクセスに伴う お客様情報の改ざん・漏えいに関するお詫びとお知らせ」 (2026-11-06) — <https://www.mizkan.co.jp/file.jsp?id=2021_Renewal/files/pdf/emg/news/oshirase18.pdf>
- **Mizkan Co., Ltd. (Primary, company website)**: Notices section of the 「ミツカングループ」 top page (checked 2026-11-12) — <https://www.mizkan.co.jp/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
