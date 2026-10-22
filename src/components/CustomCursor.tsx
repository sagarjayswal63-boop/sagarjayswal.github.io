'use client';
import { useEffect, useRef } from 'react';
export default function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fine = matchMedia('(hover: hover) and (pointer: fine)'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let x = -100, y = -100, tx = x, ty = y, raf = 0, allowed = true;
    let magnetic: HTMLElement | null = null;
    const resetMagnetic = () => { magnetic?.style.removeProperty('translate'); magnetic = null; };
    const tick = () => {
      raf = 0; x += (tx - x) * .18; y += (ty - y) * .18;
      if (ring.current) ring.current.style.translate = `${x}px ${y}px`;
      if (Math.abs(x - tx) + Math.abs(y - ty) > .1) raf = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      const on = allowed && document.documentElement.classList.contains('motion-enabled') && fine.matches && !reduced.matches && innerWidth > 660;
      ring.current?.classList.toggle('cursor-visible', on); dot.current?.classList.toggle('cursor-visible', on);
      if (!on) { resetMagnetic(); return; }
      tx = event.clientX; ty = event.clientY;
      if (dot.current) dot.current.style.translate = `${tx}px ${ty}px`;
      const next = (event.target as Element).closest<HTMLElement>('[data-magnetic]');
      if (next !== magnetic) { resetMagnetic(); magnetic = next; }
      ring.current?.classList.toggle('cursor-expanded', Boolean(next));
      if (magnetic) { const rect = magnetic.getBoundingClientRect(); magnetic.style.translate = `${((tx - rect.left) / rect.width - .5) * 6}px ${((ty - rect.top) / rect.height - .5) * 6}px`; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const hide = () => { ring.current?.classList.remove('cursor-visible'); dot.current?.classList.remove('cursor-visible'); cancelAnimationFrame(raf); raf = 0; resetMagnetic(); };
    const motion = (event: Event) => { allowed = (event as CustomEvent<boolean>).detail; if (!allowed) hide(); };
    window.addEventListener('pointermove', move, { passive: true }); document.documentElement.addEventListener('pointerleave', hide);
    window.addEventListener('portfolio-motion', motion); reduced.addEventListener('change', hide); fine.addEventListener('change', hide);
    return () => { hide(); window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', hide); window.removeEventListener('portfolio-motion', motion); reduced.removeEventListener('change', hide); fine.removeEventListener('change', hide); };
  }, []);
  return <><div ref={ring} className="custom-cursor-ring" aria-hidden="true" /><div ref={dot} className="custom-cursor-dot" aria-hidden="true" /></>;
}
