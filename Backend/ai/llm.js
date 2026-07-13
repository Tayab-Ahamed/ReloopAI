// LLM — auto-generate listing title, description, category and instructions.
const axios = require('axios');

async function generateListing({ vision, ocr }) {
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  if (provider === 'groq' && process.env.GROQ_API_KEY) return llmGroq({ vision, ocr });
  if (provider === 'openai' && process.env.OPENAI_API_KEY) return llmOpenAI({ vision, ocr });
  return llmMock({ vision, ocr });
}

async function generateImpactReport({ listing }) {
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  if (provider === 'groq' && process.env.GROQ_API_KEY) return impactGroq({ listing });
  if (provider === 'openai' && process.env.OPENAI_API_KEY) return impactOpenAI({ listing });
  return impactMock({ listing });
}

async function llmGroq({ vision, ocr }) {
  const model = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile';
  const sys = 'You are ReLoop AI. Convert vision + OCR signals into a short, action-oriented donation listing. Return strict JSON: { title, description, category, donationInstructions }.';
  const user = `Vision: ${JSON.stringify(vision)}\nOCR: ${JSON.stringify(ocr)}`;
  const { data } = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }]
    },
    { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
  );
  const parsed = safeJson(data?.choices?.[0]?.message?.content || '{}');
  return {
    title:                parsed.title                || 'Untitled listing',
    description:          parsed.description          || '',
    category:             parsed.category             || vision?.category || 'food',
    donationInstructions: parsed.donationInstructions || 'Please handle with care.',
    llmModel:             model,
  };
}

async function llmOpenAI({ vision, ocr }) {
  const model = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';
  const sys = 'You are ReLoop AI. Convert vision + OCR signals into a short, action-oriented donation listing. Return strict JSON: { title, description, category, donationInstructions }.';
  const user = `Vision: ${JSON.stringify(vision)}\nOCR: ${JSON.stringify(ocr)}`;
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    { model, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
  );
  const parsed = safeJson(data?.choices?.[0]?.message?.content || '{}');
  return {
    title:                parsed.title                || 'Untitled listing',
    description:          parsed.description          || '',
    category:             parsed.category             || vision?.category || 'food',
    donationInstructions: parsed.donationInstructions || 'Please handle with care.',
    llmModel:             model,
  };
}

function llmMock({ vision, ocr }) {
  const item = vision?.itemDetected || 'Surplus item';
  const qty  = vision?.quantityEstimate ? `${vision.quantityEstimate} ${vision.quantityUnit || 'unit'}` : '';
  const exp  = ocr?.expiry ? `Best before ${new Date(ocr.expiry).toLocaleString()}. ` : '';
  return {
    title: `${qty ? qty + ' — ' : ''}${item}`.trim(),
    description: `${item} in ${vision?.condition || 'good'} condition. ${exp}Category: ${vision?.category || 'food'}.`,
    category: vision?.category || 'food',
    donationInstructions: (vision?.category === 'food')
      ? 'Refrigerate on arrival. Consume within listed window.'
      : 'Inspect before use. Recyclables must be routed to certified partners.',
    llmModel: 'mock/reloop-llm-v1',
  };
}

async function impactGroq({ listing }) {
  const model = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile';
  const sys = 'You are ReLoop AI. Produce a short impact report as strict JSON with keys mealsSaved, co2SavedKg, wasteDivertedKg (numbers) and summary (one sentence, <= 30 words).';
  const user = JSON.stringify({
    category: listing.category,
    quantity: listing.ai?.quantityEstimate,
    unit:     listing.ai?.quantityUnit,
  });
  const { data } = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }]
    },
    { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
  );
  const p = safeJson(data?.choices?.[0]?.message?.content || '{}');
  return normaliseImpact(p, listing);
}

async function impactOpenAI({ listing }) {
  const model = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';
  const sys = 'You are ReLoop AI. Produce a short impact report as strict JSON with keys mealsSaved, co2SavedKg, wasteDivertedKg (numbers) and summary (one sentence, <= 30 words).';
  const user = JSON.stringify({
    category: listing.category,
    quantity: listing.ai?.quantityEstimate,
    unit:     listing.ai?.quantityUnit,
  });
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    { model, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
  );
  const p = safeJson(data?.choices?.[0]?.message?.content || '{}');
  return normaliseImpact(p, listing);
}

function impactMock({ listing }) {
  return normaliseImpact({}, listing);
}

// Deterministic baseline used by mock and to backfill LLM gaps
function normaliseImpact(p, listing) {
  const qty  = Number(listing?.ai?.quantityEstimate || 1);
  const cat  = listing?.category || 'food';
  const co2Factor  = { food: 2.5, electronics: 12, furniture: 3.5, books: 1.2, clothes: 6, medical: 4, recyclables: 1.5 }[cat] || 2;
  const mealsFactor = cat === 'food' ? 2.4 : 0; // 1 kg cooked food ~= 2.4 meals
  return {
    mealsSaved:      Number.isFinite(p.mealsSaved)      ? p.mealsSaved      : Math.round(qty * mealsFactor),
    co2SavedKg:      Number.isFinite(p.co2SavedKg)      ? p.co2SavedKg      : Number((qty * co2Factor).toFixed(1)),
    wasteDivertedKg: Number.isFinite(p.wasteDivertedKg) ? p.wasteDivertedKg : Number(qty.toFixed(1)),
    summary: p.summary || `This donation saved approximately ${Math.round(qty * mealsFactor) || 0} meals, prevented ~${(qty * co2Factor).toFixed(1)} kg of CO₂ emissions, and diverted ${qty.toFixed(1)} kg of ${cat} waste from landfills.`,
  };
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }

module.exports = { generateListing, generateImpactReport };
