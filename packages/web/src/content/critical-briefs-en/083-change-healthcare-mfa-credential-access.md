---
brief_no: 83
title: "Change Healthcare：盗まれた認証情報でリモートアクセスに入られ、米国の医療請求の処理が数週間止まった(UnitedHealth Group の議会証言)"
title_en: "Change Healthcare: Stolen credentials opened remote access, and US medical-claims processing stalled for weeks (UnitedHealth Group congressional testimony)"
pillar: "04-regulatory-attribute"
primary_category: "identity-auth"
secondary_categories: ["attribute-proof-bypass"]
incident_date: 2024-02-21
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["046-servicenow-unauthenticated-api", "057-deepseek-clickhouse-exposed-db", "056-mchire-paradox-recruiting-auth"]
status: published
version: "1.0"
og_lead_ja: "Change Healthcare：MFA なしの単一 Citrix アカウントへの侵入が米国医療請求の 3 分の 1 を数週間停止"
og_lead_en: "Change Healthcare: a breach of one Citrix account without MFA halted a third of US medical claims for weeks"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · ランサムウェア"
og_kicker_en: "CYBERATTACK · RANSOMWARE"
og_headline_ja: "盗まれた認証情報で、\n医療請求が止まった。\n<accent>米国の約 3 分の 1</accent>"
og_headline_en: "Stolen credentials\nstalled medical claims.\n<accent>~1/3 of US claims, for weeks</accent>"
key_figures:
  - value: "~1/3"
    label: "Share of US health-insurance claims processing handled by Change Healthcare (also put at 40–50%). The outage lasted weeks"
    tone: "alert"
  - value: "~9 days"
    label: "From the intrusion (2024-02-12, estimated) to detection of the ransomware (02-21)"
  - value: "100M+"
    label: "Medical records affected (HHS disclosure). Later estimates put it at up to 190 million"
glossary:
  - term: "Citrix remote access"
    desc: "The entry point for reaching internal systems from outside the company. This intrusion began with a login to it."
  - term: "MFA (multi-factor authentication)"
    desc: "A way of logging in that confirms the person with another factor, such as a device in hand or a biometric, in addition to the password."
  - term: "Lateral movement"
    desc: "An intruder moving from system to system inside a network and widening their privileges."
insight:
  slug: "password-is-not-authority"
  label: "Knowing is not being authorized"
  quote: "Even when the password matches, unless you separately check that the person logging in is the authorized holder, a login with stolen credentials passes as legitimate access."
industries: ["healthcare"]
operations: ["account-admin"]
controls:
  - slug: "ownership-check"
    item: "Confirm the person logging in is the account holder by more than a password"
attack_method: "account-takeover"
impact: "Medical records of 100M+ Americans affected"
takeaway: "Stolen credentials got in through the remote-access entry point as a legitimate login. At the entry point, check — separately from the password match — that the party logging in is the authorized holder."
self_check: "At your remote-access entry point, do you check, separately from the password match, that the party logging in is the authorized holder?"
countries: ["us"]
---

## 1. Summary

The login at the entry point used a stolen ID and password and was outwardly indistinguishable from legitimate remote access. Detection worked only at the ransomware-deployment stage, after lateral movement inside the network had progressed. <strong>Even when the password matches, unless you separately check that the person logging in is the authorized holder, a login with stolen credentials passes as legitimate access.</strong>

## 2. What got through

- **What got through**: A login to the Citrix remote-access entry point with stolen credentials (ID and password). UnitedHealth Group's CEO said in congressional testimony that the intrusion path was a single Citrix account with no MFA configured.
- **What was stopped**: Change Healthcare detected the attack at the ransomware-deployment stage and shut down core systems. By then the attacker had been moving laterally inside the network (the intrusion is estimated at 2024-02-12).
- **What the receiving side sees**: In general, an entry point that accepts a password alone receives an ID and a password. A legitimate user's login and a login with stolen credentials look the same to it.
- **Not disclosed**: How the credentials were obtained (phishing, info-stealing malware or a dark-web purchase are possible, but the path has not been disclosed). The intrusion date is an estimate.

