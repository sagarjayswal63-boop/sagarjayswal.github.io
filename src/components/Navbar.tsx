'use client';
import { useEffect, useRef, useState } from 'react';
import { resumePath, site } from '@/lib/site';
const links = [['#about', 'About'], ['#work', 'Work'], ['#experience', 'Journey'], ['#capabilities', 'Skills'], ['#contact', 'Contact']];
export default function Navbar() {
  const [open, setOpen] = useState(false), [active, setActive] = useState('');
  const nav = useRef<HTMLElement>(null), drawer = useRef<HTMLDialogElement>(null), toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => {
      let current = '';
      links.forEach(([hash]) => { if ((document.querySelector(hash)?.getBoundingClientRect().top ?? Infinity) <= Math.max(150, innerHeight * .3)) current = hash; });
      setActive(current);
      const selected = nav.current?.querySelector<HTMLAnchorElement>(`a[href="${current}"]`);
      if (selected && nav.current) { const rect = selected.getBoundingClientRect(); nav.current.style.setProperty('--pill-x', `${rect.left - nav.current.getBoundingClientRect().left - 10}px`); nav.current.style.setProperty('--pill-width', `${rect.width + 20}px`); }
    };
    const resize = () => { if (innerWidth > 980) drawer.current?.close(); update(); };
    window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', resize); document.fonts.ready.then(update); update();
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', resize); };
  }, []);
  const close = () => { drawer.current?.close(); setOpen(false); toggle.current?.focus(); };
  const show = () => { drawer.current?.showModal(); setOpen(true); };
  return <><header className="site-header scrolled">
    <a className="brand" href="#hero" aria-label={`${site.name}, back to top`}><span className="brand-mark">Sagar<span className="brand-dot">.</span></span></a>
    <nav ref={nav} className={`desktop-nav ${active ? 'has-active' : ''}`} aria-label="Primary navigation">{links.map(([hash, label]) => <a key={hash} href={hash} aria-current={active === hash ? 'location' : undefined}>{label}</a>)}</nav>
    <a className="header-resume" href={resumePath} download data-magnetic>Résumé ↓</a>
    <button ref={toggle} className="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded={open} onClick={show}>Menu</button>
  </header><dialog ref={drawer} id="mobile-menu" className="mobile-menu" data-lenis-prevent aria-label="Site navigation" onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const items = event.currentTarget.querySelectorAll<HTMLElement>('button,a[href]');
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }} onClose={() => { setOpen(false); toggle.current?.focus(); }}>
    <button className="menu-close" type="button" onClick={close}>Close</button><nav aria-label="Mobile navigation">{links.map(([hash, label], index) => <a key={hash} href={hash} aria-current={active === hash ? 'location' : undefined} onClick={close}><span>0{index + 1}</span>{label}</a>)}<a href={resumePath} download onClick={close}>Résumé ↓</a></nav>
  </dialog></>;
}
