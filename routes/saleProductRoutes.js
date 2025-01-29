const express = require("express");
const router = express.Router();
const saleProductController = require("../controllers/saleProductController");

// Get products on sale
router.get("/", saleProductController.getSaleProducts);

module.exports = router;
