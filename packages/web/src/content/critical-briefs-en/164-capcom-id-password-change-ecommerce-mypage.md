---
brief_no: 164
title: "カプコン：共通アカウント CAPCOM ID への不正アクセスで、会員のパスワードが変えられ、同じ ID で入る通販のマイページにも入られた(同社第二報) — パスワードの変更が持ち主の操作かを、確定の前に照合する層が見えない"
title_en: "Capcom: Unauthorized access to the CAPCOM ID shared account changed members' passwords, and the online store that uses the same ID was entered too (company's second report) — No check, before a password change takes effect, that the owner made it is visible"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-10-19
published: 2026-10-26
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering", "051-instagram-ai-support-takeover", "154-yumirlink-cuenote-support-credential-db-export"]
status: published
version: "1.0"
og_lead_ja: "カプコンの CAPCOM ID に不正アクセス、メールアドレスなど 1,177 万件 — 196 件でパスワードを不正に変更"
og_lead_en: "CAPCOM ID breached: 11.77 million email records, and 196 passwords changed without authorization"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · アカウント乗っ取り"
og_kicker_en: "CYBERATTACK · ACCOUNT TAKEOVER"
og_headline_ja: "共通アカウントのパスワードが\n変えられ、通販のマイページにも\n入られた。\n<accent>メールアドレスなど 1,177 万件が漏えい</accent>"
og_headline_en: "Passwords on a shared account were changed,\nand the online store was entered too.\n<accent>11.77 million email records exposed.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "11.77"
    unit: "million"
    label: "Email address records and system-specific identifiers exposed (worldwide total 11,774,247)"
    tone: "alert"
  - value: "196 → 19"
    label: "Accounts whose passwords were changed without authorization, and those whose online-store account pages were then entered, exposing addresses and purchase history (Japan)"
  - value: "10-19 → 10-22"
    label: "From finding traces of unauthorized access to the first report"
glossary:
  - term: "CAPCOM ID"
    desc: "Capcom's registered shared account for its web services and some online games. Capcom's online store, e-Capcom, is also used through CAPCOM ID."
  - term: "System-specific identifiers"
    desc: "In Capcom's disclosure: account creation date and time, last login date and time, number of logins, and the client IP address at last login."
  - term: "Account page"
    desc: "The page on an online store where members view and change their address, purchase history and saved delivery addresses."
insight:
  slug: "password-change-not-tied-to-owner"
  label: "A password change not tied to the owner"
  quote: "The passwords members had set were not exposed, yet passwords were changed. With the new passwords, the online store that uses the same ID was entered too."
industries: ["media", "retail"]
operations: ["account-admin"]
controls:
  - slug: "separate-approval"
    item: "Confirm password and email changes with the owner at the contact registered before the change, then apply them"
  - slug: "hold-unverified"
    item: "Right after a change the owner has not confirmed, hold entry to services that hold addresses or purchase history"
  - slug: "audit-trail"
    item: "Record who changed which account's password, and through which path"
attack_method: "account-takeover"
impact: "About 11.77 million email records exposed; 196 passwords changed, and addresses and purchase history exposed for 19 of them"
takeaway: "The passwords members had set were not exposed, yet passwords were changed. No check, before a change takes effect, that the owner made it is visible in the disclosures."
self_check: "Do you match a member's password change to the account owner before it takes effect?"
countries: ["jp"]
---

## 1. TL;DR

On October 22, 2026, Capcom disclosed unauthorized access by a third party to CAPCOM ID, its shared account, exposing email addresses and system-specific identifiers for 11,774,247 records worldwide. On 196 accounts the login password had been changed without authorization. In a second report on October 23, Capcom said that for 19 of those 196, a third party entered the account pages of e-Capcom, its online store that uses the same ID, exposing names, addresses, phone numbers, purchase history and more.

Capcom says no leak of passwords members set themselves has been confirmed. Even so, the passwords were changed, and the new passwords opened the online store's account pages. How they were changed has not been disclosed.

Capcom found traces on October 19, cut off the access, and says it identified and addressed the method of attack. Even so, the 196 password changes went through. What failed was the layer that checks, before a password change takes effect, that the owner made it.

