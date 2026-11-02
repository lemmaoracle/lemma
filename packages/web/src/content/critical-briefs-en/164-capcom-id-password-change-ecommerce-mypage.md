---
brief_no: 164
title: "カプコン：共通アカウント CAPCOM ID でパスワードが不正に変更され、一部では通販のマイページにも不正にアクセスされた"
title_en: "Capcom: Passwords on CAPCOM ID shared accounts were changed without authorization, and some online-store account pages were accessed too"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-10-19
published: 2026-10-26
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering", "051-instagram-ai-support-takeover", "154-yumirlink-cuenote-support-credential-db-export"]
status: draft
version: "1.0"
og_lead_ja: "カプコンの CAPCOM ID に不正アクセス、メールアドレスなど 1,177 万件 — 196 件でパスワードを不正に変更"
og_lead_en: "CAPCOM ID breached: 11.77 million email records, and 196 passwords changed without authorization"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · アカウント乗っ取り"
og_kicker_en: "CYBERATTACK · ACCOUNT TAKEOVER"
og_headline_ja: "パスワードの不正な変更と、\n通販のマイページへの\n不正なアクセス。\n<accent>1,177 万件が漏えい</accent>"
og_headline_en: "Passwords changed without authorization,\nand store account pages accessed.\n<accent>11.77 million email records exposed.</accent>"
key_figures:
  - value: "11.77"
    unit: "million"
    label: "Email address records and system-specific identifiers exposed (worldwide total 11,774,247)"
    tone: "alert"
  - value: "196"
    unit: "accounts"
    label: "Accounts whose login password was changed without authorization. For 19 of them, a third party accessed the online store's account pages, exposing addresses and purchase history (Japan)"
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
  quote: "With a shared ID, a single password change that goes through can open every service that ID reaches to someone else."
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
impact: "About 11.77 million email records exposed and 196 passwords changed without authorization; for 19 of those accounts, the store's account pages were accessed, exposing addresses and purchase history"
takeaway: "With a shared ID, a single password change that goes through can open every service that ID reaches to someone else."
self_check: "Do you match a member's password change to the account owner before it takes effect?"
countries: ["jp"]
---

## 1. Summary

Capcom says no leak of passwords members set themselves has been confirmed. Even so, login passwords on some accounts had been changed without authorization. In a second report the next day, it said that for some of those accounts, a third party accessed the account pages of its online store, which uses the same ID, exposing addresses and purchase history. Which procedure changed the passwords, and how the changes relate to the store access or which came first, have not been disclosed. <strong>With a shared ID, a single password change that goes through can open every service that ID reaches to someone else.</strong>

## 2. What got through

- **What got through**: Changes to CAPCOM ID login passwords. Passwords on 196 accounts were changed without authorization. No leak of passwords members set themselves has been confirmed. The 196 passwords were reset (Capcom first report).
- **Online-store account pages**: Of the 196 accounts whose passwords were changed without authorization, for 19 (Japan) a third party accessed the account pages of e-Capcom, the online store, exposing addresses, purchase history and more (Capcom second report). How the password changes relate to this access, and which came first, have not been disclosed.
- **What reached the receiving side**: In general, a password change arrives either as an action from a logged-in session or as one that passed the reset procedure. Passing the procedure does not show that the account's owner made the change.
- **Not disclosed**: The method of intrusion (the company says it has identified it), when the intrusion began, which procedure changed the passwords (the reset flow or another function), whether owners were notified of the change, whether multi-factor authentication was in place, and why it was 196 accounts.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever applies password and email changes matches each change to the owner, using a contact or key registered before the change, before it takes effect.

