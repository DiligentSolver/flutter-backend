const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expiry: { type: Date, required: true },
  },
  { timestamps: true }
);

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;
