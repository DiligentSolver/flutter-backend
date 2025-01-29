const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  discount: { type: Number, required: true }, // Discount percentage
  salePrice: { type: Number, required: true }, // Sale price after discount
  dealStartDate: { type: Date, required: true },
  dealEndDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Deal", dealSchema);
