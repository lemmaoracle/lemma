---
brief_no: 153
title: "NEC：委託先への攻撃で、大学に知らされていない協力会社と共有していたファイルが持ち出された(NEC・大阪大学・大阪公立大学の公表) — 大学のデータを誰と共有してよいかを、渡す前に照合する層が無い"
title_en: "NEC: An attack on a contractor exposed files NEC had shared with a partner the university was never told about (NEC, Osaka University and Osaka Metropolitan University disclosures) — Nothing checks, before data is handed over, who it may be shared with"
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
og_kicker_ja: "サイバー攻撃事例 · 委託先経由の侵入"
og_kicker_en: "CYBERATTACK · VIA A CONTRACTOR"
og_headline_ja: "大学に知らされていない\n協力会社と共有していた\nファイルが、持ち出された。\n<accent>大阪大学で 77,851 人分</accent>"
og_headline_en: "Files shared with a partner the university was never told about were taken.\n<accent>77,851 people at Osaka University.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "77,851"
    unit: "people"
    label: "Osaka University people whose data leaked (deduplicated): 59,014 alumni, 15,035 students, 3,802 staff"
    tone: "alert"
  - value: "09-26 → 10-09"
    label: "From a third party downloading the files to NEC reporting it to Osaka University"
  - value: "3"
    unit: "points"
    label: "What Osaka University called \"a serious problem\": an unreported partner's involvement, sharing without contractual basis, and keeping files that should have been deleted"
glossary:
  - term: "Contractor"
    desc: "The company NEC contracts for system development and maintenance. It was attacked in late September. Osaka Metropolitan University calls it a \"subcontractor\". It has not been named."
  - term: "Partner company"
    desc: "The company Osaka University says was \"not reported to the university\". NEC shared files to work with it. Whether it is the same company as the attacked contractor has not been disclosed."
  - term: "Cloud storage"
    desc: "An online place to keep files and share them with others. Anyone the files are shared with can read them."
insight:
  slug: "data-shared-beyond-contract"
  label: "Data shared beyond the contract"
  quote: "Only NEC's own practice, as the university's contractor, decided who the university's data was shared with and when it was deleted, and nothing checked that against the university's contract before handing it over."
industries: ["public-sector", "supply-chain"]
operations: ["data-access"]
controls:
  - slug: "ownership-check"
    item: "Let the data owner decide which companies may handle each dataset, and check before sharing"
  - slug: "audit-trail"
    item: "Record who data was shared with and when it was deleted, separately from the contractor's report"
attack_method: "supply-chain"
impact: "77,851 people's data leaked at Osaka University; systems down at Osaka Metropolitan University"
takeaway: "Nothing checked, before handing it over, who a contractor could share a customer's data with."
self_check: "Can you name every contractor and subcontractor that touches your data?"
---

## 1. TL;DR

On October 20, 2026, NEC disclosed that a company it contracts for development and maintenance was attacked in late September, that stolen credentials were used to break into customer systems, and that files with personal data leaked from cloud storage the parties shared. The next day Osaka University disclosed a leak affecting 77,851 people, and Osaka Metropolitan University traced its outage from October 2 to the same attack.

The account was legitimate and the files sat in the usual shared location, so it looked like ordinary work. According to Osaka University, NEC had shared the files, without basis in the contract, with a partner never reported to the university, and had kept files that should have been deleted.

NEC reported the download to Osaka University 13 days after the files were taken. What failed was the layer that checks, before handing data over, who it may be shared with.

## 2. What happened

