const Product = require("../models/productModel");

// Get products with the biggest deals
exports.getDeals = async (req, res) => {
  try {
    const deals = await Product.find().where("discount").gt(50); // Customize as needed (products with more than 50% discount)
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
