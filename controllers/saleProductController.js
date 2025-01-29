const Product = require("../models/Product");

// Get products on sale
exports.getSaleProducts = async (req, res) => {
  try {
    const saleProducts = await Product.find().where("onSale").equals(true);
    res.json(saleProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
