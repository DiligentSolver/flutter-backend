const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");

// Get all brands
router.get("/", brandController.getBrands);

module.exports = router;
