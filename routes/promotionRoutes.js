const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");

// Get all promotions
router.get("/", promotionController.getPromotions);

module.exports = router;
