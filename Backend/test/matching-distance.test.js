const assert = require('node:assert/strict');
const test = require('node:test');
const { rankRecipients } = require('../ai/matching');

test('ranks recipients with coordinates and returns a finite real distance', () => {
  const results = rankRecipients({
    listing: { category: 'food', quantity: 5, pickupCoords: { lat: 12.97, lng: 77.59 } },
    recipients: [
      { _id: 'near', name: 'Nearby', coords: { lat: 12.971, lng: 77.59 }, acceptedCategories: ['food'] },
      { _id: 'far', name: 'Distant', coords: { lat: 13.1, lng: 77.59 }, acceptedCategories: ['food'] },
    ],
  });
  assert.equal(results.length, 2);
  assert.equal(results[0].recipient, 'near');
  assert.ok(results[0].distanceKm > 0 && results[0].distanceKm < 1);
  assert.ok(results[1].distanceKm > 10);
});

test('a recipient without coordinates retains the unknown-distance fallback', () => {
  const [result] = rankRecipients({ listing: { category: 'food' }, recipients: [{ _id: 'unknown' }] });
  assert.equal(result.distanceKm, null);
  assert.ok(Number.isFinite(result.score));
});