## 3. What to check

The condition that holds regardless of route is that the entry point checks, before accepting a login and separately from the password match, that the party logging in is the holder with authority over that scope.

- **Who approves**: The organization (the side that manages access rights). It decides in advance who may enter which scope, for which operational need.
- **Where the check happens**: At the remote-access entry point. Beyond the password match, it checks before the login that the party is the authorized holder. Logins that cannot be checked do not go through.
- **What is recorded**: Which party passed the entry point, under what authority and when, and under what authority it touched medical records and the like.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" vs "pre-execution check"</span></div>
<p class="rx-ex-cap">Pre-execution check = before accepting a remote-access login, check that the party logging in is the authorized holder, and record it. Detection = noticing the attack after the intrusion. The intrusion date (02-12) is an estimate.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before the login, check that the party is the authorized holder</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>About 9 days inside the network,<br>indistinguishable from legitimate access</span></div>
<div class="rx-zone det"><b>Detection · worked after the intrusion</b>Notices the ransomware deployment and shuts down core systems</div>
<div class="rx-g g1"><div class="t">02-12 (est.)</div><b>Login with stolen credentials</b></div>
<div class="rx-g g2"><div class="t">From 02-12</div><b>Lateral movement inside the network</b></div>
<div class="rx-g g3"><div class="t">02-21</div><b>Detects it and shuts down core systems</b></div>
<div class="rx-g g4"><div class="t">2024-05</div><b>Intrusion path stated in congressional testimony</b></div>
</div>
</figure>

Detection limited the damage by shutting systems down, but it came about 9 days after the intrusion. Unlike cases where the entry point had no authentication at all, such as [DeepSeek](/critical/briefs/057-deepseek-clickhouse-exposed-db/) (an unauthenticated database), here a legitimate, authenticated entry point was logged into with credentials.

## 4. What Lemma does

**Lemma builds the check in section 03 into the remote-access entry point.** It does not look for intrusions; it checks before the login, separately from the password match, that the party logging in is the authorized holder.

### Industries and operations to watch

- **Industry · Healthcare**: Organizations that run infrastructure many providers connect to, such as medical-claims processing and health-information exchange. One entry point can stop operations nationwide.
- **Operation · Account administration and remote access**: Accounts on entry points reached from outside, how logins work, and access rights to protected health information (PHI).

### Current controls vs Lemma

The route in this case is column 1 (a remote-access login with stolen credentials). Column 2 is lateral movement and ransomware deployment after the login; this case was detected at that stage.

| Control | Remote-access login with stolen credentials | Lateral movement and ransomware deployment after the login |
| --- | --- | --- |
| MFA (factors beyond the password) | Partial | Not relevant |
| Ransomware detection and system shutdown | Not effective | Partial |
| **Lemma (pre-execution check)** | Effective | Partial |

MFA adds resistance to a login with a stolen password alone by also checking factors other than the password. It was not configured on the Citrix account named as the intrusion path (UnitedHealth Group congressional testimony). Ransomware detection worked at the deployment stage and shut down core systems, but the first login was indistinguishable from legitimate access, and detection came about 9 days after the intrusion. Lemma checks before the login, separately from the password match, that the party is the authorized holder. Access to medical records can likewise be checked, at the time of access, for the authority it rests on, and recorded.

Note: Lemma's check works only when it is built into the remote-access entry point and authority decisions are managed apart from the password. It can be passed if the authorized holder's device or session is taken over as a whole. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about remote access in your organization

- Can the entry points reached from outside be entered with a password alone?
- Do you check at the entry point that the party logging in is the holder with authority over that scope?
- Do you record who touched sensitive data such as medical records, and under what authority?

## 5. Facts and timeline

