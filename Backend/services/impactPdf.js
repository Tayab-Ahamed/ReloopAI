const axios = require('axios');

// Delegates certificate rendering to a configured, authenticated document service.
// The service must persist the PDF and return JSON with an HTTPS `url` field.
async function renderImpactPdf({ listing, impact }) {
  const endpoint = process.env.CERTIFICATE_SERVICE_URL;
  const token = process.env.CERTIFICATE_SERVICE_TOKEN;
  
  if (!endpoint || !token) {
    const backendUrl = process.env.BACKEND_URL || 'https://reloop-ai-api.onrender.com';
    const url = `${backendUrl.replace(/\/$/, '')}/api/certificates/${String(listing?._id || listing?.id)}`;
    return { url, format: 'svg' };
  }

  const { data } = await axios.post(endpoint, {
    listingId: String(listing?._id || listing?.id),
    impact,
    donorId: listing?.donor?._id ? String(listing.donor._id) : undefined,
  }, { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 });
  if (!data?.url || typeof data.url !== 'string' || !data.url.startsWith('https://')) throw new Error('Certificate service returned an invalid URL');
  return { url: data.url, format: 'pdf' };
}

module.exports = { renderImpactPdf };
