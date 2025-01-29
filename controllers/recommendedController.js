const RecommendedProduct = require("../models/RecommendedProduct");
const Product = require("../models/Product");

// Get recommended products for a specific user
exports.getRecommendedProducts = async (req, res) => {
  const userId = req.user.id; // Assuming user is authenticated and their ID is in `req.user`

  try {
    const recommendations = await RecommendedProduct.find({ userId })
      .populate("productId") // Populate the product details
      .limit(10);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get products recommended for a specific user based on past behavior (e.g., purchases)
exports.getRecommendedProductsByBehavior = async (req, res) => {
  const userId = req.user.id;

  try {
    // For this, you may have to query past purchases, favorites, or browsing history
    // Assuming past purchases are stored in `Order` or `Favorite` model
    const purchasedProducts = await Order.find({ userId }).select("productId");
    const favoriteProducts = await Favorite.find({ userId }).select(
      "productId"
    );

    // Now, find products that are similar to the purchased or favorite ones
    const recommendedProducts = await Product.find({
      _id: { $in: [...purchasedProducts, ...favoriteProducts] },
    }).limit(10);

    res.json(recommendedProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
