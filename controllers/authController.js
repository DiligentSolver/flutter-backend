const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/otpGenerator");
const { sendOTP } = require("../utils/sendOtp");
const { client, connectRedis } = require("../utils/redisClient");

const OTP_COOLDOWN = 30; // Cooldown in seconds
const OTP_VERIFICATION_ATTEMPTS = 5; // Max attempts before blocking

exports.resendOtp = async (req, res) => {
  const { mobile } = req.body;

  try {
    await connectRedis(); // Ensure Redis connection

    // Check if OTP is already requested within cooldown period
    const existingOtp = await client.get(`otp:${mobile}`);
    if (existingOtp) {
      console.warn(
        `[${new Date().toISOString()}] OTP Resend Blocked for ${mobile} (Cooldown active)`
      );
      return res.status(429).json({
        message: "OTP already sent. Please wait before requesting again.",
      });
    }

    const otp = generateOTP();
    const otpExpiry = parseInt(process.env.OTP_EXPIRY) * 60; // Convert minutes to seconds

    // Store new OTP in Redis
    await client.setEx(`otp:${mobile}`, otpExpiry, otp);
    await client.setEx(`otp_cooldown:${mobile}`, OTP_COOLDOWN, "1"); // Cooldown tracking

    console.info(
      `[${new Date().toISOString()}] OTP Resent to ${mobile}: ${otp}`
    );

    // Send OTP via Twilio
    await sendOTP(mobile, otp);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error resending OTP for ${mobile}:`,
      err
    );
    res.status(500).json({ error: "Failed to resend OTP. Please try again." });
  }
};

exports.sendOtp = async (req, res) => {
  const { mobile } = req.body;

  try {
    await connectRedis(); // Ensure Redis connection

    // Check if OTP cooldown is active
    const isCoolingDown = await client.get(`otp_cooldown:${mobile}`);
    if (isCoolingDown) {
      console.warn(
        `[${new Date().toISOString()}] OTP Request Blocked for ${mobile} (Cooldown active)`
      );
      return res.status(429).json({
        message: "Please wait before requesting a new OTP.",
      });
    }

    const otp = generateOTP();
    const otpExpiry = parseInt(process.env.OTP_EXPIRY) * 60; // Convert minutes to seconds

    // Store OTP in Redis (expires after OTP_EXPIRY minutes)
    await client.setEx(`otp:${mobile}`, otpExpiry, otp);
    await client.setEx(`otp_cooldown:${mobile}`, OTP_COOLDOWN, "1"); // Cooldown tracking

    console.info(`[${new Date().toISOString()}] OTP Sent to ${mobile}: ${otp}`);

    // Send OTP via Twilio
    await sendOTP(mobile, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error sending OTP for ${mobile}:`,
      err
    );
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

exports.verifyOtp = async (req, res) => {
  const { mobile, otp, name, email, address } = req.body;

  try {
    await connectRedis(); // Ensure Redis connection

    // Get OTP from Redis
    const storedOtp = await client.get(`otp:${mobile}`);

    console.info(
      `[${new Date().toISOString()}] OTP Verification Attempt for ${mobile}: Received ${otp}, Stored ${storedOtp}`
    );

    if (!storedOtp || storedOtp !== otp) {
      let attempts = (await client.get(`otp_attempts:${mobile}`)) || 0;
      attempts = parseInt(attempts) + 1;

      // Store failed attempt count in Redis
      await client.setEx(`otp_attempts:${mobile}`, 600, attempts); // Lock for 10 mins

      if (attempts >= OTP_VERIFICATION_ATTEMPTS) {
        console.warn(
          `[${new Date().toISOString()}] OTP Verification Blocked for ${mobile} (Too many attempts)`
        );
        return res
          .status(429)
          .json({ message: "Too many failed attempts. Try again later." });
      }

      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and attempt tracking
    await client.del(`otp:${mobile}`);
    await client.del(`otp_attempts:${mobile}`);

    let user = await User.findOne({ mobile });

    if (user) {
      user.isVerified = true;
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      console.info(
        `[${new Date().toISOString()}] OTP Verified for Existing User: ${mobile}`
      );

      return res.status(200).json({
        message: "OTP verified successfully",
        token,
        user,
      });
    }

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

    console.info(
      `[${new Date().toISOString()}] New User Registered and Verified: ${mobile}`
    );

    return res.status(201).json({
      message: "New user registered and verified successfully",
      token,
      user: newUser,
    });
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error verifying OTP for ${mobile}:`,
      err
    );
    res.status(500).json({ error: "Failed to verify OTP. Please try again." });
  }
};
