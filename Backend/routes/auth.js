const express = require('express');
const router = express.Router();

const {
  sendOTPUsingEmail,
  OTPVerification,
  AuthenticateUser,
  ForgotPasswordOTP,
  ForgotPassword,
  resetPassword,
} = require('../controllers/Auth');

router.post('/send-otp', sendOTPUsingEmail);
router.post('/verify-email', OTPVerification);
router.post('/login', AuthenticateUser);
router.post('/forgot-password', ForgotPasswordOTP);
router.post('/verify-otp', ForgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
