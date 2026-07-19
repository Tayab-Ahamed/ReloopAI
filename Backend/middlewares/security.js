const crypto = require('crypto');
const dns = require('dns').promises;

const counters = new Map();
const clientKey = (req) => String(req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();

function rateLimit({ windowMs, max, keyPrefix = 'default', key = clientKey }) {
  return (req, res, next) => {
    const now = Date.now();
    const bucketKey = `${keyPrefix}:${key(req)}`;
    const entry = counters.get(bucketKey);
    if (!entry || entry.resetAt <= now) {
      counters.set(bucketKey, { count: 1, resetAt: now + windowMs });
      res.set('RateLimit-Limit', String(max));
      res.set('RateLimit-Remaining', String(max - 1));
      return next();
    }
    if (entry.count >= max) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ success: false, message: 'Too many requests. Please retry later.' });
    }
    entry.count += 1;
    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    return next();
  };
}

function securityHeaders(_req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Resource-Policy': 'same-site',
  });
  return next();
}

function noStore(_req, res, next) {
  res.set('Cache-Control', 'no-store');
  return next();
}

function isPrivateIp(address) {
  const value = String(address).toLowerCase().replace(/^::ffff:/, '');
  if (value === '::1' || value === '0.0.0.0' || value.startsWith('fe80:') || value.startsWith('fc') || value.startsWith('fd')) return true;
  const parts = value.split('.').map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;
  const [a, b] = parts;
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

async function validateSafeImageUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) throw new Error('Image URL is invalid');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new Error('Image URL is invalid');
  const records = await dns.lookup(url.hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isPrivateIp(record.address))) throw new Error('Image URL host is not allowed');
  return url.toString();
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { rateLimit, securityHeaders, noStore, validateSafeImageUrl, safeEqual, isPrivateIp };
