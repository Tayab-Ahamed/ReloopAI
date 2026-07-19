const crypto = require('crypto');
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const hashOtp = (otp) => crypto.createHmac('sha256', process.env.JWT_SECRET || '').update(otp).digest('hex');
const validId = (value) => typeof value === 'string' && mongoose.isValidObjectId(value);
const CATEGORIES = new Set(['food', 'electronics', 'furniture', 'books', 'clothes', 'medical', 'recyclables']);

async function createDonation(req, res) {
  const body = req.body || {};
  if (!CATEGORIES.has(body.category || 'food') || typeof body.pickupLocation !== 'string' || !body.pickupLocation.trim() || body.pickupLocation.length > 500 || !Number.isFinite(Number(body.quantity)) || Number(body.quantity) <= 0 || Number(body.quantity) > 100000) return res.status(400).json({ success: false, message: 'Donation payload is invalid' });
  const expiry = body.expirationDate ? new Date(body.expirationDate) : null;
  if (expiry && (!Number.isFinite(expiry.getTime()) || expiry <= new Date())) return res.status(400).json({ success: false, message: 'Expiration date must be in the future' });
  try {
    const donation = await Donation.create({ donor: req.user.id, foodType: typeof body.foodType === 'string' ? body.foodType.slice(0, 120) : undefined, quantity: Number(body.quantity), expirationDate: expiry, pickupLocation: body.pickupLocation.trim(), description: typeof body.description === 'string' ? body.description.trim().slice(0, 3000) : '', imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl.slice(0, 2048) : undefined, category: body.category || 'food' });
    return res.status(201).json({ success: true, message: 'Donation created successfully', data: donation });
  } catch (_error) { return res.status(500).json({ success: false, message: 'Failed to create donation' }); }
}

async function addDonationToUser(req, res) {
  if (!validId(req.params.donationId)) return res.status(400).json({ success: false, message: 'Donation identifier is invalid' });
  try {
    const donation = await Donation.findOneAndUpdate({ _id: req.params.donationId, status: 'pending', receiver: null }, { $set: { receiver: req.user.id, status: 'accepted', 'automation.approvedAt': new Date() } }, { new: true });
    if (!donation) return res.status(409).json({ success: false, message: 'Donation is no longer available' });
    const donor = await User.findById(donation.donor).select('email');
    if (donor?.email) { try { await sendEmail(donor.email, 'ReLoop AI — donation accepted', 'Your donation has been reserved by a verified recipient.', '<p>Your donation has been reserved by a verified recipient.</p>'); } catch (_error) {} }
    return res.status(200).json({ success: true, message: 'Donation assigned successfully' });
  } catch (_error) { return res.status(500).json({ success: false, message: 'Unable to assign donation' }); }
}

async function generateDeliveryOTP(req, res) {
  if (!validId(req.params.donationId)) return res.status(400).json({ success: false, message: 'Donation identifier is invalid' });
  const otp = crypto.randomInt(100000, 1000000).toString();
  try {
    const donation = await Donation.findOne({ _id: req.params.donationId, donor: req.user.id, status: 'accepted' }).populate('receiver', 'email name');
    if (!donation?.receiver?.email) return res.status(404).json({ success: false, message: 'Donation not found or not authorized' });
    donation.otpHash = hashOtp(otp); donation.otpExpires = new Date(Date.now() + 30 * 60 * 1000); donation.otpAttemptCount = 0; donation.deliveryVerifiedAt = null; await donation.save();
    console.info('[reloop] Delivery confirmation code generated:', otp);
    await sendEmail(donation.receiver.email, 'ReLoop AI delivery confirmation code', `Your delivery confirmation code is ${otp}. It expires in 30 minutes.`, `<p>Your delivery confirmation code is <strong>${otp}</strong>. It expires in 30 minutes.</p>`);
    return res.status(200).json({ success: true, message: 'Delivery confirmation code sent' });
  } catch (_error) { return res.status(500).json({ success: false, message: 'Unable to generate delivery confirmation code' }); }
}

async function verifyDeliveryOTP(req, res) {
  if (!validId(req.params.donationId) || !/^\d{6}$/.test(String(req.body?.otp || ''))) return res.status(400).json({ success: false, message: 'Delivery confirmation code is invalid' });
  try {
    const donation = await Donation.findOne({ _id: req.params.donationId, receiver: req.user.id, status: 'accepted' }).select('+otpHash');
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found or not authorized' });
    if (!donation.otpHash || !donation.otpExpires || donation.otpExpires <= new Date() || donation.otpAttemptCount >= 5) return res.status(400).json({ success: false, message: 'Delivery confirmation code is unavailable' });
    if (!crypto.timingSafeEqual(Buffer.from(donation.otpHash), Buffer.from(hashOtp(String(req.body.otp))))) { donation.otpAttemptCount += 1; await donation.save(); return res.status(400).json({ success: false, message: 'Delivery confirmation code is invalid' }); }
    donation.deliveryVerifiedAt = new Date(); donation.otpHash = null; donation.otpExpires = null; await donation.save(); return res.json({ success: true, message: 'Delivery confirmed' });
  } catch (_error) { return res.status(500).json({ success: false, message: 'Unable to verify delivery confirmation code' }); }
}

async function completeDonation(req, res) {
  if (!validId(req.params.donationId)) return res.status(400).json({ success: false, message: 'Donation identifier is invalid' });
  try {
    const donation = await Donation.findOneAndUpdate({ _id: req.params.donationId, receiver: req.user.id, status: 'accepted', deliveryVerifiedAt: { $ne: null } }, { $set: { status: 'delivered', 'automation.deliveredAt': new Date(), 'automation.lastStep': 'delivered' } }, { new: true });
    if (!donation) return res.status(409).json({ success: false, message: 'Donation cannot be completed before verified delivery' });
    return res.json({ success: true, message: 'Donation marked as delivered' });
  } catch (_error) { return res.status(500).json({ success: false, message: 'Unable to complete donation' }); }
}
async function getDonationUsingId(req, res) {
  if (!validId(req.params.ListId)) return res.status(400).json({ success: false, message: 'Donation identifier is invalid' });
  try {
    const donation = await Donation.findById(req.params.ListId).populate('donor', 'name').populate('receiver', 'name');
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    const donorId = String(donation.donor?._id || donation.donor);
    const receiverId = String(donation.receiver?._id || donation.receiver || '');
    if (req.user.role !== 'Admin' && req.user.id !== donorId && req.user.id !== receiverId) return res.status(403).json({ success: false, message: 'You do not have permission to access this donation' });
    return res.json({ success: true, donation });
  } catch (_error) { return res.status(500).json({ success: false, message: 'Unable to load donation' }); }
}

module.exports = { createDonation, addDonationToUser, generateDeliveryOTP, verifyDeliveryOTP, completeDonation, getDonationUsingId };
