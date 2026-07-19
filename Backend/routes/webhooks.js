const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const axios = require('axios');
const Listing = require('../models/Donation');
const { fanout } = require('../services/notifications');
const llm = require('../ai/llm');
const { renderImpactPdf } = require('../services/impactPdf');
const { verifyWebhook, completeWebhook } = require('../middlewares/webhookSecurity');

async function fireN8n(hook, payload) {
  if (!process.env.N8N_WEBHOOK_BASE) return { ok: false, error: 'n8n_not_configured' };
  try { const { data } = await axios.post(`${process.env.N8N_WEBHOOK_BASE.replace(/\/$/, '')}/${hook}`, payload, { headers: { 'x-reloop-secret': process.env.N8N_SECRET }, timeout: 8000 }); return { ok: true, data }; }
  catch (_error) { return { ok: false, error: 'dispatch_failed' }; }
}
function getListingId(req, res) { const id = req.body?.listingId; if (!mongoose.isValidObjectId(id)) { res.status(400).json({ success: false, message: 'Listing identifier is invalid' }); return null; } return id; }
router.use(verifyWebhook);
router.post('/listing-created', async (req, res, next) => { try { const id = getListingId(req, res); if (!id) return; if (!await Listing.exists({ _id: id })) return res.status(404).json({ success: false, message: 'Listing not found' }); const result = await fireN8n('wf-01-donation-lifecycle', { listingId: id }); await completeWebhook(req); return res.status(202).json({ dispatched: result.ok }); } catch (error) { await completeWebhook(req, 'failed', 'listing_created_failed'); return next(error); } });
router.post('/expiry-escalation', async (req, res, next) => { try { const id = getListingId(req, res); if (!id) return; const listing = await Listing.findOne({ _id: id, status: { $in: ['pending', 'notified'] } }); if (!listing) return res.status(409).json({ success: false, message: 'Listing cannot be escalated in its current state' }); listing.priority = 'critical'; await listing.save(); const result = await fireN8n('wf-02-expiry-escalation', { listingId: id }); await completeWebhook(req); return res.status(202).json({ escalated: true, dispatched: result.ok }); } catch (error) { await completeWebhook(req, 'failed', 'expiry_escalation_failed'); return next(error); } });
router.post('/pickup-completed', async (req, res, next) => { try { const id = getListingId(req, res); if (!id) return; const listing = await Listing.findOne({ _id: id, status: { $in: ['accepted', 'in_transit'] } }).populate('donor'); if (!listing) return res.status(409).json({ success: false, message: 'Listing is not ready for completion' }); const impact = await llm.generateImpactReport({ listing }); const cert = await renderImpactPdf({ listing, impact }); listing.impact = { ...impact, certificateUrl: cert.url, generatedAt: new Date() }; listing.status = 'delivered'; listing.automation = { ...(listing.automation || {}), deliveredAt: new Date(), lastStep: 'delivered' }; await listing.save(); if (listing.donor) await fanout({ user: listing.donor, subject: 'Your ReLoop AI impact report is ready', message: impact.summary, html: `<p>${impact.summary}</p><p><a href="${cert.url}">Download certificate</a></p>` }); const result = await fireN8n('wf-03-impact-receipt', { listingId: id, impact, certificateUrl: cert.url }); await completeWebhook(req); return res.status(200).json({ ok: true, dispatched: result.ok }); } catch (error) { await completeWebhook(req, 'failed', 'pickup_completed_failed'); return next(error); } });
module.exports = router;
