// n8n webhook endpoints — these fire the workflows described in Automation/n8n.
const express = require('express');
const router = express.Router();
const axios = require('axios');

const Listing = require('../models/Donation');
const { fanout } = require('../services/notifications');
const llm = require('../ai/llm');
const { renderImpactPdf } = require('../services/impactPdf');

async function fireN8n(hook, payload) {
  const base = process.env.N8N_WEBHOOK_BASE;
  if (!base) {
    console.log(`[reloop] n8n (dev) → ${hook}`, JSON.stringify(payload).slice(0, 200));
    return { ok: true, channel: 'console' };
  }
  try {
    const { data } = await axios.post(`${base.replace(/\/$/, '')}/${hook}`, payload, {
      headers: { 'x-reloop-secret': process.env.N8N_SECRET || '' },
      timeout: 8000,
    });
    return { ok: true, data };
  } catch (e) {
    console.error(`[reloop] n8n → ${hook} failed`, e.message);
    return { ok: false, error: e.message };
  }
}

// Fired after a donation is created — kicks off Workflow 1.
router.post('/listing-created', async (req, res) => {
  const { listingId } = req.body || {};
  const listing = await Listing.findById(listingId);
  if (!listing) return res.status(404).json({ error: 'listing_not_found' });
  const r = await fireN8n('wf-01-donation-lifecycle', { listingId });
  res.json({ dispatched: r.ok });
});

// Fired by a cron/n8n scheduler when food is close to expiry — Workflow 2.
router.post('/expiry-escalation', async (req, res) => {
  const { listingId } = req.body || {};
  const listing = await Listing.findById(listingId);
  if (!listing) return res.status(404).json({ error: 'listing_not_found' });
  listing.priority = 'critical';
  await listing.save();
  const r = await fireN8n('wf-02-expiry-escalation', { listingId });
  res.json({ escalated: true, dispatched: r.ok });
});

// Fired when a pickup is marked complete — Workflow 3.
router.post('/pickup-completed', async (req, res) => {
  const { listingId } = req.body || {};
  const listing = await Listing.findById(listingId).populate('donor');
  if (!listing) return res.status(404).json({ error: 'listing_not_found' });

  const impact = await llm.generateImpactReport({ listing });
  const cert = await renderImpactPdf({ listing, impact });
  listing.impact = { ...impact, certificateUrl: cert.url, generatedAt: new Date() };
  listing.status = 'delivered';
  listing.automation = { ...(listing.automation || {}), deliveredAt: new Date(), lastStep: 'delivered' };
  await listing.save();

  if (listing.donor) {
    await fanout({
      user: listing.donor,
      subject: 'Your ReLoop AI impact report is ready',
      message: impact.summary,
      html: `<div style="font-family:Inter,Arial"><h2>Thank you</h2><p>${impact.summary}</p><p><a href="${cert.url}">Download certificate</a></p></div>`,
    });
  }

  const r = await fireN8n('wf-03-impact-receipt', { listingId, impact, certificateUrl: cert.url });
  res.json({ ok: true, impact, dispatched: r.ok });
});

module.exports = router;
