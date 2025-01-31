const express = require("express");
const {
  updateProfile,
  sendUserDetails,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.put("/updateprofile", protect, updateProfile);

router.get("/user", protect, sendUserDetails);

module.exports = router;
