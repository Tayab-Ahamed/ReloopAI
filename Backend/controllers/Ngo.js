const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/sendEmail');

const VERIFICATION_STATUSES = new Set(['approved', 'rejected']);

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const ngoResponse = (ngo) => ({
  _id: ngo._id,
  name: ngo.name,
  email: ngo.email,
  phone: ngo.phone,
  location: ngo.location,
  registrationNumber: ngo.registrationNumber,
  isVerified: ngo.isVerified,
  verificationStatus: ngo.verificationStatus || (ngo.isVerified ? 'approved' : 'pending'),
  createdAt: ngo.createdAt,
});

const getPendingNgos = async (_req, res) => {
  try {
    const ngos = await User.find({
      role: 'NGO',
      isVerified: false,
      $or: [
        { verificationStatus: 'pending' },
        { verificationStatus: { $exists: false } },
      ],
    }).select('name email phone location registrationNumber isVerified verificationStatus createdAt');

    return res.status(200).json({
      ngos: ngos.map(ngoResponse),
      pendingNgosCount: ngos.length,
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Unable to load pending NGOs' });
  }
};

const getTotalNgos = async (_req, res) => {
  try {
    const totalNgos = await User.countDocuments({ role: 'NGO' });
    return res.status(200).json({ totalNgos });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Unable to load NGO count' });
  }
};

const getNgoById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid NGO identifier' });
  }

  try {
    const ngo = await User.findOne({ _id: req.params.id, role: 'NGO' });
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }
    return res.status(200).json(ngoResponse(ngo));
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Unable to load NGO' });
  }
};

const updateNgoVerification = async (req, res) => {
  const { status, rejectionReason } = req.body || {};

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid NGO identifier' });
  }
  if (typeof status !== 'string' || !VERIFICATION_STATUSES.has(status)) {
    return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
  }
  if (status === 'rejected' && (typeof rejectionReason !== 'string' || !rejectionReason.trim() || rejectionReason.trim().length > 1000)) {
    return res.status(400).json({ success: false, message: 'A rejection reason between 1 and 1000 characters is required' });
  }

  try {
    const ngo = await User.findOne({ _id: req.params.id, role: 'NGO' });
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }

    const currentStatus = ngo.verificationStatus || (ngo.isVerified ? 'approved' : 'pending');
    if (currentStatus !== 'pending') {
      return res.status(409).json({ success: false, message: 'Only pending NGO applications can be reviewed' });
    }

    ngo.isVerified = status === 'approved';
    ngo.verificationStatus = status;
    ngo.verificationReason = status === 'rejected' ? rejectionReason.trim() : undefined;
    await ngo.save();

    await AuditLog.create({
      actor: req.user.id,
      action: 'ngo.verification.updated',
      targetType: 'User',
      targetId: ngo._id,
      metadata: { from: currentStatus, to: status, rejectionReason: ngo.verificationReason },
    });

    if (status === 'rejected') {
      const safeName = escapeHtml(ngo.name);
      const safeReason = escapeHtml(ngo.verificationReason);
      const subject = 'ReLoop AI NGO application update';
      const text = `Dear ${ngo.name}, your NGO application was not approved. Reason: ${ngo.verificationReason}`;
      const html = `<p>Dear ${safeName},</p><p>Your NGO application was not approved.</p><p><strong>Reason:</strong> ${safeReason}</p>`;
      try {
        await sendEmail(ngo.email, subject, text, html);
      } catch (_emailError) {
        // The review decision and audit record are durable even if a downstream email provider is unavailable.
      }
    }

    return res.status(200).json({
      success: true,
      message: `NGO application ${status}`,
      ngo: ngoResponse(ngo),
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Unable to update NGO verification' });
  }
};

module.exports = {
  getPendingNgos,
  updateNgoVerification,
  getNgoById,
  getTotalNgos,
};
