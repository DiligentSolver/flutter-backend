const Promotion = require("../models/promotionModel");

// Get all promotions
exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
