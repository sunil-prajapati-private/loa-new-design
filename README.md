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

Remaining review points are not silently resolved by this revision: final business approval of the age-12 tooth-chart assumption, fourth-and-later diagnosis ranking, OHI tooth-history synchronization, room-specific CPT rates, body-part catalogues, related Surgical supply codes, ECU/package eligibility and dental-specific chief-complaint options. These need a further design/data pass. Existing diagnosis-ranking and tooth-chart examples remain illustrative.

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


## Chief complaint and contact validation — 26 November 2026

Chief complaint is now a dropdown containing the 17 `CHIEF_COMPLAINT` code/description pairs used by the existing Provider Portal form. The portal's `ProcedureInfo.jsx` loads `/getChiefComplain`; the demo uses the reference values observed on 24 November 2026 in the workspace research snapshot. Only code/description pairs are included, with no live service dependency. The selected description appears in request details and final review. Existing demo requiredness is retained: required for consultation, inpatient and emergency; optional otherwise. No dental-specific choices have been invented.

Mobile and email remain optional, but supplied invalid values prevent review. Errors appear below each field on blur or review and clear as corrected. Mobile validation follows the portal's `src/utils/philippineMobileNumber.js`: `09` plus nine digits or `+639` plus nine digits, allowing spaces and hyphens. Email uses the pure validator from `src/modules/registration/emailValidation.js`, including the 50-character maximum and local/domain-format checks. These dependency-free copies and the complaint options live in `src/portalForm.js`.

Validation covers accepted/invalid contacts, optional blanks, email-length boundaries, complaint selection/clearing, required complaints, and description display in summary/review, alongside the existing browser journeys.


## Permanent / Temporary selector restored — 26 November 2026

Add and Edit now share a **Permanent teeth / Temporary teeth** selector. Age at availment still supplies the initial default (under 12 temporary, 12+ permanent; assumed threshold pending business confirmation). Users may choose either chart for an individual procedure. The selected chart and tooth persist after Save and reopening Edit; Cancel discards chart changes. Switching chart clears the site's current selection. A changed member resets manual chart choices to that member's age default. Date changes preserve a manual choice for the same member.

This supersedes the automatic-only picker described above. Review and compact cards show the saved chart; existing extracted-tooth and unique-tooth checks apply to both charts. A tooth still cannot be used on two procedures in the same request.


## Procedure room types — 26 November 2026

The **Room types** scenario restores per-procedure Room Type selection based on the existing portal's `ProcedureDiagnosisSelector.jsx`. Inpatient medical care offers Ward / Small Private; inpatient monitoring offers Small Private / Large Private. The third sample procedure has no room modifier and therefore no room selector. Both Add and Edit use the same half-width control, and saved choices appear in the compact cards, expanded summary and review.

The demo follows the existing filter: match a hospital room code or hierarchy name against the procedure modifier code/description. It preserves separate `providerRoomTypeCode` and hierarchy-valued `providerRoomType` fields, independent of laterality. Dental, OP Lab and PEME use fixed OP; Emergency uses fixed Emergency Room; consultation hides the room control. As in the existing UI, the editable field is optional. Changing procedure clears the previous room; switching LOA type replaces or clears incompatible room context.

Hospital room identities, procedure combinations and prices are fictional. Ward, Small Private and Large Private hierarchy names come from the workspace reference catalogue; the fixed LOA-type values come from the portal code. This demonstrates selection and retention, not actual room-specific fee calculation or member room-and-board entitlement.

## Final review audit and sample journeys — 26 November 2026

The **Review notes → 26-point review verification** table is the current status of the supplied 26 November review. Its source is [`src/reviewChecklist.js`](src/reviewChecklist.js). It supersedes older status paragraphs above; “Demo complete” refers to the browser prototype, not production/OHI/UAT completion.

- **Emergency LOA** retains three fictional ER-only procedures: assessment, observation and supplies (PAC). The scenario includes fixed Emergency Room on each line, a PhilHealth example, a chief complaint and PAC remarks. Shared medical procedures remain available for adding further lines. The ER diagnosis exclusions (`Z00.0`, `Z02.1`, `Z99.7`, `Z71.1`) follow the existing portal selector.
- **Initial consultation** demonstrates Z71.1 auto-population on an empty diagnosis list, including a new blank draft. The default is applied to new procedure lines. Existing clinical diagnoses and per-line exclusions are preserved. Users can remove/replace the default, matching the portal’s non-enforced Initial behavior. Leaving Initial removes only the auto-inserted diagnosis; a manually selected diagnosis remains. Consultation changes invalidate the old procedure, and the catalogue offers the matching Initial / Follow up / Clearance example. Actual clearance eligibility remains outside this demo.
- Diagnoses default to Primary, Secondary, then Other Diagnosys for the third and subsequent diagnoses. Users can change categories while retaining one Primary. Selected diagnoses are excluded from search.
- Selected site-free procedures are excluded from Add search; Edit retains its own selection. Dental procedures remain available for another tooth/quadrant, subject to duplicate-site and request-wide unique-tooth checks. This retains the user’s explicit exception to review point 8.
- The Today suffix is restricted to Dental, OP consultation, OP Lab and Inpatient. No Tomorrow suffix is used. The previously implemented sample three-day date window is unchanged.

**Confirmed final formula (points 24/26): Total LOA Amount = Total agreed CPT amount + Estimated Additional Charges − Total deductions.** This supersedes the earlier CPT-minus-deductions / PAC-separate total and the review’s formula without deductions. Both summaries share the same calculation; PHP deductions remain underneath. Incomplete CPT, PAC or deduction values show pending, and a negative total is flagged rather than clamped.

Unresolved items are OHI Internal Remarks/history integration (1/6), business confirmation of the age default (7), actual room-specific rates (12), body-part grouping (14), related Surgical CPT/supply mappings and UAT verification (15), and provider-rate loading (19). ECU remains out of scope (16). Dates in the review are reported targets, not verified delivery commitments.

Coverage: domain tests and browser journeys include blank-draft Z71.1 seeding, replacement, context changes, consultation-specific catalogue filtering, ER procedures/room/PhilHealth/PAC, selected-option filtering, four diagnosis ranks, and the 26-point checklist, alongside the existing Dental, room, contact, popup and claim journeys.

Quadrant follow-up: Permanent / Temporary selection now appears only for individual-tooth procedures. Add and Edit show four quadrant choices directly for quadrant procedures, with no dentition label or requirement in the picker, cards, summary or review. Tooth charts and age defaults are unchanged.

LOA summary follow-up: removed the entire **Request & procedure details** disclosure from the bottom summary. It now shows agreed CPT, estimated additional charges, Total LOA Amount, the calculation and the PHP deduction breakdown. Full clinical/request details remain in the procedure cards and final review dialog.

RVS repetition follow-up: the same RVS code remains available in Add Procedure and can be saved on three or more separate lines, including with the same doctor and modifier. Duplicate also creates an independent RVS line. No three-line maximum is imposed. Each line contributes its own quantity, amount and deductions to Total LOA Amount; the distinct Main/Assistant/Anesthetist rule still applies within each line. Non-RVS duplicate and Dental tooth/site rules are unchanged. This supersedes the earlier blanket site-free procedure exclusion.
