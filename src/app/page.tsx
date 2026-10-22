import ScrollReveal from '@/components/ScrollReveal';
import Navbar from '@/components/Navbar';
import PortraitBackdrop from '@/components/PortraitBackdrop';
import PortfolioIntro from '@/components/PortfolioIntro';
import CustomCursor from '@/components/CustomCursor';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import Experience from '@/components/sections/Experience';
import Certifications from '@/components/sections/Certifications';
import Contact from '@/components/sections/Contact';
export default function Page() {
  return <><ScrollReveal /><PortfolioIntro /><PortraitBackdrop /><CustomCursor /><Navbar /><main id="main" tabIndex={-1}><Hero /><About /><Projects /><Experience /><Skills /><Certifications /></main><Contact /><noscript><p className="noscript">Interactive controls need JavaScript. Your professional content remains readable. <a href="resume.html">Read the résumé</a> or use the email link to get in touch.</p></noscript></>;
}
