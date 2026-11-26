# GoPartner LOA design demo

A standalone React frontend for public design review. Uses a copy of the existing provider portal MUI theme, its current logo, 64px header, compact navigation rail, blue section headings, form controls and sticky actions. It does not import portal authentication, stores, HTTP clients, environment files or backend code.

## Try the journeys

- **Dental & tooth selection:** member lookup, three independent procedure lines, doctor-specific procedure dropdown, tooth chart, quadrant selection and sample extracted-tooth history.
- **Fee schedule + PAC:** read-only scheduled amounts alongside an editable total line charge. Use the procedure dropdown for laterality examples.
- **RVS doctors:** Main doctor before procedure selection, optional Assistant and Anesthetist, and review of exact line roles.
- **Demo scenarios:** switch fictional organisations or members. Medical organisation cannot enable Dental; Nico's sample plan has no Dental benefit.
- **Find member:** exact matching against four fictional card+DOB pairs, with loading, success and no-match states.
- **Review:** checks missing required entries, stale doctor quotes, duplicate sites, charges and supporting-document placeholders. Submission is a clearly labelled simulation.

All member/doctor/organisation records, procedure codes, prices and eligibility outcomes are invented. ICD labels are illustrative form choices. This is not an OHI emulator or verified clinical/benefit rule implementation. Dental site and ordinary-line doctor interactions illustrate the current design proposal. Production eligibility, all deductions, package rules, authorisation and write/recovery remain in the implementation plan.

Files are not uploaded or read; only selected filenames/sizes are kept in memory. The sample document is a placeholder. No user entries persist across reloads, and there are no API calls or analytics. A public hosting service will necessarily receive normal page/asset requests.

## Develop and verify

Use Node 24 (`.nvmrc`) with the committed lockfile. `npm ci`, then:

```sh
npm run dev
npm run lint
npm test
npm run build
npm run preview
npm run test:browser
```

The browser script uses installed Google Chrome, temporary browser context and a local server at `127.0.0.1:4178`. It rejects external requests and saves screenshots in ignored `test-results/`. Workspace development can reuse the portal's matching installed dependencies via an ignored `node_modules` symlink; it is not included in published source.

In CI, `LOA_DEMO_BROWSER_CHANNEL=bundled` selects Playwright Chromium; `LOA_DEMO_URL` can point at a repository subpath. The checks verify the same path that will be published.

`dist/` is a portable static build with relative asset URLs. `.openai/hosting.json` identifies its Sites deployment. The source project and deployed asset archive contain this demo only, not the surrounding portal repositories or earlier member research.

## GitHub Pages

