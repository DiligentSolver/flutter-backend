const Favorite = require("../models/Favorite");

// Add product to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const favorite = new Favorite({
      userId: req.user.id,
      productId: req.body.productId,
    });

    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Remove product from favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    await Favorite.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's favorite products
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id }).populate(
      "productId"
    );
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
