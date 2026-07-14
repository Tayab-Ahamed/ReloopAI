// Vision AI — detect item, condition, and quantity from an image URL.
// Provider-agnostic: reads AI_PROVIDER from env and delegates.
// Providers currently supported: 'groq', 'openai', 'huggingface', 'mock' (default).
const axios = require('axios');

async function analyzeImage({ imageUrl, hints = {} }) {
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();

  if (provider === 'groq' && process.env.GROQ_API_KEY) {
    return analyzeWithGroq({ imageUrl, hints });
  }
  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    return analyzeWithOpenAI({ imageUrl, hints });
  }
  if (provider === 'huggingface' && process.env.HF_TOKEN) {
    return analyzeWithHF({ imageUrl });
  }
  return analyzeMock({ imageUrl, hints });
}

async function analyzeWithGroq({ imageUrl, hints }) {
  const model = process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview';
  const prompt = [
    'You are ReLoop AI vision. Look at the image and return strict JSON with keys:',
    'itemDetected (string), category (one of food, electronics, furniture, books, clothes, medical, recyclables),',
    'condition (fresh|sealed|used_good|used_fair|damaged|unknown),',
    'quantityEstimate (number), quantityUnit (kg|unit|box|liter), confidence (0..1).',
    hints && hints.category ? `Hint: donor selected "${hints.category}".` : '',
  ].filter(Boolean).join(' ');

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

  const raw = data?.choices?.[0]?.message?.content || '{}';
  const parsed = safeJson(raw);
  return {
    itemDetected:     parsed.itemDetected  || 'Unknown item',
    category:         parsed.category      || 'food',
    condition:        parsed.condition     || 'unknown',
    quantityEstimate: Number(parsed.quantityEstimate) || 0,
    quantityUnit:     parsed.quantityUnit  || 'unit',
    confidence:       Number(parsed.confidence) || 0.7,
    visionModel:      model,
  };
}

async function analyzeWithOpenAI({ imageUrl, hints }) {
  const model = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';
  const prompt = [
    'You are ReLoop AI vision. Look at the image and return strict JSON with keys:',
    'itemDetected (string), category (one of food, electronics, furniture, books, clothes, medical, recyclables),',
    'condition (fresh|sealed|used_good|used_fair|damaged|unknown),',
    'quantityEstimate (number), quantityUnit (kg|unit|box|liter), confidence (0..1).',
    hints && hints.category ? `Hint: donor selected "${hints.category}".` : '',
  ].filter(Boolean).join(' ');

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

  const raw = data?.choices?.[0]?.message?.content || '{}';
  const parsed = safeJson(raw);
  return {
    itemDetected:     parsed.itemDetected  || 'Unknown item',
    category:         parsed.category      || 'food',
    condition:        parsed.condition     || 'unknown',
    quantityEstimate: Number(parsed.quantityEstimate) || 0,
    quantityUnit:     parsed.quantityUnit  || 'unit',
    confidence:       Number(parsed.confidence) || 0.7,
    visionModel:      model,
  };
}

async function analyzeWithHF({ imageUrl }) {
  const model = process.env.HF_VISION_MODEL || 'google/vit-base-patch16-224';
  const image = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const { data } = await axios.post(
    `https://api-inference.huggingface.co/models/${model}`,
    image.data,
    { headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, 'Content-Type': 'application/octet-stream' } }
  );
  const top = Array.isArray(data) && data[0] ? data[0] : {};
  return {
    itemDetected:     top.label || 'Unknown item',
    category:         'food',
    condition:        'unknown',
    quantityEstimate: 1,
    quantityUnit:     'unit',
    confidence:       Number(top.score) || 0.5,
    visionModel:      model,
  };
}

function analyzeMock({ hints = {} }) {
  const categories = ['food', 'electronics', 'furniture', 'books', 'clothes', 'medical', 'recyclables'];
  const cat = hints.category || categories[Math.floor(Math.random() * categories.length)];
  
  const mockNames = {
    food: 'Mixed Organic Meals',
    electronics: 'Dell Inspiron Laptop',
    furniture: 'Ergonomic Office Chair',
    books: 'High School Chemistry Textbooks',
    clothes: 'Winter Coats and Jackets',
    medical: 'Surgical Masks & Gloves',
    recyclables: 'PET Plastic Containers',
  };

  return {
    itemDetected:     mockNames[cat] || `Sample ${cat} item`,
    category:         cat,
    condition:        cat === 'food' ? 'fresh' : 'used_good',
    quantityEstimate: cat === 'food' ? 5 : 2,
    quantityUnit:     cat === 'food' ? 'kg' : 'unit',
    confidence:       0.91,
    visionModel:      'mock/reloop-vision-v1',
  };
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }

module.exports = { analyzeImage };