- **Who approves**: The account owner. The change is approved through the contact registered before the change (email address or phone number) or a key on the owner's device (such as a passkey), in a form that neither the server receiving the change nor the change screen itself can produce.
- **Where it is checked**: The server that applies password and email changes. Changes from any procedure — the logged-in screen, the reset flow, support desks or admin functions — are checked at one point before they take effect. A change that does not match an approval is held, not applied; with a shared ID, services holding addresses or purchase history stay closed while it is held.
- **What is recorded**: Which account's change came through which procedure, and which approval applied it.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means matching, before a password change takes effect, whether the owner made it, and keeping a record. Detection means noticing unauthorized access after it happens. The dates below are when Capcom confirmed or disclosed each point, not when the changes or the access took place.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Match the change to the owner before it takes effect</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Unauthorized password changes on 196<br>Store account pages accessed for 19 of them</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Find traces, block the access, reset the changed passwords</div>
<div class="rx-g g1"><div class="t">10-19</div><b>Traces found, access blocked</b></div>
<div class="rx-g g2"><div class="t">10-20</div><b>Password changes confirmed</b></div>
<div class="rx-g g3"><div class="t">10-22</div><b>First report (196 already reset)</b></div>
<div class="rx-g g4"><div class="t">10-23</div><b>Second report (19 store accounts)</b></div>
</div>
</figure>