Repository: [sunil-prajapati-private/loa-new-design](https://github.com/sunil-prajapati-private/loa-new-design).

Pages address after a successful deployment: **https://sunil-prajapati-private.github.io/loa-new-design/**.

The [Pages workflow](.github/workflows/pages.yml) runs on pushes to `main` and manual dispatch. It installs the lockfile, runs lint/domain tests, builds with the base path returned by Pages, checks browser journeys at that path, and deploys only the tested `dist/` artifact. Official Actions are pinned to verified commit SHAs. Node dependencies and backend services are not hosted on Pages.

Repository **Settings → Pages → Build and deployment → Source** must be **GitHub Actions**. No personal token or repository secret is required in the workflow; deployment uses the scoped Actions token. [GitHub's custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Vite's Pages deployment guide](https://v6.vite.dev/guide/static-deploy#github-pages).

To reproduce the repository-path build locally:

```sh
npm run build -- --base /loa-new-design/
npm run preview -- --base /loa-new-design/
# In another terminal:
LOA_DEMO_URL=http://127.0.0.1:4178/loa-new-design/ npm run test:browser
```

The earlier Sites URL is independent and is not removed by this workflow. This task changes hosting only; the documented prototype limitations, including incomplete package and inpatient flows, remain unchanged.


## Business review revision — 24 November 2026

The form now follows the existing portal's `InputField`, `SelectField`, `PageWrapper` and `SectionHeader` styling: labels above fields, 16px input text, 14px labels, #B3B9C4 input borders, 8px input corners, theme button corners, white sections and a full-width form. The theme font stack is retained; no external font service is added. The summary follows the form. New procedure and tooth interactions remain proposed extensions.

Content reviewed against the LOA implementation plan: mandatory card+DOB, diagnosis-first selection, organisation Dental access, both Dental categories, doctor per line, date window, PAC total charge, manual PHP deductions and simulated submission. Senior Citizen now requires age at availment of at least 60 plus explicit Filipino citizenship in the fictional member record and IP/ER/OP Lab. OP Lab PhilHealth requires Surgical class or that line's RVS procedure. Stale inapplicable deductions block review and can be deselected. No automatic discount or net-total formula is assumed.

The visible **Business review scope** panel identifies incomplete coverage: real procedure/diagnosis/benefit eligibility, ACU/PEME entitlement, consultation-clearance rules, inpatient room entitlement, chief-complaint dropdown and OHI delivery of supplemental roles. Requester details were restored in the 26 November revision below. The demo is suitable for reviewing interaction proposals, not signing off implementation completeness or OHI rule accuracy. Use only the supplied fictional records.


## Shared LOA and claim review

Use **LOA creation** / **Claim creation** at the top to switch pages; each draft is retained while switching. Both use white cards on the portal's light background, shared input styling and a fixed review action. Scenario tabs load fictional examples. **Review notes** holds review guidance and limitations so the forms stay focused on data entry. Clicking a scenario again reloads it.

Claim scenarios cover source LOA amounts, missing-charge entry, and consultation manual adjudication. The claim page inherits member, doctor, diagnosis, procedure and covered-amount details, requests service date and supporting documents (PDF/PNG/JPEG, 25 MB), and reviews line amounts before simulated submission. Files are never read or uploaded; only names are retained in memory. The demo does not implement invoice/payment flows or real eligibility/recovery services.

Amount policy is a **design proposal informed by the current implementation**: populated source amounts stay read-only; absent source amounts permit manual entry. Existing zero remains read-only. This is not a discovered PAC-only gate. Current Add Claim renders amounts read-only, its validator requires a claimed amount, and the LOA response mapper supplies it from allowedAmount. Thus absent amounts have no entry path today. The proposed input closes that gap; production rule approval and implementation remain separate. A zero-covered consultation remains blocked for manual adjudication.

Validation now includes 14 domain tests and browser journeys for both pages at 320, 375, 768 and 1440px, plus visual inspection of desktop and mobile captures.

The separate procedure browse dialog and pricing-conflict sample have been removed from the review UI. Select procedures directly from the searchable dropdown.


## LOA review changes — 26 November 2026

This revision updates the local design demo. It does not publish a new version or change the production portal/API. The attached requirements and review PDF were reference material; conflicting rules were resolved through the user's explicit answers.

- Requester name and department are mandatory. Optional mobile/email fields and requester information in review are restored. Production storage in remarks remains a separate implementation task.
- Selected doctor specialties appear for the request, procedure/Main, Assistant and Anesthetist, including saved lines and review. OP consultation again offers Initial, Follow up and Clearance; real clearance eligibility remains outside this sample.
- Add, Edit and Duplicate use a procedure popup with its own draft. Save validates and commits; Cancel or Escape discards edits. Header and actions remain visible while the popup content scrolls. Removal asks for confirmation.
- Quantity and amount appear above the tooth chart, followed by diagnosis checkboxes with codes, descriptions and ranks. All diagnoses default onto a new procedure. Deselecting one affects that line only; at least one must remain. Adding a diagnosis later applies it to all lines without restoring earlier exclusions. Saved cards and review show each line's applied diagnoses.
- The section navigation sticks below the portal header. It scrolls horizontally on narrow screens without widening the page.
- **Confirmed by the user:** PhilHealth is available on every Dental, OP Lab, IP and ER line, replacing the earlier Dental exclusion and OP Lab Surgical/RVS gate. Amount entry remains manual. Senior Citizen eligibility is unchanged.
- **Current rule:** repeat procedures are allowed for different teeth/sites, but a tooth may appear only once in the request across all procedures and doctors. Duplicate procedure + site checks remain for quadrant and site-free lines.
- The date choices retain Today and remove Tomorrow. Summary labels are “Total agreed CPT amount” and “Estimated Additional Charges”. PAC lines require remarks before review.

Remaining review points are not silently resolved by this revision: final business approval of the age-12 tooth-chart assumption, fourth-and-later diagnosis ranking, OHI tooth-history synchronization, room-specific CPT rates, body-part catalogues, related Surgical supply codes, ECU/package eligibility and dental chief-complaint options. These need a further design/data pass. Existing diagnosis-ranking and tooth-chart examples remain illustrative.

Validation: domain tests, production build, repository lint and browser journeys covering popup save/cancel, independent diagnoses, requester validation/review, specialties, PhilHealth, duplicate sites, PAC remarks, RVS roles and the existing claims flow. Browser layout checks use 320, 375, 768 and 1440 pixel widths.

## Compact procedures and itemized summary — follow-up

Saved procedure cards now use less spacing and compact diagnosis tags; the complete diagnosis descriptions remain available through the tags and the request summary. The summary includes agreed CPT amounts, estimated additional charges, all four PHP deduction categories, total deductions, and an expandable procedure breakdown with quantity, doctor/specialty, RVS roles, site, modifier and applied diagnoses. The review popup uses the same amount summary. Missing charges/deduction amounts and stale quotes display as pending instead of silently reducing the totals.

Confirmed follow-up decisions are implemented:

1. **Total covered amount = total agreed CPT amount − total deductions.** PAC charges remain separate. The summary displays pending when required amounts are incomplete; it does not silently clamp a negative result. An excess-deduction warning asks the reviewer to check entered amounts.
2. **Senior Citizen is available automatically from age 60 at availment for all LOA types, based only on age.** This supersedes the previous citizenship and LOA-type restrictions in this demo. The checkbox is visible but disabled below age 60; for an eligible member it becomes available without automatically selecting it or calculating a percentage. The PHP amount remains manual. Retained ineligible deductions must be removed before saving/review.
3. **Permanent / Temporary charts are selected automatically by member age.** The latest requested demo assumption is temporary teeth below age 12 and permanent teeth from age 12, measured at availment. Permanent charts show 32 teeth; temporary charts show 20. Both retain four quadrants. Add and Edit share the same picker. Member/date changes recalculate the chart and clear incompatible tooth selections. This replaces the earlier manual selector; the cutoff is an assumption pending business confirmation, and mixed dentition is not modelled.

| Review point | Demo behavior |
| --- | --- |
| 7 — permanent and temporary dental charts | **Assumed cutoff: age 12 at availment.** Below 12 uses temporary teeth; 12+ uses permanent teeth. Automatic selection is shared by Add and Edit. Business confirmation is still required for this simplified demo rule. |
| 9 — prevent repeated tooth selection | A tooth cannot be reused by another procedure in the same request, regardless of procedure code or doctor. Used teeth are visibly disabled; saving and request review also enforce the rule. Editing excludes the current line from reservations, and removing a line frees its tooth. |
| 10 — Senior Citizen and PhilHealth deductions | Senior Citizen control enables at 60+ for every LOA type. PhilHealth remains available on Dental, OP Lab, IP and ER lines. PHP amounts and category totals appear below covered amounts in the summary. |
| 23 / 24 — compact fields and selected procedures | Compact saved cards, with quantity, price and applied diagnoses visible; full procedure information and deduction amounts remain in the expandable summary. Popup editing is retained. |
| 18 / 19 — amount labels | Total agreed CPT amount and Estimated Additional Charges are retained, with Total covered amount added using the confirmed formula. |

Validation includes 24 domain tests and desktop/mobile browser journeys for totals, deduction breakdowns, age eligibility, age-based charts in Add/Edit, save/cancel, unique teeth across different procedures, RVS roles, popup edits and the existing claims flow. Widths checked: 320, 375, 768 and 1440 pixels. This revision is prepared for the existing GitHub Pages deployment workflow.

## Compact bottom summary

The request summary stays at the bottom of the form. Agreed CPT, additional charges and covered amount share a compact row; PHP deductions remain visible underneath. Request/member context and the full procedure table now expand through **Request & procedure details**, while the readiness status and demo note share a small footer. On phones, totals become short label/value rows and deductions use two columns. The review dialog shares the compact amount display. Amount calculations and eligibility rules are unchanged.


## Automatic chart and unique teeth

Review points 7 and 9 now reflect the latest design request. The 12-year threshold is an explicit demo assumption, not a confirmed clinical/business rule. Use fictional sample member **Maya Rivera** to try temporary teeth; Alina and Daniel demonstrate permanent teeth. The chart follows age at availment in both Add and Edit. A changed member/date clears a tooth that does not belong to the resulting chart, and the line must be completed again. Each tooth can be selected by only one procedure in a request, including when the doctor or procedure code differs. Quadrant selection retains the existing procedure-and-site duplicate rule.