## 2. What happened

- **Service**: CAPCOM ID is Capcom's registered shared account for its web services and some online games (Capcom). Using e-Capcom, Capcom's online store, also requires a CAPCOM ID (e-Capcom user guide).
- **Information exposed**: Email addresses and system-specific identifiers (account creation date and time, last login date and time, number of logins, client IP address at last login) for 11,774,247 records worldwide. For 43 of them, date of birth, gender, country/region and nickname were also exposed. Credit card information was not included (Capcom first report).
- **Unauthorized password changes**: Of the 11,774,247, login passwords were changed without authorization on 196 accounts. No leak of passwords members set themselves has been confirmed. The 196 passwords were reset (Capcom first report).
- **Online-store account pages**: For 19 of the 196 (Japan), a third party entered e-Capcom account pages, exposing name, name in phonetic script, phone number, postal code, address, gender, date of birth, purchase history, e-Capcom inquiry history and saved address book. No exposure from the password changes was found for the other accounts (Capcom second report).
- **Path**: Capcom says it has identified and addressed the method of attack. What that method was has not been disclosed (Capcom first report).
- **Not disclosed**: Where the attackers got in, when the intrusion began, which procedure changed the passwords (the reset flow or another function), whether owners were notified of the change, whether multi-factor authentication was in place, and why it was 196 accounts.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The sequence, as far as disclosed</span></div>
<p class="rx-ex-cap">The point to stop it is ③. If a password change were matched to the owner before taking effect, the new password would not lead to ④. How ① happened and which procedure ③ used have not been disclosed.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Attacker</div><div class="no">1</div><b>Gains unauthorized access to CAPCOM ID</b><p>Method identified, not disclosed.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">2</div><b>Obtains email addresses and more</b><p>11,774,247 records worldwide.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">3</div><b>Changes passwords</b><p>196 accounts. No leak of member-set passwords confirmed.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">4</div><b>Enters the online store's account pages with the same ID</b><p>19 accounts. Addresses and purchase history exposed.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-10-19**: Capcom finds traces suggesting unauthorized access to CAPCOM ID, immediately blocks the access and begins investigating. The same day it confirms unauthorized access occurred and starts emergency measures and work to identify the method of attack.
- **2026-10-20**: Capcom sets up an internal response headquarters. It finds that some registered information was exposed and that passwords on some accounts were changed without authorization, and reports to its external Security Oversight Committee.
- **2026-10-21**: Reports to the police and the Personal Information Protection Commission.
- **2026-10-22**: Publishes its first report (timely disclosure). Says emergency measures and the identification and handling of the attack method are complete, and services using CAPCOM ID remain available.
- **2026-10-23**: Second report: for 19 of the 196 accounts with changed passwords, e-Capcom account pages were entered. Says the investigation of the scope is complete.

> The facts rest on Capcom's first and second reports (both primary, timely disclosure, in Japanese and English on its site). The first report says identification and handling of the attack method is "complete" but does not describe it. As of October 26, no third report had been issued.

### After disclosure

- **Capcom**: Reset the 196 passwords and is notifying affected members in turn. Set up dedicated inquiry lines in Japan and abroad. Says it will keep monitoring CAPCOM ID and related services and take preventive measures based on the cause.
- **Advice to members**: Warns that the exposed data may be used for emails, text messages or calls impersonating Capcom or related parties, and asks members not to open links or attachments.

## 4. Why it wasn't stopped

The failure here is not only that email addresses leaked. No **layer that matches a password change to the owner before it takes effect** is visible in the disclosures.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means matching, before a password change takes effect, that "the owner of this account made this change", and keeping a record. Detection means noticing unauthorized access after it happens.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · not visible here</b>Match the change to the owner before it takes effect</div>
<div class="rx-zone gapz"><b>Gap</b><span>The new password opened<br>the store's account pages</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Find traces, block, identify the method</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Passwords changed</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Store account pages entered</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Noticed on 10-19</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Passwords reset</b></div>
</div>
</figure>

