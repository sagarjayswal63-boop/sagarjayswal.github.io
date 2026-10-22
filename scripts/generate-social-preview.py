"""Capture a compact LinkedIn card from the real exported hero, using its fonts and portrait.
Run npm run build first. Requires Python Playwright and Chromium.
Only the capture viewport receives the overrides; the website layout is unchanged.
"""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer
from threading import Thread
from shutil import which
from playwright.sync_api import sync_playwright
from serve import RangeRequestHandler

root = Path(__file__).resolve().parents[1]
class Quiet(RangeRequestHandler):
    def log_message(self, *args): pass
    def translate_path(self, path):
        return super().translate_path(path.removeprefix('/sagarjayswal.github.io'))
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(root / 'out')))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/sagarjayswal.github.io/'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=which('chromium') or which('google-chrome'), args=['--no-sandbox'])
        page = browser.new_page(viewport={'width':1200,'height':630}, device_scale_factor=1, reduced_motion='reduce')
        # Serve the export's files under the same repository prefix as production.
        page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
        page.goto(base, wait_until='networkidle')
        page.add_style_tag(content='''
            .site-header,.portfolio-intro,.hero-bottom,.skip-link,.global-motion { display:none!important; }
            .next-hero { height:630px;min-height:630px;padding:34px 54px; }
            .next-hero .hero-content { width:56%; }
            .next-hero h1 { font-size:66px;max-width:none; }
            .hero-eyebrow { margin:0 0 18px;font-size:10px; }
            .hero-identity { margin:22px 0 14px; }
            .hero-identity p { font-size:24px; }
            .hero-identity .mono { font-size:10px; }
            .hero-lead { max-width:485px;font-size:13px;line-height:1.7; }
            .hero-actions { margin-top:18px;gap:12px; }
            .button { min-height:42px;padding:12px 16px;font-size:9px; }
            .telemetry { margin:20px 0;gap:38px; }
            .telemetry strong { font-size:30px; }
            .hero-status { margin-top:0;font-size:9px; }
            .hero-watermark { top:6%;font-size:220px;opacity:.25; }
            .cine-vignette { background:linear-gradient(90deg,#030303 0%,rgba(3,3,3,.85) 28%,rgba(3,3,3,.25) 56%,transparent 78%),radial-gradient(ellipse at 68% 42%,transparent 35%,rgba(0,0,0,.65) 100%); }
            .cine-grain,.cine-scan { opacity:.02; }
        ''')
        page.evaluate('document.fonts.ready')
        assert page.locator('.hero-poster').evaluate('(v)=>v.complete && v.naturalWidth===1280')
        assert page.locator('.hero-content').evaluate('(e)=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=630}')
        target = root / 'public/assets/images/sagar-jayswal-social-preview-v3.jpg'
        page.screenshot(path=str(target), type='jpeg', quality=94)
        print(f'Created {target.relative_to(root)} ({target.stat().st_size:,} bytes, 1200×630)')
        browser.close()
finally:
    server.shutdown();server.server_close()
