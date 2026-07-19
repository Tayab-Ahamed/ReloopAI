const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const vision = require('../ai/vision');
const ocr = require('../ai/ocr');
const llm = require('../ai/llm');
const matching = require('../ai/matching');
const User = require('../models/User');
const Listing = require('../models/Donation');
const { authMiddleware, requireRoles } = require('../middlewares/Authentication');
const { rateLimit, noStore, validateSafeImageUrl } = require('../middlewares/security');

const text = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
const validId = (value) => typeof value === 'string' && mongoose.isValidObjectId(value);
const canAccess = (listing, user) => user.role === 'Admin' || String(listing.donor) === user.id || String(listing.receiver || '') === user.id;

router.use(authMiddleware, noStore, rateLimit({ windowMs: 60 * 1000, max: 20, keyPrefix: 'ai' }));

router.post('/analyze', requireRoles('Donor', 'NGO', 'Admin'), async (req, res) => {
  try {
    const imageUrl = await validateSafeImageUrl(req.body?.imageUrl);
    const hints = { category: text(req.body?.hints?.category, 32) };
    const [visionOut, ocrOut] = await Promise.all([vision.analyzeImage({ imageUrl, hints }), ocr.extractText({ imageUrl })]);
    const listing = await llm.generateListing({ vision: visionOut, ocr: ocrOut });
    return res.json({ vision: visionOut, ocr: ocrOut, listing, confidence: visionOut.confidence, generatedAt: new Date().toISOString() });
  } catch (error) {
    const status = /Image URL/.test(error.message) ? 400 : 502;
    return res.status(status).json({ success: false, message: status === 400 ? error.message : 'Image analysis is unavailable' });
  }
});

router.post('/match', requireRoles('Donor', 'Admin'), async (req, res) => {
  try {
    const listingId = req.body?.listingId;
    if (!validId(listingId)) return res.status(400).json({ success: false, message: 'Listing identifier is invalid' });
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (!canAccess(listing, req.user)) return res.status(403).json({ success: false, message: 'You do not have permission to match this listing' });
    const recipients = await User.find({ role: { $in: ['NGO', 'Recycler'] }, isVerified: true, verificationStatus: 'approved' }).select('name coords acceptedCategories storageCapacity pickupAvailability').limit(200);
    const ranked = matching.rankRecipients({ listing, recipients }).slice(0, 10);
    listing.matches = ranked.map(({ recipientName, ...match }) => match);
    await listing.save();
    return res.json({ matches: ranked });
  } catch (_error) { return res.status(502).json({ success: false, message: 'Matching is unavailable' }); }
});

router.post('/impact', requireRoles('Donor', 'NGO', 'Admin'), async (req, res) => {
  try {
    const listingId = req.body?.listingId;
    if (!validId(listingId)) return res.status(400).json({ success: false, message: 'Listing identifier is invalid' });
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (!canAccess(listing, req.user)) return res.status(403).json({ success: false, message: 'You do not have permission to access this listing' });
    if (listing.status !== 'delivered') return res.status(409).json({ success: false, message: 'Impact reports are available after delivery' });
    const impact = await llm.generateImpactReport({ listing });
    listing.impact = { ...impact, generatedAt: new Date() };
    await listing.save();
    return res.json({ impact });
  } catch (_error) { return res.status(502).json({ success: false, message: 'Impact generation is unavailable' }); }
});

router.post('/chat', requireRoles('Donor', 'NGO', 'Volunteer', 'Recycler', 'Admin'), async (req, res) => {
  const message = text(req.body?.message, 2000);
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
  try { return res.json({ reply: await llm.askReLoop({ message }) }); }
  catch (_error) { return res.status(502).json({ success: false, message: 'Assistant is unavailable' }); }
});

module.exports = router;
