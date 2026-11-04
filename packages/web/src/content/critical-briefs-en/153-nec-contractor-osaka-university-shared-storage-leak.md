---
brief_no: 153
title: "An attack on NEC's contractor led to files with Osaka University personal data being taken from shared cloud storage (NEC, Osaka University and Osaka Metropolitan University disclosures)"
title_en: "An attack on NEC's contractor led to files with Osaka University personal data being taken from shared cloud storage (NEC, Osaka University and Osaka Metropolitan University disclosures)"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: [identity-auth]
incident_date: 2026-09-26
published: 2026-10-22
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["142-awa-bank-test-environment-repurposed-leak", "151-toppan-sompo-japan-misdirected-zip", "144-studio-saas-breach-decryption-keys-read"]
status: published
version: "1.0"
og_lead_ja: "NEC の委託先への攻撃で、大阪大学の 77,851 人分の個人情報が漏えい"
og_lead_en: "An attack on NEC's contractor leaked data on 77,851 Osaka University people"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 委託先経由の侵入"
og_kicker_en: "CYBERATTACK · VIA A CONTRACTOR"
og_headline_ja: "大学に知らされていない\n協力会社と共有していた\nファイルが、持ち出された。\n<accent>大阪大学で 77,851 人分</accent>"
og_headline_en: "An attack on a contractor, and files were taken from shared cloud storage.\n<accent>77,851 people at Osaka University.</accent>"
key_figures:
  - value: "77,851"
    unit: "people"
    label: "Osaka University people whose data leaked (deduplicated): 59,014 alumni, 15,035 students, 3,802 staff"
    tone: "alert"
  - value: "09-26 → 10-09"
    label: "From a third party downloading the files to NEC reporting it to Osaka University"
  - value: "10-02 → 10-20"
    label: "From Osaka Metropolitan University's systems going down to NEC reporting the cause as the attack on its contractor"
glossary:
  - term: "Contractor"
    desc: "The company NEC contracts for system development and maintenance. It was attacked in late September. Osaka Metropolitan University calls it a \"subcontractor\". It has not been named."
  - term: "Partner company"
    desc: "The company Osaka University says was \"not reported to the university\". According to Osaka University, files were shared to work with it. Whether it is the same company as the attacked contractor has not been disclosed."
  - term: "Cloud storage"
    desc: "An online place to keep files and share them with others. Anyone the files are shared with can read them."
insight:
  slug: "data-shared-beyond-contract"
  label: "Data shared beyond the contract"
  quote: "Once data you handed over is placed in a shared location, the owner can no longer check who can read it."
industries: ["public-sector", "supply-chain"]
operations: ["data-access"]
controls:
  - slug: "ownership-check"
    item: "Let the data owner decide which companies may handle each dataset, and check before sharing"
  - slug: "minimize-data"
    item: "After the work ends, check that files in shared storage were deleted as the deletion rule requires"
  - slug: "audit-trail"
    item: "Record who data was shared with and when it was deleted, separately from the contractor's report"
attack_method: "supply-chain"
impact: "77,851 people's data leaked at Osaka University; systems down at Osaka Metropolitan University"
takeaway: "Nothing had the data owner check, before handing data over, who it would be shared with."
self_check: "Can you name every contractor and subcontractor that touches your data?"
countries: ["jp"]
---

## 1. Summary

Osaka University says a partner company that had not been reported to the university was involved in part of the work. To work with that partner, files were shared on cloud storage without basis in the contract, and files that should have been deleted after the work were kept. The attacker used a properly issued account, and the files sat in the shared location people normally use. From the outside it cannot be told from routine work. <strong>Once data you handed over is placed in a shared location, the owner can no longer check who can read it.</strong>

## 2. What got through

- **What got through**: Files containing the university's personal data were placed in shared cloud storage and kept after the work. Osaka University says the sharing was not based on the contract.
- **What reached the receiving side**: In general, placing a file in a shared location arrives as the contractor's routine work. Whether the party that placed it is one the data owner's contract allows cannot be told from the act of placing it.
- **Not disclosed**: The contractor's name, whether the partner and the attacked contractor are the same company, how the credentials were stolen, what rights the account had, whether multi-factor authentication (a setting that asks for a code in addition to the password) was used, and how the files were downloaded.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever places data in a shared location checks, before placing it, that the party it is shared with is a company the data owner's contract allows, against a list the owner registered.

