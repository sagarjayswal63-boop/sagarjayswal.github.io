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
            requests = []
            page.on('request', lambda request: requests.append(request.url))
            page.wait_for_selector('.portfolio-intro')
            assert page.locator('.intro-greetings span').count() == 4
            page.screenshot(path='/tmp/portfolio-intro.png')
            page.wait_for_selector('.intro-leaving', timeout=6000)
            page.wait_for_timeout(300)
            page.screenshot(path='/tmp/portfolio-curtain-reveal.png')
            page.wait_for_selector('.portfolio-intro', state='detached', timeout=6000)
            page.wait_for_function("getComputedStyle(document.querySelector('.hero-content')).opacity === '1'")
            assert page.locator('video').count() == 0
            assert page.locator('.hero-poster').evaluate('(v)=>v.complete && v.naturalWidth===1280')
            page.mouse.move(1296, 250)
            page.wait_for_function("document.querySelector('.cine-media').style.transform.includes('translate3d')")
            page.locator('#motion-toggle').click()
            assert page.locator('.cine-media').evaluate('(v)=>v.style.transform === ""')
            page.locator('#motion-toggle').click()
            print('PASS: greeting curtain completes, uploaded portrait, no video, parallax and pause/resume', flush=True)
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
            pdf = page.request.get(base + 'assets/Sagar-Jayswal-Automation-Resume.pdf')
            assert pdf.body().startswith(b'%PDF')
            print('PASS: repository subpath assets, Next chunks, résumé PDF, no video assets', flush=True)
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
                assert fallback.locator('video').count() == 0
                assert not any('.mp4' in url for url in requests), name
                if name == 'reduced motion':
                    assert fallback.locator('.portfolio-intro').count() == 0
                elif fallback.locator('.portfolio-intro').count():
                    fallback.locator('.intro-skip').click()
                fallback.wait_for_selector('.portfolio-intro', state='detached')
                assert fallback.locator('.hero-poster').evaluate('(v)=>v.complete && v.naturalWidth===1280')
                if name == 'touch':
                    fallback.locator('.menu-toggle').tap(); fallback.locator('#mobile-menu a[href="#work"]').tap()
                    fallback.locator('.project-summary').nth(1).tap(); assert fallback.locator('#panel-vision-upgrade').is_visible()
                    fallback.evaluate('window.scrollTo(0,0)'); fallback.screenshot(path='/tmp/next-portfolio-mobile.png')
                fallback_context.close()
                print('PASS:', name, 'portrait and accessible entrance without MP4 requests', flush=True)
            nojs = browser.new_context(java_script_enabled=False).new_page()
            nojs.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            nojs.goto(base, wait_until='domcontentloaded')
            assert nojs.locator('#about').inner_text().find('4+ years') >= 0
            assert nojs.locator('#timeline .role').count() == 7
            assert nojs.locator('#panel-vision-upgrade').is_visible()
            assert nojs.locator('.portfolio-intro').is_hidden()
            failedjs = context.new_page()
            failedjs.route('**/*', lambda route: route.abort() if route.request.url.split('?')[0].endswith('.js') or not route.request.url.startswith(base) else route.continue_())
            failedjs.goto(base, wait_until='domcontentloaded')
            failedjs.wait_for_selector('.portfolio-intro', state='hidden', timeout=6500)
            assert failedjs.locator('#hero-title').is_visible()
            print('PASS: failed JavaScript download cannot trap the visitor behind the curtain', flush=True)
            # Entrance must yield immediately to navigation and direct section links.
            for action in ['Escape', 'Tab', 'wheel', 'button']:
                entrance = context.new_page()
                entrance.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
                entrance.goto(base, wait_until='domcontentloaded')
                entrance.wait_for_selector('.intro-skip')
                if action in ['Escape', 'Tab']: entrance.keyboard.press(action)
                elif action == 'wheel': entrance.mouse.wheel(0,200)
                else: entrance.locator('.intro-skip').click()
                entrance.wait_for_selector('.portfolio-intro', state='detached', timeout=1000)
                entrance.close()
            deep = context.new_page()
            deep.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            deep.goto(base+'#work', wait_until='networkidle')
            assert deep.locator('.portfolio-intro').count() == 0
            assert deep.locator('video').count() == 0
            assert not any('.mp4' in url for url in requests)
            print('PASS: Escape/Tab/wheel/button skip, deep links and no-JavaScript entrance fallback', flush=True)
            assert not errors, errors
            print('PASS: SSR content and no-JavaScript project fallback; no hydration/runtime errors', flush=True)
            browser.close()
    finally:
        server.shutdown(); server.server_close()
