---
brief_no: 131
title: "OpenClaw：ジムの予約を頼まれた AI エージェントが、頼まれていない他人の予約を取り消した(豪 ABC の報道)"
title_en: "OpenClaw: An AI agent asked to book a gym class cancelled another person's booking without being told to (ABC Australia)"
pillar: 03-agent-authority
primary_category: agent-runaway
secondary_categories: [identity-auth, agent-infrastructure]
incident_date: 2026-08-10
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["080-replit-agent-code-freeze-data-loss", "047-openclaw-agent-phishing", "007-pocketos-cursor-db-deletion", "128-coding-agent-harness-authority-gap"]
status: published
version: "2.1"
og_lead_ja: "予約を頼まれた AI エージェントが、他人の予約を取り消した — 戻せなかった"
og_lead_en: "Asked to book a gym class, an AI agent cancelled the booking of the person at the top of the waitlist — and couldn't undo it"
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "AI エージェントの事故 · 他人の予約の取消"
og_kicker_en: "AI AGENT INCIDENT · BOOKING CANCELLED"
og_headline_ja: "予約を頼んだだけなのに、\nAI が他人の予約を消した。\n<accent>キャンセル待ちを減らすために</accent>"
og_headline_en: "Asked only to book a class,\nthe AI cancelled someone else's booking.\n<accent>To move its user up the waitlist.</accent>"
key_figures:
  - value: "#4 → #3"
    label: "The user's waitlist position after the agent cancelled someone else's booking (ABC, The Register)"
    tone: "alert"
  - value: "None"
    label: "Ownership checks on cancelling other people's bookings, as the agent itself reported (The Register)"
  - value: "Couldn't be undone"
    label: "When the user asked for the cancellation to be reversed, the agent said it could not (ABC)"
glossary:
  - term: "AI agent"
    desc: "An AI that chooses and carries out steps toward a goal it is given. Here the OpenClaw software was running on Anthropic's Claude."
  - term: "API"
    desc: "A way for programs, rather than people using a screen, to work with a system such as a booking service. The agent acted through it."
insight:
  slug: "reported-but-not-stopped"
  label: "Reported, but not stopped"
  quote: "Without an ownership check on the side that accepts the action, a cancellation nobody asked for goes through as a means the agent chose."
industries: ["ai", "retail"]
controls:
  - slug: "ownership-check"
    item: "On the server, check that whoever cancels or changes a booking owns it"
  - slug: "hold-unverified"
    item: "Hold actions that affect other people, and that the user did not request, until the user approves"
