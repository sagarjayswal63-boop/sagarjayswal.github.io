"""Local browser smoke tests. Requires Python Playwright and Chromium.

Run: python3 scripts/test-portfolio.py
External requests are blocked; the contact form is never submitted.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from shutil import which
from serve import RangeRequestHandler

class QuietHandler(RangeRequestHandler):
 def log_message(self, *args):
  pass

root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
from playwright.sync_api import sync_playwright
from urllib.parse import urlsplit
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=which('chromium') or which('google-chrome'),args=['--no-sandbox'])
 page=b.new_page(reduced_motion='reduce')
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
 page.goto(base+'/',wait_until='domcontentloaded')
 assert page.locator('.project-heading').count()==3
 # Validate every rendered local href/src, including every gallery image.
 links=page.evaluate('''() => [...document.querySelectorAll('[href],[src],[data-src]')].flatMap(e=>['href','src','data-src'].map(a=>e.getAttribute(a))).filter(Boolean)''')
 for link in set(links):
  u=urlsplit(link)
  if u.scheme or u.netloc: continue
  if link.startswith('#'):
   assert page.locator(link).count()==1,link
  else:
   r=page.request.get(base+'/'+link); assert r.ok,link
 print('PASS: rendered local links, fragments and all gallery images')
 for gallery in page.locator('.gallery').all():
  project=gallery.locator('xpath=ancestor::article')
  button=project.locator('.project-summary')
  if button.get_attribute('aria-expanded')=='false':button.click()
  tabs=gallery.get_by_role('tab')
  tabs.first.focus(); page.keyboard.press('End')
  assert tabs.last.get_attribute('aria-selected')=='true'
  assert gallery.get_by_role('tabpanel').get_attribute('aria-labelledby')==tabs.last.get_attribute('id')
  page.keyboard.press('ArrowRight'); assert tabs.first.get_attribute('aria-selected')=='true'
  page.keyboard.press('ArrowLeft'); assert tabs.last.get_attribute('aria-selected')=='true'
  page.keyboard.press('Home'); assert tabs.first.get_attribute('tabindex')=='0'
  assert gallery.locator('[role=tab][tabindex="0"]').count()==1
  gallery.locator('.gallery-open').click(); assert page.locator('dialog').evaluate('(e)=>e.open')
  page.keyboard.press('Escape'); assert not page.locator('dialog').evaluate('(e)=>e.open')
  button.click(); assert project.locator('.project-panel').is_hidden()
  assert button.locator('.project-action').text_content()=='View details'
  button.click()
 print('PASS: all 3 accordions, all galleries, keyboard wrap/Home/End, dialogs')
 for w,h in [(320,568),(375,667),(667,375),(768,1024),(980,800),(1024,768),(1440,900)]:
  page.set_viewport_size({'width':w,'height':h})
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(w,'document overflow')
  overflow=page.evaluate('''() => [...document.querySelectorAll('.project-summary *, .project-panel *, .contact-copy a, .field, .capability *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width && (r.right>innerWidth+1 || r.left < -1)}).map(e=>e.className)''')
  assert not overflow,(w,overflow)
  if w<=980:
   page.locator('.menu-toggle').click()
   assert page.locator('main').evaluate('(e)=>e.inert')
   assert page.locator('.mobile-menu nav').bounding_box()['y']>=90,(w,h,'menu clipped')
   assert page.locator('.mobile-menu').evaluate('(e)=>e.scrollWidth<=e.clientWidth'),(w,'menu overflow')
   links=page.locator('.mobile-menu a'); links.last.focus();page.keyboard.press('Tab')
   assert page.locator('.menu-close').evaluate('(e)=>e===document.activeElement')
   links.last.scroll_into_view_if_needed(); assert links.last.is_visible()
   page.keyboard.press('Escape'); assert not page.locator('main').evaluate('(e)=>e.inert')
   assert page.locator('.menu-toggle').evaluate('(e)=>e===document.activeElement')
  print(f'PASS: layout and navigation {w}x{h}')
 page.set_viewport_size({'width':375,'height':667});page.locator('.menu-toggle').click()
 page.set_viewport_size({'width':1200,'height':800});page.wait_for_timeout(100)
 assert page.locator('.menu-toggle').get_attribute('aria-expanded')=='false'
 assert not page.locator('main').evaluate('(e)=>e.inert')
 page.locator('.desktop-nav a[href="#work"]').click();page.wait_for_timeout(100)
 assert page.locator('#work').bounding_box()['y']>=78
 assert not errors,errors
 page.set_viewport_size({'width':375,'height':667})
 page.emulate_media(reduced_motion='no-preference')
 page.goto(base+'/', wait_until='domcontentloaded')
 page.wait_for_function("!document.querySelector('.hero-heading').classList.contains('reveal-pending')")
 page.locator('#work').scroll_into_view_if_needed()
 page.wait_for_function("!document.querySelector('.project').classList.contains('reveal-pending')")
 assert not errors, errors
 print('PASS: normal-motion reveal animations initialize and reveal content')
 context=b.new_context(java_script_enabled=False,viewport={'width':320,'height':568})
 nojs=context.new_page();nojs.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
 nojs.goto(base+'/',wait_until='domcontentloaded')
 assert nojs.locator('.hero-heading').evaluate('(e)=>getComputedStyle(e).opacity')=='1'
 assert nojs.locator('.menu-toggle').is_hidden()
 assert nojs.locator('.header-resume').is_visible()
 assert nojs.locator('noscript a[href="resume.html"]').is_visible()
 print('PASS: no-JavaScript content and résumé fallback; desktop resize; anchor offset; no runtime errors')
 b.close()
server.shutdown()
server.server_close()
