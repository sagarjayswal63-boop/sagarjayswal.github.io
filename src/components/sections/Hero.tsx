import { resumePath, site } from '@/lib/site';
import portfolio from '@/lib/portfolio.json';
export default function Hero() {
  return <section id="hero" className="hero next-hero" aria-labelledby="hero-title">
    <span className="hero-watermark" aria-hidden="true">{site.firstName}</span>
    <div className="hero-content">
      <p className="hero-eyebrow mono">01 / Automation &amp; Controls</p>
      <h1 id="hero-title"><span>Building ideas</span><span className="gradient-heading">into experiences<span className="neon-period">.</span></span></h1>
      <div className="hero-identity"><p>{site.name}</p><span className="mono">{site.title}</span></div>
      <p className="hero-lead">Building, troubleshooting, and improving industrial automation systems through PLC programming, robotics, machine vision, and controls engineering.</p>
      <div className="hero-actions"><a className="button button-primary" data-magnetic href="#work">Explore work →</a><a className="button button-ghost" data-magnetic href={resumePath} download>Download résumé ↓</a></div>
      <div className="telemetry"><div><strong>4+</strong><span className="mono">Years of experience</span></div><div><strong>{portfolio.projects.length.toString().padStart(2, '0')}</strong><span className="mono">Documented projects</span></div></div>
      <div className="hero-status mono"><i aria-hidden="true" />Open to automation opportunities</div>
    </div>
    <div className="hero-bottom mono"><a href="#about">Scroll to inspect ↓</a><span>Automation in motion</span></div>
  </section>;
}
