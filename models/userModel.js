const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, unique: true },
    name: { type: String, default: null },
    email: { type: String, default: null },
    address: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
