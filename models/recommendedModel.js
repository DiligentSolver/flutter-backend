const mongoose = require("mongoose");

const recommendedProductSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  reason: { type: String, required: true }, // The reason why the product is recommended
  createdAt: { type: Date, default: Date.now },
  recommendedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("RecommendedProduct", recommendedProductSchema);
