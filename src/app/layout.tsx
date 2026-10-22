import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { site, asset } from '@/lib/site';
import LenisProvider from '@/components/LenisProvider';
const socialDescription = 'PLC programming, machine vision, robotics, commissioning and industrial troubleshooting.';
export const metadata: Metadata = {
  metadataBase: new URL(site.url), title: `${site.name} — ${site.title}`, description: site.description,
  alternates: { canonical: site.url }, icons: { icon: asset('assets/images/favicon.svg') },
  openGraph: { type: 'website', title: `${site.name} — ${site.title}`, description: socialDescription, url: site.url, images: [{ url: `${site.url}assets/images/sagar-jayswal-social-preview.png`, width: 1200, height: 630, alt: 'Sagar Jayswal — Automation and Controls Technician portfolio' }] },
  twitter: { card: 'summary_large_image', title: `${site.name} — ${site.title}`, description: socialDescription, images: [`${site.url}assets/images/sagar-jayswal-social-preview.png`] },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#030303' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const person = { '@context': 'https://schema.org', '@type': 'Person', name: site.name, jobTitle: site.title, email: `mailto:${site.email}`, address: { '@type': 'PostalAddress', addressLocality: 'Scarborough', addressRegion: 'Ontario', addressCountry: 'CA' }, sameAs: [site.linkedin] };
  return <html lang="en"><head><noscript><style>{`.portfolio-intro{display:none!important}.menu-toggle,.journey-filters,.copy-email,.strength-matrix{display:none!important}.header-resume{display:block}.project-panel[hidden]{display:grid}`}</style></noscript><link rel="preload" href={asset('assets/fonts/oswald.woff2')} as="font" type="font/woff2" crossOrigin="anonymous" /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, '\\u003c') }} /></head><body><a className="skip-link" href="#main">Skip to content</a><LenisProvider>{children}</LenisProvider><Script src="https://www.googletagmanager.com/gtag/js?id=G-KVPM9TKRYQ" strategy="afterInteractive" /><Script id="analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-KVPM9TKRYQ');`}</Script></body></html>;
}
