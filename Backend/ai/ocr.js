// OCR — read expiry dates, labels, and product names from packaging.
// Providers: 'groq' (vision-as-OCR), 'openai' (vision-as-OCR), 'google' (Cloud Vision), 'mock' (default).
const axios = require('axios');

async function extractText({ imageUrl }) {
  const provider = (process.env.OCR_PROVIDER || 'mock').toLowerCase();
  if (provider === 'mock' && process.env.NODE_ENV === 'production') {
    throw new Error('A production OCR provider must be configured');
  }
  if (provider === 'groq' && process.env.GROQ_API_KEY) return ocrGroq({ imageUrl });
  if (provider === 'openai' && process.env.OPENAI_API_KEY) return ocrOpenAI({ imageUrl });
  if (provider === 'google' && process.env.GOOGLE_VISION_KEY) return ocrGoogle({ imageUrl });
  return ocrMock({ imageUrl });
}

async function ocrGroq({ imageUrl }) {
  const model = process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview';
  const prompt = 'Extract all visible text from this product packaging. Return strict JSON: { "text": string, "productName": string, "expiry": ISO8601 or null, "batch": string or null }.';
  const { data } = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      }],
    },
    { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
  );
  const parsed = safeJson(data?.choices?.[0]?.message?.content || '{}');
  return {
    text:        parsed.text || '',
    productName: parsed.productName || null,
    expiry:      parsed.expiry ? new Date(parsed.expiry) : null,
    batch:       parsed.batch || null,
    ocrModel:    model,
  };
}

async function ocrOpenAI({ imageUrl }) {
  const model = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';
  const prompt = 'Extract all visible text from this product packaging. Return strict JSON: { "text": string, "productName": string, "expiry": ISO8601 or null, "batch": string or null }.';
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      }],
    },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
  );
  const parsed = safeJson(data?.choices?.[0]?.message?.content || '{}');
  return {
    text:        parsed.text || '',
    productName: parsed.productName || null,
    expiry:      parsed.expiry ? new Date(parsed.expiry) : null,
    batch:       parsed.batch || null,
    ocrModel:    model,
  };
}

async function ocrGoogle({ imageUrl }) {
  const img = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const base64 = Buffer.from(img.data).toString('base64');
  const { data } = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_KEY}`,
    { requests: [{ image: { content: base64 }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] }] }
  );
  const text = data?.responses?.[0]?.fullTextAnnotation?.text || '';
  return { text, productName: null, expiry: parseFirstDate(text), batch: null, ocrModel: 'google-vision' };
}

function ocrMock() {
  const inSix = new Date(Date.now() + 6 * 60 * 60 * 1000);
  return {
    text: 'Amul Taaza UHT Milk\nBest before ' + inSix.toDateString() + '\nBatch BX-2481',
    productName: 'Amul Taaza UHT Milk',
    expiry: inSix,
    batch: 'BX-2481',
    ocrModel: 'mock/reloop-ocr-v1',
  };
}

function parseFirstDate(text) {
  const m = text.match(/(20\d{2}-\d{2}-\d{2}|\d{1,2}[\/\-.]\d{1,2}[\/\-.]20\d{2})/);
  return m ? new Date(m[1]) : null;
}
function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }

module.exports = { extractText };
