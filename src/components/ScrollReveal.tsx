'use client';
import { useEffect } from 'react';
export default function ScrollReveal() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || !window.IntersectionObserver) return;
    const nodes = new Set<Element>();
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('reveal-pending'); entry.target.setAttribute('data-revealed', 'true'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    const register = () => document.querySelectorAll('.milestone,.capability').forEach(node => {
      if (!nodes.has(node) && !node.hasAttribute('data-revealed')) { nodes.add(node); node.classList.add('reveal', 'reveal-pending'); observer.observe(node); }
    });
    const mutations = new MutationObserver(register); mutations.observe(document.getElementById('main')!, { childList: true, subtree: true });
    const preference = () => { if (reduced.matches) nodes.forEach(node => node.classList.remove('reveal-pending')); };
    reduced.addEventListener('change', preference); register();
    return () => { observer.disconnect(); mutations.disconnect(); reduced.removeEventListener('change', preference); nodes.forEach(node => node.classList.remove('reveal-pending')); };
  }, []);
  return null;
}
