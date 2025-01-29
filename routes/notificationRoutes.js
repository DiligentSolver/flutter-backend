const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Get all notifications for the user
router.get("/", notificationController.getNotifications);

module.exports = router;
