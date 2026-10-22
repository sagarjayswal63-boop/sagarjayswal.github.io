# Sagar Jayswal — Cinematic portfolio

Next.js **14.2.35** (App Router), TypeScript, React 18, Tailwind CSS, and
`@studio-freight/lenis`. The site exports static HTML for GitHub Pages at:

https://sagarjayswal63-boop.github.io/sagarjayswal.github.io/

## Development

Use Node 22 (CI) or Node 24 (validated locally).

```sh
npm ci
npm run dev
```

The application uses the repository subpath `/sagarjayswal.github.io`, including
in development. Keep `src/lib/site.ts` and `next.config.mjs` consistent if the
repository path changes. Development binds to loopback by default.

```sh
npm test
npm run typecheck
npm run build
python3 scripts/test-next.py
```

The browser test requires Python Playwright and Chromium. It serves `out/`
under the real repository subpath with HTTP byte-range support. To manually
serve the export from the repository root, run `npm run serve`. Its server
redirects the root to the repository subpath and supports MP4 byte ranges.
Next's dev server handles that prefix automatically.

## Architecture

- `src/app/layout.tsx`: SEO, social metadata, JSON-LD, self-hosted font preload,
  and the original Google Analytics measurement ID.
- `src/app/page.tsx`: server-rendered section composition.
- `src/app/globals.css`: Tailwind layers, design tokens, cinematic overlays,
  responsive layout, reduced-motion fallbacks, and native dialog styling.
- `src/components/CinematicVideo.tsx`: one cursor/scroll target and seek loop.
- `src/components/Navbar.tsx`: active pill and accessible native mobile dialog.
- `src/components/LenisProvider.tsx`: inertial desktop scrolling and lifecycle.
- `src/components/CustomCursor.tsx`: LERP ring/dot and magnetic targets.
- `src/components/ScrollReveal.tsx`: progressive scroll reveals with cleanup.
- `src/components/sections/`: Hero, About, Projects, Skills, Experience,
  Certifications, and Contact.
- `src/lib/portfolio.json`: existing real projects, experience, education, skills,
  and detailed résumé responsibilities.
- `src/lib/certifications.ts`: certification schema and cylinder math.
- `public/`: real project images, font licenses, résumé, poster and video.

The root `index.html`, `_next/`, `video/` and public assets are the **compiled
Next.js snapshot** used by the existing main-branch Pages publisher. Do not edit
the compiled HTML/chunks. Edit `src/` and `public/`, run `npm run publish:prepare`,
and commit the source plus generated snapshot. `.static-export-source.sha256`
lets CI detect a stale snapshot. The pre-migration static implementation is
recoverable on `backup/pre-next-migration`; unrelated original `assets/` and
older regression scripts remain for reference. No project or résumé was removed.

## Identity and evidence

The résumé is `public/assets/Sagar-Jayswal-Automation-Resume.pdf`, unchanged from
the original. Bio, telephone, email, location, employers, dates, detailed job
responsibilities, education and engineering skills come from that résumé and
the existing site. The three projects and all original project fields are
preserved. The hero shows the requested “BUILDING IDEAS / INTO EXPERIENCES.”
headline, followed by the actual **Automation & Controls Technician** title.
It does not falsely describe the owner as a full-stack/AI engineer.

The résumé supports 4+ years of experience; the portfolio contains 3 documented
projects. No CGPA, coding-platform statistics, unsupported project/demo URLs,
or certifications are invented. ISO standards describe manufacturing working
environments, not personal certifications. The original FormSubmit destination,
return URL, LinkedIn URL, SEO/social image and `G-KVPM9TKRYQ` are retained.

The full seven-page cinematic guide was reviewed in the preceding refinement.
The latest request explicitly changes the architecture to Next.js; its design
and interaction rules are adapted to the verified engineering information.

## Video

