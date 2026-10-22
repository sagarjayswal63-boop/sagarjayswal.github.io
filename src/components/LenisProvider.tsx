'use client';
import { useEffect, type ReactNode } from 'react';
import Lenis from '@studio-freight/lenis';

export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const mobile = matchMedia('(max-width: 660px)');
    let lenis: Lenis | null = null, raf = 0, paused = false;
    const tick = (time: number) => { lenis?.raf(time); if (lenis && !document.hidden) raf = requestAnimationFrame(tick); };
    const configure = () => {
      cancelAnimationFrame(raf); lenis?.destroy(); lenis = null;
      const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      const constrained = device.connection?.saveData || (device.deviceMemory && device.deviceMemory <= 4) || (device.hardwareConcurrency && device.hardwareConcurrency <= 4);
      if (!constrained && !paused && !reduced.matches && fine.matches && !mobile.matches && !document.hidden) {
        lenis = new Lenis({ duration: .9, smoothWheel: true, syncTouch: false });
        raf = requestAnimationFrame(tick);
      }
    };
    const motion = (event: Event) => { paused = !(event as CustomEvent<boolean>).detail; configure(); };
    const queries = [reduced, fine, mobile];
    queries.forEach(q => q.addEventListener('change', configure));
    document.addEventListener('visibilitychange', configure);
    window.addEventListener('portfolio-motion', motion);
    configure();
    return () => { cancelAnimationFrame(raf); lenis?.destroy(); queries.forEach(q => q.removeEventListener('change', configure)); document.removeEventListener('visibilitychange', configure); window.removeEventListener('portfolio-motion', motion); };
  }, []);
  return <>{children}</>;
}
