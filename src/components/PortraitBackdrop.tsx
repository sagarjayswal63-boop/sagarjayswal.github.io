'use client';
import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/site';

export default function PortraitBackdrop() {
  const visual = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const container = visual.current!;
    let raf = 0, x = 0, y = 0, tx = 0, ty = 0;
    const allowed = () => !reduced.matches && fine.matches && !pausedRef.current;
    const tick = () => {
      raf = 0;
      if (!allowed() || document.hidden) return;
      x += (tx - x) * .10; y += (ty - y) * .10;
      container.style.transform = `scale(1.025) translate3d(${x * -9}px,${y * -9}px,0)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > .001) raf = requestAnimationFrame(tick);
    };
    const configure = () => {
      cancelAnimationFrame(raf); raf = 0;
      setEnabled(!reduced.matches && fine.matches);
      document.documentElement.classList.toggle('motion-enabled', allowed());
      if (!allowed()) container.style.transform = '';
    };
    const pointer = (event: PointerEvent) => {
      if (!allowed() || event.pointerType === 'touch' || document.hidden) return;
      tx = Math.min(1, Math.max(0, event.clientX / innerWidth)) * 2 - 1;
      ty = Math.min(1, Math.max(0, event.clientY / innerHeight)) * 2 - 1;
      container.parentElement?.style.setProperty('--light-x', `${(tx + 1) * 50}%`);
      container.parentElement?.style.setProperty('--light-y', `${(ty + 1) * 50}%`);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const scroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty('--progress', String(max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0));
    };
    configure(); scroll();
    const abort = new AbortController(), events = { passive: true, signal: abort.signal };
    window.addEventListener('pointermove', pointer, events);
    window.addEventListener('scroll', scroll, events); window.addEventListener('resize', scroll, events);
    window.addEventListener('portfolio-motion', configure, events);
    document.addEventListener('visibilitychange', configure, events);
    [reduced, fine].forEach(query => query.addEventListener('change', configure, events));
    return () => { abort.abort(); cancelAnimationFrame(raf); document.documentElement.classList.remove('motion-enabled'); };
  }, []);
  const toggle = () => {
    pausedRef.current = !pausedRef.current; setPaused(pausedRef.current);
    window.dispatchEvent(new CustomEvent('portfolio-motion', { detail: !pausedRef.current }));
  };
  return <>
    <div className="cinematic-background portrait-background" aria-hidden="true">
      <div className="cine-media" ref={visual}><img className="hero-poster" src={asset('assets/images/portrait-poster.jpg')} width={1280} height={720} alt="" fetchPriority="high" /></div>
      <div className="cine-vignette" /><div className="cine-glow" /><div className="cine-grain" /><div className="cine-scan" />
    </div>
    <div className="scroll-progress" aria-hidden="true" />
    {enabled && <button id="motion-toggle" className="global-motion" type="button" aria-pressed={paused} onClick={toggle}>{paused ? 'Enable motion' : 'Pause motion'}</button>}
  </>;
}
