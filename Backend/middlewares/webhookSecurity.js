const crypto = require('crypto');
const WebhookEvent = require('../models/WebhookEvent');
const { safeEqual } = require('./security');

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const rawPayload = (req) => Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf8') : JSON.stringify(req.body || {});

async function verifyWebhook(req, res, next) {
  const secret = process.env.N8N_SECRET;
  const eventId = req.get('x-reloop-event-id');
  const timestamp = req.get('x-reloop-timestamp');
  const signature = req.get('x-reloop-signature');
  if (!secret || !eventId || !timestamp || !signature) return res.status(401).json({ success: false, message: 'Webhook authentication is required' });
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(eventId) || !/^\d{10,13}$/.test(timestamp)) return res.status(400).json({ success: false, message: 'Webhook headers are invalid' });
  const timestampMs = Number(timestamp) * (timestamp.length === 10 ? 1000 : 1);
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > MAX_CLOCK_SKEW_MS) return res.status(401).json({ success: false, message: 'Webhook timestamp is outside the allowed window' });
  const payload = rawPayload(req);
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  if (!safeEqual(expected, signature)) return res.status(401).json({ success: false, message: 'Webhook signature is invalid' });
  try {
    await WebhookEvent.create({ eventId, eventType: req.path, payloadHash: crypto.createHash('sha256').update(payload).digest('hex') });
  } catch (error) {
    if (error?.code === 11000) return res.status(202).json({ ok: true, duplicate: true });
    return next(error);
  }
  req.webhookEventId = eventId;
  return next();
}

async function completeWebhook(req, status = 'completed', errorCode) {
  if (req.webhookEventId) await WebhookEvent.updateOne({ eventId: req.webhookEventId }, { $set: { status, completedAt: new Date(), errorCode } });
}

module.exports = { verifyWebhook, completeWebhook };
