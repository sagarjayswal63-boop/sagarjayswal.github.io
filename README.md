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

On the original Windows development machine, the PDF can be regenerated with Microsoft Edge:

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
python3 scripts/serve.py --port 8000
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
/tmp/portfolio-tests/bin/python scripts/test-cinematic.py
```

The smoke test starts its own temporary local server. It checks all three
projects, local links and images, accordions, gallery keyboard controls and
dialogs, navigation and overflow at seven desktop/mobile sizes, fixed-header
anchor offsets, and the résumé fallback when JavaScript is disabled. It blocks
external browser requests and never submits the contact form.

## Cinematic design and media

The existing HTML/CSS/JavaScript architecture and GitHub Pages `main`-branch
publishing model are retained. The three original projects, project images,
employment dates, education, résumé PDF, contact destination, SEO metadata, and
Google Analytics measurement ID are preserved. Skills explicitly supplied in the
redesign brief extend the existing categories. Additional projects and
certifications are omitted because no supporting source details were available.

The supplied JPG is `assets/images/cinematic-poster.jpg`. The supplied 8-second,
1280 × 720 video is `assets/video/portfolio-background.mp4`. It was optimized from
the uploaded video with H.264, CRF 20, a six-frame keyframe interval, no audio,
and fast-start metadata. No identity, framing, aspect ratio, or duration edits
were made. The original upload remains outside the repository in the attachment
store; no replacement character or generated media was used.

Local range-aware Chromium seek measurements (12 alternating timestamps):

| Encoding | Size | Median seek | Maximum seek |
| --- | --- | --- | --- |
| Original upload | 1.9 MB | 173 ms | 344 ms |
| All-intra candidate | 6.8 MB | 18 ms | 23 ms |
| Selected six-frame GOP | 2.8 MB | 36 ms | 81 ms |

Sizes above are decimal MB, rounded; browser/hardware/network performance varies.
The selected file balances transfer size and seeking latency. To reproduce:

```sh
ffmpeg -i input.mp4 -an -c:v libx264 -g 6 -keyint_min 6 -sc_threshold 0 -crf 20 -preset veryfast -movflags +faststart portfolio-background.mp4
```

`assets/js/cinematic.js` owns one seek loop. The most recent cursor or scroll
input chooses the active mode; normalized progress is clamped to the video
range. Frame-rate-adjusted LERP smooths progress and parallax. The paused video
is sought at most once per 70 ms, with one seek in flight and a timestamp
threshold. The loop sleeps when settled, offscreen, or in a hidden tab. Optional
video frame callbacks are canceled during cleanup. The visible motion control
stops cinematic movement. Touch, small screens, reduced motion, data saver,
constrained devices, and failed video requests use the supplied still image.

Use `scripts/serve.py` for local media checks: the basic Python static server
lacks byte-range support and may clamp video seeking to zero. The custom server
supports byte ranges without adding runtime dependencies to the published site.
The cinematic browser test serves the repository under its project subpath and
checks actual forward/reverse seeking, cursor/scroll mode switching, pause,
asset paths, and fallbacks without downloading video on constrained devices.

Oswald, Space Grotesk, Syne, and JetBrains Mono are self-hosted WOFF2 Latin
variable fonts from Fontsource Variable 5.3.0. Package integrity hashes were
verified during download. Each font's license is retained in `assets/fonts/`.

### Validation and remaining limits

Run both Python smoke tests and the three JavaScript syntax checks (including
`node --check assets/js/cinematic.js`). HTML was checked with html-validate 10,
using its recommended rules with the stylistic `tel-non-breaking` rule disabled
to retain the existing résumé telephone formatting.

The seven-page design PDF named in the brief was not present among the supplied
attachments. The portrait JPG and written cinematic specification guided this
implementation. No claim of reading the missing guide is made.

The environment initially denied requests to the published Pages host and
GitHub API. Network additions were saved for `sagarjayswal63-boop.github.io` and
`api.github.com`; saving a draft alone does not apply that access. A Git push or
successful local test does not by itself confirm the published site's behavior.
Contact delivery/activation and production analytics are not exercised by the
tests. Keep the existing FormSubmit activation and Pages settings in place.
