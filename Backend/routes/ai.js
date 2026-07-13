// AI routes — vision, OCR, LLM, matching.
const express = require('express');
const router = express.Router();

const vision   = require('../ai/vision');
const ocr      = require('../ai/ocr');
const llm      = require('../ai/llm');
const matching = require('../ai/matching');

const User     = require('../models/User');
const Listing  = require('../models/Donation');

// POST /api/ai/analyze  { imageUrl, hints? }
router.post('/analyze', async (req, res) => {
  try {
    const { imageUrl, hints } = req.body || {};
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' });

    const [visionOut, ocrOut] = await Promise.all([
      vision.analyzeImage({ imageUrl, hints }),
      ocr.extractText({ imageUrl }),
    ]);
    const listing = await llm.generateListing({ vision: visionOut, ocr: ocrOut });

    return res.json({
      vision:  visionOut,
      ocr:     ocrOut,
      listing,
      confidence: visionOut.confidence,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[ai/analyze]', e.message);
    return res.status(500).json({ error: 'analyze_failed', detail: e.message });
  }
});

// POST /api/ai/match  { listingId }
router.post('/match', async (req, res) => {
  try {
    const { listingId } = req.body || {};
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'listing_not_found' });

    const filter = { role: { $in: ['NGO', 'Recycler'] }, isVerified: true };
    const recipients = await User.find(filter).limit(200);
    const ranked = matching.rankRecipients({ listing, recipients });

    listing.matches = ranked.slice(0, 10).map(({ recipientName, ...m }) => m);
    await listing.save();
    return res.json({ matches: ranked.slice(0, 10) });
  } catch (e) {
    console.error('[ai/match]', e.message);
    return res.status(500).json({ error: 'match_failed', detail: e.message });
  }
});

// POST /api/ai/impact  { listingId }
router.post('/impact', async (req, res) => {
  try {
    const { listingId } = req.body || {};
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'listing_not_found' });
    const impact = await llm.generateImpactReport({ listing });
    listing.impact = { ...impact, generatedAt: new Date() };
    await listing.save();
    return res.json({ impact });
  } catch (e) {
    console.error('[ai/impact]', e.message);
    return res.status(500).json({ error: 'impact_failed', detail: e.message });
  }
});

module.exports = router;
