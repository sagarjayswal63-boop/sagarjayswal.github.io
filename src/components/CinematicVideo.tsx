'use client';
import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/site';

type Connection = { saveData?: boolean };
type Device = Navigator & { deviceMemory?: number; connection?: Connection };
export default function CinematicVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => {
    const video = ref.current!, container = visual.current!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const device = navigator as Device;
    let active = false, failed = false, ready = false, duration = 0;
    let mode: 'cursor' | 'scroll' = 'scroll', cursor = 0, scroll = 0;
    let current = 0, x = 0, y = 0, tx = 0, ty = 0, raf = 0, last = 0, seeks = 0;
    // Limit decoding work on smaller devices without disabling scrubbing.
    const seekInterval = device.hardwareConcurrency <= 4 || (device.deviceMemory ?? 8) <= 4 ? 50 : 33;
    const abort = new AbortController();
    const events = { passive: true, signal: abort.signal };
    const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const cancel = () => { cancelAnimationFrame(raf); raf = 0; };
    const wake = () => { if (active && !pausedRef.current && !document.hidden && !raf) raf = requestAnimationFrame(tick); };
    function tick() {
      raf = 0;
      if (!active || pausedRef.current || document.hidden) return;
      const target = (mode === 'cursor' ? cursor : scroll) * duration;
      current += (target - current) * .10;
      x += (tx - x) * .10; y += (ty - y) * .10;
      if (fine.matches) container.style.transform = `scale(1.06) translate3d(${x * -15}px,${y * -15}px,0) rotateX(${y * -2}deg) rotateY(${x * 2}deg)`;
      // Metadata is sufficient. Never require readyState >= 2 to seek.
      // One in-flight seek and a 20–30Hz cap avoid queueing redundant decodes.
      const now = performance.now();
      if (ready && !video.seeking && now - last >= seekInterval && Math.abs(video.currentTime - current) > .001) {
        try { video.pause(); video.currentTime = clamp(current, 0, duration); seeks++; last = now; } catch { last = now; }
      }
      if (Math.abs(target - current) > .001 || Math.abs(tx - x) > .001 || Math.abs(ty - y) > .001 || (ready && (video.seeking || Math.abs(video.currentTime - target) > .001))) wake();
    }
    function configure() {
      active = !failed && !reduced.matches && !device.connection?.saveData;
      setEnabled(active);
      document.documentElement.classList.toggle('motion-enabled', active && !pausedRef.current);
      if (active && !video.hasAttribute('src')) { video.src = asset('video/portfolio-background.mp4'); video.load(); }
      if (!active || pausedRef.current) { cancel(); video.pause(); container.style.transform = ''; if (!active) video.classList.remove('is-ready'); }
      else {
        // Cached media may have fired metadata events before this effect mounted.
        metadata();
        if (video.readyState >= 2) onFrame();
        wake();
      }
    }
    const metadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const first = !ready; duration = Math.max(0, video.duration - 1 / 24); ready = true; video.pause();
      if (first) { current = clamp(video.currentTime, 0, duration); }
      wake();
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const next = max > 0 ? clamp(scrollY / max) : 0;
      // Resize/duplicate scroll events must not cancel the latest cursor input.
      if (next !== scroll) mode = 'scroll';
      scroll = next;
      document.documentElement.style.setProperty('--progress', String(scroll)); wake();
    };
    const onPointer = (event: PointerEvent) => {
      if (!active || pausedRef.current || event.pointerType === 'touch' || !fine.matches) return;
      cursor = clamp(event.clientX / innerWidth); tx = cursor * 2 - 1; ty = clamp(event.clientY / innerHeight) * 2 - 1; mode = 'cursor';
      container.parentElement?.style.setProperty('--light-x', `${cursor * 100}%`);
      container.parentElement?.style.setProperty('--light-y', `${(ty + 1) * 50}%`); wake();
    };
    const onFrame = () => { if (active) video.classList.add('is-ready'); wake(); };
    const error = () => { failed = true; configure(); };
    const onVisibility = () => { if (document.hidden) cancel(); else wake(); };
    const onMotion = () => configure();
    video.addEventListener('loadedmetadata', metadata, events); video.addEventListener('canplay', metadata, events);
    video.addEventListener('loadeddata', onFrame, events); video.addEventListener('seeked', onFrame, events); video.addEventListener('error', error, events);
    window.addEventListener('pointermove', onPointer, events); window.addEventListener('scroll', onScroll, events); window.addEventListener('resize', onScroll, events);
    document.addEventListener('visibilitychange', onVisibility, events); window.addEventListener('portfolio-motion', onMotion, events);
    [reduced, fine].forEach(q => q.addEventListener('change', configure, events));
    Object.defineProperty(video, 'cinematicState', { configurable: true, get: () => ({ mode, enabled: active, paused: pausedRef.current, target: (mode === 'cursor' ? cursor : scroll) * duration, seeks, scheduled: Boolean(raf) }) });
    configure(); onScroll();
    return () => { abort.abort(); cancel(); video.pause(); document.documentElement.classList.remove('motion-enabled'); delete (video as HTMLVideoElement & { cinematicState?: unknown }).cinematicState; };
  }, []);
  const toggle = () => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); window.dispatchEvent(new CustomEvent('portfolio-motion', { detail: !pausedRef.current })); };
  return <>
    <div className="cinematic-background" aria-hidden="true">
      <div className="cine-media" ref={visual}>
        <img className="hero-poster" src={asset('assets/images/portrait-poster.jpg')} width={720} height={1280} alt="" fetchPriority="high" />
        <video ref={ref} id="cinematic-video" muted playsInline preload="auto" poster={asset('assets/images/portrait-poster.jpg')} tabIndex={-1} />
      </div>
      <div className="cine-vignette" /><div className="cine-glow" id="cine-glow" /><div className="cine-grain" /><div className="cine-scan" />
    </div>
    <div className="scroll-progress" aria-hidden="true" />
    {enabled && <button id="motion-toggle" className="global-motion" type="button" aria-pressed={paused} onClick={toggle}>{paused ? 'Enable motion' : 'Pause motion'}</button>}
  </>;
}
