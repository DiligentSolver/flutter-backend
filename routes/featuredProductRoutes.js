const express = require("express");
const router = express.Router();
const featuredProductController = require("../controllers/featuredProductController");

// Get featured products
router.get("/", featuredProductController.getFeaturedProducts);

module.exports = router;
