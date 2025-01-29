const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/otpGenerator");
const { sendOtp } = require("../utils/sendOtp");
const { client, connectRedis } = require("../utils/redisClient");

exports.sendOtp = async (req, res) => {
  const { mobile } = req.body;

  try {
    // Ensure Redis client is connected
    await connectRedis();

    const otp = generateOTP();
    const otpExpiry = process.env.OTP_EXPIRY * 60; // Convert minutes to seconds

    // Store OTP in Redis (expires after OTP_EXPIRY minutes)
    await client.setEx(`otp:${mobile}`, otpExpiry, otp);

    await client.quit();

    // Send OTP via Twilio
    await sendOtp(mobile, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

exports.verifyOtp = async (req, res) => {
  const { mobile, otp, name, email, address } = req.body;

  try {
    // Ensure Redis client is connected
    await connectRedis();

    // Get OTP from Redis
    const storedOtp = await client.get(`otp:${mobile}`);

    if (!storedOtp || storedOtp !== otp) {
      await client.quit();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Delete OTP from Redis after verification
    await client.del(`otp:${mobile}`);

    await client.quit();

    let user = await User.findOne({ mobile });

    // If user exists, just log them in
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
    await client.quit();
  }
};