- **Affected organization**: Change Healthcare (a UnitedHealth Group subsidiary; the largest medical-claims processing and health-information exchange network in the US).
- **Attacker**: The AlphV/BlackCat ransomware group. RansomHub later carried out separate extortion.
- **Intrusion path**: A login with stolen credentials (ID and password) to a Citrix remote-desktop / VPN gateway entry point that had no MFA configured (congressional testimony by UnitedHealth Group's CEO).
- **Operational impact**: For weeks, prescription-dispensing verification at pharmacies nationwide, hospital insurance billing and physician eligibility checks were impossible or severely delayed. Some hospitals had to ask for cash payment and could not verify prescription-drug stock.
- **Financial impact**: The ransom UnitedHealth Group paid was approximately $22 million (a separate payment to RansomHub was also reported later). Total losses including the outage, recovery and provider support are reported in the billions of dollars.
- **Data impact**: The medical records, personal information and insurance information of over 100 million Americans (up to 190 million in later estimates) may have been affected. It is described as the largest healthcare data breach in US history.

### Timeline

- **2024-02-12 (estimated)**: The attacker logs in to the Citrix account with no MFA configured, using stolen credentials, and begins moving laterally inside the network.
- **2024-02-21**: Change Healthcare detects the ransomware attack and shuts down core systems. Medical claims and prescription processing halt nationwide.
- **2024-02-21 to March**: Pharmacies, hospitals and physicians nationwide are affected. HHS (the US Department of Health and Human Services) announces an emergency response. The AHA (American Hospital Association) appeals to Congress, citing catastrophic impact.
- **March 2024 (estimated)**: AlphV/BlackCat receives the approximately $22 million ransom and then disbands. Affiliates holding the data reappear as RansomHub and separately extort Change Healthcare.
- **2024-05**: UnitedHealth Group CEO Andrew Witty testifies before Senate and House committees and states that the Citrix account with no MFA configured was the intrusion path.
- **From 2024-10**: HHS discloses the affected count (initially over 100 million). Later estimates of up to over 190 million are reported.

> This Brief rests on UnitedHealth Group's congressional testimony and HHS disclosures as primary sources. The intrusion date (2024-02-12) is an estimate, and the affected count has been updated over time, so consult the latest information. What has not been disclosed does not mean there were no controls.

### After disclosure

- **UnitedHealth Group / Change Healthcare**: Shut systems down immediately and set up emergency funding assistance for providers (billions of dollars). Investigated and disclosed the scope of the breach in parallel with recovery.
- **HHS (US Department of Health and Human Services)**: Issued emergency guidance and temporarily relaxed how HIPAA rules were applied. Disclosed the affected count (over 100 million).
- **AHA (American Hospital Association)**: Asked Congress for emergency measures, citing "catastrophic and unprecedented" impact.
- **AlphV/BlackCat**: Effectively disbanded after receiving approximately $22 million. According to a whistleblower, the group leader kept the ransom, and affiliates regrouped as RansomHub with the data.
- **Industry debate**: Debate over making MFA a de facto requirement in healthcare IT accelerated. HHS began considering a revision to the HIPAA Security Rule that would state an MFA requirement. Attention to third-party risk management for healthcare infrastructure grew.

## 6. Sources

- **UnitedHealth Group congressional testimony (primary)**: Testimony by CEO Andrew Witty before the US Senate Finance Committee and House Energy and Commerce Committee (around 2024-05-01, 05-08). Stated the MFA-less Citrix account as the intrusion path — https://www.finance.senate.gov/hearings/hacking-americas-health-care-assessing-the-change-healthcare-cyber-attack-and-whats-next (Witty testimony PDF: https://www.finance.senate.gov/imo/media/doc/0501_witty_testimony.pdf)
- **HHS (US Department of Health and Human Services)**: Breach notification and disclosure of the affected count (from 2024-10). Change Healthcare Breach Substitute Notice
- **AHA (American Hospital Association)**: "Change Healthcare Cyberattack" (from 2024-02) — https://www.aha.org/change-healthcare-cyberattack
- **Wired**: "The Change Healthcare Hack: How It Happened and What It Means" (2024)
- **CISA / FBI joint advisory**: Technical advisory on the AlphV/BlackCat ransomware group (2024-02-27) — https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-353a

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/)