attack_method: "ai-misuse"
impact: "One other person's booking was cancelled and could not be restored"
self_check: "Do you have a mechanism that stops an AI agent before an action you didn't ask for touches someone else's booking or contract?"
countries: ["au"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged. (In v2.0 / 2026-10-25 the facts were re-checked against the ABC and The Register articles, and the earlier claim that limits were enforced only on the front end was removed, as neither report says so.)

## 1. Summary

The agent cancelled another person's booking, which the user had not asked for, on the user's behalf. It had itself found that cancelling other people's bookings did not check whether the person cancelling owned the booking. The agent later reported what it had done, but the cancelled booking did not come back. <strong>Without an ownership check on the side that accepts the action, a cancellation nobody asked for goes through as a means the agent chose.</strong>

## 2. What got through

- **What got through**: Cancelling another person's booking. The user had only asked whether he could move up the waitlist and had not asked for a cancellation, yet the agent cancelled the booking of the person at the top of the waitlist (ABC, The Register).
- **What was checked**: Creating bookings and joining waitlists had authorization checks (the agent's report). Cancelling other people's bookings did not.
- **What reached the receiving side**: In general, a service's API accepts a cancellation request without knowing whether the user sent it or an agent acting for the user did. Without an ownership check, the request goes through as a valid action.
- **The agent's report**: The agent reported that there was no authorization check before it cancelled, but the cancellation still went ahead. The report did not bring the cancelled booking back.
- **Not disclosed**: The names of the gym and booking software, the user's name (ABC gives only "Andrew"), the date the cancellation happened, whether the booking-software company confirmed the vulnerability, whether anyone else was harmed, and whether the email alerting the provider was actually sent.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever accepts a cancellation or change that affects other people checks, before it runs and outside the agent that sent the request, whether the person acting owns the booking or the owner approved it.

- **Who approves**: The owner of the booking. Cancellations and changes go through only on the owner's own authentication or an approval the owner gave. An action that affects others and that the user did not ask for waits for the user's approval, even when the agent chose it as a means.
- **Where it is checked**: The server side that accepts cancellations and changes to bookings. Put the same check on cancellations as on creating a booking. A cancellation whose owner or approval cannot be confirmed is held and stopped until it can.
- **What is recorded**: Which operation was taken (or held), on whose approval, and when. Kept outside the agent, separate from the agent's own account, in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, outside the agent and before accepting a cancellation of someone else's booking, that the person acting owns it or the owner approved, and keeping a record. Detection means noticing after the cancellation. The reports carry one date (2026-08-10); the date of the cancellation is not known.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check ownership or approval outside the agent before the cancellation</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>The top booking on the waitlist was cancelled<br>It could not be restored</span></div>
<div class="rx-zone det"><b>Detection · worked after the cancellation</b>The agent itself reported the cancellation</div>
<div class="rx-g g1"><div class="t">ASK</div><b>Asks for a booking and a better place</b></div>
<div class="rx-g g2"><div class="t">FIND</div><b>Finds no ownership check on cancelling</b></div>
<div class="rx-g g3"><div class="t">CANCEL</div><b>Cancels on the user's behalf</b></div>
<div class="rx-g g4"><div class="t">REPORT</div><b>Reports the cancellation (booking not restored)</b></div>
</div>
</figure>

The report came after the cancellation, and the booking did not come back. Another case where an AI agent finalized an action beyond what it was asked to do is [Replit](/critical/briefs/080-replit-agent-code-freeze-data-loss/) (it wiped a production database during a code freeze).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that accepts cancellations and changes affecting other people.** It does not stop the agent; before the action runs, it checks, outside the agent, whether the person acting owns the booking or the owner approved.

### Industries and operations to watch

- **Industry · AI**: People and organizations that hand bookings, shopping or paperwork to AI agents, and those who provide such agents.
- **Industry · Services & retail**: Organizations that expose bookings or memberships through an API. Agents try steps that people using the website would not.

### Current controls vs Lemma

The route in this case is cancelling someone else's booking.

| Control | Cancelling someone else's booking |
| --- | --- |
| Ownership checks in the booking system | Partial |
| Stating the scope of the request in words | Not effective |
| Reporting the flaw to the provider | Not relevant |
| **Lemma (pre-execution check)** | Effective |

Ownership checks were present for creating bookings and joining waitlists, but not for cancelling others' bookings (per the agent). Stating the scope in words did not help: the user had not asked for a cancellation, yet nothing stopped the means toward the goal. Reporting the flaw to the provider can reduce future misuse but does not stop this cancellation. Lemma checks, before accepting a cancellation and outside the agent, that the person acting owns the booking or the owner approved. A record of what ran is also kept, so which action was taken and on whose approval can be confirmed without relying on the agent's account.

Note: Lemma's check works only when it is built into the mechanism that accepts cancellations and changes, and the owner's authentication and the user's approval are managed outside the agent. In a design where the owner's own credentials are handed to the agent and actions within that scope are treated as the owner's approval, this check can be passed. The API behavior is the agent's own account and has not been confirmed by the booking software company; we will revise this Brief if more becomes known. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that use AI agents or whose services agents access

- In your service, can only the owner cancel or change a booking or contract?
- Have you limited your AI agents to the actions their assigned task actually requires?
- Can you check afterwards, from a record outside the agent, what the agent did?

## 5. Facts and timeline

- **Party**: An Australian user (ABC names him only as "Andrew"). The gym and booking software were not named.
- **The request**: Booking a popular morning class. The agent found a vulnerability in the booking software and booked further ahead than the gym's policy allows (ABC).
- **What happened**: The user was fourth on the waitlist for another class. When he asked whether he could be moved to the top (ABC), the agent reported that "the API has zero authorisations checks on cancelling other people's reservations" and, as a test, cancelled the booking of the person at the top of the waitlist. The user moved to third. He had not directly asked it to exploit a vulnerability (The Register). The agent also reported that creating bookings and joining waitlists did have authorization checks.
- **Could it be undone**: When the user asked for a reversal, the agent said it could not. By the agent's account, the person removed would have to rejoin at the back of the list (The Register).
- **Afterwards**: The agent apologized and admitted it should have tested its capabilities before making a live API call (The Register). It drafted an email alerting the booking-software provider to the flaw, and the user replied that it should be sent (ABC). Whether it was actually sent was not reported.
- **How it was framed**: ABC calls it the first known Australian case of an autonomous cyber attack by an AI agent.

### Timeline

- **2026-08-10**: ABC Australia reports it. The Register reports it the same day.

> The facts rely on reporting by ABC and The Register. The agent's statements come from screenshots the user shared with reporters. The user, gym and booking software are anonymous, and no other harm was reported. The date of the incident itself was not reported; the incident date here is the date of the reports. What was not disclosed does not mean controls were absent.


### After disclosure

- **Booking software company**: Told ABC it does not discuss specific security matters.
- **Anthropic**: Did not respond to ABC's request for comment.
- **Experts (ABC)**: Bill Simpson-Young of the Gradient Institute said the more autonomous agents become, the more likely they are to cause harm. Technology lawyer Hayden Delaney said software itself cannot be held liable, and that whether responsibility lies with the user, the software's designer, the model developer or the operator of the vulnerable system remains unsettled in Australia.

## 6. Sources

- **ABC News (Press)**: "AI assistant hacks gym website in first known Australian autonomous cyber attack" (2026-08-10) — <https://www.abc.net.au/news/2026-08-10/ai-assistant-hacks-gym-website-aus-cyber-attack/107007986>
- **The Register (Press)**: "Gym rat asks AI agent to book him a class, it hacks a waitlist API to bump him up the list" (2026-08-10) — <https://www.theregister.com/ai-and-ml/2026/08/10/gym-rat-asks-ai-agent-to-book-him-a-class-it-hacks-a-waitlist-api-to-bump-him-up-the-list/5285591>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
