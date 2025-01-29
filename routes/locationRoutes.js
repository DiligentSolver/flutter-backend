const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// Get all locations
router.get("/", locationController.getLocations);

// Set user's location
router.post("/", locationController.setLocation);

module.exports = router;
