const Product = require("../models/productModel");

// Get newly launched products
exports.getNewProducts = async (req, res) => {
  try {
    const newProducts = await Product.find({ isNew: true }).limit(10); // Fetch new products
    res.json(newProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Alternatively, fetch products based on their launch date (within the last 30 days, for example)
exports.getNewProductsByDate = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newProducts = await Product.find({
      launchDate: { $gte: thirtyDaysAgo },
    }).limit(10);
    res.json(newProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
