"""Validate the production Next.js static export under its GitHub Pages subpath.
Run npm run build, then python3 scripts/test-next.py. External calls are blocked.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
from functools import partial
from http.server import ThreadingHTTPServer
from threading import Thread
from shutil import which
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
from serve import RangeRequestHandler


class QuietHandler(RangeRequestHandler):
    def log_message(self, *args):
        pass


root = Path(__file__).resolve().parents[1]
assert (root / 'out/index.html').exists(), 'Run npm run build first'
with TemporaryDirectory(prefix='portfolio-next-') as temporary:
    Path(temporary, root.name).symlink_to(root / 'out', target_is_directory=True)
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=temporary))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/{root.name}/'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=which('chromium') or which('google-chrome'), args=['--no-sandbox'])
            context = browser.new_context(viewport={'width': 1440, 'height': 1000}, permissions=['clipboard-read', 'clipboard-write'])
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_function("document.querySelector('video').readyState >= 2")
            assert page.locator('video').get_attribute('preload') == 'auto'
            assert page.locator('video').evaluate('(v)=>v.paused && !v.autoplay && !v.loop && v.duration === 8')
            # Observe actual decoded pixels and currentTime samples, not only targets.
            page.evaluate("""() => {
                window.scrubSamples = [];
                const v = document.querySelector('video');
                const sample = () => { window.scrubSamples.push(v.currentTime); if (window.scrubSamples.length < 120) requestAnimationFrame(sample); };
                requestAnimationFrame(sample);
                window.videoPixels = () => { const c = document.createElement('canvas'); c.width = 72; c.height = 128; c.getContext('2d').drawImage(v,0,0,72,128); return c.toDataURL(); };
                window.firstPixels = window.videoPixels();
            }""")
            page.mouse.move(1296, 250)
            page.wait_for_function("document.querySelector('video').currentTime>6", timeout=10000)
            page.wait_for_function("!document.querySelector('video').seeking && window.videoPixels() !== window.firstPixels")
            assert page.evaluate('new Set(window.scrubSamples.map(t=>t.toFixed(3))).size > 4'), 'No intermediate currentTime updates'
            page.mouse.move(144, 250)
            page.wait_for_function("document.querySelector('video').currentTime<1.1", timeout=10000)
            page.evaluate('window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.25)')
            page.wait_for_function("document.querySelector('video').cinematicState.mode==='scroll' && Math.abs(document.querySelector('video').currentTime-2)<.2", timeout=10000)
            page.locator('#motion-toggle').click()
            assert page.locator('video').evaluate('(v)=>v.paused && !v.cinematicState.scheduled')
            page.locator('#motion-toggle').click()
            print('PASS: paused video metadata, forward/reverse cursor control, document scroll target, pause/resume', flush=True)
            assert page.locator('.project').count() == 3
            for project in page.locator('.project').all():
                button = project.locator('.project-summary')
                if button.get_attribute('aria-expanded') == 'false':
                    button.click()
                tabs = project.get_by_role('tab')
                tabs.first.focus(); page.keyboard.press('End')
                assert tabs.last.get_attribute('aria-selected') == 'true'
                page.keyboard.press('ArrowRight')
                assert tabs.first.get_attribute('aria-selected') == 'true'
                project.locator('.gallery-open').click()
                assert project.locator('dialog').evaluate('(d)=>d.open')
                page.keyboard.press('Escape')
                assert not project.locator('dialog').evaluate('(d)=>d.open')
                button.click(); assert project.locator('.project-panel').is_hidden()
            assert page.locator('#timeline .role').count() == 7
            for kind, count in [('education', 3), ('work', 4), ('all', 7)]:
                page.locator(f'[data-journey-filter="{kind}"]').click()
                assert page.locator('#timeline .role').count() == count
            page.locator('#copy-email').click()
            page.wait_for_function("document.getElementById('copy-status').textContent==='Email address copied.'")
            assert page.evaluate('navigator.clipboard.readText()') == 'sagarjayswal63@gmail.com'
            assert page.locator('form').get_attribute('action') == 'https://formsubmit.co/sagarjayswal63@gmail.com'
            assert page.locator('#certifications').count() == 0
            print('PASS: all project galleries/dialogs, seven milestones and filters, clipboard, form destination; no fictional certifications', flush=True)
            links = page.evaluate("[...document.querySelectorAll('[href],[src]')].flatMap(e=>[e.getAttribute('href'),e.getAttribute('src')]).filter(Boolean)")
            for link in set(links):
                if link.startswith('#'):
                    assert page.locator(link).count() == 1, link
                elif link.startswith('/' + root.name + '/'):
                    response = page.request.get(base.split('/' + root.name)[0] + link)
                    assert response.ok, link
            response = page.request.get(base + 'video/portfolio-background.mp4', headers={'Range': 'bytes=0-127'})
            assert response.status == 206 and len(response.body()) == 128
            pdf = page.request.get(base + 'assets/Sagar-Jayswal-Automation-Resume.pdf')
            assert pdf.body().startswith(b'%PDF')
            print('PASS: repository subpath assets, Next chunks, résumé PDF, video byte ranges', flush=True)
            for width, height in [(320,568), (390,844), (667,375), (768,1024), (980,800), (1024,768), (1440,1000)]:
                page.set_viewport_size({'width': width, 'height': height})
                page.wait_for_timeout(100)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, 'overflow')
                if width <= 980:
                    page.locator('.menu-toggle').click()
                    assert page.locator('#mobile-menu').evaluate('(d)=>d.open')
                    links = page.locator('#mobile-menu a')
                    links.last.focus(); page.keyboard.press('Tab')
                    assert page.locator('.menu-close').evaluate('(e)=>e===document.activeElement')
                    page.keyboard.press('Escape')
                    assert not page.locator('#mobile-menu').evaluate('(d)=>d.open')
                print(f'PASS: viewport {width}x{height} navigation and overflow', flush=True)
            page.set_viewport_size({'width':1440,'height':1000})
            page.evaluate('window.scrollTo(0,0)'); page.wait_for_timeout(600)
            page.screenshot(path='/tmp/next-portfolio-desktop.png')
            for name, settings, init in [
                ('touch', {'is_mobile': True, 'has_touch': True, 'viewport': {'width':390,'height':844}}, None),
                ('reduced motion', {'reduced_motion': 'reduce'}, None),
                ('data saver', {}, "Object.defineProperty(navigator,'connection',{value:{saveData:true}})"),
                ('constrained device', {}, "Object.defineProperty(navigator,'hardwareConcurrency',{value:4})"),
            ]:
                fallback_context = browser.new_context(**settings)
                if init: fallback_context.add_init_script(init)
                fallback = fallback_context.new_page(); requests = []
                fallback.on('request', lambda request: requests.append(request.url))
                fallback.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
                fallback.goto(base, wait_until='networkidle')
                if name in ('reduced motion', 'data saver'):
                    assert fallback.locator('video').evaluate('(v)=>!v.hasAttribute("src")')
                    assert not any('.mp4' in url for url in requests), name
                else:
                    fallback.wait_for_function("document.querySelector('video').readyState >= 2")
                    fallback.evaluate('window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.25)')
                    fallback.wait_for_function("Math.abs(document.querySelector('video').currentTime-2)<.2")
                    fallback.evaluate('window.scrollTo(0,0)')
                    fallback.wait_for_function("document.querySelector('video').currentTime<.1")
                    fallback.wait_for_function("!document.querySelector('video').cinematicState.scheduled")
                    if name == 'constrained device':
                        fallback.mouse.move(1100, 200)
                        fallback.wait_for_function("document.querySelector('video').currentTime>6")
                if name == 'touch':
                    fallback.locator('.menu-toggle').tap(); fallback.locator('#mobile-menu a[href="#work"]').tap()
                    fallback.locator('.project-summary').nth(1).tap(); assert fallback.locator('#panel-vision-upgrade').is_visible()
                    fallback.evaluate('window.scrollTo(0,0)'); fallback.screenshot(path='/tmp/next-portfolio-mobile.png')
                fallback_context.close()
                print('PASS:', name, 'fallback' if name in ('reduced motion', 'data saver') else 'forward/reverse scrubbing and idle RAF', flush=True)
            nojs = browser.new_context(java_script_enabled=False).new_page()
            nojs.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            nojs.goto(base, wait_until='domcontentloaded')
            assert nojs.locator('#about').inner_text().find('4+ years') >= 0
            assert nojs.locator('#timeline .role').count() == 7
            assert nojs.locator('#panel-vision-upgrade').is_visible()
            failed = browser.new_page()
            failed.route('**/*', lambda route: route.abort() if '.mp4' in route.request.url or not route.request.url.startswith(base) else route.continue_())
            failed.goto(base, wait_until='domcontentloaded')
            failed.wait_for_function("document.querySelector('video').error !== null")
            assert failed.locator('video').evaluate('(v)=>!v.cinematicState.enabled && !v.classList.contains("is-ready")')
            assert not errors, errors
            print('PASS: failed media request uses poster fallback', flush=True)
            print('PASS: SSR content and no-JavaScript project fallback; no hydration/runtime errors', flush=True)
            browser.close()
    finally:
        server.shutdown(); server.server_close()
