const express = require("express");
const router = express.Router();
const newProductController = require("../controllers/newProductController");

// Get newly launched products by flag
router.get("/", newProductController.getNewProducts);

// Get newly launched products by date
router.get("/by-date", newProductController.getNewProductsByDate);

module.exports = router;