- **The contract chain**: Osaka University contracts NEC to run its university-wide education computer system (the "campus system"); Osaka Metropolitan University contracts NEC to maintain and run its core systems. NEC contracted system development and maintenance to another company (the contractor), which has not been named.
- **The attack**: The contractor was attacked in late September and stolen credentials for a legitimate account were abused. Customer systems were accessed from the contractor's device using that account, and files on servers were encrypted (per NEC). How the credentials were stolen, what rights the account had and whether multi-factor authentication was used have not been disclosed.
- **Leak from shared storage**: Files leaked from cloud storage NEC created and used to share information between customers and NEC, and between NEC and its contractor. They included customers' personal data and system information (per NEC). How the files were downloaded has not been disclosed.
- **Osaka University (leak only)**: On September 26, 2026, a third party downloaded files containing the university's personal data. A partner company not reported to the university was involved in part of the work, and NEC, without basis in its contract with the university, had shared the files on cloud storage to work with that partner. It had also kept files that should have been deleted after the work (per Osaka University). NEC's investigation found no sign of intrusion into the campus system.
- **What leaked at Osaka University**: 77,851 people (deduplicated: 59,014 alumni, 15,035 students, 3,802 staff). Name, university personal ID, university-issued email address, student or staff number, affiliation and more; the fields vary by person. No misuse or secondary harm has been confirmed (per Osaka University).
- **Osaka Metropolitan University (encryption and leak)**: Its information infrastructure went down on October 2. The cause was unauthorized access to its systems using a legitimate account held by the subcontractor. It was also told that personal data and system information about the university in the cloud storage had leaked, but says the content and count are still being confirmed with NEC (per Osaka Metropolitan University).
- **What NEC's statement does not say**: NEC's disclosure does not address the three points Osaka University raised. It says only "multiple" customers were affected (press reports say three, with personal data leaked at two).

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The sequence, as disclosed</span></div>
<p class="rx-ex-cap">The stopping point is ①. Had anyone checked, before placing the files in shared storage, whether the party was allowed under the university's contract, the files would not have been shared with the partner (how they were taken has not been disclosed).</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">NEC</div><div class="no">1</div><b>Shares files containing university personal data with a partner via cloud storage</b><p>Without contractual basis (per Osaka University).</p></div>
<div class="rx-step crit"><div class="who">NEC</div><div class="no">2</div><b>Files that should have been deleted after the work remain</b><p>Per Osaka University.</p></div>
<div class="rx-step crit"><div class="who">Third party</div><div class="no">3</div><b>Downloads the shared files</b><p>Osaka University's files on 09-26.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">4</div><b>Encrypts Osaka Metropolitan University's systems via the contractor's legitimate account</b><p>Down on 10-02.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-09**: In late September, NEC's contractor is attacked (per NEC).
- **2026-09-26**: A third party downloads files containing Osaka University's personal data (per Osaka University).
- **2026-10-02**: Early in the morning, Osaka Metropolitan University's maintenance vendor sees servers stopping and contacts the university, which reports to the education ministry, police and others (OMU press materials).
- **2026-10-05**: Osaka Metropolitan University holds a press conference and contacts the Personal Information Protection Commission.
- **2026-10-09**: NEC tells Osaka University that files had been downloaded.
- **2026-10-20**: NEC discloses. The same day, NEC reports the cause of the outage to Osaka Metropolitan University.
- **2026-10-21**: Osaka University and Osaka Metropolitan University (5th update) disclose.

> The facts rest on the disclosures by NEC, Osaka University and Osaka Metropolitan University (all primary). The partner's involvement and how the files came to be shared appear only in Osaka University's disclosure; NEC's statement does not mention them. No disclosure says whether the partner and the attacked contractor are the same company. Osaka Metropolitan University says the roughly 130,000 academic-system records it said on October 5 may have leaked were on its own virtualisation platform and are separate from the information in NEC's cloud storage. The number of customers comes from press reports.

### After disclosure

- **NEC**: Is lending NEC-managed devices to the contractor among other measures, and will tighten contractor and personal-data management. It will report details of the leaked personal data to customers as they become clear.
- **Osaka University**: Will tell each affected person which fields leaked, and warns about phishing and spoofed email. It will press NEC to find the cause and carry out preventive measures.
- **Osaka Metropolitan University**: Will gather information with NEC and take the necessary steps.

## 4. Why it wasn't stopped

This case was not only about a contractor's credentials being stolen. Only NEC's own practice, as the university's contractor, decided who the university's data was shared with and when it was deleted, and nothing checked that against the university's contract.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof here means checking, before a file is placed, that "this party may receive it", and recording that. Detection means noticing after files are taken or encrypted.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Before sharing, check whether the party is allowed under the contract</div>
<div class="rx-zone gapz"><b>The gap</b><span>77,851 people's data<br>already taken</span></div>
<div class="rx-zone det"><b>Detection layer · found later</b>After the files are taken, NEC reports to the university</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Shared outside the contract</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Files not deleted</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Third party downloads</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Reported 13 days later</b></div>
</div>
</figure>

