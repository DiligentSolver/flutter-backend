const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" }, // Linked to Brand
  imageUrl: { type: String },
  isFeatured: { type: Boolean, default: false },
  onSale: { type: Boolean, default: false },
  discount: { type: Number, default: 0 }, // Represents discount percentage
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
