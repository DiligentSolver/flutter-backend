const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/otpGenerator");
const { sendOTP } = require("../utils/sendOtp");
const { client, connectRedis } = require("../utils/redisClient");

exports.resendOtp = async (req, res) => {
  const { mobile } = req.body;

  try {
    await connectRedis(); // Ensure Redis connection
    // Check if OTP is already requested within cooldown period (e.g., 30 sec)
    const existingOtp = await client.get(`otp:${mobile}`);
    if (existingOtp) {
      return res.status(429).json({
        message: "OTP already sent. Please wait before requesting again.",
      });
    }

    const otp = generateOTP();
    const otpExpiry = process.env.OTP_EXPIRY * 60; // Convert minutes to seconds

    // Store new OTP in Redis
    await client.setEx(`otp:${mobile}`, otpExpiry, otp);

    // Send OTP via Twilio
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
    // Ensure Redis client is connected
    await connectRedis();

    await client.del(`otp:${mobile}`); // Delete any old OTP before storing a new one
    const otp = generateOTP();

    // Store OTP in Redis (expires after OTP_EXPIRY minutes)
    await client.setEx(`otp:${mobile}`, otpExpiry, otp);

    // Get OTP from Redis
    const storedOtp = await client.get(`otp:${mobile}`);

    console.log("OTP Expiry Time:", otpExpiry);
    console.log("Stored OTP:", storedOtp, "Received OTP:", otp);

    // Send OTP via Twilio
    await sendOTP(mobile, otp);

    client.quit();

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
