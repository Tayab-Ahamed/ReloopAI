// AI Matching — score recipients on distance, urgency, storage, category, availability.
const calculateDistance = require('../utils/calculateDistance');

const DEFAULT_WEIGHTS = {
  distance:     0.30,
  urgency:      0.25,
  category:     0.20,
  storage:      0.15,
  availability: 0.10,
};

function hoursUntilExpiry(listing) {
  const d = listing?.ai?.detectedExpiry || listing?.expirationDate;
  if (!d) return 72;
  return Math.max(0, (new Date(d).getTime() - Date.now()) / 36e5);
}

function distanceScore(km) {
  if (km == null) return 50;
  if (km <= 1)  return 100;
  if (km <= 3)  return 90;
  if (km <= 5)  return 75;
  if (km <= 10) return 55;
  if (km <= 20) return 30;
  return 10;
}

function urgencyScore(listing) {
  const h = hoursUntilExpiry(listing);
  if (listing.category !== 'food') return 60;
  if (h <= 2)  return 100;
  if (h <= 6)  return 90;
  if (h <= 24) return 65;
  if (h <= 48) return 40;
  return 20;
}

function categoryScore(recipient, listing) {
  if (!recipient.acceptedCategories || !recipient.acceptedCategories.length) return 60;
  return recipient.acceptedCategories.includes(listing.category) ? 100 : 5;
}

function storageScore(recipient, listing) {
  const need = Number(listing?.ai?.quantityEstimate || listing?.quantity || 1);
  const cap  = Number(recipient.storageCapacity || 0);
  if (!cap) return 50;
  return Math.max(10, Math.min(100, Math.round((cap / Math.max(need, 1)) * 25)));
}

function availabilityScore(recipient) {
  switch (recipient.pickupAvailability) {
    case '24x7':           return 100;
    case 'daytime':        return 80;
    case 'business_hours': return 60;
    case 'weekends':       return 40;
    default:               return 50;
  }
}

function rankRecipients({ listing, recipients }) {
  const results = recipients.map((r) => {
    let km = null;
    if (listing.pickupCoords && r.coords) {
      km = calculateDistance(
        listing.pickupCoords.lat, listing.pickupCoords.lng,
        r.coords.lat, r.coords.lng,
      );
    }
    const d = distanceScore(km);
    const u = urgencyScore(listing);
    const c = categoryScore(r, listing);
    const s = storageScore(r, listing);
    const a = availabilityScore(r);

    const w = DEFAULT_WEIGHTS;
    const score = Math.round(
      d * w.distance + u * w.urgency + c * w.category + s * w.storage + a * w.availability
    );

    return {
      recipient:         r._id,
      recipientName:     r.name,
      score,
      distanceKm:        km == null ? null : Number(km.toFixed(2)),
      urgencyScore:      u,
      storageScore:      s,
      categoryMatch:     c,
      availabilityScore: a,
      reason: buildReason({ d, u, c, s, a }),
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

function buildReason({ d, u, c, s, a }) {
  const parts = [];
  if (d >= 75) parts.push('close by');
  if (u >= 80) parts.push('time-sensitive');
  if (c >= 90) parts.push('category match');
  if (s >= 70) parts.push('enough storage');
  if (a >= 80) parts.push('available now');
  return parts.length ? parts.join(', ') : 'best available fit';
}

module.exports = { rankRecipients };
