import portfolio from '@/lib/portfolio.json';
export default function Skills() {
  return <section className="section" id="capabilities" aria-labelledby="skills-title"><div className="section-head"><span className="section-index mono">05 / Engineering toolkit</span><div><h2 id="skills-title">Connected systems.<em>Practical skills.</em></h2><p>Technologies grounded in diagnosis, verification, safe startup and clear documentation.</p></div></div>
    <div className="signal-path"><span className="mono">Signal path / system thinking</span><ol>{[['Sense', 'Field devices'], ['Decide', 'PLC & vision'], ['Move', 'Motion & robotics'], ['Verify', 'Feedback & diagnostics']].map(([title, label]) => <li key={title}><i aria-hidden="true" />{title}<span className="mono">{label}</span></li>)}</ol></div>
    <div className="capability-grid">{portfolio.capabilities.map((skill, index) => <article className="capability" key={skill.title}><span className="mono">C / 0{index + 1}</span><h3>{skill.title}</h3><ul className="skill-pills">{skill.items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div>
  </section>;
}
