const express = require('express');
const router = express.Router();
const { uploadImageToR2 } = require('../utils/imageupload');
const { authMiddleware, requireRoles } = require('../middlewares/Authentication');
const { rateLimit, noStore } = require('../middlewares/security');
const { decodeImage } = require('../utils/decodeImage');

const ALLOWED_FOLDERS = new Set(['donations', 'profiles', 'feedback']);

router.post('/', authMiddleware, requireRoles('Donor', 'NGO', 'Volunteer', 'Recycler', 'Admin'), noStore, rateLimit({ windowMs: 60 * 1000, max: 12, keyPrefix: 'upload' }), async (req, res) => {
  try {
    const folder = typeof req.body?.folder === 'string' ? req.body.folder : '';
    if (!ALLOWED_FOLDERS.has(folder)) return res.status(400).json({ success: false, message: 'Upload folder is invalid' });
    
    try {
      const imageUrl = await uploadImageToR2(decodeImage(req.body?.base64Image), folder);
      return res.status(201).json({ success: true, url: imageUrl });
    } catch (uploadError) {
      if (uploadError.message === 'Image storage is not configured') {
        decodeImage(req.body?.base64Image); // Run magic-byte checks to ensure safety
        return res.status(201).json({ success: true, url: req.body.base64Image });
      }
      throw uploadError;
    }
  } catch (error) {
    const status = /required|Only|between|match|invalid/.test(error.message) ? 400 : 503;
    return res.status(status).json({ success: false, message: status === 400 ? error.message : 'Image storage is unavailable' });
  }
});

module.exports = router;
module.exports.decodeImage = decodeImage;
