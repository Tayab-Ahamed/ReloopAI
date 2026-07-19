// ReLoop AI — User model with 5 roles
const mongoose = require("mongoose");

const ROLES = ["Donor", "NGO", "Volunteer", "Recycler", "Admin", "Donar"]; // "Donar" kept for backward-compat with legacy data only

const ACCEPTED_CATEGORIES = ['food', 'electronics', 'furniture', 'books', 'clothes', 'medical', 'recyclables'];

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  about:        { type: String },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  profileImage: { type: String, required: true },

  role: { type: String, enum: ROLES, required: true },

  location:  { type: String },
  coords:    { lat: Number, lng: Number },
  phone:     { type: String },

  // Recipient (NGO/Recycler) preferences — fuels AI matching
  acceptedCategories: [{ type: String, enum: ACCEPTED_CATEGORIES }],
  storageCapacity:    { type: Number, default: 0 },     // kg
  pickupAvailability: { type: String, enum: ['24x7', 'daytime', 'business_hours', 'weekends'], default: 'business_hours' },
  serviceRadiusKm:    { type: Number, default: 10 },

  // Volunteer profile
  volunteerProfile: {
    vehicle:       { type: String, enum: ['bike', 'car', 'van', 'walk'], default: 'bike' },
    maxLoadKg:     { type: Number, default: 20 },
    activeToday:   { type: Boolean, default: false },
  },

  registrationNumber: {
    type: String,
    validate: {
      validator: function (value) {
        if ((this.role === "NGO" || this.role === "Recycler") && !value) return false;
        return true;
      },
      message: "Registration Number is required for NGO and Recycler accounts.",
    },
  },

  // Notification channels
  channels: {
    email:    { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
    sms:      { type: Boolean, default: false },
  },
  whatsappNumber: { type: String },

  isVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  verificationReason: { type: String, maxlength: 1000 },
  createdAt:  { type: Date, default: Date.now },
});

userSchema.statics.ROLES = ROLES;
userSchema.statics.ACCEPTED_CATEGORIES = ACCEPTED_CATEGORIES;

module.exports = mongoose.model('User', userSchema);