Detection worked, but only after the files were taken. The files could be placed in shared storage, yet no one checked whether the party could handle the university's data; because they could be placed, they were shared, and they stayed after the work ended. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [the Awa Bank test environment](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/) (customer data was left in an environment that should have been finished with).

## 5. How to counter this

**Let the data owner decide who entrusted data may be shared with and where it may be kept, and check before sharing.** Writing subcontracting approval into the contract does not control who actually touches the data. Each time a file is placed in shared storage, check whether the party is on the approved list, and refuse it if not. Delete when the work ends, and record the deletion.

### Industries and operations to watch

- **Industry · Government & public sector**: Universities, local governments and others that outsource system operations to IT vendors. From the outsourcing side, subcontracting beyond the vendor is invisible, and it is hard to know how many companies the data has reached.
- **Industry · Procurement & supply chain**: IT vendors that hand development and maintenance to partners. Each customer's data gathers in shared locations for the work.
- **Operation · Lookup & data access**: Contractors and partners receiving data and deleting it after the work. Sharing and deletion are decided only by the contractor's own practice.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Contractual approval of subcontracting | Ineffective | A partner not reported to the university was involved in the work (per Osaka University). |
| Rules to delete data after the work | Ineffective | Files that should have been deleted were kept (per Osaka University). |
| Managing contractor devices | Partial | NEC is lending its own managed devices to the contractor. That narrows entry via contractor devices, but does not change who files are shared with. |
| Intrusion detection | Partial | It notices after encryption or download. |

### What is needed

1. **Let the owner decide which companies may handle each dataset.** Keep a list, on the owner's side such as the university, of the contractors and subcontractors the contract allows. Do not rely on the contractor's own declaration.
2. **Check before placing data in a shared location.** Check whether the party is on the list, and refuse sharing if not. Give files an end-of-work date and delete them once it passes.
3. **Record who data was shared with and when it was deleted.** Keep it separately from the contractor's report, in a form that can later be shown to a third party: in other words, as proof.

### Checklist

Three things to confirm in your organisation about outsourced system operations

- When a contractor subcontracts, are you notified in advance, and is there a step to approve it?
- Is your personal data sitting in the shared storage your contractor uses to exchange files? If so, have you asked who can see it?
- Can the contractor show you, by record, that data was deleted when the work ended?

Note: if the approved list is itself wrong, wrong sharing still goes through. And if an allowed contractor's legitimate account is taken over, data given to parties on the list can be read. How the credentials were stolen and how the files were downloaded have not been disclosed yet. If follow-up reports reveal them, this Brief will be revised.

## 6. Sources

- **NEC (Primary, company disclosure)**: Apology for customer system outages and data leakage caused by unauthorized access at a contractor (2026-10-20, Japanese) — <https://jpn.nec.com/news/info/20261020.html>
- **Osaka University (Primary, disclosure)**: Personal data leak at a contractor (2026-10-21, Japanese) — <https://www.osaka-u.ac.jp/ja/news/topics/2026/10/21004>
- **Osaka Metropolitan University (Primary, disclosure)**: Outage of the university's information infrastructure, 5th update: system outage and data leak from the cyberattack disclosed by the contractor (2026-10-21, Japanese) — Osaka Public University Corporation temporary notice site · <https://www.omu.moe/news/2026-10-21-1d69aecb.html>
- **Osaka Metropolitan University (Primary, press conference handout)**: Press conference handout (2026-10-06, Japanese) — conference held 10-05 · <https://www.omu.moe/news-files/2026-10-06-7fb5a624/press-conference-materials_20261005.pdf>
- **Nikkei (Press)**: NEC contractor hit by cyberattack, three customers' data leaked (2026-10-20, Japanese) — <https://www.nikkei.com/article/DGXZQOUC2081V0Q6A021C2000000/>
- **@IT (Press)**: Osaka Metropolitan University ransomware traced to an attack on NEC's contractor; legitimate account stolen (2026-10-22, Japanese) — <https://atmarkit.itmedia.co.jp/ait/articles/2610/22/news019.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
