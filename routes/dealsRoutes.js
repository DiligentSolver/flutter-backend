const express = require("express");
const router = express.Router();
const dealsController = require("../controllers/dealsController");

// Get products with the biggest deals
router.get("/", dealsController.getDeals);

module.exports = router;