`public/video/portfolio-background.mp4` is derived from the latest uploaded
`799354785_1792634314244978.mp4`: 8 seconds, 720 × 1280, portrait. Its identity,
framing, aspect ratio and duration are preserved. The hero/poster uses the separately uploaded landscape portrait
`file_00000000fc7081f5a44406f8baa12a90.jpg`, with its original pixels preserved. H.264/CRF 20, all-intra encoding (`-g 1 -keyint_min 1`), audio removal and
fast-start metadata give a ~7.1 MiB seek-friendly file. Every frame is independently
decodable for forward/reverse scrubbing. The previous video remains in the
legacy assets for recovery; the app loads only this new video.

The video has `muted`, `playsInline`, `preload="auto"`, no autoplay and no loop.
Cursor scrubbing works on pointer devices, and native scroll scrubbing works
on desktop and touch devices, including four-core/low-memory hardware.
Reduced-motion and data-saver preferences use the poster without fetching the MP4. One RAF loop selects
the most recent cursor or document-scroll target, applies LERP 0.10, pauses
and seeks after metadata, and catches transient seek errors. There is no
`readyState >= 2` seek gate. One seek at a time and a 20–30Hz cap prevent redundant
decode work while retaining the requested .001-second threshold. It sleeps at
rest and in hidden tabs. A visible motion control stops cinematic movement.

The video container applies the requested scale, translate and 3D tilt. Dynamic
spotlight, grain, scanlines, radial vignette and the two-pixel progress bar use
CSS without per-frame blur filters. Native scrolling is preserved on mobile;
Lenis is disabled for reduced motion and constrained devices. No global
`overflow: hidden` is used. Native dialogs contain their own scrolling.

## Certifications

`Certifications.tsx` is a complete data-driven cylindrical gallery: responsive
480/380/275px radii, camera pull-back, backface culling, pointer capture,
recent-sample velocity, 0.945 inertia damping, 0.06°/frame auto-spin, shortest-path
centering, keyboard buttons, pagination, modal and motion preferences.

The supplied résumé has **no certification records**, so the public section
returns `null`. Populate the typed `certifications` array only with real issuer,
completion and competency information. A real document SHA-256 or verified date
is optional and displayed only when provided. Document fingerprints are not
represented as issuer verification. Test fixtures exist only in unit tests.

## Publishing

The repository retains its existing Pages source: **main, root directory**.
The initial workflow could build successfully but could not change the Pages
setting; a later CI install stalled. Publication therefore uses a tested,
checked-in static export instead of requiring administrative credentials.

Before pushing an application update:

```sh
npm run publish:prepare
python3 scripts/test-next.py
python3 scripts/sync-export.py --check
```

Commit the updated source and generated root snapshot together. The export sync
copies only known Next/public outputs and preserves unrelated original files.
The existing GitHub Pages branch workflow publishes those static files.
`.github/workflows/next-pages.yml` separately performs frozen installation,
unit tests, type checking, build and snapshot freshness validation, and saves a
build artifact. It has read-only repository permissions and bounded network
retries/timeouts. No Next runtime server, admin setting change or application
secret is required. Both source and generated files live in the existing repo.

## Validation and limitations

Six unit tests cover certification geometry/physics, real empty-data behavior,
centering, and truthful issuer dialogs. The browser suite validates actual
forward/reverse video seeking, document-scroll timing, pause/resume, all three
project galleries, keyboard dialogs, seven timeline milestones/filters,
clipboard, all media and Next chunk paths, seven viewport sizes, touch,
reduced-motion/data-saver/device fallbacks, and readable HTML without JavaScript.
It blocks external calls and never submits the contact form. Delivery/activation
and production analytics cannot be validated by submitting test messages.

The requested Next.js 14 line's latest available release is pinned. `npm audit`
still flags Next itself for upstream server-related advisories; PostCSS is
overridden to 8.5.31 to remove the separate transitive findings. This publication
contains **static files only**: no Next server, Server Actions, middleware,
rewrites, image optimization API, CSP nonces or untrusted script input. Do not
reuse this configuration as a publicly exposed Next server; move to a maintained
major before adding those capabilities. The dependency tree is not claimed to
be vulnerability-free. Lenis uses the exact requested package name, whose
maintainer has since renamed it to `lenis`.

