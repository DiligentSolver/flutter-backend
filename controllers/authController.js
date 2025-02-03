const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/otpGenerator");
const { sendOTP } = require("../utils/sendOtp");
const { client, connectRedis } = require("../utils/redisClient");
const bcrypt = require("bcrypt");
const OTP = require("../models/otpModel");

const OTP_COOLDOWN = 30 * 1000; // 30 seconds
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

exports.resendOtp = async (req, res) => {
  const { mobile } = req.body;

  try {
    const otpRecord = await OTP.findOne({ mobile });

    // If OTP exists, check cooldown and expiration
    if (otpRecord) {
      const now = Date.now();

      // Check cooldown period (e.g., 30 seconds)
      if (now - otpRecord.updatedAt.getTime() < OTP_COOLDOWN) {
        return res.status(429).json({
          message: "OTP already sent. Please wait before requesting again.",
        });
      }
    }

    // Generate a new OTP
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiryTime = new Date(Date.now() + OTP_EXPIRY);

    // Update or insert OTP record
    await OTP.findOneAndUpdate(
      { mobile },
      { otp: hashedOtp, expiresAt: expiryTime },
      { upsert: true, new: true }
    );

    // Send OTP via SMS
    await sendOTP(mobile, otp);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("Error resending OTP:", err);
    res.status(500).json({ error: "Failed to resend OTP. Please try again." });
  }
};

exports.sendOtp = async (req, res) => {
  const { mobile } = req.body;

  try {
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10); // Hash OTP before storing
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    await OTP.findOneAndUpdate(
      { mobile },
      { otp: hashedOtp, expiresAt: otpExpiry },
      { upsert: true, new: true }
    );

    await sendOTP(mobile, otp); // Send actual OTP via SMS

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

exports.verifyOtp = async (req, res) => {
  const { mobile, otp, name, email, address } = req.body;

  try {
    const otpRecord = await OTP.findOne({ mobile });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isOtpValid || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await OTP.deleteOne({ mobile }); // Delete OTP after successful verification
    let user = await User.findOne({ mobile });

    // If user exists, update verification status and log them in
    if (user) {
      user.isVerified = true;
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        message: "OTP verified successfully",
        token,
        user,
      });
    }

    // If user is new, require additional data
    if (!name || !email || !address) {
      return res
        .status(400)
        .json({ message: "New users must provide name, email, and address" });
    }

    const newUser = new User({
      mobile,
      name,
      email,
      address,
      isVerified: true,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "New user registered and verified successfully",
      token,
      user: newUser,
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Failed to verify OTP. Please try again." });
  }
};
