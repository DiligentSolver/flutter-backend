const Product = require("../models/Product");

// Get all products (or filtered by category, etc.)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Search products by name or category
exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.q;
    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
