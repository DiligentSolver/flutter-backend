const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { sendOtp } = require("../utils/twilio");

// Generate random 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtp = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  try {
    let user = await User.findOne({ mobile });

    // If user doesn't exist, create a new one
    if (!user) {
      user = await User.create({ mobile });
    }

    // Generate OTP and set expiry
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    // Send OTP via Twilio
    await sendOtp(mobile, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
