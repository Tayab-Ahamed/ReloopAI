const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const originalLoad = Module._load;

Module._load = function loadWithJwtStub(request, parent, isMain) {
  if (request === 'jsonwebtoken') {
    return {
      verify(token, secret) {
        if (secret !== 'test-secret-for-route-authorization' || !token.startsWith('signed:')) {
          throw new Error('invalid token');
        }
        return JSON.parse(Buffer.from(token.slice('signed:'.length), 'base64url').toString('utf8'));
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

process.env.JWT_SECRET = 'test-secret-for-route-authorization';
const { authMiddleware, requireRoles } = require('../middlewares/Authentication');
Module._load = originalLoad;

const tokenFor = (role) => `signed:${Buffer.from(JSON.stringify({
  user: { id: '507f1f77bcf86cd799439011', email: 'person@example.test', role },
})).toString('base64url')}`;

const authorize = (token, roles) => new Promise((resolve) => {
  const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
  const res = { status: () => ({ json: (body) => resolve({ allowed: false, body, req }) }) };
  authMiddleware(req, res, () => {
    requireRoles(...roles)(req, res, () => resolve({ allowed: true, req }));
  });
});

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('the insecure Google-login route and handler are removed', () => {
  assert.doesNotMatch(read('routes/auth.js'), /google-login|GoogleLogin/);
  assert.doesNotMatch(read('controllers/Auth.js'), /const GoogleLogin/);
});

test('anonymous and malformed bearer tokens are rejected', async () => {
  const noToken = await new Promise((resolve) => {
    authMiddleware({ headers: {}, cookies: {} }, { status: () => ({ json: resolve }) }, () => resolve('allowed'));
  });
  const malformed = await new Promise((resolve) => {
    authMiddleware({ headers: { authorization: 'Bearer invalid' }, cookies: {} }, { status: () => ({ json: resolve }) }, () => resolve('allowed'));
  });
  assert.equal(noToken.success, false);
  assert.equal(malformed.success, false);
});

test('server-side role guard permits Admin and rejects Donor', async () => {
  const admin = await authorize(tokenFor('Admin'), ['Admin']);
  const donor = await authorize(tokenFor('Donor'), ['Admin']);
  assert.equal(admin.allowed, true);
  assert.equal(donor.allowed, false);
  assert.equal(donor.body.success, false);
});

test('legacy Donar is normalized without gaining administrator permission', async () => {
  const legacyDonor = await authorize(tokenFor('Donar'), ['Admin']);
  assert.equal(legacyDonor.allowed, false);
  assert.equal(legacyDonor.req.user.role, 'Donor');
});

test('webhooks, AI, uploads, and lifecycle routes enforce the new security boundary', () => {
  const webhooks = read('routes/webhooks.js');
  const ai = read('routes/ai.js');
  const upload = read('routes/upload.js');
  const donations = read('routes/donation.js');
  const lifecycle = read('controllers/DonationSecurity.js');
  assert.match(webhooks, /router\.use\(verifyWebhook\)/);
  assert.match(ai, /router\.use\(authMiddleware, noStore, rateLimit/);
  assert.match(upload, /authMiddleware, requireRoles\('Donor', 'NGO', 'Volunteer', 'Recycler', 'Admin'\)/);
  assert.match(donations, /secure\.createDonation/);
  assert.match(donations, /secure\.addDonationToUser/);
  assert.match(lifecycle, /findOneAndUpdate\(\{ _id: req\.params\.donationId, status: 'pending', receiver: null \}/);
  assert.match(lifecycle, /otpHash/);
  assert.doesNotMatch(lifecycle, /otp: otp/);
});

test('NGO administration and FAQ mutations are protected by auth plus Admin role', () => {
  const ngoRoutes = read('routes/Ngo.js');
  const faqRoutes = read('routes/faq.js');
  assert.match(ngoRoutes, /router\.get\('\/pending', \.\.\.requireAdmin/);
  assert.match(ngoRoutes, /router\.patch\('\/:id\/verification', \.\.\.requireAdmin/);
  assert.doesNotMatch(ngoRoutes, /approve\/|reject\//);
  assert.match(faqRoutes, /router\.post\('\/', authMiddleware, requireRoles\('Admin'\), addNewFAQ\)/);
  assert.match(faqRoutes, /router\.delete\('\/:id', authMiddleware, requireRoles\('Admin'\), deleteFAQ\)/);
});
