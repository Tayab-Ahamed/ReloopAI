// Impact PDF stub — wire to a real generator (pdfkit, puppeteer, or n8n) when deploying.
// Kept dependency-free so the app boots even without the generator installed.
async function renderImpactPdf({ listing, impact }) {
  // In production, generate a PDF and upload to R2/S3, then return the public URL.
  // For now, return a deterministic placeholder URL derived from the listing id.
  const id = String(listing?._id || listing?.id || Date.now());
  return { url: `${process.env.PUBLIC_ASSET_BASE || ''}/certificates/${id}.pdf`, format: 'placeholder' };
}

module.exports = { renderImpactPdf };
