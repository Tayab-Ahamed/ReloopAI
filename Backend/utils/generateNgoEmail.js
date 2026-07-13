// ReLoop AI — recipient (NGO/Recycler) notification email
function generateNGOEmail(donorDetails, donationDetails) {
  const category   = donationDetails.category || donationDetails.foodType || 'resource';
  const qty        = donationDetails.quantity != null ? `${donationDetails.quantity}` : (donationDetails?.ai?.quantityEstimate || '—');
  const unit       = donationDetails.quantityUnit || donationDetails?.ai?.quantityUnit || '';
  const expiry     = donationDetails.expirationDate ? new Date(donationDetails.expirationDate).toLocaleString() : 'n/a';
  const pickupLoc  = donationDetails.pickupLocation || '—';
  const title      = donationDetails.title || 'New surplus listing';
  const description= donationDetails.description || '';

  const subject = `♻️ ReLoop AI — New ${category} listing matched to you`;

  const text = `Hello,

ReLoop AI matched a new listing to your organisation.

Listing
- Title: ${title}
- Category: ${category}
- Quantity: ${qty} ${unit}
- Expiry / best-before: ${expiry}
- Pickup: ${pickupLoc}

Donor
- Name: ${donorDetails.name}
- Email: ${donorDetails.email}

Accept the listing in your dashboard to trigger the automated pickup workflow.

— The ReLoop AI team`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" /><title>${subject}</title></head>
<body style="margin:0;background:#0B0B14;font-family:Inter,Arial,sans-serif;color:#E8E8F0;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="padding:28px;border-radius:16px;background:linear-gradient(180deg,#111121,#0F0F1E);border:1px solid rgba(255,255,255,0.06);">
    <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:linear-gradient(90deg,#7C5CFF,#22D3B1);color:#fff;font-size:12px;letter-spacing:.14em;text-transform:uppercase;">New match</div>
    <h1 style="margin:18px 0 8px;font-size:22px;font-weight:600;color:#fff;">${title}</h1>
    <p style="margin:0 0 16px;color:#B8B8CC;line-height:1.6;">${description}</p>
    <table style="width:100%;border-collapse:collapse;color:#B8B8CC;font-size:14px;line-height:1.7;">
      <tr><td style="padding:6px 0;color:#8E8EA8;">Category</td><td style="padding:6px 0;color:#fff;text-transform:capitalize;">${category}</td></tr>
      <tr><td style="padding:6px 0;color:#8E8EA8;">Quantity</td><td style="padding:6px 0;color:#fff;">${qty} ${unit}</td></tr>
      <tr><td style="padding:6px 0;color:#8E8EA8;">Expires</td><td style="padding:6px 0;color:#fff;">${expiry}</td></tr>
      <tr><td style="padding:6px 0;color:#8E8EA8;">Pickup</td><td style="padding:6px 0;color:#fff;">${pickupLoc}</td></tr>
      <tr><td style="padding:6px 0;color:#8E8EA8;">Donor</td><td style="padding:6px 0;color:#fff;">${donorDetails.name} — ${donorDetails.email}</td></tr>
    </table>
    <a href="${process.env.PUBLIC_APP_URL || '#'}" style="display:inline-block;margin-top:20px;padding:12px 18px;border-radius:10px;background:linear-gradient(90deg,#7C5CFF,#22D3B1);color:#fff;text-decoration:none;font-weight:600;">Review in dashboard</a>
  </div>
  <p style="margin:16px 0 0;text-align:center;color:#6B6B85;font-size:12px;">© ${new Date().getFullYear()} ReLoop AI</p>
</div>
</body></html>`;

  return { subject, text, html };
}

module.exports = { generateNGOEmail };