Blocking and resetting are remedies after the fact. Account details being changed without confirming the owner is an issue shared with the [Instagram support-channel takeover](/critical/briefs/051-instagram-ai-support-takeover/) (asking the AI support bot was enough to have the registered email switched to the attacker's).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that applies password and email changes.** It does not look for intrusions; it confirms, before a change takes effect, that the change rests on the owner's approval.

### Industries and operations to watch

- **Industry · Media & content**: Games, video, e-books and other businesses where one member account opens several services and apps. Member counts are large, and account changes are often processed automatically.
- **Industry · Services & retail**: Online stores whose member accounts hold addresses, phone numbers, purchase history and saved delivery addresses. When login runs through a shared ID, a change on the ID side becomes the way into the store.
- **Operation · Accounts & permissions**: Managing changes and resets of member passwords and email addresses.

### Current controls vs Lemma

This disclosure covers 196 unauthorized password changes on CAPCOM ID and, for 19 of those accounts, access to the online store's account pages; the method of intrusion and the procedure used to change the passwords have not been disclosed. So it is not known whether the changes here fall in column 1 (changes through a procedure) or column 3 (direct rewrites). Column 2 covers entering another service after a change; whether the 19 cases of access fit it has not been disclosed either. The last column corresponds to the exposure of 11.77 million email records.

| Control | Changes through the screen or reset flow | Entering other services right after a change | Direct rewrites in the database or admin functions | Taking registered data |
| --- | --- | --- | --- | --- |
| Strong, unique passwords | Partial | Partial | Not relevant | Not relevant |
| Login MFA | Partial | Partial | Not effective | Not relevant |
| Notice after a change (to the registered contact) | Partial | Partial | Not effective | Not relevant |
| Detecting and blocking unauthorized access | Partial | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective | Not effective |

Strong passwords and MFA protect login; if the reset flow does not require them, that path stays open. A notice after a change gives the owner a way to notice later. Detection and blocking work after the fact. Lemma checks the change itself, not the login, against the owner's approval before it takes effect.

Note: Lemma's check works only when it is built into the server that applies password and email changes, every change — from the logged-in screen, the reset flow, support or admin functions — passes the same check, and the contact or key used for approval sits apart from the system that receives the change. It passes if the contact registered before the change has itself been taken over, or if the database or admin functions are rewritten directly. Nor does this check stop registered data from being taken. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to check in your organisation about changes to member accounts

- When a member's password or email address changes, does a notice also reach the contact registered before the change?
- For services reached with a shared ID that show addresses or purchase history, do you confirm the person again when they enter right after a password change?
- If passwords change on many accounts in a short time, can you notice and stop the changes?

## 5. Facts and timeline

- **Service**: CAPCOM ID is Capcom's registered shared account for its web services and some online games (Capcom). Using e-Capcom, Capcom's online store, also requires a CAPCOM ID (e-Capcom user guide).
- **Information exposed**: Email addresses and system-specific identifiers (account creation date and time, last login date and time, number of logins, client IP address at last login) for 11,774,247 records worldwide. For 43 of them, date of birth, gender, country/region and nickname were also exposed. Credit card information was not included (Capcom first report).
- **Unauthorized password changes**: Of the 11,774,247, login passwords were changed without authorization on 196 accounts. No leak of passwords members set themselves has been confirmed. The 196 passwords were reset (Capcom first report).
- **Online-store account pages**: Of the 196 accounts whose passwords were changed without authorization, for 19 (Japan) a third party accessed e-Capcom account pages, exposing name, name in phonetic script, phone number, postal code, address, gender, date of birth, purchase history, e-Capcom inquiry history and saved address book. Credit card information was not included. The company says no information exposure from the unauthorized password changes was found for the other accounts (Capcom second report).
- **Path**: Capcom says it has identified and addressed the method of attack. What that method was has not been disclosed (Capcom first report).

### Timeline

- **2026-10-19**: Capcom finds traces suggesting unauthorized access to CAPCOM ID, immediately blocks the access and begins investigating. The same day it confirms unauthorized access occurred and starts emergency measures and work to identify the method of attack.
- **2026-10-20**: Capcom sets up an internal response headquarters. It finds that some registered information was exposed and that passwords on some accounts were changed without authorization, and reports to its external Security Oversight Committee.
- **2026-10-21**: Reports to the police and the Personal Information Protection Commission.
- **2026-10-22**: Publishes its first report (timely disclosure). Says emergency measures and the identification and handling of the attack method are complete, and services using CAPCOM ID remain available.
- **2026-10-23**: Second report: for 19 of the 196 accounts whose passwords were changed without authorization, e-Capcom account pages were accessed. Says the investigation of the scope is complete.

> The facts rest on Capcom's first and second reports (both primary, timely disclosure, in Japanese and English on its site). The first report says identification and handling of the attack method is "complete" but does not describe it. The second report says the store's account pages were accessed for 19 of the 196 accounts whose passwords were changed, but does not say which came first or whether the changed passwords were used. What has not been disclosed does not mean no measure was in place. As of November 2, no third report appears in the company's news list.

### After disclosure

- **Capcom**: Reset the 196 passwords and is notifying affected members in turn. Set up dedicated inquiry lines in Japan and abroad. Says it will keep monitoring CAPCOM ID and related services and take preventive measures based on the cause.
- **Advice to members**: Warns that the exposed data may be used for emails, text messages or calls impersonating Capcom or related parties, and asks members not to open links or attachments.

## 6. Sources

- **Capcom (Primary, timely disclosure)**: Notice and apology regarding customer information leaked through unauthorized access (2026-10-22, Japanese) — <https://www.release.tdnet.info/inbs/140120261022554474.pdf>
- **Capcom (Primary, timely disclosure)**: Notice and apology regarding customer information leaked through unauthorized access (second report) (2026-10-23, Japanese) — <https://www.release.tdnet.info/inbs/140120261023555492.pdf>
- **Capcom (Primary, company disclosure)**: "Notice and Apology Regarding Customer Information Affected Through Unauthorized Access" (2026-10-22) — <https://www.capcom.co.jp/ir/english/news/html/e261022.html>
- **Capcom (Primary, company disclosure)**: "Update to Notice and Apology Regarding Customer Information Affected Through Unauthorized Access" (2026-10-23) — <https://www.capcom.co.jp/ir/english/news/html/e261023.html>
- **e-Capcom (Primary, user guide)**: User guide (Japanese) — using e-Capcom requires a CAPCOM ID · <https://www.e-capcom.com/shop/pages/guide.aspx>
- **ASCII.jp (Press)**: Capcom leaks over 11.77 million customer records; unauthorized access to CAPCOM ID, unauthorized password changes too (2026-10-22, Japanese) — <https://ascii.jp/elem/000/004/445/4445054/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
