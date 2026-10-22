"""Guide-specific timeline, navigation, and clipboard regression checks.
Run with Python Playwright and Chromium; external requests are blocked.
"""
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from shutil import which
from threading import Thread
from playwright.sync_api import sync_playwright
from serve import RangeRequestHandler


class QuietHandler(RangeRequestHandler):
    def log_message(self, *args):
        pass


root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=which('chromium') or which('google-chrome'), args=['--no-sandbox'])
        context = browser.new_context(reduced_motion='reduce', viewport={'width': 1440, 'height': 900}, permissions=['clipboard-read', 'clipboard-write'])
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
        page.goto(base, wait_until='domcontentloaded')
        assert page.locator('#timeline .role').count() == 7
        assert page.evaluate('''() => {
          const cards=[...document.querySelectorAll('#timeline .role')];
          return PORTFOLIO_CONTENT.education.every(e=>cards.some(c=>c.dataset.kind==='education' && c.textContent.includes(e.credential) && c.textContent.includes(e.school) && c.textContent.includes(e.date))) &&
            PORTFOLIO_CONTENT.experience.every(e=>cards.some(c=>c.dataset.kind==='work' && c.textContent.includes(e.role) && c.textContent.includes(e.company) && c.textContent.includes(e.date) && c.textContent.includes(e.detail)));
        }''')
        assert page.locator('#timeline .role').first.get_attribute('data-kind') == 'work'
        assert page.locator('#timeline .role').nth(1).get_attribute('data-kind') == 'education'
        for kind, count in [('education', 3), ('work', 4), ('all', 7)]:
            control = page.locator(f'[data-journey-filter="{kind}"]')
            control.focus()
            page.keyboard.press('Enter')
            assert control.get_attribute('aria-pressed') == 'true'
            visible = page.locator('#timeline .role:not([hidden])')
            assert visible.count() == count
            assert page.locator('#journey-status').text_content().startswith(str(count))
            for index, card in enumerate(visible.all()):
                assert ('role-right' in card.get_attribute('class')) == (index % 2 == 1)
            assert page.locator('#journey-filters [aria-pressed="true"]').count() == 1
        print('PASS: all original work and education milestones; keyboard filters; alternating visible cards')
        for section in ['work', 'experience', 'capabilities', 'contact']:
            page.locator('#' + section).evaluate('(e)=>e.scrollIntoView({block:"start",behavior:"instant"})')
            page.wait_for_function('(s)=>document.querySelector(`.desktop-nav a[href="#${s}"]`).getAttribute("aria-current")==="location"', arg=section)
            assert page.locator('.desktop-nav [aria-current]').count() == 1
            assert page.locator('.desktop-nav').evaluate('(e)=>parseFloat(e.style.getPropertyValue("--pill-width")) > 0')
        page.locator('#copy-email').click()
        page.wait_for_function("document.getElementById('copy-status').textContent === 'Email address copied.'")
        assert page.locator('#copy-status').text_content() == 'Email address copied.'
        assert page.evaluate('navigator.clipboard.readText()') == 'sagarjayswal63@gmail.com'
        page.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('Permission denied'))},configurable:true})")
        page.locator('#copy-email').click()
        page.wait_for_function("document.getElementById('copy-status').textContent.includes('Use the email link above')")
        assert 'Use the email link above' in page.locator('#copy-status').text_content()
        print('PASS: active section/pill tracking; clipboard success and permission-denied fallback')
        mobile_context = browser.new_context(is_mobile=True, has_touch=True, reduced_motion='reduce', viewport={'width': 320, 'height': 568})
        mobile = mobile_context.new_page()
        mobile.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
        mobile.goto(base, wait_until='domcontentloaded')
        mobile.locator('[data-journey-filter="education"]').tap()
        assert mobile.locator('#timeline .role:not([hidden])').count() == 3
        assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert not errors, errors
        print('PASS: mobile touch filtering, no overflow or runtime errors')
        browser.close()
finally:
    server.shutdown()
    server.server_close()
