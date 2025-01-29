const express = require("express");
const router = express.Router();
const recommendedProductController = require("../controllers/recommendedProductController");

// Get recommended products for a user
router.get("/", recommendedProductController.getRecommendedProducts);

// Get recommended products based on past behavior (purchases, favorites)
router.get(
  "/by-behavior",
  recommendedProductController.getRecommendedProductsByBehavior
);

module.exports = router;
