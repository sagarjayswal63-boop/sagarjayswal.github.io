import { test } from 'node:test';
import assert from 'node:assert/strict';
import React, { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import CinematicVideo from '../src/components/CinematicVideo';

test('cached metadata survives Strict Mode effect replay and starts cursor seeking without canplay', async () => {
  const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', { url: 'https://example.test', pretendToBeVisual: true });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, React, IS_REACT_ACT_ENVIRONMENT: true, innerWidth: 1000, innerHeight: 800, scrollY: 0, AbortController: dom.window.AbortController });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { hardwareConcurrency: 4, deviceMemory: 4 } });
  let nextId = 0;
  const callbacks = new Map<number, FrameRequestCallback>();
  Object.assign(globalThis, {
    matchMedia: (query: string) => ({ matches: query.includes('pointer: fine'), addEventListener() {} }),
    requestAnimationFrame: (callback: FrameRequestCallback) => { callbacks.set(++nextId, callback); return nextId; },
    cancelAnimationFrame: (id: number) => callbacks.delete(id),
  });
  const media = dom.window.HTMLMediaElement.prototype;
  Object.defineProperty(media, 'duration', { configurable: true, get: () => 8 });
  // Metadata only: seeking must not depend on decoded data or a fresh metadata event.
  Object.defineProperty(media, 'readyState', { configurable: true, get: () => 1 });
  media.load = () => {};
  media.pause = () => {};
  const root = createRoot(document.getElementById('root')!);
  await act(async () => root.render(React.createElement(StrictMode, null, React.createElement(CinematicVideo))));
  const video = document.querySelector('video')!;
  assert.ok(video.hasAttribute('src'), 'Four-core devices must load the video');
  window.dispatchEvent(new dom.window.MouseEvent('pointermove', { clientX: 900, clientY: 300 }));
  assert.equal(callbacks.size, 1, 'Only one RAF loop after Strict Mode replay');
  // The first eligible RAF should seek to a LERP intermediate, not jump to the end.
  await new Promise(resolve => setTimeout(resolve, 55));
  const frame = callbacks.entries().next().value!;
  callbacks.delete(frame[0]); frame[1](performance.now());
  assert.ok(video.currentTime > 0 && video.currentTime < 1, String(video.currentTime));
  assert.equal(callbacks.size, 1);
  await act(async () => root.unmount());
  assert.equal(callbacks.size, 0, 'Unmount must cancel outstanding work');
  dom.window.close();
});
