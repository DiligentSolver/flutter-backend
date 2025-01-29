const mongoose = require("mongoose");

const saleProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  discount: { type: Number, required: true }, // Represents the discount amount
  salePrice: { type: Number, required: true }, // Final sale price after discount
  saleStartDate: { type: Date, required: true },
  saleEndDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SaleProduct", saleProductSchema);
