# GoPartner LOA design demo

A standalone React frontend for public design review. Uses a copy of the existing provider portal MUI theme, its current logo, 64px header, compact navigation rail, blue section headings, form controls and sticky actions. It does not import portal authentication, stores, HTTP clients, environment files or backend code.

## Try the journeys

- **Dental & tooth selection:** member lookup, three independent procedure lines, doctor-specific catalogue, tooth chart, quadrant selection and sample extracted-tooth history.
- **Fee schedule + PAC:** read-only scheduled amounts alongside an editable total line charge. Browse the catalogue for laterality and unresolved-price examples.
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

The earlier Sites URL is independent and is not removed by this workflow. This task changes hosting only; the documented prototype limitations, including incomplete deduction controls, remain unchanged.