- **Who approves**: The data owner (such as the university). The owner keeps a list of the contractors and subcontractors the contract allows. It does not rely on the contractor's own declaration.
- **Where it is checked**: The mechanism that places files in the shared location. Before a file is placed, it checks whether the party it is shared with is on the list, and refuses sharing if not. Files carry an end-of-work date and are deleted once it passes.
- **What is recorded**: Who data was shared with and when it was deleted, kept apart from the contractor's report in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a file is placed in a shared location, that the party it is shared with is a company the contract allows, and keeping a record. Detection means noticing after a download or encryption has happened. The dates below are when each company or university confirmed or disclosed a point, not when the sharing or download took place.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check, before placing it, that the party is one the contract allows</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>77,851 people leaked at Osaka University<br>Systems down at Osaka Metropolitan University</span></div>
<div class="rx-zone det"><b>Detection · learned afterwards</b>After the download, NEC reports to the university</div>
<div class="rx-g g1"><div class="t">09-26</div><b>Osaka University files downloaded</b></div>
<div class="rx-g g2"><div class="t">10-02</div><b>Osaka Metropolitan University systems stop</b></div>
<div class="rx-g g3"><div class="t">10-09</div><b>NEC reports to Osaka University</b></div>
<div class="rx-g g4"><div class="t">10-20</div><b>NEC discloses</b></div>
</div>
</figure>

