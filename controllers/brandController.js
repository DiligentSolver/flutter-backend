const Brand = require("../models/Brand");

// Get all brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
