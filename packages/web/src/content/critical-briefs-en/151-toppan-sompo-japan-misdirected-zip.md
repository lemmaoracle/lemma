---
brief_no: 151
title: "TOPPAN：手作業で束ねた ZIP に、損保ジャパンの契約者 177,426 名分のリストが紛れ込み、別の損害保険会社へ送られた(保険料控除証明書発行サービス) — 宛先と中身の対応を、送る前に確かめる層が無い"
title_en: "TOPPAN: A list of 177,426 Sompo Japan policyholders slipped into a manually assembled ZIP and went to another insurer (insurance-premium deduction certificate service) — nothing checks that the contents match the recipient before the send"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: []
incident_date: 2026-09-01
published: 2026-10-14
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["065-hokkaido-hospital-hdd-disposal", "137-ssk-receipt-review-screen-display-proof", "149-revolut-italy-government-mailbox-disclosure-requests"]
status: published
version: "1.0"
og_lead_ja: "TOPPAN、損保ジャパン契約者 17.7 万人分のリストを別の保険会社へ誤送付"
og_lead_en: "TOPPAN sent 177,426 Sompo Japan policyholder records to another insurer"
---

## 1. TL;DR

On September 1, 2026, TOPPAN, which runs an insurance-premium deduction certificate service for Japanese non-life insurers, sent a list of 177,426 Sompo Japan policyholders (possibly including duplicates) to another insurer. With ZIP files for several insurers sitting in one folder, a drag-and-drop slip copied Sompo Japan's file into another insurer's ZIP, and nobody rechecked the contents before sending. The recipient noticed the same day. **Detection worked. What didn't was a layer that checks, independently of the operator, that the contents match the recipient before the send.**

## 2. What happened

