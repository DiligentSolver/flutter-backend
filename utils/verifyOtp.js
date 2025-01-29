const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.verifyOtp = async (req, res) => {
  const { mobile, otp, name, email, address } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: "Mobile and OTP are required" });
  }

  try {
    let user = await User.findOne({ mobile });

    // If user does not exist, create a new user
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found, please register first." });
    }

    // Check if OTP is valid
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    // If the user is new (i.e., no name, email, or address), update profile details
    if (!user.name && !user.email && !user.address) {
      if (!name || !email || !address) {
        return res
          .status(400)
          .json({ message: "Profile details are required for new users." });
      }
      user.name = name;
      user.email = email;
      user.address = address;
    }

    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        address: user.address,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
