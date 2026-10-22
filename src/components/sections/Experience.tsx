'use client';
import { useState } from 'react';
import portfolio from '@/lib/portfolio.json';
type Kind = 'all' | 'work' | 'education';
const milestones = [
  ...portfolio.experience.map(e => ({ kind: 'work' as const, date: e.date, title: e.role, place: e.company, detail: e.detail, highlights: e.highlights, current: 'current' in e && e.current })),
  ...portfolio.education.map(e => ({ kind: 'education' as const, date: e.date, title: e.credential, place: e.school, detail: '', highlights: [] as string[], current: false })),
].sort((a, b) => Date.parse(`1 ${b.date.split(' — ')[0]}`) - Date.parse(`1 ${a.date.split(' — ')[0]}`));
export default function Experience() {
  const [kind, setKind] = useState<Kind>('all');
  const visible = milestones.filter(item => kind === 'all' || item.kind === kind);
  return <section id="experience" className="section" aria-labelledby="experience-title"><div className="section-head"><span className="section-index mono">04 / The journey</span><div><h2 id="experience-title">Built on <em>experience.</em></h2><p>Work experience and education, connected. From electrical engineering fundamentals to the production floor.</p></div></div>
    <div className="journey-filters" role="group" aria-label="Filter journey milestones">{([['all', 'All'], ['work', 'Work experience'], ['education', 'Education']] as const).map(([value, label]) => <button key={value} type="button" data-journey-filter={value} aria-controls="timeline" aria-pressed={value === kind} onClick={() => setKind(value)}>{label}</button>)}</div>
    <p className="journey-status mono" id="journey-status" role="status">{visible.length} {kind === 'all' ? 'career & education' : kind} milestones</p>
    <div className="timeline" id="timeline">{visible.map((item, index) => <article key={`${item.kind}-${item.date}`} data-kind={item.kind} className={`role milestone ${index % 2 ? 'role-right' : ''} ${item.current ? 'role-current' : ''}`}><div><span className="milestone-kind mono">{item.kind === 'work' ? 'Work experience' : 'Education'}</span><time className="role-date mono">{item.date}</time>{item.current && <span className="current mono">Current role</span>}</div><h3>{item.title}</h3><p className="role-company">{item.place}</p>{item.detail && <p className="role-detail">{item.detail}</p>}{item.highlights.length > 0 && <details className="role-highlights"><summary>Responsibilities &amp; validation</summary><ul>{item.highlights.map(point => <li key={point}>{point}</li>)}</ul></details>}</article>)}</div>
  </section>;
}
