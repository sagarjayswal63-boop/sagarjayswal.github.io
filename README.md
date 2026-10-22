# Sagar Jayswal — Portfolio

Static portfolio for an Automation & Controls Technician, designed for GitHub Pages.

## Edit portfolio content

Most project, experience, capability, and education content is stored in:

`assets/js/content.js`

Edit that file and commit the change. Layout and interactions are separated into:

- `assets/css/styles.css`
- `assets/js/main.js`

## Update the résumé

The printable browser version is `resume.html`. The downloadable PDF is:

`assets/Sagar-Jayswal-Automation-Resume.pdf`

On the original Windows development machine, the PDF can be regenerated with Microsoft Word:

```powershell
./scripts/export-resume.ps1
```

## Contact form

The contact form uses FormSubmit and sends to `sagarjayswal63@gmail.com`. FormSubmit may send a one-time activation email after the first submission. That activation email must be accepted before normal delivery begins.

## Analytics

Google Analytics 4 is enabled in `index.html` with measurement ID `G-KVPM9TKRYQ`. Traffic appears in the Google Analytics Realtime report shortly after the published site is visited; standard reports can take longer to populate. Visits to local files or unpublished changes are not meaningful production traffic.

## Social preview

LinkedIn and other social platforms use `assets/images/sagar-jayswal-social-preview.png` through the Open Graph and Twitter Card metadata in `index.html`. The image is 1200 × 630 pixels. Social platforms may continue showing a cached older image until their link-preview cache is refreshed.

## Publishing

GitHub Pages publishes the `main` branch of this repository.


## Local development and checks

No dependency installation or build step is needed to serve the site:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Run JavaScript syntax checks from the repository root:

```sh
node --check assets/js/content.js
node --check assets/js/main.js
```

For browser regression checks, install Python Playwright in a virtual environment
and use an installed Chromium/Chrome, or install Playwright's Chromium:

```sh
python3 -m venv /tmp/portfolio-tests
/tmp/portfolio-tests/bin/pip install playwright
/tmp/portfolio-tests/bin/python -m playwright install chromium
/tmp/portfolio-tests/bin/python scripts/test-portfolio.py
```

The smoke test starts its own temporary local server. It checks all three
projects, local links and images, accordions, gallery keyboard controls and
dialogs, navigation and overflow at seven desktop/mobile sizes, fixed-header
anchor offsets, and the résumé fallback when JavaScript is disabled. It blocks
external browser requests and never submits the contact form.

### Review notes

Project content and personal information are preserved in this review. Project
headings, explicit detail controls, and highlighted results improve scanning.
Small-screen wrapping, short-screen menu scrolling, gallery tab semantics, and
JavaScript-disabled visibility have been improved.

External URLs (the published site/social image, LinkedIn, Google Fonts,
Analytics, and FormSubmit) could not be verified from the review environment:
its network proxy returned 403 tunnel denials. These are access restrictions,
not confirmed broken links. Contact delivery and production analytics need a
separate check on the published site; the documented FormSubmit activation
requirement still applies.

For future project presentation improvements, consider adding approved,
measured before/after outcomes, each project's constraints and individual
contribution, and public demos or source links where sharing is permitted.
No metrics or project URLs have been invented. Dynamic project details still
require JavaScript; the résumé and contact links provide the fallback.