Detection worked: Capcom blocked the access the day it found the traces and reset the changed passwords. But "a request to change the password arrived" and "the owner of this account made this change" are separate facts, and no layer that matches the first to the second before the change takes effect is visible in the disclosures. With a shared account, one change also becomes the way into other services that hold addresses and purchase history. That separation is the **gap between detection and proof**, and it is a structural one.

The same structure appears in the [Instagram support-channel takeover](/critical/briefs/051-instagram-ai-support-takeover/) (account emails were changed without checking the requester was the owner).

## 5. How to counter this

**Apply password and email changes only after matching them to the account owner.** Then, wherever the attackers got in, a change alone does not become a takeover. With a shared account, right after a change that cannot be matched, keep it from opening services that hold addresses or purchase history. This is not a substitute for detection; it sits in front of it.

### Industries and operations to watch

- **Industry · Media & content**: Games, video, e-books and other businesses where one member account opens several services and apps. Member counts are large, and account changes are often processed automatically.
- **Industry · Services & retail**: Online stores whose member accounts hold addresses, phone numbers, purchase history and saved delivery addresses. When login runs through a shared ID, a change on the ID side becomes the way into the store.
- **Operation · Accounts & permissions**: Managing changes and resets of member passwords and email addresses.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Strong, unique passwords | Not relevant | No leak of member-set passwords was confirmed. The passwords were changed. |
| Members' MFA | Partial | It protects login. Whether it was required for password changes or resets is not clear from the disclosures. |
| Detecting and blocking unauthorized access | Partial | Access was blocked the day traces were found. When the password changes and store entries happened has not been disclosed. |
| Resetting passwords | Partial | The 196 changed passwords were restored. The 19 addresses and purchase histories had already been exposed. |

### What is needed

1. **Confirm changes with the owner before applying them.** Apply password and email changes only after confirming with the owner at the contact registered before the change. Whatever procedure a change comes through, put the step before it takes effect in one place.
2. **Right after an unconfirmed change, hold entry to other services.** With a shared account, check the person again when they enter a service holding addresses or purchase history right after a change.
3. **Record who changed it and through which path.** Keep which procedure changed which account's password in a form that can be checked later: in other words, as proof.

### Checklist

Three things to confirm in your organisation about changes to member accounts

- When a member's password or email address changes, does a notice also reach the contact registered before the change?
- For services reached with a shared ID that show addresses or purchase history, do you confirm the person again when they enter right after a password change?
- If passwords change on many accounts in a short time, can you notice and stop the changes?

Note: if attackers can rewrite the database or admin functions directly, they can change passwords without passing this check; it cannot be said that this mechanism would have stopped the 196 changes here. Nor does this layer stop the exposure of 11.77 million email records. The attack method has been identified but not disclosed. If follow-up reports reveal it, this Brief will be revised.

## 6. Sources

- **Capcom (Primary, timely disclosure)**: Notice and apology regarding customer information leaked through unauthorized access (2026-10-22, Japanese) — <https://www.release.tdnet.info/inbs/140120261022554474.pdf>
- **Capcom (Primary, timely disclosure)**: Notice and apology regarding customer information leaked through unauthorized access (second report) (2026-10-23, Japanese) — <https://www.release.tdnet.info/inbs/140120261023555492.pdf>
- **Capcom (Primary, company disclosure)**: "Notice and Apology Regarding Customer Information Affected Through Unauthorized Access" (2026-10-22) — <https://www.capcom.co.jp/ir/english/news/html/e261022.html>
- **Capcom (Primary, company disclosure)**: "Update to Notice and Apology Regarding Customer Information Affected Through Unauthorized Access" (2026-10-23) — <https://www.capcom.co.jp/ir/english/news/html/e261023.html>
- **e-Capcom (Primary, user guide)**: User guide (Japanese) — using e-Capcom requires a CAPCOM ID · <https://www.e-capcom.com/shop/pages/guide.aspx>
- **ASCII.jp (Press)**: Capcom leaks over 11.77 million customer records; unauthorized access to CAPCOM ID, unauthorized password changes too (2026-10-22, Japanese) — <https://ascii.jp/elem/000/004/445/4445054/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
