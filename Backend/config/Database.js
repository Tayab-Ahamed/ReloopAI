const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Patch DNS servers to bypass Node.js DNS SRV resolution bugs on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('[reloop] Failed to set public DNS servers:', e.message);
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri)) {
    console.warn('[reloop] MONGO_URI not set — running in DB-less demo mode. '
      + 'Endpoints that read/write the DB will return 503.');
    return null;
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[reloop] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[reloop] MongoDB connection failed: ${error.message}`);
    console.warn('[reloop] Continuing without DB. Fix MONGO_URI and restart.');
    return null;
  }
};

module.exports = connectDB;