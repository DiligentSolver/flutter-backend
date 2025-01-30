const express = require("express");
const { sendOtp, verifyOtp } = require("../controllers/authController");
const router = express.Router();

// Send OTP to user's mobile
router.post("/send-otp", sendOtp);

// Verify OTP and login
router.post("/verify-otp", verifyOtp);

// Resend OTP route
router.post("/resend-otp", authController.resendOtp);

module.exports = router;
