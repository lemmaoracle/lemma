---
brief_no: 150
title: "北朝鮮IT労働者：国内の支援者から提供された身分証の画像でその支援者になりすまし、業務を受注していた(日米豪独7機関の合同文書・国内初のラップトップ・ファーム解体) — 身分証は本物でも、その持ち主と画面の向こうで働く人物を、業務を渡す前に結びつける層が無い"
title_en: "North Korean IT workers: they won contracts in Japan by posing as local enablers, using ID images the enablers supplied (joint advisory by seven agencies in Japan, the US, Australia and Germany; Japan's first laptop farm dismantled) — the ID was genuine, but nothing tied its holder to the person doing the work before the work was handed over"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth]
incident_date: 2026-09-18
published: 2026-09-24
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["141-idscan-net-drivers-license-dark-web-breach", "084-hong-kong-deepfake-video-call-fraud", "034-ekyc-liveness-bypass"]
status: published
version: "1.0"
og_lead_ja: "北朝鮮IT労働者が国内支援者の身分証で業務を受注、国内初のラップトップ・ファーム解体"
og_lead_en: "North Korean IT workers won contracts in Japan with ID images supplied by local enablers"
---

## 1. TL;DR

On September 18, 2026, Japan's National Police Agency and National Cybersecurity Office, with US, Australian and German agencies, published a joint advisory on the North Korean cyber group "WaterPlum" and North Korean IT workers. The IT workers posed as enablers living in Japan, using ID images those enablers supplied, to win contracts. Japan's first "laptop farm" was identified and dismantled, and one Japanese crypto exchange caught a suspicious applicant before hiring. **Detection worked. What didn't was a layer confirming, before work is handed over, that the ID's holder and the person doing the work are the same.**

## 2. What happened

