"""Cinematic video integration checks, served under the GitHub Pages subpath.
Requires Python Playwright and Chromium. No external calls or form submissions.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from shutil import which
from threading import Thread
from playwright.sync_api import sync_playwright
from serve import RangeRequestHandler


class QuietHandler(RangeRequestHandler):
    def log_message(self, *args):
        pass


root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root.parent)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/{root.name}/'

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=which('chromium') or which('google-chrome'), args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
        page.goto(base, wait_until='domcontentloaded')
        page.wait_for_function("document.querySelector('video').readyState >= 2")
        assert page.locator('video').evaluate('(v)=>v.paused && v.duration === 8')
        # Drive the actual engine forward, then backward; seeking stays paused.
        page.mouse.move(1296, 250)
        page.wait_for_function("Math.abs(document.querySelector('video').currentTime - document.querySelector('video').cinematicState.target) < .15 && document.querySelector('video').currentTime > 6", timeout=10000)
        page.mouse.move(144, 250)
        page.wait_for_function("document.querySelector('video').currentTime < 1.1", timeout=10000)
        assert page.locator('video').evaluate('(v)=>v.paused && v.cinematicState.mode === "cursor"')
        page.evaluate('window.scrollTo(0, 300)')
        page.wait_for_function("document.querySelector('video').cinematicState.mode === 'scroll'")
        page.wait_for_function("Math.abs(document.querySelector('video').currentTime - document.querySelector('video').cinematicState.target) < .15", timeout=10000)
        assert page.locator('video').evaluate('(v)=>v.currentTime >= 0 && v.currentTime < v.duration')
        page.locator('#motion-toggle').click()
        assert page.locator('video').evaluate('(v)=>v.paused && !v.cinematicState.scheduled && v.cinematicState.paused')
        frozen = page.locator('video').evaluate('(v)=>v.currentTime')
        page.mouse.move(1400, 250)
        page.wait_for_timeout(250)
        assert page.locator('video').evaluate('(v)=>v.currentTime') == frozen
        page.locator('#motion-toggle').click()
        assert page.locator('video').evaluate('(v)=>!v.cinematicState.paused')
        print('PASS: subpath video loading, forward/reverse cursor scrubbing, scroll mode, timestamp clamping, pause/resume')
        # All self-hosted typography and assets load under the project subpath.
        for path in root.joinpath('assets').rglob('*'):
            if path.is_file():
                response = page.request.get(base + path.relative_to(root).as_posix())
                assert response.ok, str(path)
        assert page.evaluate("document.fonts.check('500 24px Oswald')")
        print('PASS: all assets and self-hosted fonts under GitHub Pages subpath')
        for name, settings, init in [
            ('touch', {'is_mobile': True, 'has_touch': True, 'viewport': {'width': 390, 'height': 844}}, None),
            ('reduced motion', {'reduced_motion': 'reduce'}, None),
            ('data saver', {}, "Object.defineProperty(navigator,'connection',{value:{saveData:true}})"),
            ('low performance', {}, "Object.defineProperty(navigator,'hardwareConcurrency',{value:4})"),
        ]:
            context = browser.new_context(**settings)
            if init:
                context.add_init_script(init)
            fallback = context.new_page()
            requests = []
            fallback.on('request', lambda request: requests.append(request.url))
            fallback.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            fallback.goto(base, wait_until='domcontentloaded')
            assert fallback.locator('video').evaluate('(v)=>!v.hasAttribute("src") && !v.cinematicState.enabled')
            assert not any('.mp4' in url for url in requests), name
            assert fallback.locator('.hero-poster').evaluate('(i)=>i.complete && i.naturalWidth > 0')
            assert fallback.evaluate('document.documentElement.scrollWidth <= innerWidth'), name
            context.close()
            print(f'PASS: {name} uses image fallback without downloading video')
        failed = browser.new_page()
        failed.route('**/*', lambda route: route.abort() if '.mp4' in route.request.url or not route.request.url.startswith(base) else route.continue_())
        failed.goto(base, wait_until='domcontentloaded')
        failed.wait_for_function("document.querySelector('video').error !== null")
        assert failed.locator('video').evaluate('(v)=>!v.cinematicState.enabled && !v.classList.contains("is-ready")')
        assert failed.locator('.hero-poster').is_visible()
        assert not errors, errors
        print('PASS: video error falls back to portrait; no runtime errors')
        browser.close()
finally:
    server.shutdown()
    server.server_close()
