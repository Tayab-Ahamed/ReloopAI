const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./config/Database');
const { securityHeaders, rateLimit } = require('./middlewares/security');
const { authMiddleware } = require('./middlewares/Authentication');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((value) => value.trim()).filter(Boolean);
app.use(cors({ origin(origin, cb) { if (!origin || origins.includes(origin)) return cb(null, true); return cb(new Error('Origin is not allowed by CORS')); }, credentials: true, methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-reloop-secret', 'x-reloop-event-id', 'x-reloop-timestamp', 'x-reloop-signature'] }));
app.use(securityHeaders, cookieParser());
app.use(express.json({ limit: '7mb', verify(req, _res, buffer) { req.rawBody = Buffer.from(buffer); } }));
app.use(express.urlencoded({ limit: '100kb', extended: false, parameterLimit: 1000 }));

app.get('/api/nearby-places', authMiddleware, rateLimit({ windowMs: 60e3, max: 30, keyPrefix: 'places' }), async (req, res) => {
  const lat = Number(req.query.lat), lng = Number(req.query.lng), radius = Number(req.query.radius || 5000), type = typeof req.query.type === 'string' ? req.query.type : 'food';
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180 || !Number.isFinite(radius) || radius < 1 || radius > 50000 || !/^[a-z_]{2,40}$/.test(type)) return res.status(400).json({ success: false, message: 'Place query is invalid' });
  if (!process.env.GOOGLE_MAPS_API_KEY) return res.status(503).json({ success: false, message: 'Places service is unavailable' });
  try { const { data } = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', { params: { location: `${lat},${lng}`, radius, type, key: process.env.GOOGLE_MAPS_API_KEY }, timeout: 5000 }); return res.json(data); }
  catch (_error) { return res.status(502).json({ success: false, message: 'Places service is unavailable' }); }
});

connectDB().catch((error) => console.error('[reloop] database connection failed:', error.message));
app.use('/api/auth', rateLimit({ windowMs: 60e3, max: 20, keyPrefix: 'auth' }), require('./routes/auth'));
app.use('/api/ngos', require('./routes/Ngo')); app.use('/user', require('./routes/ContactUs')); app.use('/api/faq', require('./routes/faq')); app.use('/user', require('./routes/user')); app.use('/api/donations', require('./routes/donation')); app.use('/api/upload', require('./routes/upload')); app.use('/feedback/user', require('./routes/feedback')); app.use('/api/ai', require('./routes/ai')); app.use('/api/webhooks', require('./routes/webhooks'));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'reloop-ai', time: new Date().toISOString() }));
app.use((error, _req, res, _next) => { if (error?.type === 'entity.too.large') return res.status(413).json({ success: false, message: 'Request is too large' }); if (error?.message === 'Origin is not allowed by CORS') return res.status(403).json({ success: false, message: 'Origin is not allowed' }); return res.status(500).json({ success: false, message: 'Unexpected server error' }); });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[reloop] API listening on :${PORT}`));
