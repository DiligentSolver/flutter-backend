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

  console.log(`[resendOtp] Received request for mobile: ${mobile}`);

  try {
    const otpRecord = await OTP.findOne({ mobile });
    console.log(`[resendOtp] Found OTP record:`, otpRecord);

    if (otpRecord) {
      const now = Date.now();
      console.log(`[resendOtp] Checking cooldown...`);

      if (now - otpRecord.updatedAt.getTime() < OTP_COOLDOWN) {
        console.warn(`[resendOtp] Cooldown active. OTP request denied.`);
        return res.status(429).json({
          message: "OTP already sent. Please wait before requesting again.",
        });
      }
    }

    const otp = generateOTP();
    console.log(`[resendOtp] Generated OTP: ${otp}`);

    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiryTime = new Date(Date.now() + OTP_EXPIRY);

    await OTP.findOneAndUpdate(
      { mobile },
      { otp: hashedOtp, expiresAt: expiryTime },
      { upsert: true, new: true }
    );

    console.log(`[resendOtp] OTP saved to database. Expiry: ${expiryTime}`);

    await sendOTP(mobile, otp);
    console.log(`[resendOtp] OTP sent successfully to ${mobile}`);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error(`[resendOtp] Error resending OTP:`, err);
    res.status(500).json({ error: "Failed to resend OTP. Please try again." });
  }
};

exports.sendOtp = async (req, res) => {
  const { mobile } = req.body;

  console.log(`[sendOtp] Received request for mobile: ${mobile}`);

  try {
    const otp = generateOTP();
    console.log(`[sendOtp] Generated OTP: ${otp}`);

    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY);

    await OTP.findOneAndUpdate(
      { mobile },
      { otp: hashedOtp, expiresAt: otpExpiry },
      { upsert: true, new: true }
    );

    console.log(`[sendOtp] OTP saved to database. Expiry: ${otpExpiry}`);

    await sendOTP(mobile, otp);
    console.log(`[sendOtp] OTP sent successfully to ${mobile}`);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(`[sendOtp] Error sending OTP:`, err);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

exports.verifyOtp = async (req, res) => {
  const { mobile, otp, name, email, address } = req.body;

  console.log(
    `[verifyOtp] Received request for mobile: ${mobile}, OTP: ${otp}`
  );

  try {
    const otpRecord = await OTP.findOne({ mobile });
    console.log(`[verifyOtp] OTP record found:`, otpRecord);

    if (!otpRecord) {
      console.warn(`[verifyOtp] No OTP record found or expired.`);
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    console.log(`[verifyOtp] OTP validation result: ${isOtpValid}`);

    if (!isOtpValid || otpRecord.expiresAt < new Date()) {
      console.warn(`[verifyOtp] OTP is invalid or expired.`);
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await OTP.deleteOne({ mobile });
    console.log(`[verifyOtp] OTP deleted after successful verification.`);

    let user = await User.findOne({ mobile });

    if (user) {
      console.log(`[verifyOtp] Existing user found:`, user);

      user.isVerified = true;
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      console.log(`[verifyOtp] OTP verified. User logged in.`);
      return res.status(200).json({
        message: "OTP verified successfully",
        token,
        user,
      });
    }

    if (!name || !email || !address) {
      console.warn(`[verifyOtp] New user missing required details.`);
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
    console.log(`[verifyOtp] New user registered successfully:`, newUser);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "New user registered and verified successfully",
      token,
      user: newUser,
    });
  } catch (err) {
    console.error(`[verifyOtp] Error verifying OTP:`, err);
    res.status(500).json({ error: "Failed to verify OTP. Please try again." });
  }
};
