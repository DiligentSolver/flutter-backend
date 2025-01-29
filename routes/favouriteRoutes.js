const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

// Add to favorites
router.post("/", favoriteController.addToFavorites);

// Remove from favorites
router.delete("/:id", favoriteController.removeFromFavorites);

// Get user's favorite items
router.get("/", favoriteController.getFavorites);

module.exports = router;
