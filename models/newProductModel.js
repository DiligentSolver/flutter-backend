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
  isNew: { type: Boolean, default: false }, // Flag to indicate if the product is new
  launchDate: { type: Date }, // Date when the product was launched
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
