const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

let deliveryMessage;
const donation = { receiver: { email: 'receiver@example.test' }, async save() {} };
const originalLoad = Module._load;
Module._load = function (name, parent, isMain) {
  if (name === 'mongoose') return { isValidObjectId: () => true };
  if (name === '../models/Donation') return { findOne: () => ({ populate: async () => donation }) };
  if (name === '../models/User') return {};
  if (name === '../utils/sendEmail') return async (_to, _subject, message) => { deliveryMessage = message; };
  return originalLoad.call(this, name, parent, isMain);
};
let generateDeliveryOTP;
try { ({ generateDeliveryOTP } = require('../controllers/DonationSecurity')); }
finally { Module._load = originalLoad; }

test('delivery confirmation codes are emailed and hashed but never printed to logs', async () => {
  const logs = [];
  const originalInfo = console.info;
  console.info = (...values) => logs.push(values.join(' '));
  let status;
  try {
    await generateDeliveryOTP({ params: { donationId: 'donation' }, user: { id: 'donor' } }, {
      status(code) { status = code; return this; }, json() {},
    });
  } finally { console.info = originalInfo; }
  assert.equal(status, 200);
  const code = deliveryMessage.match(/\b\d{6}\b/)[0];
  assert.equal(donation.otpHash.length, 64);
  assert.equal(logs.some((line) => line.includes(code)), false);
});
