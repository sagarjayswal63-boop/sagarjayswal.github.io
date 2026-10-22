'use client';
import { useEffect, useState } from 'react';
import { site } from '@/lib/site';
export default function Contact() {
  const [status, setStatus] = useState(''), [sent, setSent] = useState(false), [time, setTime] = useState('Toronto'), [year, setYear] = useState(2026);
  useEffect(() => {
    setSent(new URLSearchParams(location.search).get('sent') === '1'); setYear(new Date().getFullYear());
    const update = () => setTime(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date()));
    update(); const timer = setInterval(update, 60000); return () => clearInterval(timer);
  }, []);
  const copy = async () => { try { await navigator.clipboard.writeText(site.email); setStatus('Email address copied.'); } catch { setStatus('Copy unavailable. Use the email link above.'); } };
  return <footer className="contact section" id="contact"><div className="contact-heading"><span className="section-index mono">06 / Open channel</span><h2>Let’s engineer <em>what’s next.</em></h2></div><div className="contact-grid"><div className="contact-copy"><p>Available for automation technician, controls and commissioning opportunities across the Greater Toronto Area.</p><a href={`mailto:${site.email}`} data-magnetic>{site.email}<span aria-hidden="true">↗</span></a><div className="email-tools"><button id="copy-email" type="button" className="copy-email" onClick={copy}>Copy email address</button><span role="status" id="copy-status">{status}</span></div><a href={site.linkedin} data-magnetic target="_blank" rel="noopener noreferrer">LinkedIn profile ↗</a><p className="form-note">Prefer a quick message? Use the form and it will be delivered by email.</p></div>
    <form className="contact-form" action={`https://formsubmit.co/${site.email}`} method="POST"><input type="hidden" name="_subject" value="New portfolio enquiry for Sagar Jayswal" /><input type="hidden" name="_template" value="table" /><input type="hidden" name="_captcha" value="false" /><input type="hidden" name="_next" value={`${site.url}?sent=1#contact`} />
      <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" required /></div><div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div><div className="field field-wide"><label htmlFor="company">Company <span>(optional)</span></label><input id="company" name="company" autoComplete="organization" /></div><div className="field field-wide"><label htmlFor="message">Message</label><textarea id="message" name="message" rows={5} required /></div><div className="form-footer field-wide"><p className="form-status" role="status">{sent ? 'Thank you. Your message has been sent.' : ''}</p><button className="button button-dark" type="submit" data-magnetic>Send message ↗</button></div>
    </form></div><div className="footer-row mono"><span>© {year} {site.name}</span><span>{site.location} · {time}</span><a href="#hero">Back to top ↑</a></div></footer>;
}