- **The service**: Operation of the insurance-premium deduction certificate service. Six non-life insurers including Sompo Japan, the General Insurance Association of Japan, and TOPPAN built the service; 14 insurers now outsource its operation to TOPPAN (per Sompo Japan's announcement).
- **What was sent**: A CSV list of Sompo Japan policyholders who do not need a deduction certificate postcard. It went to one other non-life insurer.
- **Scale**: 177,426 people. The figure may include the same policyholder more than once and may fall after review.
- **Fields**: Name in katakana, policy number for premium deduction, and a business ID (a per-certificate unique key combining issue year, insurer identifier and policy number). Names in kanji, addresses, dates of birth, phone numbers, email addresses, card details, bank account details and My Number were not included.
- **Cause**: A manual operating error and a gap in the checking procedure. TOPPAN states it was not caused by a system failure, unauthorized access or a cyberattack.
- **What has been confirmed**: The recipient discarded and fully deleted the data. No leak to third parties or misuse has been confirmed so far. TOPPAN says this was the only cross-insurer mix-up in this round of deliveries.

The misdirected send happened through the following chain.

1. List data for each insurer was packed into a separate ZIP file, and files for several insurers sat in the same folder.
2. An operator made a drag-and-drop error and copied Sompo Japan's ZIP into the ZIP meant for another insurer.
3. The inside of the ZIP was not rechecked before sending.
4. The file transfer service delivered it as that other insurer's data, and Sompo Japan's list reached the recipient.

The point of no return was step 4. The only basis for the delivery was a ZIP assembled by hand, and at the moment of delivery no one had confirmed that its contents belonged to that recipient.

## 3. Timeline — disclosure and response

- **2026-09-01**: The misdirected send occurs during a manual data transmission. At 17:15 the same day, the receiving insurer asks the General Insurance Association of Japan about another insurer's policyholder data in its delivery.
- **2026-09-02**: The association asks TOPPAN to investigate, and the mix-up is confirmed. TOPPAN starts an investigation immediately and stops deliveries through the file transfer service.
- **2026-09-29**: TOPPAN and Sompo Japan announce the incident on the same day.

> The facts in this Brief rest on the official announcements of TOPPAN and Sompo Japan. The date, the sequence leading to discovery, the cause and the preventive measures appear only in TOPPAN's announcement; Sompo Japan's announcement refers readers to TOPPAN for them. The count and fields match in both. The deletion and the absence of any confirmed leak are statements by the parties themselves, not third-party verification.

Response and preventive measures after disclosure:

- **Notice to affected policyholders**: Sompo Japan is sending individual notices to the email addresses registered with the service, and letters to those without one.
- **TOPPAN's preventive measures**: Attach files only via "choose file"; assign a checker separate from the operator to review every step; compare attachment size and timestamps against the source data. As a permanent fix, systematize the sending process.
- **Sompo Japan**: Working with the participating insurers and the association, it will press TOPPAN to carry out the measures and strengthen its oversight of outsourced operations.

The mix-up was noticed on the day it happened; disclosure came 28 days later. The alert came from the recipient, not the sender.

## 4. Why it wasn't stopped

The failure here was neither an external attack nor one operator's carelessness. **Before the irreversible act of delivery, there was no layer that checked, separately from the operator's actions, that the contents matched the recipient.**

Detection worked. The receiving insurer noticed data that wasn't its own and asked the association the same day. By then, the list of 177,426 people had already left the company. What didn't work came earlier: a step right before delivery asking, "Is this ZIP's content something this recipient should receive?" The only thing that knew what was inside was the operator's own handling.

TOPPAN's measures all strengthen checking. A uniform way of choosing files reduces slips, an added checker adds eyes, and comparing size and timestamps adds a mechanical check; systematizing the send reduces manual handling altogether. All are useful, but matching size and timestamps does not directly show that the contents belong to that recipient. The match between recipient and contents still lives in the memory and procedure of whoever checked.

The same structure appears in earlier Briefs. In [the Hokkaido hospital drives](/critical/briefs/065-hokkaido-hospital-hdd-disposal/), media assumed to be shredded reached the second-hand market unverified; at [Japan's claims-review Fund](/critical/briefs/137-ssk-receipt-review-screen-display-proof/), a record of a screen shown for over one second was no proof that a person had reviewed it; and at [Revolut](/critical/briefs/149-revolut-italy-government-mailbox-disclosure-requests/), customer data was handed over for months without the requester's authority being verified. In each case, the step before data left the organization rested on a human assumption.

> "We had not rechecked the contents inside the ZIP file before sending it." — TOPPAN's announcement

## 5. What proof would have changed

There is no need to stop having one operator handle data for several insurers. Where a proof step could be inserted is not in adding more human checks, but in mechanically matching, right before delivery, "which issuer's data is in this file" against "may this recipient receive that issuer's data."

Lemma's proposed design for this gap:

- **Bind provenance to the contents.** Attach to each file a provenance proof showing which issuer (insurer) its business data belongs to. Bundling files into a ZIP does not strip that provenance.
- **Define in advance what each recipient may receive.** Register, per recipient, the issuers and formats it may receive, and stop any delivery containing a file whose provenance falls outside that scope before it executes.
- **Record the match separately from the operator's actions.** Keep a record, apart from the operator's activity log, of which proofs a delivery passed on, so it can be audited later.

This is where it differs from after-the-fact detection. Detection works when the recipient notices unfamiliar data — by which time the data has already left. A proof asks whether the contents match the recipient before delivery. This layer complements detection rather than replacing it.

Note: if the per-recipient scope is itself registered wrongly, a wrong delivery will still pass. Deletion or reuse of data after it reaches the recipient is also outside this check.

## 6. Sources

- **TOPPAN (primary, corporate announcement)**: Notice of misdirected data in the outsourced operation of the insurance-premium deduction certificate service (2026-09-29, in Japanese) — <https://www.holdings.toppan.com/ja/info/toppan_info20260929.pdf>
- **Sompo Japan Insurance (primary, corporate announcement)**: Notice of misdirected data by an outsourcing contractor for the insurance-premium deduction certificate service (2026-09-29, in Japanese) — <https://www.sompo-japan.co.jp/-/media/SJNK/files/news/2026/20260929_1.pdf?la=ja-JP>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving data provenance, see [Pillar 01 — Verifiable Origin](/pillars/#provenance).

The only primary sources for this incident are the official announcements of the parties (TOPPAN and Sompo Japan); as of this writing, no independent third-party verification has been found. The name of the insurer that received the data has not been disclosed.
