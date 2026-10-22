'use client';
import { useEffect, useState } from 'react';

/** A short greeting and curved curtain; never waits for downloads or locks scrolling. */
export default function PortfolioIntro() {
  const [phase, setPhase] = useState<'greeting' | 'leaving' | 'done'>('greeting');
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    let leave = 0, done = 0;
    const finish = () => {
      clearTimeout(leave); clearTimeout(done);
      root.classList.remove('intro-running');
      root.classList.add('intro-revealed');
      setPhase('done');
    };
    const skipForInput = (event: Event) => {
      if (event instanceof KeyboardEvent && !['Tab', 'Escape'].includes(event.key)) return;
      finish();
    };
    if (reduced.matches || location.hash || scrollY > 0 || performance.now() > 4000) { finish(); return () => root.classList.remove('intro-revealed'); }
    root.classList.add('intro-running');
    leave = window.setTimeout(() => {
      setPhase('leaving');
      root.classList.remove('intro-running');
      root.classList.add('intro-revealed');
    }, 1650);
    done = window.setTimeout(finish, 2550);
    window.addEventListener('keydown', skipForInput);
    window.addEventListener('wheel', skipForInput, { passive: true });
    window.addEventListener('touchstart', skipForInput, { passive: true });
    reduced.addEventListener('change', finish);
    document.addEventListener('visibilitychange', finish);
    return () => {
      clearTimeout(leave); clearTimeout(done);
      root.classList.remove('intro-running', 'intro-revealed');
      window.removeEventListener('keydown', skipForInput);
      window.removeEventListener('wheel', skipForInput);
      window.removeEventListener('touchstart', skipForInput);
      reduced.removeEventListener('change', finish);
      document.removeEventListener('visibilitychange', finish);
    };
  }, []);
  const skip = () => {
    // Use the same input path as keyboard navigation to clear pending timers too.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  };
  if (phase === 'done') return null;
  return <div className={`portfolio-intro intro-${phase}`} data-testid="portfolio-intro">
    <div className="intro-greetings" aria-hidden="true"><i />{['Hello', 'नमस्ते', 'Bonjour', 'Let’s engineer.'].map((word, index) => <span key={word} style={{ '--greeting-index': index } as React.CSSProperties}>{word}</span>)}</div>
    <div className="intro-footer mono" aria-hidden="true"><span>Sagar Jayswal</span><span>Automation / Controls / Robotics</span></div>
    <button type="button" className="intro-skip mono" onClick={skip}>Skip introduction ↗</button>
    <div className="intro-curve" aria-hidden="true" />
  </div>;
}
