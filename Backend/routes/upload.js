const express = require('express');
const router = express.Router();
const { uploadImageToR2 } = require('../utils/imageupload');
const { authMiddleware, requireRoles } = require('../middlewares/Authentication');
const { rateLimit, noStore } = require('../middlewares/security');

const ALLOWED_FOLDERS = new Set(['donations', 'profiles', 'feedback']);
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
];

function decodeImage(value) {
  if (typeof value !== 'string') throw new Error('Image is required');
  const cleanValue = value.replace(/\s/g, ''); // Strip all whitespace and newlines
  const match = cleanValue.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error('Only JPEG, PNG, or WebP image data is accepted');
  let mimeType = match[1];
  if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > MAX_BYTES) throw new Error('Image must be between 1 byte and 5 MB');
  const signature = TYPES.find((entry) => entry.bytes.every((byte, index) => buffer[index] === byte));
  if (!signature || signature.mime !== mimeType) throw new Error('Image content does not match its declared type');
  return { buffer, contentType: signature.mime };
}

router.post('/', authMiddleware, requireRoles('Donor', 'NGO', 'Volunteer', 'Recycler', 'Admin'), noStore, rateLimit({ windowMs: 60 * 1000, max: 12, keyPrefix: 'upload' }), async (req, res) => {
  try {
    const folder = typeof req.body?.folder === 'string' ? req.body.folder : '';
    if (!ALLOWED_FOLDERS.has(folder)) return res.status(400).json({ success: false, message: 'Upload folder is invalid' });
    const imageUrl = await uploadImageToR2(decodeImage(req.body?.base64Image), folder);
    return res.status(201).json({ success: true, url: imageUrl });
  } catch (error) {
    const status = /required|Only|between|match|invalid/.test(error.message) ? 400 : 503;
    return res.status(status).json({ success: false, message: status === 400 ? error.message : 'Image storage is unavailable' });
  }
});

module.exports = router;
