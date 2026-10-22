'use client';
import { useState } from 'react';
import { site, summary } from '@/lib/site';
const strengths = [
  ['Diagnose', 'Structured fault isolation from field device to PLC and machine response.'],
  ['Verify', 'Safe sequence changes followed by functional verification.'],
  ['Document', 'Clear maintenance documentation and backup discipline.'],
  ['Collaborate', 'Cross-functional support with engineering, production and maintenance.'],
];
export default function About() {
  const [selected, setSelected] = useState(0);
  return <section id="about" className="section about-section" aria-labelledby="about-title"><div className="section-head"><span className="section-index mono">02 / System inspection</span><div><h2 id="about-title">Engineering with <em>intent.</em></h2></div></div>
    <div className="terminal-grid"><div className="terminal"><div className="terminal-bar mono"><i aria-hidden="true" />profile / {site.firstName.toLowerCase()}.sys</div><p className="mono text-rose-300">$ inspect professional_profile</p><p>{summary}</p><dl><dt>Based in</dt><dd>{site.location}</dd><dt>Current role</dt><dd>Automation Technician · Axiom Group Inc., Aurora, ON</dd><dt>Contact</dt><dd><a href={`tel:+14379620400`}>{site.phone}</a></dd></dl></div>
    <div className="strengths-console"><p className="mono text-rose-300">Core working practices</p><div className="strength-matrix" role="group" aria-label="Inspect engineering strengths">{strengths.map(([label], index) => <button type="button" key={label} aria-pressed={selected === index} aria-controls="strength-detail" onClick={() => setSelected(index)}>0{index + 1} / {label}</button>)}</div><p id="strength-detail" role="status">{strengths[selected][1]}</p><span className="mono text-neutral-400">Input → logic → response → validation</span></div></div>
  </section>;
}
