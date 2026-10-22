import { test } from 'node:test';
import assert from 'node:assert/strict';
import React, { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import PortfolioIntro from '../src/components/PortfolioIntro';

test('entrance supports skip and reduced motion after Strict Mode effect replay', async () => {
  const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', { url: 'https://example.test', pretendToBeVisual: true });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, location: dom.window.location, scrollY: 0, KeyboardEvent: dom.window.KeyboardEvent, React, IS_REACT_ACT_ENVIRONMENT: true });
  let reduced = false, now = 0;
  const originalPerformance = globalThis.performance;
  Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => now } });
  Object.assign(globalThis, { matchMedia: () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }) });
  // Use one timer realm, matching the browser, so cleanup can be verified.
  let next = 0;
  const pending = new Map<number, () => void>();
  const oldClear = globalThis.clearTimeout;
  dom.window.setTimeout = ((callback: () => void) => { pending.set(++next, callback); return next; }) as typeof dom.window.setTimeout;
  globalThis.clearTimeout = ((id: number) => pending.delete(id)) as unknown as typeof clearTimeout;
  const root = createRoot(document.getElementById('root')!);
  try {
    await act(async () => root.render(React.createElement(StrictMode, null, React.createElement(PortfolioIntro))));
    assert.equal(pending.size, 2, 'Replay must cancel the first timer pair');
    assert.ok(document.querySelector('.portfolio-intro'));
    await act(async () => document.querySelector<HTMLButtonElement>('.intro-skip')!.click());
    assert.equal(document.querySelector('.portfolio-intro'), null);
    assert.equal(pending.size, 0);
    assert.ok(!document.documentElement.classList.contains('intro-running'));
    await act(async () => root.render(null));
    reduced = true;
    await act(async () => root.render(React.createElement(PortfolioIntro)));
    assert.equal(document.querySelector('.portfolio-intro'), null);
    assert.equal(pending.size, 0, 'Reduced motion must never schedule the intro');
    await act(async () => root.render(null));
    reduced = false; now = 5000;
    await act(async () => root.render(React.createElement(PortfolioIntro)));
    assert.equal(document.querySelector('.portfolio-intro'), null, 'Late hydration must bypass the curtain');
    assert.equal(pending.size, 0);
    await act(async () => root.unmount());
    assert.ok(!document.documentElement.classList.contains('intro-revealed'));
  } finally { globalThis.clearTimeout = oldClear; Object.defineProperty(globalThis, 'performance', { configurable: true, value: originalPerformance }); dom.window.close(); }
});
