import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frontFacing, radiusFor, shortestDelta, releaseVelocity, certifications } from '../src/lib/certifications';

test('no unsupported certifications are published', () => assert.deepEqual(certifications, []));
test('shortest centering rotation crosses the zero-degree boundary', () => {
  assert.equal(shortestDelta(350, 10), 20); assert.equal(shortestDelta(10, 350), -20);
  assert.equal(shortestDelta(-720, 10), 10); assert.equal(shortestDelta(1085, 0), -5);
});
test('responsive radii keep front card at camera plane', () => {
  for (const [width, radius] of [[390, 275], [768, 380], [1440, 480]]) {
    assert.equal(radiusFor(width), radius); assert.equal(-radius + radius, 0);
  }
});
test('back faces are culled for every rotation cycle', () => {
  assert.equal(frontFacing(0), true); assert.equal(frontFacing(180), false); assert.equal(frontFacing(540), false); assert.equal(frontFacing(360), true);
});
test('throw velocity uses recent samples and remains bounded', () => {
  assert.equal(releaseVelocity([]), 0); assert.equal(releaseVelocity([{ x: 0, time: 0 }]), 0);
  assert.ok(releaseVelocity([{ x: 0, time: 0 }, { x: 40, time: 100 }]) > 0);
  assert.ok(releaseVelocity([{ x: 40, time: 0 }, { x: 0, time: 100 }]) < 0);
  assert.equal(releaseVelocity([{ x: 0, time: 0 }, { x: 10000, time: 1 }]), 3);
});
