import { test } from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import Certifications from '../src/components/sections/Certifications';

test('credential controls center cards and open truthful issuer details; empty records hide the section', async () => {
  const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', { url: 'https://example.test' });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, React, IS_REACT_ACT_ENVIRONMENT: true, innerWidth: 1440 });
  const media = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  Object.assign(globalThis, { matchMedia: media, requestAnimationFrame: () => 1, cancelAnimationFrame() {}, IntersectionObserver: class { observe() {} disconnect() {} } });
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new dom.window.Event('close')); };
  const root = createRoot(document.getElementById('root')!);
  await act(async () => root.render(React.createElement(Certifications, { records: [] })));
  assert.equal(document.querySelector('#certifications'), null);
  // Explicit test fixtures only; these records never enter the application data.
  const records = [0, 1, 2].map(i => ({ id: `test-${i}`, title: `Test credential ${i}`, issuer: 'Test issuer', completed: 'Test completion', competencies: ['Test competency'] }));
  await act(async () => root.render(React.createElement(Certifications, { records })));
  const pagination = document.querySelectorAll<HTMLButtonElement>('.cert-pagination button');
  await act(async () => pagination[1].click());
  const card = document.querySelectorAll<HTMLButtonElement>('.cert-card')[1];
  assert.equal(card.style.visibility, 'visible');
  assert.match(card.getAttribute('aria-label')!, /open issuer details/);
  await act(async () => card.click());
  assert.ok(document.querySelector('dialog[open]'));
  assert.equal(document.getElementById('credential-title')!.textContent, 'Test credential 1');
  assert.ok(!document.querySelector('.credential-hash'), 'No invented verification hash');
  await act(async () => root.unmount());
  dom.window.close();
});
