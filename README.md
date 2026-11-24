# GoPartner LOA design demo

A standalone React frontend for public design review. Uses a copy of the existing provider portal MUI theme, its current logo, 64px header, compact navigation rail, blue section headings, form controls and sticky actions. It does not import portal authentication, stores, HTTP clients, environment files or backend code.

## Try the journeys

- **Dental & tooth selection:** member lookup, three independent procedure lines, doctor-specific procedure dropdown, tooth chart, quadrant selection and sample extracted-tooth history.
- **Fee schedule + PAC:** read-only scheduled amounts alongside an editable total line charge. Use the procedure dropdown for laterality examples.
- **RVS doctors:** Main doctor before procedure selection, optional Assistant and Anesthetist, and review of exact line roles.
- **Demo scenarios:** switch fictional organisations or members. Medical organisation cannot enable Dental; Nico's sample plan has no Dental benefit.
- **Find member:** exact matching against three fictional card+DOB pairs, with loading, success and no-match states.
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

The visible **Business review scope** panel identifies incomplete coverage: real procedure/diagnosis/benefit eligibility, ACU/PEME entitlement, consultation-clearance rules, inpatient room entitlement, chief-complaint dropdown and OHI delivery of supplemental roles. Requester details remain deferred. The demo is suitable for reviewing interaction proposals, not signing off implementation completeness or OHI rule accuracy. Use only the supplied fictional records.


## Shared LOA and claim review

Use **LOA creation** / **Claim creation** at the top to switch pages; each draft is retained while switching. Both use white cards on the portal's light background, shared input styling and a fixed review action. Scenario tabs load fictional examples. **Review notes** holds review guidance and limitations so the forms stay focused on data entry. Clicking a scenario again reloads it.

Claim scenarios cover source LOA amounts, missing-charge entry, and consultation manual adjudication. The claim page inherits member, doctor, diagnosis, procedure and covered-amount details, requests service date and supporting documents (PDF/PNG/JPEG, 25 MB), and reviews line amounts before simulated submission. Files are never read or uploaded; only names are retained in memory. The demo does not implement invoice/payment flows or real eligibility/recovery services.

Amount policy is a **design proposal informed by the current implementation**: populated source amounts stay read-only; absent source amounts permit manual entry. Existing zero remains read-only. This is not a discovered PAC-only gate. Current Add Claim renders amounts read-only, its validator requires a claimed amount, and the LOA response mapper supplies it from allowedAmount. Thus absent amounts have no entry path today. The proposed input closes that gap; production rule approval and implementation remain separate. A zero-covered consultation remains blocked for manual adjudication.

Validation now includes 14 domain tests and browser journeys for both pages at 320, 375, 768 and 1440px, plus visual inspection of desktop and mobile captures.

The separate procedure browse dialog and pricing-conflict sample have been removed from the review UI. Select procedures directly from the searchable dropdown.
