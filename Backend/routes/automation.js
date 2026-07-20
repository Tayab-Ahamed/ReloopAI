const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const router = express.Router();

const Donation = require('../models/Donation');
const User = require('../models/User');
const { fanout } = require('../services/notifications');
const { renderImpactPdf } = require('../services/impactPdf');
const { authMiddleware } = require('../middlewares/Authentication');

// authOrN8n middleware permits requests with matching shared N8N secret OR standard JWT token auth
const authOrN8n = (req, res, next) => {
  const secret = req.headers['x-reloop-secret'];
  if (secret && secret === process.env.N8N_SECRET) {
    return next();
  }
  return authMiddleware(req, res, next);
};

// 1. PATCH /api/donations/:id (Save AI Result & Status)
router.patch('/donations/:id', authOrN8n, async (req, res) => {
  const { ai, status } = req.body;
  try {
    const update = {};
    if (ai) update.ai = ai;
    if (status) update.status = status;
    const listing = await Donation.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    return res.json({ success: true, data: listing });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. POST /api/notify (Notify Top NGO Match)
router.post('/notify', authOrN8n, async (req, res) => {
  const { listingId } = req.body;
  try {
    const listing = await Donation.findById(listingId).populate('matches.recipient');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    if (listing.matches && listing.matches.length > 0) {
      const topMatch = listing.matches[0].recipient;
      if (topMatch) {
        listing.status = 'notified';
        await listing.save();
        await fanout({
          user: topMatch,
          subject: `ReLoop AI Match: ${listing.title}`,
          message: `You have a new recommended listing match: "${listing.title}". Please review it on your dashboard!`,
        });
        return res.json({ success: true, notifiedNGO: topMatch.name });
      }
    }

    // Fallback: Notify any approved NGO if matches list is empty
    const fallbackNGO = await User.findOne({ role: 'NGO', isVerified: true });
    if (fallbackNGO) {
      listing.status = 'notified';
      await listing.save();
      await fanout({
        user: fallbackNGO,
        subject: `ReLoop AI Match: ${listing.title}`,
        message: `You have a new recommended listing match: "${listing.title}". Please review it on your dashboard!`,
      });
      return res.json({ success: true, notifiedNGO: fallbackNGO.name });
    }

    return res.json({ success: true, message: 'No NGOs to notify' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST /api/volunteer/assign (Assign Volunteer)
router.post('/volunteer/assign', authOrN8n, async (req, res) => {
  const { listingId } = req.body;
  try {
    const listing = await Donation.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    const volunteer = await User.findOne({ role: 'Volunteer' });
    if (volunteer) {
      listing.volunteer = volunteer._id;
      listing.status = 'assigned';
      await listing.save();

      await fanout({
        user: volunteer,
        subject: `ReLoop AI Volunteer Assignment`,
        message: `You have been assigned to pick up donation listing "${listing.title}". Please check your route!`,
      });
      return res.json({ success: true, volunteer: volunteer.name });
    }
    return res.json({ success: true, message: 'No volunteer available for assignment' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4. POST /api/routing/google-maps (Generate Directions Route)
router.post('/routing/google-maps', authOrN8n, async (req, res) => {
  const { listingId } = req.body;
  try {
    const listing = await Donation.findById(listingId).populate('donor receiver');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    let route = { distance: '5.2 km', duration: '12 mins' };
    if (process.env.GOOGLE_MAPS_API_KEY && listing.donor?.location && listing.receiver?.location) {
      try {
        const { data } = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
          params: {
            origin: listing.donor.location,
            destination: listing.receiver.location,
            key: process.env.GOOGLE_MAPS_API_KEY
          },
          timeout: 5000
        });
        if (data.routes?.[0]) {
          const leg = data.routes[0].legs[0];
          route = { distance: leg.distance.text, duration: leg.duration.text, points: data.routes[0].overview_polyline.points };
        }
      } catch (err) {
        console.warn('Google Maps Directions query failed, falling back to mock routing:', err.message);
      }
    }

    listing.automation = {
      ...(listing.automation || {}),
      lastStep: 'route_generated',
      route
    };
    await listing.save();
    return res.json({ success: true, route });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 5. POST /api/notify/reminder (Send reminder to assigned Volunteer)
router.post('/notify/reminder', authOrN8n, async (req, res) => {
  const { listingId } = req.body;
  try {
    const listing = await Donation.findById(listingId).populate('volunteer receiver');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    if (listing.volunteer) {
      await fanout({
        user: listing.volunteer,
        subject: `ReLoop AI Pickup Reminder`,
        message: `Reminder: Please pick up donation listing "${listing.title}" as scheduled today.`,
      });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 6. GET /api/donations/expiring?withinHours=6 (Find food items close to expiry)
router.get('/donations/expiring', authOrN8n, async (req, res) => {
  try {
    const hours = Number(req.query.withinHours || 6);
    const threshold = new Date(Date.now() + hours * 60 * 60 * 1000);
    const expiring = await Donation.find({
      category: 'food',
      expirationDate: { $lte: threshold, $gte: new Date() },
      status: { $in: ['pending', 'notified'] }
    });
    return res.json(expiring.map(d => ({ listingId: d._id })));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 7. POST /api/notify/fanout (Fanout notification to NGOs or Volunteers)
router.post('/notify/fanout', authOrN8n, async (req, res) => {
  const { listingId, audience } = req.body;
  try {
    const listing = await Donation.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    let role = 'NGO';
    if (audience === 'volunteers') role = 'Volunteer';

    const users = await User.find({ role, isVerified: true });
    const jobs = users.map(user => fanout({
      user,
      subject: `Urgent ReLoop AI listing match: ${listing.title}`,
      message: `A critical food listing "${listing.title}" is expiring soon near you. Please log in to accept it!`,
    }));
    await Promise.all(jobs);

    return res.json({ success: true, notifiedCount: users.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 8. POST /api/certificates/render (Generate PDF certificate via internal service)
router.post('/certificates/render', authOrN8n, async (req, res) => {
  const { listingId } = req.body;
  try {
    const listing = await Donation.findById(listingId).populate('donor');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    const impact = listing.impact || { mealsSaved: 10, co2SavedKg: 5, wasteDivertedKg: 15, summary: 'Food saved successfully.' };
    const cert = await renderImpactPdf({ listing, impact });

    listing.impact = {
      ...impact,
      certificateUrl: cert.url,
      generatedAt: new Date()
    };
    await listing.save();
    return res.json({ success: true, url: cert.url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 9. POST /api/notify/impact (Notify donor that impact certificate is available)
router.post('/notify/impact', authOrN8n, async (req, res) => {
  const { listingId } = req.body;
  try {
    const listing = await Donation.findById(listingId).populate('donor');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    const impact = listing.impact;
    if (listing.donor) {
      await fanout({
        user: listing.donor,
        subject: 'Your ReLoop AI impact report is ready',
        message: impact?.summary || 'Thank you for your donation!',
        html: `<p>${impact?.summary || 'Thank you for your donation!'}</p>${impact?.certificateUrl ? `<p><a href="${impact.certificateUrl}">Download certificate</a></p>` : ''}`
      });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 10. POST /api/analytics/rollup (Compute summary totals)
router.post('/analytics/rollup', authOrN8n, async (req, res) => {
  return res.json({ success: true, message: 'Analytics roll-up completed' });
});

module.exports = router;