- On September 18, 2026, Japan's National Police Agency (NPA) and National Cybersecurity Office (NCO) published a joint document with the US FBI, the US Department of Defense Cyber Crime Center (DC3), the Australian Signals Directorate's Australian Cyber Security Centre (ASD's ACSC), Germany's Federal Intelligence Service (BND), and Germany's Federal Office for the Protection of the Constitution (BfV).
- North Korean IT workers used ID images supplied by domestic enablers to impersonate them, obtain contracts, and receive payment. In some cases they took on work the enablers had contracted for. Enabler bank accounts received the payments, and the enablers then transferred the funds to the workers.
- For the first time in Japan, authorities identified, investigated, and dismantled a "laptop farm" — computers set up in an enabler's residence and remotely operated by North Korean IT workers. The workers transferred several hundred million yen abroad, including cryptocurrency.
- WaterPlum posed as headhunters — impersonating AI, cryptocurrency and NFT companies or recruiting services — and lured IT professionals into running malicious code under the pretext of interviews and coding tests. From around December 2025 to July 2026, at least 30,000 PCs in more than 100 countries were infected; funds or credentials were taken from over 7,000 cryptocurrency wallets, and at least 1.7 billion yen (about $10.71 million) in cryptocurrency was moved.
- The NPA and FBI assess that WaterPlum and some North Korean IT workers both operate under the 313 General Bureau of the Munitions Industry Department of the Workers' Party of Korea. Some WaterPlum actors themselves work as North Korean IT workers, doing web system design and development for client companies.
- WaterPlum's targets include ID images — driver's licenses and passports — stored on infected machines. The advisory states that stolen IDs can be used by North Korean IT workers to impersonate victims.
- WaterPlum actors and North Korean IT workers used the same IP addresses when accessing laptop farms, using crowdsourcing services, and applying to a Japanese crypto exchange.

The impersonated employment worked through the following chain:

1. A domestic enabler provides images of their own ID to a North Korean IT worker. (ID images WaterPlum steals from infected machines can serve the same purpose.)
2. Routing through the enabler's home PC or a VPS the enabler rents, the worker disguises their location and takes crowdsourced contracts in the enabler's name.
3. The commissioning party treats the worker as the enabler, based on the submitted ID image and the domestic connection.
4. Payment goes to the enabler's bank account, and the enabler forwards it to the worker.

## 3. Timeline — disclosure and response

- May 2025: An applicant believed to be a North Korean IT worker applied for an engineering role at Japanese crypto exchange bitFlyer with a resume impersonating someone else. The company interviewed him with that possibility in mind, recognized the signs, and did not hire him. No damage occurred.
- Around December 2025 – July 2026: WaterPlum malware infected at least 30,000 PCs across more than 100 countries and regions.
- 2026-07-31: The NPA, NCO, Ministry of Foreign Affairs, Ministry of Finance, and Ministry of Economy, Trade and Industry, with agencies of the US, South Korea and other allies, issued an alert to countries and companies regarding North Korean IT workers.
- Date not disclosed: Japan's first laptop farm was identified, investigated, and dismantled.
- 2026-09-18: The NPA and NCO published the joint document with five US, Australian, and German agencies.

> The primary source for this Brief is the joint document issued by seven agencies in Japan, the US, Australia and Germany. The location of the laptop farm, the date it was dismantled, the number of enablers involved, and the names of Japanese companies that commissioned work from North Korean IT workers have not been disclosed. "Several hundred million yen" is used as stated in the document. On ID images stolen by WaterPlum, the advisory describes a possibility ("can be used"); it does not state how many were actually used for employment impersonation.

The advisory's response and mitigations include:

- Businesses that commission work should consider that subcontractors or downstream partners may involve North Korean IT workers, and should clarify contractual clauses and prohibitions.
- Information and access given to contractors (source code, credentials, etc.) should be kept to the minimum necessary, and accounts and sessions should be revoked promptly once suspicion arises.
- Recruitment checks include matching access IP addresses with claimed residence, checking contact details, asking for detailed explanations of listed skills, verifying certification registration numbers, and asking personal questions about hometown or weather.
- Paying North Korean IT workers for commissioned work, or facilitating their revenue generation, may violate domestic law and sanctions against the DPRK. Separately, knowingly providing payment or ID images to North Korean actors could constitute a crime.
- IT professionals are advised to run untrusted code only in a sandbox and to open unfamiliar VS Code projects in Restricted Mode.

## 4. Why it wasn't stopped

The failure here is not that forged IDs went unnoticed, or that interviewers were careless. The IDs were genuine. **What was missing was a layer confirming, before work was handed over, that the holder of the submitted ID and the person doing the work were the same.**

Identity checks in crowdsourcing and contracting usually mean receiving an ID image and confirming that the document is authentic and matches the applicant's stated details. Here, every one of those checks passes: the document belongs to a real resident of Japan, and the connection comes from the enabler's home or a server the enabler rents. What was absent was the step that ties that document to the person typing on the other side of the screen. An ID image can be copied and handed over. Once handed over, it stops belonging to its holder and becomes an appearance anyone can present.

Detection worked. bitFlyer noticed an implausibly broad resume, English that didn't match the claimed background, and vague answers about listed skills, and did not hire the applicant. Police tracked down and dismantled the laptop farm. But most mitigations in the advisory are detection — looking for signals such as a mismatch between IP address and residence, or unnatural answers. Checks against a source of record, such as verifying certification numbers, are a small minority. WaterPlum actors used AI face-swapping software for only a few minutes of an interview, then disabled their video citing network issues. Checks that depend on signals pass once the signals are removed. What didn't work was the step before that: confirming the worker themselves before handing over work, internal information, and access.

The gap also comes back to the commissioning side as regulatory weight. The advisory states that commissioning and paying North Korean IT workers may violate domestic law and sanctions. A commissioning party has to be able to show whom it gave work to and whom it paid. [Brief 141](/critical/briefs/141-idscan-net-drivers-license-dark-web-breach/) covered the supply side of ID images, where driver's license scans handed over for verification ended up for sale. This case shows the receiving side, where the link between the person who submitted the image and the person who does the work was never checked. As in [Brief 084](/critical/briefs/084-hong-kong-deepfake-video-call-fraud/), where every participant on a video call was a real-time deepfake, confirming identity by video loses its basis once the video can be replaced.

> "North Korean IT workers use ID images supplied by domestic enablers for impersonation, to obtain contracts, and receive payment." — Joint advisory by seven agencies in Japan, the US, Australia and Germany

## 5. What proof would have changed

Remote hiring and contracting cannot be abandoned, and don't need to be. Where a proof step could be inserted is not in deciding whether to hire someone, but in confirming whether the party receiving work and access is presenting with the key of the person whose attributes were shown.

Lemma's proposed design for this gap:

- **Receive attribute proofs, not ID images.** Accept only the attributes a contract requires — work eligibility, residence, not being a sanctioned party — as proofs checkable against the issuer's record. The ID image itself never reaches the commissioning party.
- **Bind the proof to the worker's key.** Tie the attribute proof to a key held by the person presenting it. Unlike an image, it cannot be copied and passed along; lending one's name requires the explicit act of handing over the key itself.
- **Require presentation at each access, not just at contract.** Make presentation with the same key a condition at contract award and at each access to repositories and internal systems. Give proofs an expiry and scope, and revoke them as soon as suspicion arises.
- **Align the payee with the proof's subject.** Make payment conditional on the receiving account belonging to the person who proved the attributes, and keep a record showing whom the commissioning party paid.

What this does not do:

- It cannot prevent collusion in which the named holder hands over the device holding their key. A proof shows only that presentation was made with the holder's key.
- It does not replace interview judgment, access monitoring, EDR, or other detection mechanisms.
- It does not prevent malware infection by fake recruiters such as WaterPlum. Avoiding or sandboxing untrusted code remains necessary.

This is where it differs from after-the-fact detection. Detection looks for signs of impersonation in interview answers or connection mismatches, and passes when those signs are skillfully removed. A proof asks, regardless of signals, whether the presentation comes from the holder's own key before work and access are handed over.

This layer complements detection rather than replacing it. Detection finds signs of impersonation and shuts accounts down after discovery. This layer lets an organization confirm, before handing over work and access, that the worker is the holder of the proven attributes.

## 6. Sources

- **National Police Agency / National Cybersecurity Office (primary, government announcement)**: Public attribution on WaterPlum and North Korean IT workers by Japan, the US, Australia, and Germany (2026-09-18, in Japanese) — <https://www.npa.go.jp/bureau/cyber/koho/caution/caution20260918.html>
- **Seven agencies in Japan, the US, Australia and Germany (primary, joint document, English)**: "North Korean 'WaterPlum,' commonly referred to as 'Contagious Interview,' Cyber Actor Group Targeting IT Professionals; Activities of North Korean IT Workers in Japan, the United States and Europe" — <https://www.npa.go.jp/bureau/cyber/pdf/20260918_e.pdf>
- **Seven agencies in Japan, the US, Australia and Germany (primary, joint document, Japanese)** — <https://www.npa.go.jp/bureau/cyber/pdf/20260918_j.pdf>
- **NPA and others (primary, earlier alert)**: Alert to companies regarding North Korean IT workers (2026-07-31, in Japanese) — <https://www.npa.go.jp/bureau/security/northkorea_IT/NK_IT_202607.html>
- **The Register (independent reporting)**: "North Korea's fake job interviews infected 30,000 devices" (2026-09-18) — <https://www.theregister.com/security/2026/09/18/north-koreas-fake-job-interviews-infected-30000-devices/5297461>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving attributes, see [Pillar 04 — Regulatory Attribute Proof](/pillars/#attribute). On key-bound presentation, see [Seal](/seal/).

> As of this writing, the location of the laptop farm and the date it was dismantled, the number of enablers involved, and the names of Japanese companies that commissioned work from North Korean IT workers have not been disclosed. All figures in this Brief are as stated in the joint document by the seven agencies.
