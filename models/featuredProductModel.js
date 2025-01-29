const mongoose = require("mongoose");

const featuredProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  isFeatured: { type: Boolean, default: true }, // Flag to indicate if the product is featured
  featureStartDate: { type: Date, required: true },
  featureEndDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FeaturedProduct", featuredProductSchema);
