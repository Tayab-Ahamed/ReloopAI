// ReLoop AI — API server
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/Database');

const app = express();

const ALLOWED = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',').map((s) => s.trim()).filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED.includes('*') || ALLOWED.includes(origin)) return cb(null, origin);
    return cb(null, ALLOWED[0] || false);
  },
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-reloop-secret'],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// ---- Public utilities ---------------------------------------------------

// Google Maps nearby-places proxy (keeps the API key server-side)
app.get('/api/nearby-places', async (req, res) => {
  const { lat, lng, radius, type } = req.query;
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return res.status(501).json({ error: 'GOOGLE_MAPS_API_KEY not configured' });
  try {
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
      + `?location=${lat},${lng}&radius=${radius}&type=${type}&key=${key}`;
    const r = await axios.get(url);
    res.json(r.data);
  } catch (e) {
    console.error('nearby-places error', e.message);
    res.status(500).json({ error: 'nearby_places_failed' });
  }
});

// ---- DB -----------------------------------------------------------------
connectDB().catch((e) => console.error('[reloop] connectDB threw:', e.message));

// ---- Routes -------------------------------------------------------------
const authRoutes     = require('./routes/auth');
const userRoutes     = require('./routes/user');
const ngoRoutes      = require('./routes/Ngo');
const donationRoutes = require('./routes/donation');
const contactRoutes  = require('./routes/ContactUs');
const uploadRoutes   = require('./routes/upload');
const feedBackRoutes = require('./routes/feedback');
const faqRoutes      = require('./routes/faq');

const aiRoutes       = require('./routes/ai');
const webhookRoutes  = require('./routes/webhooks');

app.use('/api/auth', authRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/user', contactRoutes);
app.use('/api/faq', faqRoutes);
app.use('/user', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/feedback/user', feedBackRoutes);

// ReLoop AI additions
app.use('/api/ai', aiRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/api/health', (_req, res) => res.json({
  ok: true, service: 'reloop-ai', time: new Date().toISOString(),
}));

app.get('/api/donation/test', (_req, res) => res.json({ message: 'Donation routes are working' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[reloop] API listening on :${PORT}`));
