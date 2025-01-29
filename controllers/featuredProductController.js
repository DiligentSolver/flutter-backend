const Product = require("../models/productModel");

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find()
      .where("isFeatured")
      .equals(true)
      .limit(10);
    res.json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
