
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const OTP = require('../models/OTP');
const { check, validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

// Import OTP Templates
const otpVerificationTemplate = require('../helper/OTPVerification');


// ----------------------------------------   Send Email while Registration ---------------------------------------

const sendOTPUsingEmail = async(req, res)=>{
   console.log("Request is Coming");

  const { name, email, password, confirmPassword, role, registrationNumber } = req.body;

    if (!name || !email || !password || !confirmPassword || !role){
      return res.status(400).json({
        success:false,
        message:"All fields are Manadetory",
      });
    }

    if(password !== confirmPassword){
      return res.status(400).json({
        success:false,
        message:"Password and Confirm password not Matching",
      });
    }

    if(role==="NGO" && !registrationNumber){
      return res.status(400).json({
        success:false,
        message:"Registration Number is Required",
      });
    }

    try {

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success:false,
          message:"User aleready exist",
        });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit numeric OTP

      // Save OTP to database
      await OTP.deleteMany({ email, purpose: 'registration' });
      await OTP.create({ email, otpHash: await bcrypt.hash(otp, 12), purpose: 'registration' });

      // Send OTP via email
      const subject = 'Shareplat - Verify your Eamail';
      const text = `Your OTP for email verification is: ${otp}. It is valid for 5 minutes.`;
      const htmlBody = otpVerificationTemplate(name, otp, "verification");

      await sendEmail(email, subject, text, htmlBody);

      return res.status(200).json({ 
        success:true,
        message: 'OTP sent to your email for verification'
      });

    } 
    catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
}





// ----------------------------------------  Verify email using OTP  ---------------------------------------- 

const OTPVerification = async(req, res)=>{

  const { email, name, password, role, registrationNumber } = req.body.userData;
  const {otp} = req.body;
  try {

    // Find OTP in database using find().sort().limit(1) for guaranteed sorting order
    const storedOTP = await OTP.findOne({ email, purpose: 'registration' }).select('+otpHash').sort({ createdAt: -1 });

    if (!storedOTP || storedOTP.attemptCount >= 5 || !(await bcrypt.compare(String(otp || ''), storedOTP.otpHash))) {
      if (storedOTP) { storedOTP.attemptCount += 1; await storedOTP.save(); }
      console.warn('[reloop] OTP verification failed');
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP' 
      });
    }
    

    await OTP.deleteOne({ _id: storedOTP._id });

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      profileImage: `https://api.dicebear.com/5.x/initials/svg?seed=${name}`,
      registrationNumber,

      isVerified: role=="NGO"?false:true, // Default to false for NGOs
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        email:email,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Strict",
      maxAge: 12 * 60 * 60 * 1000,
    }).status(200)
      .json({
        success: true,
        message: "User registered successfully!",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
        }
    });

  } 
  catch (err) {
    console.error("[reloop] OTP verification uncaught server error:", err);
    res.status(500).json({
      success:false,
      message:err.message,
     })
  }
}





//  ----------------------------------------    Authenticate user and get token   ---------------------------------------- 

const AuthenticateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // Generate JWT token
      const payload = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

      const isProd = process.env.NODE_ENV === 'production';
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Strict",
        maxAge: 12 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "User Login successfull!",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
}




// ----------------------------------------    Send OTP to user's email for password reset   ---------------------------------------- 
const ForgotPasswordOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Generate OTP
    const otp = crypto.randomBytes(3).toString('hex').toLowerCase();
    console.info('[reloop] password reset OTP generated');

    // Save OTP to database
    await OTP.deleteMany({ email, purpose: 'password-reset' });
    const otpEntry = new OTP({ email, otpHash: await bcrypt.hash(otp, 12), purpose: 'password-reset' });
    await otpEntry.save();

    // Send OTP via email
    const subject = 'Password Reset OTP';
    const htmlBody = otpVerificationTemplate(user.name, otp, 'reset');
    
    try {
      await sendEmail(email, subject, '', htmlBody);
      res.json({ msg: 'OTP sent to your email' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Clean up OTP if email fails
      await OTP.deleteOne({ _id: otpEntry._id });
      return res.status(500).json({ 
        msg: 'Failed to send OTP email',
        error: emailError.message 
      });
    }
  } catch (err) {
    console.error('Error in ForgotPasswordOTP:', err);
    res.status(500).json({ 
      msg: 'Server error',
      error: 'Request could not be completed' 
    });
  }
};



// ----------------------------------------   Verify OTP and allow password reset   ---------------------------------------- 

const ForgotPassword = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find OTP in database
    const storedOTP = await OTP.findOne({ email, purpose: 'password-reset' }).select('+otpHash').sort({ createdAt: -1 });
    if (!storedOTP || storedOTP.attemptCount >= 5 || !(await bcrypt.compare(String(otp || ''), storedOTP.otpHash))) {
      if (storedOTP) { storedOTP.attemptCount += 1; await storedOTP.save(); }
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    res.json({ msg: 'OTP verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}



// -----------------------------------------  Reset user's password after OTP verification     -----------------------------------------

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Find OTP in database
    const storedOTP = await OTP.findOne({ email, purpose: 'password-reset' }).select('+otpHash').sort({ createdAt: -1 });
    if (!storedOTP || storedOTP.attemptCount >= 5 || !(await bcrypt.compare(String(otp || ''), storedOTP.otpHash))) {
      if (storedOTP) { storedOTP.attemptCount += 1; await storedOTP.save(); }
      return res.status(400).json({ msg: 'Invalid OTP' });
    }
    
    // Log the OTP for debugging
    console.info('[reloop] password reset OTP validated');

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // Delete OTP from database
    await OTP.deleteOne({ _id: storedOTP._id });

    res.json({ success: true, msg: 'Password reset successfully' });
  } catch (err) {
    console.error('Error in resetPassword:', err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { sendOTPUsingEmail, OTPVerification, AuthenticateUser, ForgotPasswordOTP, ForgotPassword, resetPassword };