'use client';
import { useEffect, useRef, useState } from 'react';
import { certifications as supplied, frontFacing, radiusFor, releaseVelocity, shortestDelta, type Certification } from '@/lib/certifications';

export default function Certifications({ records = supplied }: { records?: Certification[] }) {
  const [angle, setAngle] = useState(0), [radius, setRadius] = useState(480), [auto, setAuto] = useState(false);
  const [opened, setOpened] = useState<Certification | null>(null);
  const section = useRef<HTMLElement>(null), dialog = useRef<HTMLDialogElement>(null), track = useRef<HTMLDivElement>(null);
  const state = useRef({ angle: 0, velocity: 0, target: null as number | null, dragging: false, moved: false, x: 0, pressed: null as number | null, samples: [] as { x: number; time: number }[] });
  const autoRef = useRef(false), visible = useRef(true), reduced = useRef(true), raf = useRef(0), wake = useRef<() => void>(() => {});
  const step = records.length ? 360 / records.length : 0;
  useEffect(() => {
    if (!records.length) return;
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const canSpin = matchMedia('(hover:hover) and (pointer:fine)');
    const resize = () => setRadius(radiusFor(innerWidth));
    let last = 0;
    const tick = (time: number) => {
      raf.current = 0;
      const s = state.current, dt = Math.min(2, (time - (last || time - 16.67)) / 16.67); last = time;
      if (document.hidden || !visible.current || s.dragging) return;
      if (s.target !== null) {
        const delta = s.target - s.angle;
        s.angle += delta * .14;
        if (Math.abs(delta) < .05) { s.angle = s.target; s.target = null; }
      } else if (Math.abs(s.velocity) > .005 && !reduced.current) {
        s.angle += s.velocity * dt; s.velocity *= Math.pow(.945, dt);
      } else if (autoRef.current && !reduced.current) s.angle += .06 * dt;
      setAngle(s.angle);
      if (s.target !== null || Math.abs(s.velocity) > .005 || (autoRef.current && !reduced.current)) wake.current();
    };
    wake.current = () => { if (!raf.current && visible.current && !document.hidden) raf.current = requestAnimationFrame(tick); };
    const preference = () => { reduced.current = query.matches; if (query.matches) { state.current.velocity = 0; autoRef.current = false; setAuto(false); } wake.current(); };
    reduced.current = query.matches;
    autoRef.current = !query.matches && canSpin.matches; setAuto(autoRef.current);
    const visibility = () => { cancelAnimationFrame(raf.current); raf.current = 0; last = 0; if (!document.hidden) wake.current(); };
    const motion = (event: Event) => { if (!(event as CustomEvent<boolean>).detail) { autoRef.current = false; state.current.velocity = 0; setAuto(false); } };
    const observer = new IntersectionObserver(entries => { visible.current = entries[0].isIntersecting; if (visible.current) wake.current(); else { cancelAnimationFrame(raf.current); raf.current = 0; } });
    if (section.current) observer.observe(section.current);
    query.addEventListener('change', preference); window.addEventListener('resize', resize); window.addEventListener('portfolio-motion', motion); document.addEventListener('visibilitychange', visibility);
    resize(); wake.current();
    return () => { cancelAnimationFrame(raf.current); observer.disconnect(); query.removeEventListener('change', preference); window.removeEventListener('resize', resize); window.removeEventListener('portfolio-motion', motion); document.removeEventListener('visibilitychange', visibility); };
  }, [records.length]);
  useEffect(() => { if (opened) dialog.current?.showModal(); }, [opened]);
  if (!records.length) return null;
  const center = (index: number) => {
    const s = state.current;
    autoRef.current = false; setAuto(false); s.velocity = 0;
    const delta = shortestDelta(s.angle, -index * step);
    if (reduced.current) { s.angle += delta; setAngle(s.angle); s.target = null; }
    else { s.target = s.angle + delta; wake.current(); }
  };
  const activate = (index: number) => {
    if (Math.abs(shortestDelta(state.current.angle, -index * step)) < 3) {
      autoRef.current = false; setAuto(false); setOpened(records[index]);
    } else center(index);
  };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const s = state.current;
    if (!s.dragging) return;
    s.dragging = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!s.moved && s.pressed !== null) { activate(s.pressed); return; }
    s.velocity = reduced.current ? 0 : releaseVelocity(s.samples.filter(sample => performance.now() - sample.time < 120));
    wake.current();
  };
  const nearest = ((Math.round(-angle / step) % records.length) + records.length) % records.length;
  return <section ref={section} className="section certifications" id="certifications" aria-labelledby="certifications-title"><div className="section-head"><span className="section-index mono">Credentials / issuer records</span><div><h2 id="certifications-title">Learning, <em>documented.</em></h2><p>Drag to explore. Select a card to center it, then open its issuer details.</p></div></div>
    <div className="cert-toolbar"><button type="button" aria-pressed={auto} onClick={() => { autoRef.current = !auto; setAuto(!auto); wake.current(); }}>Auto-spin {auto ? 'on' : 'paused'}</button><span className="mono" role="status">{nearest + 1} / {records.length}</span></div>
    <div ref={track} className="cert-stage" aria-label="Certification carousel" onPointerDown={event => { if (event.button !== 0) return; const s = state.current; s.pressed = Number((event.target as Element).closest<HTMLElement>('[data-cert-index]')?.dataset.certIndex ?? -1); if (s.pressed < 0) s.pressed = null; s.dragging = true; s.moved = false; s.x = event.clientX; s.velocity = 0; s.target = null; s.samples = [{ x: event.clientX, time: performance.now() }]; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => { const s = state.current; if (!s.dragging) return; const dx = event.clientX - s.x; s.moved = s.moved || Math.abs(dx) > 2; s.x = event.clientX; s.angle += dx * .25; s.samples.push({ x: event.clientX, time: performance.now() }); s.samples = s.samples.filter(sample => performance.now() - sample.time < 120).slice(-8); setAngle(s.angle); }} onPointerUp={endDrag} onPointerCancel={event => { state.current.velocity = 0; state.current.dragging = false; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}>
      <div className="cert-cylinder" style={{ transform: `translateZ(-${radius}px) rotateY(${angle}deg)` }}>{records.map((record, index) => {
        const visible = frontFacing(index * step + angle), front = Math.abs(shortestDelta(angle, -index * step)) < 3;
        return <button key={record.id} type="button" data-cert-index={index} className="cert-card" tabIndex={visible ? 0 : -1} aria-hidden={!visible} aria-label={`${record.title}: ${front ? 'open issuer details' : 'center card'}`} style={{ transform: `translate(-50%,-50%) rotateY(${index * step}deg) translateZ(${radius}px)`, visibility: visible ? 'visible' : 'hidden' }} onClick={event => { if (event.detail === 0) activate(index); }} onFocus={event => { if (event.currentTarget.matches(':focus-visible')) { autoRef.current = false; setAuto(false); } }}><span className="mono">{record.issuer}</span><strong>{record.title}</strong><span className="credential-chip mono">{record.completed}</span><span className="mono">{front ? 'Open issuer details ↗' : 'Center credential →'}</span></button>;
      })}</div>
    </div>
    <div className="cert-pagination" aria-label="Choose certification">{records.map((record, index) => <button key={record.id} type="button" aria-label={`Center ${record.title}`} aria-pressed={nearest === index} onClick={() => center(index)} />)}</div>
    <dialog ref={dialog} className="credential-dialog" data-lenis-prevent aria-labelledby="credential-title" onClose={() => setOpened(null)}>{opened && <><div className="dialog-bar"><span className="mono">Issuer record</span><button type="button" onClick={() => dialog.current?.close()}>Close</button></div><div className="credential-details"><span className="credential-chip">{opened.issuer}</span><h3 id="credential-title">{opened.title}</h3><p>Completed: {opened.completed}</p>{opened.verifiedDate && <p>Record verified: {opened.verifiedDate}</p>}<ul>{opened.competencies.map(item => <li key={item}>{item}</li>)}</ul>{opened.documentSha256 && /^[a-f\d]{64}$/i.test(opened.documentSha256) && <p className="credential-hash"><span className="mono">Document fingerprint (not issuer verification)</span><code>SHA256://{opened.documentSha256}</code></p>}{opened.credentialUrl && <a className="button" href={opened.credentialUrl} rel="noopener noreferrer" target="_blank">View issuer record ↗</a>}</div></>}</dialog>
  </section>;
}
