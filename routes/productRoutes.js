const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Get all products
router.get("/", productController.getAllProducts);

// Search products
router.get("/search", productController.searchProducts);

module.exports = router;