Detection worked, but only after the download. A similar case, where customer data was left in an environment that should have been finished with, is [the Awa Bank test environment](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that places data in a shared location.** It does not look for intrusions; it checks, before the file is placed, whether the party it is shared with is on the list the owner registered.

### Industries and operations to watch

- **Industry · Public sector**: Universities and local governments that outsource system operations to IT vendors. From the outsourcing side, subcontracting beyond the first tier is out of sight, and it is hard to know how many companies the data has reached.
- **Industry · Procurement & supply chain**: IT vendors that hand development and maintenance to partner companies. Each customer's data gathers in shared locations for the work.
- **Operation · Lookups & reads**: Work where a contractor or partner receives data and deletes it afterwards. Sharing and deletion are decided by the contractor's own operations alone.

### Current controls vs Lemma

The route in this case is column 1 (placing files in a shared location and sharing them). Column 2 covers files that remain after the work, which also applies here. Column 3 is direct entry into the university's system with the contractor's legitimate account; the Osaka Metropolitan University outage is close to it, but how the credentials were stolen has not been disclosed.

| Control | Placing and sharing in a shared location | Files kept after the work | Direct entry with the contractor's legitimate account |
| --- | --- | --- | --- |
| Contractual approval of subcontracting | Not effective | Not relevant | Not relevant |
| Rules to delete data after the work | Not relevant | Not effective | Not relevant |
| Managing contractor devices | Partial | Not relevant | Partial |
| Intrusion detection | Partial | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

Contractual approval of subcontracting did not stop the sharing, because a partner not reported to the university took part in the work (per Osaka University). Rules to delete data after the work did not hold; files that should have been deleted were kept (per Osaka University). Managing contractor devices, with NEC lending its own managed devices, narrows entry via contractor devices but does not change who files are shared with. Detection notices after encryption or download. Lemma checks the party against the registered list before the file is placed.

Note: Lemma's check works only when it is built into the mechanism that places files in the shared location and the owner manages the list. If the registered list is itself wrong, wrong sharing still goes through. If an allowed contractor's legitimate account is taken over, data given to parties on the list can be read. Deleting files after the work needs separate operations; Lemma keeps the record that they were deleted. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about outsourced system operations

- When a contractor subcontracts, are you notified in advance, and is there a step to approve it?
- Is your personal data sitting in the shared storage your contractor uses to exchange files? If so, have you asked who can see it?
- Can the contractor show you, by record, that data was deleted when the work ended?

## 5. Facts and timeline

- **The contract chain**: Osaka University contracts NEC to run its university-wide education computer system (the "campus system"); Osaka Metropolitan University contracts NEC to maintain and run its core systems. NEC contracted system development and maintenance to another company (the contractor), which has not been named.
- **The attack**: The contractor was attacked in late September and stolen credentials for a legitimate account were abused. Customer systems were accessed from the contractor's device using that account, and files on servers were encrypted (per NEC). How the credentials were stolen, what rights the account had and whether multi-factor authentication was used have not been disclosed.
- **Leak from shared storage**: Files leaked from cloud storage NEC created and used to share information between customers and NEC, and between NEC and its contractor. They included customers' personal data and system information (per NEC). How the files were downloaded has not been disclosed.
- **Osaka University (leak only)**: On September 26, 2026, a third party downloaded files containing the university's personal data. Osaka University says its subsequent inquiry confirmed that a partner company not reported to the university was involved in part of the work, that files were shared on cloud storage to work with that partner without basis in the contract, and that files that should have been deleted after the work were kept. NEC's investigation found no sign of intrusion into the campus system.
- **What leaked at Osaka University**: 77,851 people (deduplicated: 59,014 alumni, 15,035 students, 3,802 staff). Name, university personal ID, university-issued email address, student or staff number, affiliation and more; the fields vary by person. No misuse or secondary harm has been confirmed (per Osaka University).
- **Osaka Metropolitan University (encryption and leak)**: Its information infrastructure went down on October 2. The cause was unauthorized access to its systems using a legitimate account held by the subcontractor. It was also told that personal data and system information about the university in the cloud storage had leaked, but says the content and count are still being confirmed with NEC (per Osaka Metropolitan University).
- **NEC's disclosure**: It does not describe the partner's involvement or how the files came to be shared. It says "multiple" customers were affected (press reports say three, with personal data leaked at two).

### Timeline

- **2026-09**: In late September, NEC's contractor is attacked (per NEC).
- **2026-09-26**: A third party downloads files containing Osaka University's personal data (per Osaka University).
- **2026-10-02**: Early in the morning, Osaka Metropolitan University's maintenance vendor sees servers stopping and contacts the university, which reports to the education ministry, police and others (OMU press materials).
- **2026-10-05**: Osaka Metropolitan University holds a press conference and contacts the Personal Information Protection Commission.
- **2026-10-09**: NEC tells Osaka University that files had been downloaded.
- **2026-10-20**: NEC discloses. The same day, NEC reports the cause of the outage to Osaka Metropolitan University.
- **2026-10-21**: Osaka University and Osaka Metropolitan University (5th update) disclose.

> The facts rest on the disclosures by NEC, Osaka University and Osaka Metropolitan University (all primary). The partner's involvement and how the files came to be shared appear only in Osaka University's disclosure; NEC's statement does not mention them. No disclosure says whether the partner and the attacked contractor are the same company. Osaka Metropolitan University says the roughly 130,000 academic-system records it said on October 5 may have leaked were on its own virtualisation platform and are separate from the information in NEC's cloud storage. The number of customers comes from press reports. What has not been disclosed does not mean there were no controls.

### After disclosure

- **NEC**: Is lending NEC-managed devices to the contractor among other measures, and will tighten contractor and personal-data management. It will report details of the leaked personal data to customers as they become clear.
- **Osaka University**: Will tell each affected person which fields leaked, and warns about phishing and spoofed email. It will press NEC to find the cause and carry out preventive measures.
- **Osaka Metropolitan University**: Will gather information with NEC and take the necessary steps.

## 6. Sources

- **NEC (Primary, company disclosure)**: Apology for customer system outages and data leakage caused by unauthorized access at a contractor (2026-10-20, Japanese) — <https://jpn.nec.com/news/info/20261020.html>
- **Osaka University (Primary, disclosure)**: Personal data leak at a contractor (2026-10-21, Japanese) — <https://www.osaka-u.ac.jp/ja/news/topics/2026/10/21004>
- **Osaka Metropolitan University (Primary, disclosure)**: Outage of the university's information infrastructure, 5th update: system outage and data leak from the cyberattack disclosed by the contractor (2026-10-21, Japanese) — Osaka Public University Corporation temporary notice site · <https://www.omu.moe/news/2026-10-21-1d69aecb.html>
- **Osaka Metropolitan University (Primary, press conference handout)**: Press conference handout (2026-10-06, Japanese) — conference held 10-05 · <https://www.omu.moe/news-files/2026-10-06-7fb5a624/press-conference-materials_20261005.pdf>
- **Nikkei (Press)**: NEC contractor hit by cyberattack, three customers' data leaked (2026-10-20, Japanese) — <https://www.nikkei.com/article/DGXZQOUC2081V0Q6A021C2000000/>
- **@IT (Press)**: Osaka Metropolitan University ransomware traced to an attack on NEC's contractor; legitimate account stolen (2026-10-22, Japanese) — <https://atmarkit.itmedia.co.jp/ait/articles/2610/22/news019.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
